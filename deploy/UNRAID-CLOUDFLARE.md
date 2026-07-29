# Kochkiste auf dem Tower + über Cloudflare erreichbar machen

Diese Anleitung ist für **deinen** Server (Tower, `192.168.178.32`) und deinen
bestehenden Cloudflare-Tunnel auf `derpixel.com` geschrieben. Kopier die Befehle
einfach 1:1. Am Ende läuft die App unter **https://kochkiste.derpixel.com**.

Mach es **Schritt für Schritt** — nach jedem Abschnitt kurz prüfen, ob es geklappt hat.

---

## Schritt 1 — Per SSH auf den Tower

Vom PC:
```bash
ssh root@192.168.178.32
```
(oder vom Handy mit Termius/JuiceSSH, Host `192.168.178.32`, User `root`)

---

## Schritt 2 — App-Repo in die AppData holen

Wir legen die App unter `/mnt/user/appdata/kochkiste` ab (dort, wo auch deine
anderen Container-Daten liegen).

```bash
git clone https://github.com/Slim3joker/project1.git /mnt/user/appdata/kochkiste
```

> **Falls die App noch nicht im `master`-Branch ist** (aktuell entwickeln wir sie
> auf dem Branch `claude/koch-app-unraid-cloudflare-ex3k2n`), hol dir diesen Branch:
> ```bash
> cd /mnt/user/appdata/kochkiste
> git checkout claude/koch-app-unraid-cloudflare-ex3k2n
> ```
> Sobald wir den Branch nach `master` gemergt haben, reicht später ein einfaches
> `git pull` auf `master`.

Prüfen, dass die App da ist:
```bash
ls -l /mnt/user/appdata/kochkiste/index.html
```
→ Es sollte eine `index.html` angezeigt werden.

---

## Schritt 3 — Webserver-Container starten

Ein winziger nginx-Container liefert die App auf **Port 8088** aus:

```bash
docker run -d \
  --name kochkiste \
  --restart unless-stopped \
  -p 8088:80 \
  -v /mnt/user/appdata/kochkiste:/usr/share/nginx/html:ro \
  -v /mnt/user/appdata/kochkiste/deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
```

Prüfen, dass er läuft:
```bash
docker ps | grep kochkiste
```
→ Status sollte `Up ...` sein.

> **Der Container taucht danach ganz normal in der Unraid Docker-Oberfläche auf**
> (Start/Stop/Logs per Klick). Nur das Icon fehlt — das kannst du später über
> "Edit → Icon URL" setzen, ist aber egal.

---

## Schritt 4 — Lokal testen

Im Browser am PC (im selben Netz) öffnen:

**http://192.168.178.32:8088**

→ Die Kochkiste sollte erscheinen. Wenn ja: Server-Teil fertig. ✅
(Wenn nicht: `docker logs kochkiste | tail -30` zeigt den Fehler.)

---

## Schritt 5 — Über Cloudflare von überall erreichbar machen

Jetzt hängen wir die App an deinen bestehenden Tunnel — **genau wie damals bei n8n**.

1. **Cloudflare Zero Trust** öffnen → **Networks → Tunnels** → deinen Tunnel →
   **Configure → Public Hostnames** → **Add a public hostname**.
2. Ausfüllen:
   - **Subdomain:** `kochkiste`
   - **Domain:** `derpixel.com`
   - **Type:** `HTTP`
   - **URL:** `192.168.178.32:8088`

   > ⚠️ Intern **http** (nicht https) und **ohne** `https://` davor — sonst
   > Zertifikatsfehler. Nur `192.168.178.32:8088` eintragen.
3. **Save hostname.**

Der passende DNS-Eintrag (`kochkiste` als CNAME) wird von Cloudflare automatisch
angelegt. Nach ~30 Sekunden testen:

**https://kochkiste.derpixel.com**

→ Läuft von überall, auch mobil. 🎉

---

## Schritt 6 — App aktualisieren (unser Entwicklungs-Ablauf)

Wenn wir zusammen etwas an der App geändert haben und ich es gepusht habe, holst
du es so auf den Server:

```bash
cd /mnt/user/appdata/kochkiste && git pull
```

Danach im Browser einfach **neu laden**. Kein Container-Neustart nötig — nginx
liefert die neue Datei sofort aus (Cache ist für `index.html` bewusst aus).

> **Optional, noch bequemer:** Leg dir in Unraid unter **Settings → User Scripts**
> ein Skript "kochkiste-update" mit genau dieser einen Zeile an. Dann reicht ein
> Klick auf "Run Script", statt SSH zu öffnen.

---

## Optional — Login-Schutz (Cloudflare Access)

So bleibt die App privat: Beim Öffnen kommt ein einmaliger PIN-Code per Mail an
deine Adresse, sonst kommt niemand rein. Keine zusätzliche Software nötig.

1. **Cloudflare Zero Trust → Access → Applications → Add an application → Self-hosted.**
2. **Application domain:** Subdomain `kochkiste`, Domain `derpixel.com`.
3. **Policy** anlegen:
   - Name z. B. `Nur ich`
   - Action: **Allow**
   - Include → **Emails** → deine Mail-Adresse eintragen.
4. Speichern.

Ab jetzt fragt `kochkiste.derpixel.com` erst nach deiner Mail + Code, bevor die
App lädt.

---

## Kurz-Referenz (Befehle zum Nachschlagen)

| Zweck | Befehl |
|---|---|
| Läuft der Container? | `docker ps \| grep kochkiste` |
| Logs / Fehler ansehen | `docker logs kochkiste \| tail -30` |
| App aktualisieren | `cd /mnt/user/appdata/kochkiste && git pull` |
| Container neu starten | `docker restart kochkiste` |
| Container entfernen | `docker rm -f kochkiste` |

**Eckdaten dieses Setups:**
- Interner Port: `8088` → http://192.168.178.32:8088
- Öffentliche Adresse: https://kochkiste.derpixel.com
- App-Ordner auf dem Server: `/mnt/user/appdata/kochkiste`
