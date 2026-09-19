# MeinZyklus – Zyklustracker

Eine private Zyklus-Tracking-App zum Selbsthosten auf Unraid.
Keine Cloud, keine Abo-Kosten – alle Daten bleiben lokal im Browser.

## Features

- **Dashboard** – Aktueller Zyklustag, Phase, Countdown zur nächsten Periode
- **Kalender** – Monatsansicht mit farbcodierten Zyklusphasen
- **Perioden-Verwaltung** – Perioden starten/beenden, historische Daten nachtragen
- **Vorhersagen** – Nächste Periode, Eisprung, fruchtbare Tage
- **Statistiken** – Durchschnittliche Zykluslänge, Regelmäßigkeit, Verlauf
- **Daten-Export/Import** – JSON-Backup zum Sichern und Wiederherstellen
- **Dark Mode** – Automatisch oder manuell umschaltbar
- **Mobil-optimiert** – Funktioniert perfekt auf dem Handy

## Tech-Stack

Die App ist eine einzige Datei (`index.html`), kein Build-Tool.
Ein winziger Node-Server (`server.js`, ohne Abhängigkeiten) liefert die App aus
und speichert die Daten **zentral** in `data/data.json` auf dem Server.
So sehen **alle Geräte dieselben Daten** (Handy, PC, Tablet). Der Browser
behält zusätzlich eine lokale Kopie, damit die App auch offline weiterläuft.

## Deployment auf Unraid

### Docker Compose

```bash
docker-compose up -d --build
```

Die App läuft dann auf `http://<unraid-ip>:8087`.

### Zentraler Datenspeicher (data/)

Die gemeinsamen Daten liegen in `data/data.json` (Docker-Volume `./data`).
Jede Änderung auf irgendeinem Gerät wird sofort dorthin gespeichert; alle
anderen Geräte übernehmen sie beim nächsten Öffnen bzw. Aktualisieren.

Der Ordner `data/` steht in der `.gitignore` und darf **nie** ins Repo
committet werden – er enthält private Gesundheitsdaten.

### Startdaten (data/seed.json)

Optional kann im `data/`-Ordner eine `seed.json` liegen (gleiches Format wie
der Export). Existiert noch keine `data.json`, werden diese Startdaten beim
ersten Zugriff übernommen. Sobald echte Daten gespeichert sind, wird die
`seed.json` nicht mehr verwendet.

### Manuell mit Docker

```bash
docker build -t meinzyklus .
docker run -d --name meinzyklus -p 8087:80 \
  -v /mnt/user/appdata/meinzyklus/data:/data \
  --restart unless-stopped meinzyklus
```

### Unraid Community Applications

1. Docker-Container manuell hinzufügen
2. Repository: Lokales Build oder Image
3. Port-Mapping: `8087:80`
4. Neustart-Policy: `unless-stopped`

## Cloudflare Tunnel einrichten

Um die App unter einer eigenen Domain erreichbar zu machen:

1. **Cloudflare Dashboard** → Zero Trust → Networks → Tunnels
2. Tunnel auswählen (oder neuen erstellen)
3. **Public Hostname** hinzufügen:
   - **Subdomain**: z.B. `zyklus` (ergibt `zyklus.deinedomain.de`)
   - **Domain**: Deine Domain auswählen
   - **Service Type**: `HTTP`
   - **URL**: `<unraid-ip>:8087` (z.B. `192.168.1.100:8087`)
4. Speichern – die App ist sofort unter der Domain erreichbar

### Cloudflare Access (DRINGEND empfohlen!)

Seit die Daten zentral auf dem Server liegen, ist der Endpunkt
`zyklus.deinedomain.de/api/data` öffentlich erreichbar – **ohne Schutz kann
jeder mit der URL die Gesundheitsdaten lesen oder überschreiben.** Deshalb
solltet ihr den Zugriff unbedingt per Cloudflare Access absichern:

1. Cloudflare Dashboard → Zero Trust → Access → Applications
2. **Add an Application** → Self-hosted
3. Application domain: `zyklus.deinedomain.de` (die **ganze** Domain, nicht nur ein Pfad)
4. Policy erstellen: z.B. nur eure E-Mail-Adressen erlauben
5. So müsst ihr euch erst einloggen, bevor App **und** `/api/data` geladen werden

## Datenformat

Die App speichert Daten als JSON (zentral in `data/data.json`, plus lokale Kopie):

```json
{
  "periods": [
    {
      "id": "uuid",
      "startDate": "2026-07-14",
      "endDate": "2026-07-18"
    }
  ],
  "notes": {
    "2026-07-15": "Kopfschmerzen"
  },
  "settings": {
    "defaultCycleLength": 28,
    "defaultPeriodLength": 5
  }
}
```

## Zyklusberechnung

- **Zykluslänge** = Tage zwischen aufeinanderfolgenden Periodenstarttagen
- **Laufende Periode** (ohne Ende): mindestens 3 Tage angezeigt, Tage nach heute
  als Vorhersage, höchstens 14 Tage falls das Beenden vergessen wird
- **Eisprung** = Zykluslänge − 13 + 1 Tage (Tag 16 bei 28 Tagen, wie Flo)
- **Fruchtbares Fenster** = 4 Tage vor Eisprung bis 2 Tage nach Eisprung
- **Phasen**: Menstruation → Follikelphase → Eisprung → Lutealphase

## Privatsphäre

Die Daten liegen zentral auf **eurem eigenen Server** (`data/data.json`) –
keine Cloud, kein fremder Anbieter. Der Browser hält zusätzlich eine lokale
Kopie, damit die App auch offline funktioniert.

Weil der Server unter einer öffentlichen Domain läuft, schützt **Cloudflare
Access** (siehe oben) den Zugriff auf App und Daten. Ohne diesen Schutz wäre
`/api/data` für jeden mit der URL erreichbar.

## Scarlett-MCP-Anbindung (Claude Code)

[Scarlett](https://scarlett.ai) stellt einen MCP-Server unter
`https://api.scarlett.ai/mcp` bereit. Dieses Repo bringt die passende
Claude-Code-Konfiguration mit (`.mcp.json` im Repo-Root), sodass die
Scarlett-Tools in jeder Claude-Code-Sitzung in diesem Ordner verfügbar sind.
Der API-Key liegt **nicht** im Repo: Er wird beim Start aus der
Umgebungsvariable `SCARLETT_API_TOKEN` gelesen.

> Diese Anbindung ist unabhängig von der oben beschriebenen Amazon-MCP-
> Roadmap – sie ändert nichts am Dashboard oder am Datenschema.

### 1. API-Key hinterlegen

Den Key aus deinem Scarlett-Konto als Umgebungsvariable setzen – dauerhaft
in `~/.zshrc` bzw. `~/.bashrc`:

```bash
export SCARLETT_API_TOKEN='YOUR_SCARLETT_API_KEY'
```

Danach das Terminal neu öffnen (oder `source ~/.zshrc`) und Claude Code neu
starten – die Variable wird nur beim Start gelesen.

### 2. Server registrieren

**Variante A – Projekt-Scope (im Repo, bereits erledigt):** `.mcp.json`
liegt im Repo. Beim ersten Start in diesem Ordner fragt Claude Code einmalig,
ob die Server aus `.mcp.json` genutzt werden dürfen – bestätigen, fertig.

```json
{
  "mcpServers": {
    "scarlett": {
      "type": "http",
      "url": "https://api.scarlett.ai/mcp",
      "headers": { "Authorization": "Bearer ${SCARLETT_API_TOKEN}" }
    }
  }
}
```

**Variante B – User-Scope (in allen Projekten):** Soll Scarlett überall
verfügbar sein, den Server einmalig im User-Scope anlegen (landet in
`~/.claude.json`, nicht im Repo):

```bash
claude mcp add-json --scope user scarlett '{"type":"http","url":"https://api.scarlett.ai/mcp","headers":{"Authorization":"Bearer ${SCARLETT_API_TOKEN}"}}'
```

Die einfachen Anführungszeichen sind wichtig: So ersetzt nicht die Shell
`${SCARLETT_API_TOKEN}`, sondern Claude Code beim Start – der Key steht
damit nie im Klartext in einer Konfigurationsdatei.

### 3. Prüfen

In Claude Code `/mcp` eingeben: `scarlett` sollte als verbunden erscheinen
und seine Tools auflisten. Im Terminal:

```bash
claude mcp get scarlett   # Konfiguration und Status
claude mcp list           # alle Server mit Health-Check
```

### Fehlersuche

| Symptom | Ursache / Lösung |
|---|---|
| `scarlett` fehlt in `/mcp` | Freigabe der `.mcp.json` abgelehnt → `claude mcp reset-project-choices` ausführen, Claude Code neu starten und die Freigabe bestätigen |
| Status „failed“ / nicht verbunden, oder `claude mcp list` warnt vor einer fehlenden Variable | `SCARLETT_API_TOKEN` fehlt oder ist ungültig → `echo $SCARLETT_API_TOKEN` prüfen, nach dem `export` Claude Code neu starten |
| Server doppelt (Projekt und User) | Eine Variante reicht → `claude mcp remove scarlett -s user` |

**Sicherheit:** Den Key nie in `.mcp.json`, README, Commits oder Logs
eintragen. `.env`-Dateien und `.claude/settings.local.json` sind per
`.gitignore` ausgeschlossen.
