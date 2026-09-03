#!/usr/bin/env python3
"""Holt Garmin-Connect-Daten ab und schickt sie an den lokalen Webhook.

Aufruf im Container:
    python3 poller/sync.py --days 3

Die Anmeldung passiert einmalig über poller/login.py; die Tokens liegen
danach im persistenten Volume (/data/garth) und werden hier nur geladen.
"""

import argparse
import datetime as dt
import json
import os
import sys

import garth
import requests

from mapping import (
    build_payload,
    map_daily,
    map_hrv,
    map_sleep,
    map_stress_details,
    map_user_metrics,
)

TOKEN_DIR = os.environ.get("GARTH_TOKEN_DIR") or os.path.join(
    os.environ.get("DATA_DIR", "/data"), "garth"
)
WEBHOOK_URL = os.environ.get("INTERNAL_WEBHOOK_URL", "http://127.0.0.1:3000/webhook/garmin")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "")


def log(message):
    print(f"[sync] {message}", flush=True)


def connect_get(path, **params):
    """Ein Connect-API-Aufruf; Fehler einzelner Metriken brechen den Lauf nicht ab."""
    try:
        return garth.connectapi(path, params=params or None)
    except Exception as err:  # noqa: BLE001 — jede Metrik ist optional
        log(f"  ! {path} fehlgeschlagen: {err}")
        return None


def fetch_day(display_name, day):
    """Sammelt alle Metriken eines Tages und mappt sie ins Webhook-Format."""
    date_str = day.isoformat()

    daily = connect_get(
        f"/usersummary-service/usersummary/daily/{display_name}", calendarDate=date_str
    )
    sleep = connect_get(
        f"/wellness-service/wellness/dailySleepData/{display_name}",
        date=date_str,
        nonSleepBufferMinutes=60,
    )
    hrv = connect_get(f"/hrv-service/hrv/{date_str}")
    stress = connect_get(f"/wellness-service/wellness/dailyStress/{date_str}")
    maxmet = connect_get(f"/metrics-service/metrics/maxmet/latest/{date_str}")

    return build_payload(
        {
            "dailies": map_daily(daily, date_str),
            "sleeps": map_sleep(sleep, date_str),
            "hrv": map_hrv(hrv, date_str),
            "stressDetails": map_stress_details(stress, date_str),
            "userMetrics": map_user_metrics(maxmet, date_str),
        }
    )


def send(payload):
    url = WEBHOOK_URL
    if WEBHOOK_SECRET:
        separator = "&" if "?" in url else "?"
        url = f"{url}{separator}secret={WEBHOOK_SECRET}"
    response = requests.post(url, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()


def main():
    parser = argparse.ArgumentParser(description="Garmin Connect → lokaler Webhook")
    parser.add_argument(
        "--days", type=int, default=2,
        help="Wie viele Tage rückwirkend geholt werden (Standard: 2)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Nur anzeigen was geholt wurde, nichts senden",
    )
    args = parser.parse_args()

    if not os.path.isdir(TOKEN_DIR):
        log(f"Keine Anmeldung gefunden ({TOKEN_DIR}). Erst 'python3 poller/login.py' ausführen.")
        return 2

    try:
        garth.resume(TOKEN_DIR)
        profile = garth.connectapi("/userprofile-service/socialProfile")
        display_name = profile["displayName"]
    except Exception as err:  # noqa: BLE001
        log(f"Anmeldung ungültig oder abgelaufen: {err}")
        log("Bitte 'python3 poller/login.py' erneut ausführen.")
        return 2

    # Tokens werden beim Resume ggf. erneuert — zurückschreiben, damit die
    # Sitzung dauerhaft gültig bleibt.
    try:
        garth.save(TOKEN_DIR)
    except Exception as err:  # noqa: BLE001
        log(f"Hinweis: Tokens konnten nicht aktualisiert werden: {err}")

    today = dt.date.today()
    days = [today - dt.timedelta(days=offset) for offset in range(max(args.days, 1))]

    sent = 0
    for day in days:
        payload = fetch_day(display_name, day)
        if not payload:
            log(f"{day}: keine Daten")
            continue
        if args.dry_run:
            log(f"{day}: {json.dumps(payload, ensure_ascii=False)[:400]}")
            continue
        try:
            send(payload)
            log(f"{day}: übertragen ({', '.join(payload.keys())})")
            sent += 1
        except Exception as err:  # noqa: BLE001
            log(f"{day}: Senden fehlgeschlagen: {err}")

    log(f"Fertig — {sent} von {len(days)} Tagen übertragen.")
    return 0 if sent or args.dry_run else 1


if __name__ == "__main__":
    sys.exit(main())
