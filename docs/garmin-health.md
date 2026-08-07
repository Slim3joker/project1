# Garmin Health Integration — Tower + Notion

Garmin-Vivoactive-5-Daten (Schlaf, Schritte, Body Battery, HRV, Stress, VO2 Max)
automatisch abholen, in SQLite speichern und anzeigen:

- **https://health.erenstower.de** → eigenes Dashboard mit Live-Graphen
- **Notion** → Datenbank „Gesundheits-Journal" im MY HUB, täglich um 07:00 via n8n befüllt

```
Garmin Uhr → Garmin-Connect-App → Garmin Connect (Cloud)
    → Container holt die Daten alle 3 Stunden selbst ab
    → SQLite unter /mnt/user/appdata/garmin-health/data/
    → Dashboard health.erenstower.de (gleicher Container)
    → n8n (07:00) → Notion "Gesundheits-Journal"
```

**Bereits erledigt:** Die Notion-Datenbank „Gesundheits-Journal" existiert schon im MY HUB
(ID `a60873bb-8deb-4c0f-8217-02fd288a383d`). Der n8n-Workflow zeigt bereits darauf.

> **Warum kein offizieller Webhook?** Garmins Health API wird ausschließlich an Firmen
> vergeben (Antrag + Integrationsgespräch, „business use only"). Für ein privates
> Dashboard mit der eigenen Uhr ist der Weg über Garmin Connect der praktikable.
> Der Webhook-Empfang ist trotzdem eingebaut — falls du später doch offiziellen Zugang
> bekommst, siehe *Anhang: Offizieller Health-API-Weg*.

---

## Schritt 1 — Uhr einrichten

Vivoactive 5 mit der **Garmin-Connect-App** am Handy koppeln und tragen. Die Daten
landen in Garmins Cloud — von dort holt sie der Container ab. Nichts weiter zu tun.

## Schritt 2 — Container auf dem Tower installieren

Per SSH auf den Tower (`ssh root@192.168.178.32`), Zeile für Zeile:

```bash
mkdir -p /mnt/user/appdata/garmin-health/data
cd /mnt/user/appdata/garmin-health
git clone https://github.com/Slim3joker/project1.git app
cd app
git checkout claude/garmin-health-integration-dryveo
docker build -t garmin-health .
```

> ⚠️ Die Zeile mit `git checkout` ist nötig, **solange PR #3 noch nicht gemerged ist** —
> sonst landest du auf `master`, wo der Garmin-Code noch fehlt (typisches Symptom:
> `failed to read dockerfile: open Dockerfile: no such file or directory`).
> Nach dem Merge kannst du sie weglassen.

Der Build dauert beim ersten Mal ein paar Minuten (Node + Python werden eingerichtet).
Dann starten:

```bash
docker run -d --name garmin-health --restart unless-stopped \
  -p 8100:3000 \
  -v /mnt/user/appdata/garmin-health/data:/data \
  -e TZ=Europe/Berlin \
  -e POLL_INTERVAL_MIN=180 \
  -e POLL_DAYS=2 \
  garmin-health
```

**Test:** `curl http://192.168.178.32:8100/api/health` → muss `{"ok":true}` zeigen.

> Alternativ als Unraid-Template: `unraid/my-garmin-health.xml` nach
> `/boot/config/plugins/dockerMan/templates-user/` kopieren, dann Docker → **Add Container**
> → Template „garmin-health" wählen. Wichtig: Das Image muss vorher lokal gebaut sein
> (`docker build -t garmin-health .`), es liegt in keiner Registry.

⚠️ Wie immer bei dir: **Umgebungsvariablen gehören ins Template** (bzw. in den
`docker run`-Befehl), nicht in Dateien im Container.

## Schritt 3 — Einmalig bei Garmin Connect anmelden

Dieser Schritt ist **einmalig**. Danach merkt sich der Container den Zugang dauerhaft
(die Tokens liegen im AppData-Volume und überleben Neustarts und Container-Neubau).

```bash
docker exec -it garmin-health /opt/venv/bin/python3 /app/poller/login.py
```

Du wirst nach **E-Mail und Passwort deines Garmin-Connect-Kontos** gefragt — dieselben
Daten wie in der Handy-App. Das Passwort wird **nicht gespeichert**, nur die daraus
erzeugten Zugangs-Tokens. Falls du Zwei-Faktor-Authentifizierung aktiv hast, fragt das
Skript zusätzlich nach dem Code.

Bei Erfolg steht dort `✅ Angemeldet als: <dein Name>`.

Danach direkt die Daten der letzten Tage holen:

```bash
docker exec garmin-health /opt/venv/bin/python3 /app/poller/sync.py --days 7
```

Ab jetzt läuft der Abruf automatisch alle 3 Stunden — du musst nichts mehr tun.

**Historie nachladen:** Wenn die Uhr schon länger Daten gesammelt hat, kannst du weiter
zurückgehen (dauert entsprechend länger, ein Aufruf pro Tag):

```bash
docker exec garmin-health /opt/venv/bin/python3 /app/poller/sync.py --days 30
```

## Schritt 4 — Cloudflare Tunnel: health.erenstower.de

1. **Cloudflare Zero Trust** → **Networks → Tunnels** → deinen Tunnel → **Configure**
2. **Public Hostnames** → **Add a public hostname**
   - Subdomain: `health`
   - Domain: `erenstower.de`
   - Service: **`http://192.168.178.32:8100`** (intern http, nicht https!)
3. Speichern. **Test:** https://health.erenstower.de

🔒 **Wichtig — Zugriff absichern:** Unter **Zero Trust → Access → Applications** eine
Application für `health.erenstower.de` anlegen und nur deine E-Mail zulassen. Sonst sind
deine Gesundheitsdaten öffentlich im Internet. Spätestens wenn dort auch Arztdaten
liegen sollen, ist das Pflicht.

*(Nur beim offiziellen Health-API-Weg nötig: eine Bypass-Regel für `/webhook/garmin`,
damit Garmins Server durchkommen. Beim Connect-Abruf braucht es das nicht — der
Container holt sich die Daten von innen.)*

## Schritt 5 — Dashboard

Läuft automatisch mit: **https://health.erenstower.de**

- KPI-Karten: Schlaf, Body Battery (Morgenwert), HRV, Schritte, Stress, VO2 Max
- Graphen: Schlafphasen (letzte Nacht), Body-Battery- und Stress-Verlauf (heute),
  Schlafdauer / HRV / Schritte über 7 Tage
- Oben rechts: Verbindungsstatus und ein **⟳ Sync**-Knopf, um sofort neu abzurufen

## Schritt 6 — n8n → Notion

1. n8n öffnen → **Workflows → Import from File** → `n8n/garmin-health-to-notion.json`
2. Im Notion-Node deine **Notion-Credential** auswählen (falls noch keine existiert:
   Notion → Settings → Connections → Integration anlegen, Token in n8n hinterlegen).
   Die Integration braucht Zugriff auf die Seite **MY HUB**.
3. Workflow **aktivieren**. Ab jetzt legt n8n jeden Morgen um 07:00 einen Eintrag für
   **gestern** an — Titel z. B. „Donnerstag, 06.08.2026", alle Zahlen vorausgefüllt,
   Haken bei „Auto-Import". Den Tagebuchtext ergänzt du selbst.

Der HTTP-Node holt die Daten intern über `http://192.168.178.32:8100/api/day/yesterday`.

---

## Wenn etwas nicht läuft

```bash
# Was macht der Container?
docker logs garmin-health | tail -40

# Status der Anmeldung und des letzten Abrufs
curl -s http://192.168.178.32:8100/auth/status

# Abruf von Hand anstoßen und zuschauen
docker exec garmin-health /opt/venv/bin/python3 /app/poller/sync.py --days 2

# Nur schauen was Garmin liefert, ohne zu speichern
docker exec garmin-health /opt/venv/bin/python3 /app/poller/sync.py --days 1 --dry-run
```

| Problem | Ursache / Lösung |
|---|---|
| `Keine Anmeldung gefunden` | Schritt 3 noch nicht gemacht — `login.py` ausführen. |
| `Anmeldung ungültig oder abgelaufen` | Passwort geändert oder Token abgelaufen → `login.py` erneut ausführen. |
| Dashboard zeigt „–" überall | Noch keine Daten. Uhr synchronisiert? Handy-App einmal öffnen, dann `sync.py --days 3`. |
| Einzelne Werte fehlen (z. B. VO2 Max) | Nicht jede Metrik existiert für jeden Tag. Der Abruf überspringt sie und macht weiter. |
| Nach Garmin-Änderung bricht der Abruf | Der Connect-Zugang ist inoffiziell. Log zeigt, welcher Aufruf scheitert — dann melden, ich passe das Mapping an. |

## API-Übersicht

| Endpoint | Zweck |
|---|---|
| `GET /api/day/yesterday` | Tageswerte (auch `today` oder `YYYY-MM-DD`) — für n8n |
| `GET /api/range?days=7` | Tageswerte-Reihe (1–90 Tage) — fürs Dashboard |
| `GET /api/series/today` | Body-Battery- & Stress-Zeitreihe eines Tages |
| `POST /api/sync?days=2` | Abruf sofort anstoßen (macht der ⟳-Knopf) |
| `GET /auth/status` | Anmelde- und Abrufstatus |
| `GET /api/health` | Healthcheck |
| `POST /webhook/garmin?secret=…` | Empfang der offiziellen Health API (optional) |

## Updates einspielen

```bash
cd /mnt/user/appdata/garmin-health/app
git pull origin claude/garmin-health-integration-dryveo   # nach dem Merge: git pull
docker build -t garmin-health .
docker rm -f garmin-health
# … dann den docker run-Befehl aus Schritt 2 erneut ausführen
```

Datenbank **und** Garmin-Anmeldung liegen unter `/mnt/user/appdata/garmin-health/data/`
und überleben den Neubau — du musst dich nicht neu anmelden.

## Wie die Daten verarbeitet werden

Der Abruf (`poller/`) übersetzt die Garmin-Connect-Antworten in exakt dasselbe Format,
das auch die offizielle Health API schickt, und wirft es in den eigenen Webhook-Endpoint.
Dadurch gibt es nur **einen** Verarbeitungsweg (`src/garmin/normalize.js`) für beide
Varianten. Das Mapping ist mit Beispieldaten getestet:

```bash
cd poller && python3 test_mapping.py
```

Alle Rohdaten landen zusätzlich in der Tabelle `raw_events` — falls mal etwas fehlt,
lässt sich nachvollziehen, was Garmin tatsächlich geliefert hat.

---

## Anhang: Offizieller Health-API-Weg

Falls du doch einmal offiziellen Zugang bekommst
([Antragsformular](https://www.garmin.com/en-US/forms/GarminConnectDeveloperAccess/),
nur für Firmen), ist der Code dafür fertig:

1. Container mit `GARMIN_CLIENT_ID`, `GARMIN_CLIENT_SECRET` und `WEBHOOK_SECRET` starten,
   Redirect-URI `https://health.erenstower.de/auth/garmin/callback`.
2. Im Garmin-Portal Push Notifications aktivieren für `Dailies`, `Sleeps`,
   `Stress Details`, `HRV`, `User Metrics` — URL jeweils:
   `https://health.erenstower.de/webhook/garmin?secret=DEIN-SECRET`
3. In Cloudflare Access eine Bypass-Regel für `/webhook/garmin` anlegen.
4. Einmal https://health.erenstower.de/auth/garmin aufrufen und Garmin-Konto verbinden.
5. Automatischen Abruf abschalten: `POLL_ENABLED=false`.

Beide Wege können auch parallel laufen — doppelte Daten überschreiben sich sauber,
weil pro Kalendertag gespeichert wird.
