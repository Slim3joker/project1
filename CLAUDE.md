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

## Skills

- `.claude/skills/` enthält unveränderte Kopien öffentlicher Skills:
  Anthropic (Apache 2.0), `last30days` (MIT, `mvanhorn/last30days-skill`)
  und Superpowers (MIT, `obra/superpowers`). Dazu kommt das Superpowers-
  Startskript `.claude/hooks/session-start`. Nicht inhaltlich bearbeiten. Zum
  Aktualisieren neu aus der jeweiligen Quelle kopieren, siehe `SKILLS.md`.
- Superpowers-Skills verweisen aufeinander als `superpowers:<name>`. Hier
  heißen sie ohne Präfix: `superpowers:brainstorming` ist der Skill
  `brainstorming`.
- `docx`, `pdf`, `pptx` und `xlsx` sind proprietär lizenziert: nie ins Repo
  kopieren. Sie kommen über den Marketplace in `.claude/settings.json`.
- Das Repo ist öffentlich. Die eigenen Skills aus dem claude.ai-Konto
  bleiben privat: nicht ins Repo kopieren und auch nicht namentlich nennen,
  weder in `SKILLS.md` noch sonst wo. Das ist so entschieden, also nicht
  erneut nachfragen.
- Wenn ein Skill dazukommt oder entfernt wird, `SKILLS.md` mit anpassen.

## Projekt

- `index.html` ist das FBA Cockpit: eine Datei, kein Build, kein Server –
  im Browser öffnen. Daten liegen im `localStorage` (siehe README).
