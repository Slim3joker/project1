# 🍲 Kochkiste

Eine persönliche Koch- & Rezept-App: Vorratsschrank, Geschmacks-Radar, Wochenplan,
Einkaufsliste und Koch-Logbuch. Alles in **einer einzigen HTML-Datei** — kein Backend,
keine externen Abhängigkeiten. Die Daten liegen lokal im Browser (`localStorage`).

## Projektstruktur

| Datei | Zweck |
|---|---|
| `index.html` | **Die komplette App.** Hier wird entwickelt. |
| `docker-compose.yml` | Startet einen kleinen nginx-Webserver, der die App ausliefert. |
| `deploy/nginx.conf` | Webserver-Konfiguration (blockt `.git`, kein Cache auf der App). |
| `Dockerfile` | Optional: baut ein fertiges Image mit App drin (für den normalen Betrieb nicht nötig). |
| `deploy/UNRAID-CLOUDFLARE.md` | **Schritt-für-Schritt-Anleitung**: auf dem Tower installieren + über Cloudflare erreichbar machen. |

## App lokal ansehen

Einfach `index.html` doppelklicken — läuft direkt im Browser, ohne alles andere.

## Auf dem Unraid-Server (Tower) betreiben

Die App läuft als winziger nginx-Container auf dem Tower und ist über den
Cloudflare-Tunnel unter **https://kochkiste.derpixel.com** erreichbar.

👉 Komplette Anleitung: **[`deploy/UNRAID-CLOUDFLARE.md`](deploy/UNRAID-CLOUDFLARE.md)**

## Fern-Entwicklung — so arbeiten wir daran weiter

Der Ablauf, wenn wir gemeinsam etwas an der App ändern:

1. **Ich (Claude) bearbeite** `index.html` und pushe die Änderung nach GitHub.
2. **Du holst sie auf den Server**, per SSH auf dem Tower:
   ```bash
   cd /mnt/user/appdata/kochkiste && git pull
   ```
3. **Browser neu laden** — fertig. Kein Container-Neustart nötig, nginx liefert die
   neue Datei sofort aus.

> Deine Daten (Vorräte, Geschmacksprofil …) liegen im Browser, **nicht** in der Datei.
> Ein Update der App löscht also nichts.

### Hinweis: Daten pro Gerät

Weil die App im `localStorage` speichert, sind deine Eingaben **pro Gerät und Browser**
getrennt — das Handy kennt die Vorräte vom PC nicht. Für die persönliche Nutzung ist das
in Ordnung. Wenn du später geräteübergreifende Synchronisierung willst, ist das ein
eigener Ausbauschritt (kleines Backend) — sag einfach Bescheid.
