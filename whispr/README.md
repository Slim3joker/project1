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

`docker-compose.yml` liegt bei. Die eigenen Pfade kommen **nicht** in die yml,
sondern in eine `.env` daneben — die ist in `.gitignore`, ein `git pull`
überschreibt sie also nicht:

```bash
cd /mnt/user/appdata/whispr
cp env.compose.example .env
nano .env          # TRANSKRIPTE_DIR auf deinen Share setzen
docker compose up -d --build
```

Falls `docker compose` (mit Leerzeichen) nicht existiert, hast du die alte v1 —
dann überall `docker-compose` (mit Bindestrich) schreiben.

Wichtig: Nach einer Änderung an `.env` oder `docker-compose.yml` reicht
`restart` **nicht**, das übernimmt keine neuen Variablen. Es braucht:

```bash
docker-compose up -d --force-recreate whispr
```

Beim ersten Auftrag lädt der Whisper-Container sein Modell herunter. Es landet
in `./whisper-models` und bleibt dort — ab dem zweiten Mal geht es sofort.

Standard ist `ASR_MODEL: small` auf der CPU, weil das überall läuft. Für
Deutsch ist `medium` deutlich besser, wenn der Server den RAM hat.

### Mit Nvidia-GPU

In `docker-compose.yml` den CPU-`whisper`-Block auskommentieren und den
GPU-Block darunter aktivieren. Zwei Dinge sind dabei wichtig:

- **Image muss `:latest-gpu` sein.** Im normalen `:latest` ist kein CUDA
  enthalten — der Container startet, rechnet aber still auf der CPU weiter.
- **`runtime: nvidia` statt `deploy:`.** Wenn `docker compose` (mit Leerzeichen)
  bei dir nicht existiert und du `docker-compose` (mit Bindestrich) brauchst,
  hast du die alte v1. Die **ignoriert einen `deploy:`-Block komplett und ohne
  Fehlermeldung** — die Karte wird dann nie durchgereicht.

Prüfen, ob die Nvidia-Runtime da ist (Unraid: Plugin „Nvidia Driver"):

```bash
docker info | grep -i runtimes
```

## Wenn etwas nicht geht: der Selbsttest

```bash
docker exec whispr node scripts/doctor.js
```

Das ist der erste Griff bei jedem Problem — er ersetzt das Raten. Geprüft wird
der komplette Weg **aus dem Container heraus**, also auf genau der Strecke, die
die App auch nimmt: Konfiguration, Ausgabeordner, freier Speicher, freier RAM
gemessen am gewählten Modell, Erreichbarkeit des Dienstes und zum Schluss eine
echte Transkription mit einer selbst erzeugten Tondatei. Läuft der Test durch,
funktioniert auch ein Upload.

Statt einer Fehlermeldung nennt er die Ursache samt nächstem Schritt:

```
Erreichbarkeit
  ✓ Whisper-Dienst antwortet · http://whisper:9000/docs → HTTP 200

Echte Transkription
  ✗ Transkription fehlgeschlagen · nach 45.1s

  Die Verbindung riss MITTEN in der Anfrage ab. Das ist die Signatur eines
  abgestürzten Containers, nicht eines Netzwerkfehlers – der Dienst war ja
  eben noch erreichbar. Fast immer zu wenig RAM beim Laden des Modells.
  Beweis: docker inspect whisper --format "oom={{.State.OOMKilled}} ..."
```

Zwei Ursachen sehen von außen gleich aus und sind es nicht:

- **`large-v3` auf der CPU** braucht rund 5 GB RAM und wird beim Laden vom
  Kernel abgeschossen. Der Selbsttest misst den freien RAM und sagt, welches
  Modell hineinpasst.
- **Das Modell kommt nicht an.** Der Dienst lädt es beim ersten Start von
  Hugging Face. Klappt das nicht, stürzt er ab, wird neu gestartet, stürzt
  wieder ab — von außen sieht das aus wie ein flackerndes Netzwerk, mal grün,
  mal rot. Im Log steht dann `Unable to open file 'model.bin'` oder ein Fehler
  vom Hub. Abhilfe: den angefangenen Download wegwerfen.

```bash
docker-compose down
rm -rf whisper-models
docker-compose up -d
docker logs -f whisper     # bis "Uvicorn running on http://0.0.0.0:9000"
```

Kommt derselbe Hub-Fehler wieder, hat der Container kein Internet — auf Unraid
meist DNS. Prüfen und beheben:

```bash
docker exec whisper python -c "import urllib.request; print(urllib.request.urlopen('https://huggingface.co', timeout=10).status)"
```

Bei einem DNS-Fehler in der `docker-compose.yml` beim `whisper`-Service den
`dns:`-Block aktivieren (steht auskommentiert drin).

Der `whisper`-Service hat einen Healthcheck. Ein Container, der im
Absturz-Neustart-Kreis hängt, steht in `docker ps` sonst als „Up" da, obwohl
nichts geht:

```bash
docker ps | grep whisper     # "(healthy)" · "(unhealthy)" · "(health: starting)"
```

Ein **gelber** Punkt oben rechts ist dagegen kein Fehler: Whisper rechnet gerade
und beantwortet den Statuscheck nicht. Rot heißt Problem, gelb heißt beschäftigt.

Ohne Docker geht der Test auch direkt — dann aber vom Host aus, was einen
anderen Netzwerkweg nimmt und weniger aussagt:

```bash
npm run doctor
```

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
