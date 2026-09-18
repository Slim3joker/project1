« Goldwörter auf dem Unraid-Server "Tower" hosten »
====================================================

Ziel: Die App läuft dauerhaft unter http://192.168.178.32:8788 im Heimnetz
und aktualisiert sich automatisch, sobald neue Wörter/Features gepusht werden.

Prinzip: Ein winziger nginx-Container serviert die statischen Dateien aus
/mnt/user/appdata/goldwoerter. Ein User-Script zieht dort regelmäßig per
`git pull` den neuesten Stand vom GitHub-Branch.

--------------------------------------------------------------------
SCHRITT 1 — Repo auf den Server holen (einmalig, per SSH)
--------------------------------------------------------------------
Per Termius/JuiceSSH als root auf Tower, dann:

    mkdir -p /mnt/user/appdata/goldwoerter
    git clone --branch claude/turkish-learning-quiz-app-uj801y \
      https://github.com/Slim3joker/project1.git /mnt/user/appdata/goldwoerter

WICHTIG: Ist das Repo privat, braucht git ein Token. Dann stattdessen:
    git clone --branch claude/turkish-learning-quiz-app-uj801y \
      https://<DEIN_GITHUB_TOKEN>@github.com/Slim3joker/project1.git \
      /mnt/user/appdata/goldwoerter
(Token unter github.com -> Settings -> Developer settings -> Personal access
tokens erstellen, Scope "repo", nur Lesen reicht.)

--------------------------------------------------------------------
SCHRITT 2 — nginx-Container anlegen (Unraid Web-UI)
--------------------------------------------------------------------
1. Web-UI öffnen: http://192.168.178.32 -> Reiter "Docker" -> "Add Container"
2. Felder ausfüllen:
   - Name:        goldwoerter
   - Repository:  nginx:alpine
   - Network:     bridge
3. "Add another Path, Port, Variable..." -> Port:
   - Container Port: 80
   - Host Port:      8788        (frei auf Tower; kollidiert mit nichts)
4. Nochmal "Add another..." -> Path:
   - Container Path: /usr/share/nginx/html
   - Host Path:      /mnt/user/appdata/goldwoerter
   - Access Mode:    Read Only
5. "Apply" drücken. Fertig.

Test: http://192.168.178.32:8788 im Browser -> Goldwörter sollte laden.
(Handy im selben WLAN: gleiche Adresse. Am besten als Icon auf den
Startbildschirm legen.)

--------------------------------------------------------------------
SCHRITT 3 — Auto-Update einrichten (User Scripts Plugin)
--------------------------------------------------------------------
1. Apps -> "User Scripts" installieren (falls noch nicht drauf).
2. Settings -> User Scripts -> "Add New Script" -> Name: goldwoerter-update
3. Skript-Inhalt:

    #!/bin/bash
    cd /mnt/user/appdata/goldwoerter || exit 1
    git fetch origin claude/turkish-learning-quiz-app-uj801y
    git reset --hard origin/claude/turkish-learning-quiz-app-uj801y
    echo "Goldwörter aktualisiert: $(git log -1 --oneline)"

4. Zeitplan: "Scheduled Daily" (oder Custom `0 5 * * *` = täglich 5 Uhr).

Ab dann gilt: Neue Wörter werden hier im Chat gebaut und gepusht ->
Tower zieht sie nachts automatisch -> App ist aktuell. Kein Neustart des
Containers nötig (statische Dateien werden direkt frisch ausgeliefert).

--------------------------------------------------------------------
OPTIONAL — Von unterwegs erreichbar (Cloudflare Tunnel)
--------------------------------------------------------------------
Da der Cloudflared-Tunnel-Container schon läuft:
1. Cloudflare Zero Trust Dashboard -> Networks -> Tunnels -> deinen Tunnel
   wählen -> "Public Hostname" -> "Add a public hostname"
2. Subdomain: goldwoerter   Domain: derpixel.com
   Service: HTTP -> 192.168.178.32:8788
3. Speichern -> App läuft unter https://goldwoerter.derpixel.com

Hinweis: Damit ist die App öffentlich im Internet (Wörter sind nicht
geheim, Spielstand liegt eh nur im jeweiligen Browser). Wer das nicht
will, lässt diesen Schritt weg und nutzt die App nur im WLAN.

--------------------------------------------------------------------
WICHTIG ZU WISSEN
--------------------------------------------------------------------
- Der Spielstand (Gold, Streak, gelernte Wörter) hängt an der ADRESSE im
  Browser. Beim Umzug von der claude.ai-Version auf die Tower-Adresse:
  in der alten App Einstellungen -> Export, in der neuen -> Import.
- Backup: /mnt/user/appdata/goldwoerter liegt im Array und ist damit
  parity-geschützt. Nichts weiter nötig.
- Wenn http://192.168.178.32:8788 nicht lädt: `docker logs goldwoerter | tail -20`
