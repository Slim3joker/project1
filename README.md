# Garmin Health Integration — Tower + Notion

Garmin Vivoactive 5 Daten (Schlaf, Schritte, Body Battery, HRV, Stress, VO2 Max)
automatisch empfangen, in SQLite speichern und anzeigen:

- **https://health.erenstower.de** → eigenes Dashboard mit Live-Graphen
- **Notion** → Datenbank „Gesundheits-Journal" im MY HUB, täglich um 07:00 via n8n befüllt

```
Garmin Uhr → Garmin App → Garmin Health API
    → POST https://health.erenstower.de/webhook/garmin   (Cloudflare Tunnel)
    → Docker "garmin-health" auf dem Tower (Port 8100)
    → SQLite unter /mnt/user/appdata/garmin-health/data/
    → Dashboard (gleicher Container)
    → n8n (07:00) → Notion "Gesundheits-Journal"
```

**Bereits erledigt:** Die Notion-Datenbank „Gesundheits-Journal" existiert schon im MY HUB
(Datenbank-ID `a60873bb-8deb-4c0f-8217-02fd288a383d`). Der n8n-Workflow in
`n8n/garmin-health-to-notion.json` zeigt bereits darauf.

---

## Schritt 1 — Container auf dem Tower installieren

Per SSH auf den Tower (`ssh root@192.168.178.32`), dann Zeile für Zeile:

```bash
mkdir -p /mnt/user/appdata/garmin-health/data
cd /mnt/user/appdata/garmin-health
git clone -b claude/garmin-health-integration-dryveo https://github.com/slim3joker/project1.git app
cd app
docker build -t garmin-health .
```

Dann den Container starten (die zwei GARMIN-Werte kommen später aus Schritt 3 —
erstmal mit Platzhaltern starten ist okay, Dashboard geht auch ohne):

```bash
docker run -d --name garmin-health --restart unless-stopped \
  -p 8100:3000 \
  -v /mnt/user/appdata/garmin-health/data:/data \
  -e TZ=Europe/Berlin \
  -e GARMIN_CLIENT_ID=NOCH-LEER \
  -e GARMIN_CLIENT_SECRET=NOCH-LEER \
  -e GARMIN_REDIRECT_URI=https://health.erenstower.de/auth/garmin/callback \
  -e WEBHOOK_SECRET=$(head -c16 /dev/urandom | md5sum | cut -c1-16) \
  garmin-health
```

**Test:** `curl http://192.168.178.32:8100/api/health` → muss `{"ok":true}` zeigen.
Das gewürfelte `WEBHOOK_SECRET` merken: `docker inspect garmin-health | grep WEBHOOK_SECRET`

> Alternativ als Unraid-Template: `unraid/my-garmin-health.xml` nach
> `/boot/config/plugins/dockerMan/templates-user/` kopieren, dann Docker → **Add Container**
> → Template „garmin-health" wählen. Wichtig: Das Image muss vorher lokal gebaut sein
> (`docker build -t garmin-health .`), es liegt in keiner Registry.

⚠️ Wie immer bei dir: **Umgebungsvariablen gehören ins Template** (bzw. in den
`docker run`-Befehl), nicht in Dateien im Container.

## Schritt 2 — Cloudflare Tunnel: health.erenstower.de

1. **Cloudflare Zero Trust** → **Networks → Tunnels** → deinen Tunnel → **Configure**
2. **Public Hostnames** → **Add a public hostname**
   - Subdomain: `health`
   - Domain: `erenstower.de`
   - Service: **`http://192.168.178.32:8100`** (intern http, nicht https!)
3. Speichern. **Test:** https://health.erenstower.de → Dashboard lädt (noch ohne Daten).

*Optional aber empfohlen:* Unter **Zero Trust → Access → Applications** eine Application
für `health.erenstower.de` anlegen (z. B. nur deine E-Mail erlauben) — dann sieht niemand
außer dir deine Gesundheitsdaten. **Ausnahme einrichten:** Für den Pfad
`/webhook/garmin` eine Bypass-Policy setzen, sonst kommt Garmin nicht durch.

## Schritt 3 — Garmin Health API (OAuth)

1. Auf https://developerportal.garmin.com für das **Garmin Connect Developer Program /
   Health API** registrieren (kostenlos, Freischaltung dauert 1–2 Tage).
2. Im Portal eine App anlegen:
   - **Redirect/Callback URI:** `https://health.erenstower.de/auth/garmin/callback` (exakt so)
   - **Client ID** und **Client Secret** notieren.
3. Auf dem Tower die echten Werte setzen (Container neu erstellen mit denselben Pfaden —
   AppData bleibt erhalten):
   ```bash
   docker rm -f garmin-health
   docker run -d --name garmin-health --restart unless-stopped \
     -p 8100:3000 \
     -v /mnt/user/appdata/garmin-health/data:/data \
     -e TZ=Europe/Berlin \
     -e GARMIN_CLIENT_ID=DEINE-CLIENT-ID \
     -e GARMIN_CLIENT_SECRET=DEIN-CLIENT-SECRET \
     -e GARMIN_REDIRECT_URI=https://health.erenstower.de/auth/garmin/callback \
     -e WEBHOOK_SECRET=DEIN-SECRET-AUS-SCHRITT-1 \
     garmin-health
   ```
4. Im Garmin-Portal (**Endpoint Configuration**) die **Push Notifications** aktivieren für:
   `Dailies`, `Sleeps`, `Stress Details`, `HRV`, `User Metrics` — als URL überall:
   ```
   https://health.erenstower.de/webhook/garmin?secret=DEIN-SECRET-AUS-SCHRITT-1
   ```
   (Der Ping-Modus funktioniert auch — der Container lädt die Daten dann selbst nach.)
5. **Uhr verbinden:** Im Browser https://health.erenstower.de/auth/garmin öffnen,
   mit deinem Garmin-Connect-Konto einloggen, bestätigen. Danach zeigt
   https://health.erenstower.de/auth/status → `"connected": true`.

Nach der nächsten Synchronisation der Uhr (Garmin-App am Handy öffnen) trudeln die
ersten Daten ein. Logs ansehen: `docker logs garmin-health | tail -30`

**Webhook lokal testen** (ohne Garmin, mit Beispieldaten):

```bash
curl -s -X POST "http://192.168.178.32:8100/webhook/garmin?secret=DEIN-SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"dailies":[{"calendarDate":"2026-08-03","steps":8542,"restingHeartRateInBeatsPerMinute":52,"averageStressLevel":31,"maxStressLevel":78,"bodyBatteryChargedValue":68,"bodyBatteryDrainedValue":61}],"sleeps":[{"calendarDate":"2026-08-03","durationInSeconds":26100,"deepSleepDurationInSeconds":5400,"lightSleepDurationInSeconds":14400,"remSleepInSeconds":6300,"awakeDurationInSeconds":900,"overallSleepScore":{"value":82}}]}'
```

Danach zeigt das Dashboard und `curl http://192.168.178.32:8100/api/day/2026-08-03` die Werte.

## Schritt 4 — Dashboard

Läuft automatisch mit: **https://health.erenstower.de**

- KPI-Karten: Schlaf, Body Battery (Morgenwert), HRV, Schritte, Stress, VO2 Max
- Graphen: Schlafphasen (letzte Nacht), Body-Battery- und Stress-Verlauf (heute),
  Schlafdauer / HRV / Schritte über 7 Tage

## Schritt 5 — n8n → Notion

1. n8n öffnen → **Workflows → Import from File** → `n8n/garmin-health-to-notion.json`
2. Im Notion-Node deine **Notion-Credential** auswählen (falls noch keine existiert:
   Notion → Settings → Connections → Integration anlegen, Token in n8n hinterlegen).
   Die Integration braucht Zugriff auf die Seite **MY HUB** (dort liegt das
   „Gesundheits-Journal").
3. Workflow **aktivieren**. Ab jetzt legt n8n jeden Morgen um 07:00 einen Eintrag für
   **gestern** an — Titel z. B. „Montag, 03.08.2026", alle Zahlen vorausgefüllt,
   Haken bei „Auto-Import". Den Tagebuchtext ergänzt du selbst in der Spalte „Tagebuch"
   oder direkt auf der Seite.

Der HTTP-Node holt die Daten intern über `http://192.168.178.32:8100/api/day/yesterday` —
kein Umweg übers Internet nötig.

## API-Übersicht

| Endpoint | Zweck |
|---|---|
| `POST /webhook/garmin?secret=…` | Garmin Push/Ping-Empfang |
| `GET /auth/garmin` | OAuth-Login starten |
| `GET /auth/status` | Verbindungsstatus |
| `GET /api/health` | Healthcheck |
| `GET /api/day/yesterday` | Tageswerte (auch `today` oder `YYYY-MM-DD`) — für n8n |
| `GET /api/range?days=7` | Tageswerte-Reihe (1–90 Tage) — fürs Dashboard |
| `GET /api/series/today` | Body-Battery- & Stress-Zeitreihe eines Tages |

## Updates einspielen

```bash
cd /mnt/user/appdata/garmin-health/app
git pull
docker build -t garmin-health .
docker rm -f garmin-health
# … dann den docker run-Befehl aus Schritt 3 erneut ausführen
```

Die SQLite-Datenbank liegt unter `/mnt/user/appdata/garmin-health/data/` und
überlebt Container-Neubau problemlos. Sie ist automatisch im Unraid-AppData-Backup,
falls du eins fährst.
