# Whispr — Audio zu Markdown

Audiodatei hochladen → Whisper transkribiert → fertige **`.md`-Datei** landet in
einem Ordner deiner Wahl (auf Unraid: direkt in einem Share, den du per SMB
öffnen kannst). Das Markdown hat YAML-Frontmatter und saubere Absätze — also
genau das Format, das man einer KI vorwerfen kann.

```
┌──────────┐  Datei   ┌──────────┐  HTTP   ┌───────────────┐
│ Browser  │ ───────► │  whispr  │ ──────► │ whisper (ASR) │
└──────────┘          └────┬─────┘         └───────────────┘
                           │ .md
                           ▼
                  /mnt/user/Notizen/Transkripte
```

## Was anders ist als beim letzten Versuch

Die alte Version hat aus dem Node-Prozess heraus `docker run … whisper …`
aufgerufen. Das konnte nicht funktionieren:

| Problem damals | Jetzt |
|---|---|
| `docker run` aus dem Container → braucht Docker-Socket | HTTP-Aufruf an den Nachbarcontainer |
| `-v ${UPLOAD_DIR}:/data` mountete einen Container-Pfad als Host-Pfad | keine Volume-Akrobatik mehr nötig |
| `--entrypoint whisper` auf einem Image, das ein **Webservice** ist | offizielle `/asr`-API des Images |
| Dateiname ging ungeprüft in eine Shell | keine Shell im Spiel |
| `/transcript/:filename` erlaubte `../../etc/passwd` | Dateiname wird auf den Basisnamen reduziert |
| Jobs nur im RAM → Neustart = alles weg | `jobs.json`, laufende Jobs werden nach Neustart fortgesetzt |
| Ergebnis: `.txt` neben dem Audio | `.md` mit Frontmatter im Zielordner |

## Schnellstart (lokal zum Ausprobieren)

```bash
cd whispr
npm install
docker run -d -p 9000:9000 -e ASR_MODEL=small \
  onerahmet/openai-whisper-asr-webservice:latest
WHISPER_URL=http://127.0.0.1:9000 \
OUTPUT_DIR=./transkripte \
npm start
# → http://localhost:8098
```

## Auf Unraid einrichten

### Variante A: docker-compose (empfohlen)

`docker-compose.yml` liegt bei. Anpassen musst du nur den Ausgabe-Pfad:

```yaml
    volumes:
      - ./data:/data
      - /mnt/user/Notizen/Transkripte:/transkripte   # ← dein Share
```

Dann:

```bash
cd /mnt/user/appdata/whispr
docker compose up -d --build
```

Beim ersten Start lädt der Whisper-Container sein Modell herunter
(`large-v3` ≈ 3 GB). Es landet in `./whisper-models` und bleibt dort — der
zweite Start geht sofort.

**Ohne Nvidia-GPU:** den `deploy:`-Block beim `whisper`-Service löschen und
`ASR_MODEL` auf `small` oder `medium` stellen. Auf CPU braucht `large-v3`
schnell das Fünf- bis Zehnfache der Audiolänge.

### Variante B: zwei Container über die Unraid-Oberfläche

1. **Whisper**: `onerahmet/openai-whisper-asr-webservice:latest`,
   Port `9000`, `ASR_ENGINE=faster_whisper`, `ASR_MODEL=large-v3`,
   Pfad `/models` → `/mnt/user/appdata/whisper-models`.
2. **Whispr**: dieses Repo bauen (`docker build -t whispr:latest .`),
   Port `8098`, Pfade `/data` → `/mnt/user/appdata/whispr`,
   `/transkripte` → `/mnt/user/Notizen/Transkripte`,
   Variable `WHISPER_URL` → `http://<Tower-IP>:9000`.

Der grüne Punkt oben rechts in der Oberfläche zeigt dir, ob Whisper erreichbar
und der Ausgabeordner beschreibbar ist. Wenn er rot ist, steht dort auch warum.

### Von außen erreichbar (Cloudflare Tunnel)

Wenn du die App durch einen Tunnel schickst, **unbedingt `AUTH_TOKEN` setzen** —
sonst kann jeder, der die URL kennt, Dateien hochladen und deine Transkripte
lesen. Mit gesetztem Token fragt die Oberfläche nach einem Passwort und merkt
sich die Anmeldung 90 Tage im Cookie.

## Ohne eigenen Server: OpenAI-Backend

Kein GPU-Rechner in der Nähe? Dann:

```
TRANSCRIBE_BACKEND=openai
OPENAI_API_KEY=sk-…
OPENAI_MODEL=whisper-1
```

Die API nimmt maximal 25 MB pro Anfrage. Whispr rechnet größere Dateien vorher
automatisch auf mono/16 kHz Opus herunter und schneidet sie, wenn nötig, in
10-Minuten-Stücke — die Zeitmarken werden danach wieder korrekt
zusammengesetzt. Dafür wird `ffmpeg` gebraucht; im mitgelieferten Docker-Image
ist es enthalten.

`OPENAI_BASE_URL` lässt sich auf jede kompatible API umbiegen (Groq, ein
lokaler Server …).

## Das Ergebnis

```markdown
---
titel: "Lieferantengespräch Chen Core"
quelle: "sprachnotiz-2026-08-07.m4a"
dauer: "30:34"
dauer_sekunden: 1834
sprache: "de"
modell: "whisper (asr-webservice)"
backend: "local"
transkribiert_am: "2026-08-07T09:14:22.000Z"
woerter: 4127
tags: ["sourcing", "kuvio"]
---

# Lieferantengespräch Chen Core

> Sprachnotiz nach dem Call, für die Ablage.

## Transkript

Also, kurz zum Stand beim Steckdosenwürfel. Der Lieferant hat die Muster
verschickt, die sollten Freitag da sein.

Wichtig ist noch die CE-Konformitätserklärung. Ohne die können wir nicht
einlisten, das hatten wir letztes Mal schon.

## Mit Zeitmarken

- **[0:00]** Also, kurz zum Stand beim Steckdosenwürfel. …
```

Whisper liefert Häppchen von wenigen Sekunden. Whispr fügt sie zu echten
Absätzen zusammen — neuer Absatz bei einer längeren Sprechpause oder wenn ein
Absatz lang genug ist und gerade ein Satz endet. Das macht den Unterschied
zwischen einer Textwüste und etwas, das man lesen (und einem Modell füttern)
kann.

Den Zeitmarken-Abschnitt kannst du mit `TIMESTAMPS=false` weglassen.

## Einstellungen

Alle in `.env.example` beschrieben. Die wichtigsten:

| Variable | Standard | Bedeutung |
|---|---|---|
| `OUTPUT_DIR` | `/transkripte` | **Hier landen die `.md`-Dateien** |
| `AUDIO_ARCHIVE_DIR` | leer | Audio hierhin verschieben statt löschen |
| `TRANSCRIBE_BACKEND` | `local` | `local` oder `openai` |
| `WHISPER_URL` | `http://127.0.0.1:9000` | Adresse des ASR-Containers |
| `WHISPER_LANG` | `de` | `auto` erkennt die Sprache selbst |
| `CONCURRENCY` | `1` | gleichzeitige Transkriptionen |
| `MAX_UPLOAD_MB` | `500` | Obergrenze pro Datei |
| `JOB_TIMEOUT_MIN` | `120` | danach gilt ein Job als hängengeblieben |
| `AUTH_TOKEN` | leer | gesetzt = Passwortschutz an |

## Bedienung

- Mehrere Dateien auf einmal ablegen — sie werden nacheinander abgearbeitet.
- Titel, Tags und eine Notiz sind optional und landen im Frontmatter. Ohne
  Titel wird der Dateiname genommen.
- Der Browser darf zwischendurch zu: die Verarbeitung läuft auf dem Server, die
  Auftragsliste holt den Stand wieder.
- Fehlgeschlagene Aufträge lassen sich mit **Erneut** wiederholen, solange die
  Audiodatei noch im Eingang liegt.
- Das Archiv listet, was tatsächlich im Ausgabeordner liegt — auch Dateien aus
  früheren Läufen.

## API

| Methode | Pfad | Zweck |
|---|---|---|
| `POST` | `/api/upload` | Felder: `files[]`, `title`, `tags`, `language`, `notes` |
| `GET` | `/api/jobs` · `/api/jobs/:id` | Auftragsstatus |
| `POST` | `/api/jobs/:id/cancel` · `/api/jobs/:id/retry` | abbrechen / wiederholen |
| `GET` | `/api/transcripts` | Markdown-Dateien im Ausgabeordner |
| `GET` | `/api/transcripts/:name` | Inhalt (`?download=1` als Datei) |
| `GET` | `/api/health` | Backend erreichbar? Ordner beschreibbar? |

Mit `AUTH_TOKEN` zusätzlich den Header `x-auth-token` mitschicken. Damit kannst
du auch aus n8n heraus Dateien einwerfen.

## Tests

```bash
npm test
```

Startet einen Mock-Whisper und fährt den echten Server hoch: Upload,
Transkription, geschriebenes Markdown, Namenskollisionen, Pfad-Traversal und
Persistenz der Auftragsliste.
