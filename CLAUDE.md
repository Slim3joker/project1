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

## Projekt

- `index.html` ist das FBA Cockpit: eine Datei, kein Build, kein Server –
  im Browser öffnen. Daten liegen im `localStorage` (siehe README).
