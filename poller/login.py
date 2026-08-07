#!/usr/bin/env python3
"""Einmalige Anmeldung bei Garmin Connect.

Im Container ausführen:
    docker exec -it garmin-health python3 /app/poller/login.py

Fragt E-Mail und Passwort ab (Eingabe wird nicht angezeigt) und legt die
Zugangs-Tokens im persistenten Volume ab. Danach läuft die Synchronisation
automatisch — das Passwort wird nicht gespeichert.
"""

import getpass
import os
import sys

import garth

TOKEN_DIR = os.environ.get("GARTH_TOKEN_DIR", "/data/garth")


def main():
    print("Anmeldung bei Garmin Connect")
    print("(dieselben Zugangsdaten wie in der Garmin-Connect-App)\n")

    email = os.environ.get("GARMIN_EMAIL") or input("E-Mail: ").strip()
    password = os.environ.get("GARMIN_PASSWORD") or getpass.getpass("Passwort: ")

    if not email or not password:
        print("\nE-Mail und Passwort werden benötigt.")
        return 2

    try:
        # Falls für das Konto Zwei-Faktor-Authentifizierung aktiv ist, fragt
        # garth hier nach dem Code aus der E-Mail bzw. der Authenticator-App.
        garth.login(email, password, prompt_mfa=lambda: input("MFA-Code: ").strip())
    except Exception as err:  # noqa: BLE001
        print(f"\n❌ Anmeldung fehlgeschlagen: {err}")
        print("Prüfe E-Mail/Passwort. Bei aktivierter Zwei-Faktor-Authentifizierung")
        print("muss der Code innerhalb der Gültigkeitsdauer eingegeben werden.")
        return 1

    os.makedirs(TOKEN_DIR, exist_ok=True)
    garth.save(TOKEN_DIR)

    try:
        profile = garth.connectapi("/userprofile-service/socialProfile")
        name = profile.get("displayName") or profile.get("fullName") or "unbekannt"
        print(f"\n✅ Angemeldet als: {name}")
    except Exception:  # noqa: BLE001
        print("\n✅ Anmeldung gespeichert.")

    print(f"Tokens liegen in {TOKEN_DIR} — bleiben über Container-Neustarts erhalten.")
    print("Die Synchronisation startet automatisch beim nächsten Durchlauf.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
