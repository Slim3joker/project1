#!/usr/bin/env python3
"""Tests für das Connect→Webhook-Mapping. Ohne Netzwerk lauffähig:

    python3 poller/test_mapping.py
"""

import sys

from mapping import (
    build_payload,
    map_daily,
    map_hrv,
    map_sleep,
    map_stress_details,
    map_user_metrics,
)

failures = []


def check(name, actual, expected):
    if actual != expected:
        failures.append(f"{name}: erwartet {expected!r}, war {actual!r}")


# --- Tagessummary ---------------------------------------------------------
daily = map_daily(
    {
        "calendarDate": "2026-08-06",
        "totalSteps": 8542,
        "totalDistanceMeters": 6500.5,
        "activeKilocalories": 512,
        "restingHeartRate": 52,
        "averageStressLevel": 31,
        "maxStressLevel": 78,
        "bodyBatteryChargedValue": 68,
        "bodyBatteryDrainedValue": 61,
    },
    "2026-08-06",
)
check("daily.steps", daily["steps"], 8542)
check("daily.restingHr", daily["restingHeartRateInBeatsPerMinute"], 52)
check("daily.bbCharged", daily["bodyBatteryChargedValue"], 68)
check("daily leer", map_daily(None, "2026-08-06"), None)

# Fehlende Felder dürfen nicht crashen, sondern werden zu None
sparse = map_daily({"calendarDate": "2026-08-06", "totalSteps": 100}, "2026-08-06")
check("daily.sparse restingHr", sparse["restingHeartRateInBeatsPerMinute"], None)
check("daily.sparse steps", sparse["steps"], 100)

# --- Schlaf ---------------------------------------------------------------
sleep = map_sleep(
    {
        "dailySleepDTO": {
            "calendarDate": "2026-08-06",
            "sleepTimeSeconds": 26100,
            "deepSleepSeconds": 5400,
            "lightSleepSeconds": 14400,
            "remSleepSeconds": 6300,
            "awakeSleepSeconds": 900,
            "sleepStartTimestampGMT": 1754170200000,
            "sleepScores": {"overall": {"value": 82, "qualifierKey": "GOOD"}},
        }
    },
    "2026-08-06",
)
check("sleep.duration", sleep["durationInSeconds"], 26100)
check("sleep.rem", sleep["remSleepInSeconds"], 6300)
check("sleep.score", sleep["overallSleepScore"], {"value": 82})
check("sleep.start (ms→s)", sleep["startTimeInSeconds"], 1754170200)

# Nacht ohne Score (kommt bei Garmin vor) — darf trotzdem durchgehen
no_score = map_sleep(
    {"dailySleepDTO": {"calendarDate": "2026-08-06", "sleepTimeSeconds": 20000}},
    "2026-08-06",
)
check("sleep ohne Score", no_score["overallSleepScore"], None)
check("sleep ohne Daten", map_sleep({"dailySleepDTO": {}}, "2026-08-06"), None)

# --- HRV ------------------------------------------------------------------
hrv = map_hrv(
    {"hrvSummary": {"calendarDate": "2026-08-06", "lastNightAvg": 48, "lastNight5MinHigh": 72}},
    "2026-08-06",
)
check("hrv.avg", hrv["lastNightAvg"], 48)
check("hrv leer", map_hrv({"hrvSummary": {}}, "2026-08-06"), None)

# --- VO2 Max --------------------------------------------------------------
metrics = map_user_metrics(
    {"generic": {"calendarDate": "2026-08-06", "vo2MaxPreciseValue": 44.5, "fitnessAge": 32}},
    "2026-08-06",
)
check("vo2max", metrics["vo2Max"], 44.5)
# Manche Konten liefern eine Liste statt eines Objekts
as_list = map_user_metrics([{"generic": {"vo2MaxValue": 41.0}}], "2026-08-06")
check("vo2max aus Liste", as_list["vo2Max"], 41.0)
check("vo2max leer", map_user_metrics({}, "2026-08-06"), None)

# --- Zeitreihen (Stress + Body Battery) -----------------------------------
start_ms = 1754193600000
stress = map_stress_details(
    {
        "calendarDate": "2026-08-06",
        "stressValuesArray": [
            [start_ms, 22],
            [start_ms + 10_800_000, 35],
            [start_ms + 21_600_000, -1],  # -1 = keine Messung möglich
        ],
        # Body Battery kommt mit Status-String an Position 1
        "bodyBatteryValuesArray": [
            [start_ms, "MEASURED", 75, 1.0],
            [start_ms + 10_800_000, "MEASURED", 80, 1.0],
            [start_ms + 21_600_000, "MEASURED", 72, 1.0],
        ],
    },
    "2026-08-06",
)
check("series.start (ms→s)", stress["startTimeInSeconds"], int(start_ms / 1000))
check("series.stress offsets", stress["timeOffsetStressLevelValues"], {"0": 22, "10800": 35, "21600": -1})
check("series.bb offsets", stress["timeOffsetBodyBatteryValues"], {"0": 75, "10800": 80, "21600": 72})
check("series leer", map_stress_details({"stressValuesArray": []}, "2026-08-06"), None)

# Nur Body Battery, kein Stress — Startzeit muss trotzdem stimmen
bb_only = map_stress_details(
    {"calendarDate": "2026-08-06", "bodyBatteryValuesArray": [[start_ms, "MEASURED", 90]]},
    "2026-08-06",
)
check("series nur BB", bb_only["timeOffsetBodyBatteryValues"], {"0": 90})
check("series nur BB, Stress leer", bb_only["timeOffsetStressLevelValues"], {})

# --- Payload-Bau ----------------------------------------------------------
payload = build_payload({"dailies": daily, "sleeps": sleep, "hrv": None, "stressDetails": stress})
check("payload keys", sorted(payload.keys()), ["dailies", "sleeps", "stressDetails"])
check("payload dailies ist Liste", isinstance(payload["dailies"], list), True)
check("payload leer", build_payload({"dailies": None}), {})

if failures:
    print("FEHLGESCHLAGEN:")
    for failure in failures:
        print("  -", failure)
    sys.exit(1)

print("Alle Mapping-Tests bestanden.")
