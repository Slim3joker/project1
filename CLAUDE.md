# Hinweise für Claude Code

## Scarlett-MCP

- Der MCP-Server `scarlett` (`https://api.scarlett.ai/mcp`, Transport HTTP)
  ist projektweit in `.mcp.json` konfiguriert.
- Authentifizierung: Bearer-Token aus der Umgebungsvariable
  `SCARLETT_API_TOKEN`. Der Key steht nirgends im Repo und gehört auch nicht
  hinein – nie in `.mcp.json`, README, Commits oder Logs schreiben.
- Ist `scarlett` unter `/mcp` nicht verbunden: Die Variable muss in der Shell
  gesetzt sein, aus der Claude Code gestartet wurde (nach `export` neu
  starten). Details und Fehlersuche im README, Abschnitt
  „Scarlett-MCP-Anbindung“.
- Den Server nicht zusätzlich per `claude mcp add` anlegen – er ist über
  `.mcp.json` bereits vorhanden.

## PC-Zugriff (Remote Desktop Commander)

- Schickt der Nutzer etwas zum Anschauen (Link, YouTube-Video, Datei/Ordner
  auf seinem PC) oder ist eine Seite aus der Cloud gesperrt: Skill
  `pc-zugriff` nutzen und über seinen Windows-PC „Jacktown“ gehen
  (`.claude/skills/pc-zugriff/SKILL.md`).

## Video-Schnitt (Yumi-Kanal)

- Videos schneiden/bearbeiten läuft nach dem Workflow im Skill
  `video-schnitt` (`.claude/skills/video-schnitt/SKILL.md`). Nach jeder
  Feedback-Runde die Erkenntnis dort unter „Regeln aus Feedback“ eintragen.

## Projekt

- `index.html` ist das FBA Cockpit: eine Datei, kein Build, kein Server –
  im Browser öffnen. Daten liegen im `localStorage` (siehe README).
