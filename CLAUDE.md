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
  Anthropic (Apache 2.0), `last30days` (MIT, `mvanhorn/last30days-skill`),
  `html` (MIT, Robogold) und `surprise-me` (CC BY 4.0, Robogold). Nicht
  inhaltlich bearbeiten. Zum Aktualisieren neu aus der jeweiligen Quelle
  kopieren, siehe `SKILLS.md`. Ausnahme: `robogold-style` ist ein eigener
  Skill dieses Repos und wird hier gepflegt (siehe unten).
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

## Design: RoboGold-Style

- Projekt-Skill `robogold-style` (`.claude/skills/robogold-style/`) ist der
  Hausstil der Marke RoboGold für YouTube-Folien, Kurs-Lektionen,
  Recherche-Screenshots, Thumbnails und Instagram-Karussells (4:5) –
  dunkel zuerst (Navy), Gold als einziger Akzent, inklusive „Glut-Bühne“
  (leuchtender Glaswürfel). Vor dem Bauen `brand-book.html` im selben Ordner
  ansehen.
- Für RoboGold-Inhalte immer `robogold-style` verwenden. Die Vorlage, aus der
  er entstanden ist, ist nur Herkunft (`ATTRIBUTION.md`), nicht zum Bauen.
- Der Style ist bewusst abstrakte Gestaltungskunst: keine Maskottchen-,
  Comic-, Kinder- oder Roboterfiguren, keine Produktmotive oder Produktfotos.

## HTML-Ausgabe (Skill `html`)

- `html` (`.claude/skills/html/`) legt fest, wann ein Ergebnis als
  HTML-Seite statt als Markdown kommt und in welcher Stufe (1–4). Der Skill
  bleibt unverändert; wie er hier eingesetzt wird, regelt nur dieser
  Abschnitt.
- Von selbst nur bei großen Ausgaben: lange Pläne, Reports, Vergleiche,
  Review- und Triage-Aufgaben. Kurze Antworten bleiben normaler Text.
  Arbeit an `index.html` (FBA Cockpit) ist Code-Arbeit und kein Anlass für
  den Skill. Ausdrücklich gewünscht: `/html`, „als HTML“, „html this“.
- Form und Look trennen: `html` bestimmt Stufe, Aufbau und Export-Knopf.
  Bei RoboGold-Inhalten (Video, Kurs, Social) kommt der Look aus
  `robogold-style` (Navy/Gold) statt aus der Palette des Skills. Interne
  Seiten (Pläne, FBA-Auswertungen, Recaps) behalten den Look des Skills.
- Fertige Seiten als privaten claude.ai-Link veröffentlichen, statt sie „im
  Browser zu öffnen“. Die Arbeitsdatei nicht im Repo-Ordner ablegen und nie
  committen: Das Repo ist öffentlich, die Seiten enthalten oft
  Geschäftszahlen.

## Surprise Me (Skill `surprise-me`)

- `surprise-me` (`.claude/skills/surprise-me/`) ist ein Modus für einen
  einzelnen visuellen Build mit maximalem Anspruch: mindestens drei
  fortgeschrittene Techniken gemischt, echte Assets und mindestens drei
  Runden Screenshot → schriftliche Kritik → Verbessern. Der Skill bleibt
  unverändert; wie er hier eingesetzt wird, regelt nur dieser Abschnitt.
- Nur auf ausdrücklichen Aufruf: `/surprise-me`, „surprise me“, „blow me
  away“. Nicht von selbst für normale Design-, Seiten- oder Folien-Arbeit.
- RoboGold-Inhalte (Video, Kurs, Social): Der Look kommt aus
  `robogold-style` (Farben, Schrift, nur abstrakte Motive), auch für
  generierte Bilder und Videos. `surprise-me` bringt dort nur den Anspruch,
  den Technik-Mix und die Prüfschleife. Die freie Stilwahl des Skills gilt
  nur für Inhalte, die nicht zu RoboGold gehören.
- Kosten: Vor jedem kostenpflichtigen Aufruf (Bild, Video, Stimme, z. B.
  Higgsfield, Kling, ElevenLabs) Modell, Anzahl und geschätzte Credits
  nennen und auf ein Go warten, auch bei kleinen Beträgen.
- Ablage: Build und `passes/`-Screenshots nicht im Repo-Ordner, sondern im
  Scratchpad bzw. einem Arbeitsordner außerhalb. Nie committen. Statt „im
  Browser öffnen“ am Ende als privaten claude.ai-Link veröffentlichen, wie
  bei `html`. Öffentliches Hosting bleibt verboten („Never deploy“).
- Screenshots: `node .claude/skills/surprise-me/scripts/shoot.js
  <absoluter-pfad.html> <out.png> [--mobile]`. Den Pfad absolut übergeben,
  ein relativer Pfad läuft unter Linux/macOS ins Leere. In Cloud-Sitzungen
  sind Playwright und Chromium schon da: kein `npm install`, kein
  `npx playwright install`.
