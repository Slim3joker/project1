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

Eine einzige Datei (`index.html`), kein Server, kein Build-Tool.
Daten werden im `localStorage` des Browsers gespeichert.

## Deployment auf Unraid

### Docker Compose

```bash
docker-compose up -d --build
```

Die App läuft dann auf `http://<unraid-ip>:8087`.

### Startdaten (seed.json)

Optional kann neben der `docker-compose.yml` eine `seed.json` liegen
(gleiches Format wie der Export). Browser ohne eigene Daten übernehmen
sie beim ersten Öffnen automatisch – kein manueller Import nötig.
Lokale Einträge und Importe haben immer Vorrang und werden nie überschrieben.

**Wichtig:** `seed.json` steht in der `.gitignore` und darf nie ins Repo
committet werden – sie enthält private Gesundheitsdaten.

### Manuell mit Docker

```bash
docker build -t meinzyklus .
docker run -d --name meinzyklus -p 8087:80 --restart unless-stopped meinzyklus
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

### Cloudflare Access (optional, empfohlen!)

Da es private Gesundheitsdaten sind, solltet ihr den Zugriff schützen:

1. Cloudflare Dashboard → Zero Trust → Access → Applications
2. **Add an Application** → Self-hosted
3. Application domain: `zyklus.deinedomain.de`
4. Policy erstellen: z.B. nur eure E-Mail-Adressen erlauben
5. So müsst ihr euch erst einloggen, bevor die App geladen wird

## Datenformat

Die App speichert Daten als JSON im Browser-localStorage:

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
- **Eisprung** = Zykluslänge − 14 Tage (Lutealphase ist relativ konstant)
- **Fruchtbares Fenster** = 5 Tage vor Eisprung bis 1 Tag nach Eisprung
- **Phasen**: Menstruation → Follikelphase → Eisprung → Lutealphase

## Privatsphäre

Alle Daten werden ausschließlich im `localStorage` des Browsers gespeichert.
Es werden keine Daten an Server gesendet. Die App funktioniert komplett offline.
