# Geräte-Sync für die Kochkiste (gemeinsamer Haushalt)

Damit du **und deine Frau** dieselbe Einkaufsliste, denselben Kühlschrank und Vorrat
seht — egal von welchem Handy. Dafür läuft ein **winziger Zusatz-Container** auf dem
Tower, der den gemeinsamen Stand speichert. Geschützt über einen **Haushalts-Schlüssel**
(ein langes Passwort), das die App einmal speichert.

> Reihenfolge: **erst dieses Backend aufsetzen**, danach schalte ich die Sync-Funktion
> in der App frei. Bis dahin läuft die App wie gewohnt (pro Gerät).

---

## Schritt 1 — Haushalts-Schlüssel erzeugen

Per SSH auf dem Tower (`ssh root@192.168.178.32`) einen zufälligen Schlüssel erzeugen:

```bash
head -c 24 /dev/urandom | base64
```

→ Es kommt so etwas wie `NWLTzhh6j6OBmROIiX5rgDZ6bjQFJb97` heraus.
**Kopier ihn dir raus** — den brauchst du gleich beim Container und später einmal in der App
(auch auf dem Handy deiner Frau). Behandle ihn wie ein Passwort.

---

## Schritt 2 — Backend-Dateien holen

```bash
mkdir -p /mnt/user/appdata/kochkiste-sync
B="https://raw.githubusercontent.com/Slim3joker/project1/refs/heads/claude/koch-app-unraid-cloudflare-ex3k2n"
curl -fL -o /mnt/user/appdata/kochkiste-sync/server.js "$B/sync/server.js"
```

---

## Schritt 3 — Container starten

**Ersetze `DEIN_SCHLUESSEL`** durch den Schlüssel aus Schritt 1:

```bash
docker run -d \
  --name kochkiste-sync \
  --restart unless-stopped \
  -p 8089:8089 \
  -e KK_KEY="DEIN_SCHLUESSEL" \
  -e KK_DATA="/app/state.json" \
  -v /mnt/user/appdata/kochkiste-sync:/app \
  -w /app \
  node:alpine node server.js
```

Läuft er?
```bash
docker ps | grep kochkiste-sync
curl -s http://localhost:8089/api/health
```
→ Erwartet: `{"ok":true,"version":0}` ✅

---

## Schritt 4 — Über Cloudflare erreichbar machen

Genau wie bei der App selbst: **Zero Trust → Tunnels → dein Tunnel → Public Hostnames → Add**

- **Subdomain:** `kk-api`
- **Domain:** `erenstower.de`
- **Type:** `HTTP`
- **URL:** `192.168.178.32:8089`

Speichern. Nach ~30 Sek. testen (vom Handy/überall):

**https://kk-api.erenstower.de/api/health** → sollte `{"ok":true,"version":0}` zeigen.

---

## Schritt 5 — Bescheid geben

Sobald das läuft, sag mir Bescheid. Dann schalte ich die Sync-Funktion in der App frei.
Du gibst dann **einmal** die Sync-Adresse (`https://kk-api.erenstower.de`) und den
**Haushalts-Schlüssel** in der App ein — auf jedem Gerät, das mitmachen soll (dein Handy,
das deiner Frau, PC …). Ab dann ist der Stand überall gleich.

---

## Aktualisieren / Nützliches

| Zweck | Befehl |
|---|---|
| Läuft der Sync? | `docker ps \| grep kochkiste-sync` |
| Logs ansehen | `docker logs kochkiste-sync \| tail -30` |
| Backend-Code updaten | `curl -fL -o /mnt/user/appdata/kochkiste-sync/server.js "$B/sync/server.js" && docker restart kochkiste-sync` |
| Neu starten | `docker restart kochkiste-sync` |
| Gemeinsamen Stand ansehen | `cat /mnt/user/appdata/kochkiste-sync/state.json` |

**Sicherung:** Der komplette geteilte Stand liegt in einer einzigen Datei:
`/mnt/user/appdata/kochkiste-sync/state.json` — die wird von deinem normalen AppData-Backup
mitgesichert.

**Technik-Kurzfassung:** Das Backend hält genau einen gemeinsamen Zustand mit einer
hochzählenden `version`. Beim Speichern schickt die App die `version`, auf der sie basiert;
hat in der Zwischenzeit jemand anderes gespeichert, meldet das Backend einen Konflikt (409)
und schickt den aktuellen Stand zurück, damit nichts überschrieben wird.
