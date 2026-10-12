# Skills für Claude Code

Dieses Repo bringt die **öffentlich nutzbaren Skills von Anthropic** mit:
Skills unter einer Lizenz, die Kopieren und Weitergeben erlaubt (Apache 2.0).
Sie liegen in `.claude/skills/<skill-name>/SKILL.md` und stehen in jeder
Claude-Code-Sitzung in diesem Ordner automatisch zur Verfügung.

**Nutzen:** Claude wählt einen passenden Skill selbst aus, sobald deine
Anfrage zur Beschreibung passt. Gezielt aufrufen kannst du ihn mit
`/<skill-name>`, z. B. `/theme-factory`. Welche Skills geladen sind, zeigt
`/skills`.

## Im Repo enthalten (14 Anthropic-Skills + 17 von Drittanbietern)

Alle 14 sind **unveränderte Kopien** des Originals, Lizenz Apache 2.0
(`LICENSE.txt` im jeweiligen Ordner).

### Design & Gestaltung

| Skill | Wofür |
|---|---|
| `algorithmic-art` | Generative Kunst mit p5.js: Flow Fields, Partikelsysteme, Zufall mit festem Seed, interaktive Parameter. |
| `canvas-design` | Poster, Kunstwerke und statische Designs als `.png`/`.pdf`, ausgehend von einer eigenen Design-Philosophie. Bringt 27 freie Schriftfamilien mit. |
| `frontend-design` | Eigenständiges, durchdachtes UI-Design (Ästhetik, Typografie), damit Oberflächen nicht nach Standard-Vorlage aussehen. |
| `theme-factory` | Wendet eines von 10 fertigen Farb-/Schrift-Themes auf Folien, Dokumente, Reports oder Landingpages an – oder erzeugt ein neues. |
| `brand-guidelines` | Wendet **Anthropics eigenes** Branding (Farben, Typografie) an. Nicht für deine eigene Marke gedacht. |

### Web & Entwicklung

| Skill | Wofür |
|---|---|
| `web-artifacts-builder` | Aufwendige HTML-Artefakte mit React, Tailwind CSS und shadcn/ui (mehrere Komponenten, State, Routing). |
| `webapp-testing` | Lokale Web-Apps mit Playwright testen: Klicks prüfen, Screenshots, Browser-Logs. Passt z. B. zum FBA Cockpit (`index.html`). |
| `mcp-builder` | Eigene MCP-Server bauen (Python/FastMCP oder Node/TypeScript), inkl. Best Practices und Evaluation. |

### Kommunikation

| Skill | Wofür |
|---|---|
| `internal-comms` | Interne Texte in bewährten Formaten: Statusberichte, Leadership-Updates, Newsletter, FAQs, Incident-Reports. |
| `slack-gif-creator` | Animierte GIFs, die Slacks Größen- und Formatvorgaben einhalten. |

### Lernen & Denken

| Skill | Wofür |
|---|---|
| `learn` | Lernmodus: erklärt, wie und warum etwas funktioniert, mit Quiz, Karteikarten und Lernpfaden. |
| `discernment-nudge` | Hängt nach einer gewichtigen Antwort 2–3 kurze Rückfragen an, mit denen du Fakten, Annahmen und fehlenden Kontext prüfst (höchstens einmal pro Gespräch). |
| `academy-guide` | Empfiehlt passende Kurse und Tutorials aus der Claude Academy (academy.claude.com), wenn du fragst, wie man Claude nutzt. |

### Skills bauen

| Skill | Wofür |
|---|---|
| `skill-creator` | Neue Skills erstellen, bestehende verbessern, mit Evals testen und die Beschreibung so optimieren, dass der Skill zuverlässig auslöst. |

## Drittanbieter (17 Skills)

| Skill | Wofür |
|---|---|
| `last30days` | Recherchiert, was in den letzten 30 Tagen über ein Thema gesagt wurde: Reddit, X, YouTube, TikTok, Hacker News, Polymarket, GitHub und Web, gewichtet nach echtem Engagement. Aufruf z. B. `/last30days Steckdosenwürfel`. |
| `html` | Liefert große Ergebnisse (Pläne, Reports, Reviews, Vergleiche, Dashboards, kleine Werkzeuge) als eine eigenständige HTML-Seite statt als langen Markdown-Text, in vier Stufen: Lese-Seite, Seite mit Grafiken und Tabellen, Seite zum Klicken und Einstellen, Wegwerf-Werkzeug. Stufe 3 und 4 enden mit einem „Copy as …“-Knopf, der deine Auswahl als nächsten Prompt zurückgibt. Aufruf: `/html`. |
| Superpowers (15 Skills) | Arbeitsweise fürs Programmieren: erst Brainstorming und Plan, dann testgetrieben umsetzen, systematisch debuggen, Code-Review. Die einzelnen Skills stehen unten. |

### `last30days`

Quelle: [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill),
Version 3.28.0, Lizenz MIT (`LICENSE` im Ordner). Unverändert übernommen, nur
ohne die Demo-Medien (`assets/`), die auch das Original beim Paketieren
weglässt.

- **Ohne API-Schlüssel** laufen Reddit, Hacker News, Polymarket, GitHub und die
  Websuche. Für X, YouTube, TikTok usw. braucht es Schlüssel (z. B.
  `SCRAPECREATORS_API_KEY`). Die gehören als Umgebungsvariable in die
  Cloud-Umgebung, nie ins Repo.
- Der Skill darf ohne Rückfrage `Bash`, `Read`, `Write` und die Websuche
  nutzen (`allowed-tools`). Browser-Cookies liest er nur nach ausdrücklicher
  Zustimmung.
- Am PC ist er als Plugin installiert. Solche Plugins laden in Cloud-Sitzungen
  nicht, deshalb liegt er hier als Skill.

### `html`

Quelle: Skill-Paket `robogold-html.zip` von [Robogold](https://robogold.de),
Lizenz MIT (`LICENSE` im Ordner). Umsetzung des Artikels „Using Claude Code:
The Unreasonable Effectiveness of HTML“ von Thariq Shihipar. Unverändert
übernommen (`SKILL.md`, `README.md`, `LICENSE`).

- Wie der Skill hier eingesetzt wird, regelt `CLAUDE.md`, Abschnitt
  „HTML-Ausgabe“, nicht der Skill selbst. Kurz: Von selbst greift er nur bei
  großen Ausgaben. RoboGold-Inhalte bekommen den Look von `robogold-style`.
  Fertige Seiten kommen als privater claude.ai-Link und landen nie im Repo.
- Keine Skripte, keine Abhängigkeiten. Der im README erwähnte Zusatz-Skill
  für Live-Regler gehört nicht zum Paket.

### Superpowers (15 Skills)

Eine feste Arbeitsweise fürs Programmieren mit Claude: erst klären und
planen, dann testgetrieben umsetzen, systematisch debuggen und vor dem
Abschluss nachweisen, dass es funktioniert. Die Skills greifen von selbst,
sobald eine Anfrage passt.

| Skill | Wofür |
|---|---|
| `brainstorming` | Klärt vor jeder Umsetzung mit Rückfragen, was du wirklich willst, und legt einen Entwurf zur Freigabe vor. Optional mit Browser-Begleiter für Skizzen. |
| `writing-plans` | Macht aus dem freigegebenen Entwurf einen kleinteiligen Umsetzungsplan. |
| `executing-plans` | Arbeitet einen Plan in der laufenden Sitzung selbst ab. |
| `subagent-driven-development` | Lässt Subagenten die Aufgaben eines Plans einzeln umsetzen und prüft jede in zwei Stufen: Plantreue, dann Codequalität. |
| `dispatching-parallel-agents` | Verteilt unabhängige Aufgaben parallel auf mehrere Subagenten. |
| `test-driven-development` | Erst ein fehlschlagender Test, dann der Code (Red-Green-Refactor). |
| `systematic-debugging` | Verfolgt einen Fehler in vier Phasen bis zur eigentlichen Ursache, bevor etwas geändert wird. |
| `verification-before-completion` | Erst Prüfbefehle laufen lassen, dann „fertig“ melden. |
| `requesting-code-review` | Lässt die Arbeit vor dem Abschluss von einem Subagenten reviewen. |
| `receiving-code-review` | Review-Anmerkungen erst technisch prüfen, dann umsetzen – nicht blind übernehmen. |
| `using-git-worktrees` | Legt für neue Features einen isolierten Arbeitsbereich (Git-Worktree) an. |
| `finishing-a-development-branch` | Am Ende entscheiden: lokal mergen, Pull Request oder Branch behalten. |
| `using-superpowers` | Einstieg: verpflichtet Claude, vor jeder Antwort passende Skills zu prüfen und zu nutzen. |
| `writing-skills` | Eigene Skills schreiben und mit Subagenten testen. |
| `diagnosing-superpowers` | Findet heraus, warum eine Sitzung mit Superpowers schiefging, und erstellt auf Wunsch einen bereinigten Fehlerbericht. |

Quelle: [obra/superpowers](https://github.com/obra/superpowers),
Version 7.0.0 (Commit `bb92a77`), Lizenz MIT (`LICENSE` in jedem Ordner).
Unverändert übernommen.

- **Namen:** Im Original heißen die Skills `superpowers:<name>`, und so
  verweisen sie auch aufeinander. Hier heißen sie ohne Präfix, z. B.
  `/brainstorming` statt `/superpowers:brainstorming`.
- **Start-Hook:** Im Plugin lädt ein SessionStart-Hook bei jedem Start den
  Text von `using-superpowers` in die Sitzung. Erst dadurch hält sich Claude
  konsequent an die Skills. Das Skript liegt unverändert unter
  `.claude/hooks/session-start` (MIT, `LICENSE` daneben). Aktiv ist es nur
  mit diesem Eintrag auf oberster Ebene in `.claude/settings.json`:

  ```json
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "CLAUDE_PLUGIN_ROOT=\"$CLAUDE_PROJECT_DIR/.claude\" bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-start\"",
            "shell": "bash",
            "async": false
          }
        ]
      }
    ]
  }
  ```

  `CLAUDE_PLUGIN_ROOT` sorgt nur dafür, dass das Skript im Format von
  Claude Code antwortet. Ohne den Eintrag greifen die Skills nur über ihre
  Beschreibung, also weniger zuverlässig. Zum Abschalten den Eintrag löschen.
- **Wirkung:** Mit Superpowers fragt und plant Claude auch bei kleinen
  Änderungen erst. Deine Anweisungen und `CLAUDE.md` haben laut Skill
  Vorrang. Ein „mach einfach“ genügt also, um abzukürzen.
- **Browser-Begleiter:** Der optionale Skizzen-Begleiter von `brainstorming`
  lädt das Logo der Entwickler von deren Website und übermittelt dabei die
  Superpowers-Version. Abschalten mit der Umgebungsvariable
  `SUPERPOWERS_DISABLE_TELEMETRY=1`.
- **Am PC nicht zusätzlich als Plugin installieren.** Sonst sind alle Skills
  und der Start-Hook doppelt aktiv.

## Eigener Skill (1)

| Skill | Wofür |
|---|---|
| `robogold-style` | Hausstil der Marke RoboGold für YouTube-Folien, Kurs-Lektionen, Recherche-Screenshots, Thumbnails und Instagram-Karussells (4:5): dunkel zuerst (Navy), Gold als einziger Akzent, Grafiken aus einem Würfelraster, „Glut-Bühne“ für Intros. Rein abstrakt, keine Figuren. Vor dem Bauen `brand-book.html` im Ordner öffnen. Aufruf: `/robogold-style`. |

Für dieses Repo gebaut und wird hier gepflegt, anders als die unveränderten
Kopien oben. Er ist eine Weiterentwicklung eines Skills unter CC BY 4.0. Die
Quellenangabe steht in `ATTRIBUTION.md` und muss bei jeder Weitergabe mit.

## Über den Anthropic-Marketplace (nicht kopiert)

| Skill | Wofür |
|---|---|
| `docx` | Word-Dokumente erstellen, lesen und bearbeiten (inkl. Änderungsverfolgung, Kommentare, Vorlagen). |
| `pdf` | PDFs lesen, zusammenführen, teilen, Formulare ausfüllen, Wasserzeichen, OCR. |
| `pptx` | PowerPoint-Präsentationen erstellen, lesen und bearbeiten. |
| `xlsx` | Excel-/CSV-Tabellen erstellen, bereinigen, mit Formeln und Diagrammen. |

Diese vier Dokument-Skills sind öffentlich einsehbar, aber **proprietär**
lizenziert: Kopieren und Weitergeben ist verboten. Deshalb liegen sie nicht
als Dateien im Repo. Stattdessen registriert `.claude/settings.json` den
offiziellen Anthropic-Marketplace und aktiviert das Plugin `document-skills`.
Einmalig installieren:

```
/plugin install document-skills@anthropic-agent-skills
```

Danach heißen die Skills `document-skills:docx`, `document-skills:pdf` usw.
Voraussetzung: Du hast beim ersten Start die Vertrauensabfrage für diesen
Ordner bestätigt.

> In Cloud-Sitzungen (claude.ai/code) laden Marketplace-Plugins nicht. Dort
> kommen `docx`, `pdf`, `pptx` und `xlsx` aus deinem claude.ai-Konto, wo sie
> bereits aktiv sind.

## Bewusst nicht kopiert

| Skill | Grund |
|---|---|
| `claude-api` | Ist in Claude Code eingebaut und wird mit jedem Update aktualisiert. Eine Kopie im Repo würde den eingebauten `/claude-api` ersetzen und mit der Zeit veralten (Modelle, Preise). |
| `doc-coauthoring` | Hat im Original keine Lizenzdatei und darf daher nicht weitergegeben werden. Erhältlich über `/plugin install example-skills@anthropic-agent-skills`. Dieses Plugin installiert allerdings alle Beispiel-Skills, also auch die oben schon enthaltenen noch einmal als `example-skills:…`. |

## Hinweise

- **Diese Skills wirken von selbst:** `discernment-nudge`, `academy-guide`,
  `learn` und die Superpowers-Skills greifen ohne Aufruf, sobald eine Anfrage
  passt. Wenn du das nicht willst, lösch den jeweiligen Ordner unter
  `.claude/skills/`. `html` greift von selbst nur bei großen Ausgaben (siehe
  `CLAUDE.md`).
- **Voraussetzungen für Skripte:**
  - `slack-gif-creator`: `pip install -r .claude/skills/slack-gif-creator/requirements.txt`
  - `webapp-testing`: Playwright für Python (`pip install playwright`)
  - `web-artifacts-builder`: Node.js 18 oder neuer
  - `mcp-builder` (Evaluation): `pip install -r .claude/skills/mcp-builder/scripts/requirements.txt`
  - `brainstorming` (Browser-Begleiter): Node.js
  - Superpowers-Start-Hook: `bash` (unter Windows Git Bash)
- **Lizenzen:** Apache 2.0 je Skill in `LICENSE.txt`. Die mitgelieferten
  Schriften (`canvas-design/canvas-fonts`) stehen unter der SIL Open Font
  License (`*-OFL.txt`). Hinweise zu Fremdkomponenten:
  `.claude/skills/THIRD_PARTY_NOTICES.md`.
- **Deine eigenen Skills** aus dem claude.ai-Konto sind hier nicht enthalten.
  Das Repo ist öffentlich.

## Herkunft & Aktualisieren

- 13 Skills stammen aus [anthropics/skills](https://github.com/anthropics/skills),
  Commit `dbd4588` (9. Oktober 2026).
- `learn` gehört zu Anthropics Beispiel-Skills in claude.ai (Apache 2.0) und
  ist nicht im GitHub-Repo enthalten.

Die 13 GitHub-Skills auf den neuesten Stand bringen:

```bash
git clone --depth 1 https://github.com/anthropics/skills /tmp/anthropic-skills
for s in academy-guide algorithmic-art brand-guidelines canvas-design \
         discernment-nudge frontend-design internal-comms mcp-builder \
         skill-creator slack-gif-creator theme-factory \
         web-artifacts-builder webapp-testing; do
  rm -rf ".claude/skills/$s" && cp -a "/tmp/anthropic-skills/skills/$s" ".claude/skills/$s"
done
cp /tmp/anthropic-skills/THIRD_PARTY_NOTICES.md .claude/skills/
```

Vor dem Commit prüfen, ob sich eine Lizenz geändert hat:
`grep -L "Apache License" .claude/skills/*/LICENSE.txt` darf nichts ausgeben.

`last30days` auf den neuesten Stand bringen:

```bash
git clone --depth 1 https://github.com/mvanhorn/last30days-skill /tmp/last30days
rm -rf .claude/skills/last30days
cp -a /tmp/last30days/skills/last30days .claude/skills/last30days
rm -rf .claude/skills/last30days/assets
cp /tmp/last30days/LICENSE .claude/skills/last30days/LICENSE
```

`html` auf den neuesten Stand bringen (neue ZIP von Robogold):

```bash
unzip -o robogold-html.zip -d /tmp/robogold-html
rm -rf .claude/skills/html
cp -a /tmp/robogold-html/html .claude/skills/html
```

Superpowers auf den neuesten Stand bringen:

```bash
git clone --depth 1 https://github.com/obra/superpowers /tmp/superpowers
for d in /tmp/superpowers/skills/*/; do
  s=$(basename "$d")
  rm -rf ".claude/skills/$s" && cp -a "$d" ".claude/skills/$s"
  cp /tmp/superpowers/LICENSE ".claude/skills/$s/LICENSE"
done
cp /tmp/superpowers/hooks/session-start .claude/hooks/session-start
cp /tmp/superpowers/LICENSE .claude/hooks/LICENSE
```

Danach prüfen: Ist im Original ein Skill weggefallen, den Ordner hier löschen.
Kommt einer dazu oder hat sich `hooks/hooks.json` im Original geändert, die
Tabelle und den Hook-Eintrag oben anpassen.
