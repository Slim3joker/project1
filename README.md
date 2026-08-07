# FBA Cockpit – Amazon Business Dashboard

Dashboard für den Aufbau eines Amazon-FBA-Business (Amazon.de), gebaut als
kleine Server-App für den Unraid-Server **Tower**. Alle Geräte – Laptop, Handy,
Tablet – greifen auf **denselben Datenstand** zu.

## Was es kann

- **Übersicht:** KPI-Kacheln (FBA-Bestand, unterwegs, zuhause, Alarme),
  Lagerreichweiten-Chart mit der 28-Tage-Fee-Grenze, Handlungsbedarf,
  Bewegungsjournal.
- **Bestand & SKUs:** Bestände je SKU an drei Orten (bei Amazon / unterwegs zu
  Amazon / zuhause). Bewegungen werden **gebucht**, nicht überschrieben –
  Wareneingang, Sendung an Amazon, Einlagerung, Inventur.
- **Nachschub:** Automatische Empfehlungen nach der eCommerce.de-Methodik –
  wann an Amazon senden, wann beim Lieferanten bestellen, wo Überbestand liegt.
- **Firma & Dokumente:** Firmendaten (USt-IdNr., Steuernummer, EORI, IBAN,
  Amazon Seller-ID) mit Kopieren-Button, plus Dokumentenliste mit Ablageort.
- **PPC:** Platzhalter – wird mit der Amazon-MCP-Anbindung befüllt.

## Formeln

```
Reichweite (Tage)   = Bestand ÷ Ø Verkäufe/Tag
Nachbestellpunkt    = Ø Verkäufe/Tag × (Lieferzeit + 14 Tage Sicherheitspuffer)
Bestellmenge        = max(MOQ, Ziel-Reichweite × Ø Verkäufe/Tag)
Sendemenge (an FBA) = Ziel-Reichweite × Ø Verkäufe/Tag − FBA − unterwegs
```

Schwellen: **28 Tage** kritisch (Low-Inventory-Level-Fee), **35 Tage** Warnung
(Vorlauf zum Einsenden), **120 Tage** Überbestand (Aged-Inventory-Fee).

---

# Installation auf Tower (Unraid, 192.168.178.32)

## Schritt 1 – Code holen und Image bauen

Per SSH auf den Server (`ssh root@192.168.178.32`), dann Block für Block:

```bash
mkdir -p /mnt/user/appdata/fba-cockpit-src
cd /mnt/user/appdata/fba-cockpit-src
wget -O master.tar.gz https://github.com/Slim3joker/project1/archive/refs/heads/master.tar.gz
tar xzf master.tar.gz --strip-components=1
docker build -t fba-cockpit .
```

Am Ende muss `Successfully tagged fba-cockpit:latest` stehen.

## Schritt 2 – Datenordner anlegen

Der Container läuft unter Unraids Standard-Benutzer `nobody:users` (99:100).
Der Ordner muss ihm gehören, sonst kann er nicht schreiben (`EACCES`):

```bash
mkdir -p /mnt/user/appdata/fba-cockpit
chown -R nobody:users /mnt/user/appdata/fba-cockpit
```

## Schritt 3 – Container starten

Zwei Varianten – **eine** davon wählen.

**Variante A: mit Passwort** (Schutz in der App selbst)

```bash
docker run -d --name fba-cockpit --restart unless-stopped \
  --user 99:100 \
  -p 8477:8477 \
  -v /mnt/user/appdata/fba-cockpit:/data \
  -e FBA_PASSWORD='HIER-DEIN-PASSWORT' \
  -e TZ='Europe/Berlin' \
  fba-cockpit
```

**Variante B: ohne Login** – nur sinnvoll, wenn **Cloudflare Access** davor
hängt (Schritt 5). Ohne Access sieht jeder alle Daten, der die Adresse kennt.

```bash
docker run -d --name fba-cockpit --restart unless-stopped \
  --user 99:100 \
  -p 8477:8477 \
  -v /mnt/user/appdata/fba-cockpit:/data \
  -e FBA_AUTH='off' \
  -e TZ='Europe/Berlin' \
  fba-cockpit
```

Prüfen:

```bash
docker logs fba-cockpit | tail -5
```

Erwartet: `[start] FBA Cockpit läuft auf Port 8477`, dazu je nach Variante
`Passwortschutz aktiv` oder `Login ist abgeschaltet`.

Häufige Stolpersteine:

| Meldung im Log | Ursache | Lösung |
|---|---|---|
| `EACCES: permission denied` | Ordner gehört nicht `nobody:users` | Schritt 2 nachholen, dann `docker rm -f fba-cockpit` und neu starten |
| `FBA_PASSWORD ist nicht gesetzt` | Wert war leer | Container löschen, Befehl mit echtem Passwort wiederholen |
| `name is already in use` | Container existiert schon | `docker rm -f fba-cockpit`, dann neu starten |

**Jetzt im Browser testen:** http://192.168.178.32:8477

## Schritt 4 – Von außen erreichbar machen (Cloudflare Tunnel)

Der Tunnel-Container läuft bereits. Nur einen neuen Hostnamen ergänzen:

1. **Cloudflare Zero Trust → Networks → Tunnels → <dein Tunnel> → Configure → Public Hostnames**
2. **Add a public hostname:**
   - Subdomain: `fba`
   - Domain: `derpixel.com`
   - Type: **HTTP**
   - URL: `192.168.178.32:8477`  ← intern **http**, nicht https, sonst Zertifikatsfehler
3. Speichern. Danach erreichbar unter **https://fba.derpixel.com**

## Schritt 5 – Cloudflare Access davorschalten

**Bei Variante B (ohne Login) ist das Pflicht, nicht optional** – und zwar
**bevor** der Hostname aus Schritt 4 angelegt wird. Sonst liegen Steuernummer
und IBAN in der Zwischenzeit offen im Internet.

**Cloudflare Zero Trust → Access → Applications → Add an application →
Self-hosted**, Domain `fba.derpixel.com`, Policy z. B. „E-Mail = deine
Adresse" mit Einmal-Code per Mail. Danach kommt ohne deine Mailadresse
niemand überhaupt bis zur Seite.

Bei Variante A ist Access die empfehlenswerte zweite Schicht vor dem Passwort.

## Updates einspielen

```bash
cd /mnt/user/appdata/fba-cockpit-src
wget -O master.tar.gz https://github.com/Slim3joker/project1/archive/refs/heads/master.tar.gz
tar xzf master.tar.gz --strip-components=1
docker build -t fba-cockpit .
docker rm -f fba-cockpit
# danach Schritt 2 erneut ausführen
```

Deine Daten liegen im Volume `/mnt/user/appdata/fba-cockpit/` und bleiben dabei
erhalten – der Container darf jederzeit gelöscht und neu gebaut werden.

---

## Wo die Daten liegen

Eine Datei: **`/mnt/user/appdata/fba-cockpit/fba-cockpit.json`**.
Geschrieben wird atomar (erst temporäre Datei, dann umbenennen), damit bei einem
Stromausfall keine halb geschriebene Datei zurückbleibt. Ist die Datei einmal
unlesbar, startet der Server **nicht** und überschreibt sie auch nicht – so geht
nichts verloren, du kannst aus einem Export wiederherstellen.

Zusätzlich sichert der **Export-Button** den kompletten Stand als JSON-Datei,
**Import** spielt ihn zurück (überschreibt dann alles auf dem Server).

Bestandsbewegungen rechnet **der Server**, nicht der Browser. Deshalb können sich
Handy und Laptop nicht gegenseitig die Bestände überschreiben, auch wenn beide
gleichzeitig offen sind. Alle Ansichten laden alle 30 Sekunden und beim
Zurückwechseln zum Tab neu.

## Umgebungsvariablen

| Variable | Pflicht | Bedeutung |
|---|---|---|
| `FBA_PASSWORD` | ja* | Login-Passwort. Leer = Dashboard bleibt gesperrt. |
| `FBA_AUTH` | nein | `off` schaltet den Login ganz ab – nur mit Cloudflare Access davor. |
| `PORT` | nein | Standard `8477`. |
| `DATA_DIR` | nein | Standard `/data` (im Container). |
| `TZ` | nein | Zeitzone, z. B. `Europe/Berlin`. |

## Hinweis zum Repository

Dieses GitHub-Repo ist **öffentlich**. Der Code darf das sein – deine
Geschäftsdaten liegen ausschließlich auf Tower und nie im Repo. Trage also keine
echten Firmendaten, Passwörter oder Tunnel-Token in Dateien dieses Projekts ein.

## Roadmap: Amazon-MCP-Anbindung

Die Datenstruktur ist die Andockstelle für die geplante MCP-Verbindung zum
Seller-Account:

1. **Bestand & Absatz automatisch:** `skus[].fba` und `skus[].salesPerDay` kommen
   aus dem Seller-Account statt aus der Inventur-Buchung (SP-API: FBA Inventory /
   Sales & Traffic).
2. **PPC-Daten:** Impressions, Klicks, CTR, CVR, ACoS, TACoS füllen den PPC-Tab.

## Technik

Node.js 22, **keine npm-Abhängigkeiten** – nur Bordmittel. Dadurch kann der
Container nicht an kaputten Paketen scheitern und das Image bleibt klein.

- `server.js` – HTTP-Server, JSON-API, Sessions, Datenhaltung
- `public/index.html` – die komplette Oberfläche (eine Datei)
- `Dockerfile` / `docker-compose.yml` – Container
