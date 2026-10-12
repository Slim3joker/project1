# Skills für Claude Code

Dieses Repo bringt die **öffentlich nutzbaren Skills von Anthropic** mit:
Skills unter einer Lizenz, die Kopieren und Weitergeben erlaubt (Apache 2.0).
Sie liegen in `.claude/skills/<skill-name>/SKILL.md` und stehen in jeder
Claude-Code-Sitzung in diesem Ordner automatisch zur Verfügung.

**Nutzen:** Claude wählt einen passenden Skill selbst aus, sobald deine
Anfrage zur Beschreibung passt. Gezielt aufrufen kannst du ihn mit
`/<skill-name>`, z. B. `/theme-factory`. Welche Skills geladen sind, zeigt
`/skills`.

## Im Repo enthalten (14 Skills)

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

- **Diese Skills wirken von selbst:** `discernment-nudge`, `academy-guide`
  und `learn` greifen ohne Aufruf, sobald eine Anfrage passt. Wenn du das
  nicht willst, lösch den jeweiligen Ordner unter `.claude/skills/`.
- **Voraussetzungen für Skripte:**
  - `slack-gif-creator`: `pip install -r .claude/skills/slack-gif-creator/requirements.txt`
  - `webapp-testing`: Playwright für Python (`pip install playwright`)
  - `web-artifacts-builder`: Node.js 18 oder neuer
  - `mcp-builder` (Evaluation): `pip install -r .claude/skills/mcp-builder/scripts/requirements.txt`
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
