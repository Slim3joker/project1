# 🌙 Abend-Hub

Dein persönliches Abend-Dashboard – selbstgehostet auf dem Tower, angebunden an deine
Notion-Datenbank **🎯 Abend-Tasks**. Aus der reinen To-Do-Liste soll Schritt für Schritt
deine kleine Kommandozentrale werden.

**Roadmap**
- **Phase 1 (fertig):** Aufgaben aus Notion anzeigen, nach Bereich filtern, abhaken **und direkt in der App anlegen, bearbeiten & löschen** (schreibt zurück nach Notion). Ruhiges, dunkles Design, handytauglich.
- **Phase 2 (fertig):** Google-Kalender-Agenda „Heute / Demnächst" (per geheimer iCal-URL, ohne Google-OAuth).
- **Phase 3 (geplant):** Kochkiste-Anbindung – Kühlschrank/gekochtes ansehen → Essensvorschläge.

---

## Wie es funktioniert

Ein einziger kleiner Node-Container:
- serviert das Frontend (`public/index.html`)
- spricht **serverseitig** mit Notion (dein Token bleibt auf dem Server, nie im Browser)
- braucht **keine** npm-Pakete → winziges Image, baut überall

| Endpoint | Zweck |
|---|---|
| `GET /api/tasks` | Aufgaben aus Notion laden |
| `POST /api/tasks` | Neue Aufgabe anlegen |
| `PATCH /api/tasks/:id` | Aufgabe ändern (Titel, Bereich, Priorität, Fällig, Status) |
| `DELETE /api/tasks/:id` | Aufgabe löschen (in Notion archivieren) |
| `GET /api/calendar` | Termine aus dem Google-Kalender (iCal) |
| `GET /api/health` | Statuscheck |

> Ohne Backend (z. B. beim direkten Öffnen der HTML-Datei) läuft die App im **Vorschau-Modus**
> mit Beispiel-Aufgaben – zum Anschauen des Designs.

---

## Schritt 1 – Notion-Integration einrichten

1. Öffne https://www.notion.so/my-integrations → **New integration** (Name z. B. „Abend-Hub").
2. Kopiere den **Internal Integration Token** (beginnt mit `ntn_…` bzw. `secret_…`).
3. In Notion die DB **🎯 Abend-Tasks** öffnen → oben `•••` → **Connections / Verbindungen** →
   die Integration „Abend-Hub" hinzufügen. (Sonst sieht der Server die Daten nicht.)

Die DB-ID ist bereits bekannt: `77d8a1796e0140cc8e4505021007d15f`.

---

## Schritt 1b (optional) – Google-Kalender verbinden

Für die Kalender-Agenda „Heute / Demnächst":

1. Google Kalender (Web) öffnen → **Einstellungen** (Zahnrad) → links deinen Kalender wählen.
2. Runterscrollen zu **„Geheime Adresse im iCal-Format"** → die URL kopieren (endet auf `.../basic.ics`).
3. Diese URL in der `.env` als `GOOGLE_ICAL_URL` eintragen.

> Die Adresse ist ein Geheimlink – deshalb liest **nur der Server** sie, nie der Browser.
> Ohne diesen Eintrag läuft alles weiter, die App zeigt dann nur einen „Kalender verbinden"-Hinweis.

---

## Schritt 2 – Auf dem Tower deployen (Unraid)

Am einfachsten per SSH/Terminal auf dem Tower.

```bash
# 1) Code holen
mkdir -p /mnt/user/appdata/abend-hub
cd /mnt/user/appdata/abend-hub
git clone https://github.com/Slim3joker/project1.git .

# 2) Zugangsdaten eintragen (.env)
cp .env.example .env
nano .env        # NOTION_TOKEN eintragen, speichern mit Strg+O, Enter, Strg+X

# 3) Image bauen und starten
docker build -t abend-hub .
docker run -d --name abend-hub --restart unless-stopped \
  -p 8787:3000 \
  --env-file /mnt/user/appdata/abend-hub/.env \
  -e TZ=Europe/Berlin \
  abend-hub
```

Test im lokalen Netz: **http://192.168.178.32:8787**

> Später aktualisieren:
> ```bash
> cd /mnt/user/appdata/abend-hub && git pull \
>   && docker build -t abend-hub . \
>   && docker rm -f abend-hub \
>   && docker run -d --name abend-hub --restart unless-stopped \
>        -p 8787:3000 --env-file .env -e TZ=Europe/Berlin abend-hub
> ```

*(Alternativ mit dem Unraid-Plugin „Compose Manager": `docker compose up -d --build` im Ordner.)*

---

## Schritt 3 – Domain via Cloudflare-Tunnel

Dein `cloudflared`-Container läuft schon. Im **Cloudflare Zero-Trust-Dashboard**:

1. **Networks → Tunnels →** deinen Tunnel wählen → **Public Hostname → Add**.
2. Subdomain: z. B. `hub` → Domain `erenstower.de` (ergibt `hub.erenstower.de`).
3. **Service:** `HTTP` → `192.168.178.32:8787`.
4. Speichern. Fertig – erreichbar unter **https://hub.erenstower.de**.

*(Den alten `todo.erenstower.de`-Eintrag kannst du danach löschen.)*

---

## Lokal entwickeln

```bash
export NOTION_TOKEN=ntn_...
export NOTION_DB_ID=77d8a1796e0140cc8e4505021007d15f
npm start           # -> http://localhost:3000
```

Ohne gesetzte Variablen startet der Server trotzdem und zeigt das Frontend im Vorschau-Modus.
