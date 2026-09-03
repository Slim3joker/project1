"""Übersetzt Garmin-Connect-Antworten in das Format, das der Webhook-Endpoint
(/webhook/garmin) erwartet — also dasselbe Schema wie die offizielle Health API.

Dadurch bleibt die Verarbeitung in src/garmin/normalize.js für beide Wege gleich:
egal ob die Daten per Webhook reinkommen oder hier abgeholt werden.

Reines Datenmapping, kein Netzwerk — dadurch mit Beispiel-JSON testbar
(siehe poller/test_mapping.py).
"""


def _num(value):
    """Gibt Zahlen zurück, alles andere (None, "", Strings) wird zu None."""
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return value
    return None


def _ms_to_s(value):
    n = _num(value)
    return int(n / 1000) if n is not None else None


def map_daily(summary, calendar_date):
    """usersummary-service → "dailies"-Eintrag."""
    if not summary:
        return None
    return {
        "calendarDate": summary.get("calendarDate") or calendar_date,
        "steps": _num(summary.get("totalSteps")),
        "distanceInMeters": _num(summary.get("totalDistanceMeters")),
        "activeKilocalories": _num(summary.get("activeKilocalories")),
        "restingHeartRateInBeatsPerMinute": _num(summary.get("restingHeartRate")),
        "averageStressLevel": _num(summary.get("averageStressLevel")),
        "maxStressLevel": _num(summary.get("maxStressLevel")),
        "bodyBatteryChargedValue": _num(summary.get("bodyBatteryChargedValue")),
        "bodyBatteryDrainedValue": _num(summary.get("bodyBatteryDrainedValue")),
    }


def map_sleep(sleep_response, calendar_date):
    """wellness-service/dailySleepData → "sleeps"-Eintrag."""
    if not sleep_response:
        return None
    dto = sleep_response.get("dailySleepDTO") or {}
    if not dto:
        return None

    scores = dto.get("sleepScores") or {}
    overall = scores.get("overall") or {}
    score = _num(overall.get("value"))

    duration = _num(dto.get("sleepTimeSeconds"))
    if duration is None:
        return None  # ohne Schlafdauer ist der Datensatz wertlos

    return {
        "calendarDate": dto.get("calendarDate") or calendar_date,
        "startTimeInSeconds": _ms_to_s(dto.get("sleepStartTimestampGMT")),
        "durationInSeconds": duration,
        "deepSleepDurationInSeconds": _num(dto.get("deepSleepSeconds")),
        "lightSleepDurationInSeconds": _num(dto.get("lightSleepSeconds")),
        "remSleepInSeconds": _num(dto.get("remSleepSeconds")),
        "awakeDurationInSeconds": _num(dto.get("awakeSleepSeconds")),
        "overallSleepScore": {"value": score} if score is not None else None,
    }


def map_hrv(hrv_response, calendar_date):
    """hrv-service → "hrv"-Eintrag."""
    if not hrv_response:
        return None
    summary = hrv_response.get("hrvSummary") or {}
    avg = _num(summary.get("lastNightAvg"))
    high = _num(summary.get("lastNight5MinHigh"))
    if avg is None and high is None:
        return None
    return {
        "calendarDate": summary.get("calendarDate") or calendar_date,
        "lastNightAvg": avg,
        "lastNight5MinHigh": high,
    }


def map_user_metrics(maxmet_response, calendar_date):
    """metrics-service/maxmet → "userMetrics"-Eintrag (VO2 Max)."""
    if not maxmet_response:
        return None
    # Antwort ist je nach Endpoint ein Objekt oder eine Liste
    if isinstance(maxmet_response, list):
        maxmet_response = maxmet_response[0] if maxmet_response else {}
    generic = maxmet_response.get("generic") or {}
    vo2 = _num(generic.get("vo2MaxPreciseValue"))
    if vo2 is None:
        vo2 = _num(generic.get("vo2MaxValue"))
    fitness_age = _num(generic.get("fitnessAge"))
    if vo2 is None and fitness_age is None:
        return None
    return {
        "calendarDate": generic.get("calendarDate") or calendar_date,
        "vo2Max": vo2,
        "fitnessAge": fitness_age,
    }


def _series_point(entry):
    """Zerlegt einen Eintrag der Connect-Zeitreihen in (Zeitstempel_ms, Wert).

    Garmin liefert je nach Metrik unterschiedliche Formen:
      [ts, 22]                      → Stress
      [ts, "MEASURED", 75, 1.0]     → Body Battery (Status an Position 1)
    """
    if not isinstance(entry, list) or len(entry) < 2:
        return None, None
    ts = _num(entry[0])
    if ts is None:
        return None, None
    for item in entry[1:]:
        value = _num(item)
        if value is not None:
            return ts, value
    return ts, None


def map_stress_details(stress_response, calendar_date):
    """wellness-service/dailyStress → "stressDetails"-Eintrag mit Zeitreihen.

    Der Webhook erwartet Offsets relativ zu startTimeInSeconds, Connect liefert
    absolute Zeitstempel in Millisekunden — hier wird umgerechnet.
    """
    if not stress_response:
        return None

    stress_raw = stress_response.get("stressValuesArray") or []
    battery_raw = stress_response.get("bodyBatteryValuesArray") or []

    points = []
    for entry in list(stress_raw) + list(battery_raw):
        ts, _ = _series_point(entry)
        if ts is not None:
            points.append(ts)
    if not points:
        return None

    start_ms = min(points)
    start_s = int(start_ms / 1000)

    stress_offsets = {}
    for entry in stress_raw:
        ts, value = _series_point(entry)
        if ts is None or value is None:
            continue
        stress_offsets[str(int((ts - start_ms) / 1000))] = value

    battery_offsets = {}
    for entry in battery_raw:
        ts, value = _series_point(entry)
        if ts is None or value is None:
            continue
        battery_offsets[str(int((ts - start_ms) / 1000))] = value

    if not stress_offsets and not battery_offsets:
        return None

    return {
        "calendarDate": stress_response.get("calendarDate") or calendar_date,
        "startTimeInSeconds": start_s,
        "timeOffsetStressLevelValues": stress_offsets,
        "timeOffsetBodyBatteryValues": battery_offsets,
    }


def build_payload(day_data):
    """Baut aus den gemappten Einzelteilen eines Tages einen Webhook-Body.

    day_data: dict mit den Schlüsseln dailies/sleeps/hrv/userMetrics/stressDetails,
    Werte dürfen None sein. Leere Listen werden weggelassen.
    """
    payload = {}
    for key in ("dailies", "sleeps", "hrv", "userMetrics", "stressDetails"):
        entry = day_data.get(key)
        if entry:
            payload[key] = [entry]
    return payload
