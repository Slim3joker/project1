# Geräte-Sync für die Kochkiste (gemeinsamer Haushalt) — einfache Variante

Damit du **und deine Frau** dieselbe Einkaufsliste, denselben Kühlschrank und Vorrat
seht — egal von welchem Handy. Dafür läuft ein **winziger Zusatz-Container** auf dem
Tower, der den gemeinsamen Stand speichert.

**Ohne Passwort:** Die App-Adresse ist fest eingebaut, die App verbindet sich von allein.
Ihr müsst auf keinem Gerät etwas eintippen — einfach die App öffnen. Geschützt ist die
Liste über die **nicht öffentliche Adresse** (`kk-api.erenstower.de`), also so „privat" wie
deine App ohnehin schon ist.

> Reihenfolge: **erst dieses Backend aufsetzen**, dann die neue App-Version ziehen — fertig.

---

## Schritt 1 — Backend-Datei holen

Per SSH auf dem Tower (`ssh root@192.168.178.32`):

```bash
mkdir -p /mnt/user/appdata/kochkiste-sync
B="https://raw.githubusercontent.com/Slim3joker/project1/refs/heads/claude/koch-app-unraid-cloudflare-ex3k2n"
curl -fL -o /mnt/user/appdata/kochkiste-sync/server.js "$B/sync/server.js"
```

---

## Schritt 2 — Container starten (ohne Passwort)

```bash
docker run -d \
  --name kochkiste-sync \
  --restart unless-stopped \
  -p 8089:8089 \
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

> Ohne gesetzten `KK_KEY` läuft das Backend bewusst **offen** (nur über die geheime Adresse
> geschützt) — genau die einfache Variante. Willst du später doch ein Passwort, sag Bescheid,
> dann ergänzen wir `-e KK_KEY="…"` und tragen es einmalig in der App ein.

---

## Schritt 3 — Über Cloudflare erreichbar machen

**Zero Trust → Tunnels → dein Tunnel → Public Hostnames → Add**

- **Subdomain:** `kk-api`
- **Domain:** `erenstower.de`
- **Type:** `HTTP`
- **URL:** `192.168.178.32:8089`

Speichern. Nach ~30 Sek. testen (vom Handy/überall):
**https://kk-api.erenstower.de/api/health** → `{"ok":true,"version":0}`

---

## Schritt 4 — Neue App-Version ziehen

```bash
B="https://raw.githubusercontent.com/Slim3joker/project1/refs/heads/claude/koch-app-unraid-cloudflare-ex3k2n"
curl -fL -o /mnt/user/appdata/kochkiste/index.html "$B/index.html"
```

**Das war's.** Ab jetzt: Du und deine Frau öffnet einfach `kochkiste.erenstower.de` — die App
verbindet sich automatisch. Einer legt „Milch" rein → kurz drauf sieht's der andere; jemand
hakt „Brot" ab → verschwindet bei beiden; frisch Gekauftes landet im gemeinsamen Kühlschrank.

> Den Status siehst du in der App unter **🛒 Einkauf → 🔗 Geräte-Sync**
> („Verbunden ✓"). Dort kann man den Sync bei Bedarf auch trennen.

---

## Aktualisieren / Nützliches

| Zweck | Befehl |
|---|---|
| Läuft der Sync? | `docker ps \| grep kochkiste-sync` |
| Logs ansehen | `docker logs kochkiste-sync \| tail -30` |
| Backend-Code updaten | `curl -fL -o /mnt/user/appdata/kochkiste-sync/server.js "$B/sync/server.js" && docker restart kochkiste-sync` |
| Neu starten | `docker restart kochkiste-sync` |
| Gemeinsamen Stand ansehen | `cat /mnt/user/appdata/kochkiste-sync/state.json` |

**Sicherung:** Der komplette geteilte Stand liegt in einer Datei:
`/mnt/user/appdata/kochkiste-sync/state.json` — die nimmt dein AppData-Backup automatisch mit.

**Kein Datenverlust:** Beim ersten Verbinden werden lokale und geteilte Daten **vereint**
(nicht überschrieben) — egal, welches Gerät zuerst online geht. Ändern zwei Geräte gleichzeitig,
führt das Backend die Listen zusammen und schickt bei einem Konflikt den aktuellen Stand zurück.
