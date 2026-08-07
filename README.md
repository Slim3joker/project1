# project1 — Hakans Projekte

In diesem Repo liegen zwei unabhängige Projekte nebeneinander.

## 🩺 Garmin Health Integration — Tower + Notion

Garmin-Vivoactive-5-Daten (Schlaf, Schritte, Body Battery, HRV, Stress, VO2 Max)
automatisch aus Garmin Connect abholen, auf dem Unraid-Tower in SQLite speichern und
anzeigen: Dashboard unter **health.erenstower.de** plus täglicher Notion-Eintrag via n8n.

📖 **Anleitung: [`docs/garmin-health.md`](docs/garmin-health.md)**

Dateien: `src/` (Node.js-Backend), `poller/` (Garmin-Abruf, Python), `public/`
(Dashboard), `Dockerfile`, `unraid/`, `n8n/`

## 📦 FBA Cockpit — Amazon Business Dashboard

Schlankes Dashboard für den Aufbau des Amazon-FBA-Business: Bestand, Nachschub,
Firmendaten und Dokumente. Eine einzige Datei, kein Server — `index.html` im
Browser öffnen.

📖 **Anleitung: [`docs/fba-cockpit.md`](docs/fba-cockpit.md)**

Dateien: `index.html`
