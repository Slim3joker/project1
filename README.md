# FBA Cockpit – Amazon Business Dashboard

Ein schlankes Dashboard für den Aufbau eines Amazon-FBA-Business (Amazon.de).
Eine einzige Datei, kein Server, kein Build-Tool: **`index.html` im Browser
öffnen – fertig.**

## Was es kann (Sprint 1)

- **Übersicht:** KPI-Kacheln (FBA-Bestand, unterwegs, zuhause, Alarme),
  Lagerreichweiten-Chart mit 28-Tage-Fee-Grenze, Handlungsbedarf,
  Bewegungsjournal.
- **Bestand & SKUs:** Bestände je SKU an drei Orten (FBA / unterwegs zu
  Amazon / zuhause). Bewegungen werden gebucht statt überschrieben –
  Wareneingang, Sendung an Amazon, Einlagerung, Inventur – so bleiben die
  Bestände abgeglichen und nachvollziehbar.
- **Nachschub:** Automatische Empfehlungen nach der eCommerce.de-Methodik:
  - *An Amazon senden*, wenn die Amazon-Reichweite (FBA + unterwegs) unter
    35 Tage fällt – Ziel: nie unter die 28-Tage-Grenze
    (Low-Inventory-Level-Fee).
  - *Beim Lieferanten bestellen*, wenn der Gesamtbestand unter den
    **Nachbestellpunkt** fällt.
  - *Überbestand*-Hinweis ab 120 Tagen Reichweite (Aged-Inventory-Fee).
- **Firma & Dokumente:** Firmendaten (USt-IdNr., Steuernummer, EORI, IBAN,
  Amazon Seller-ID …) mit Kopieren-Button, plus Dokumentenliste mit
  Ablageort/Link (Gewerbeanmeldung, Zertifikate, Lieferantenverträge …).
- **PPC:** Platzhalter – wird mit der Amazon-MCP-Anbindung befüllt
  (Impressions, CTR, Conversion Rate, ACoS, TACoS).

## Formeln

```
Reichweite (Tage)   = Bestand ÷ Ø Verkäufe/Tag
Nachbestellpunkt    = Ø Verkäufe/Tag × (Lieferzeit + 14 Tage Sicherheitspuffer)
Bestellmenge        = max(MOQ, Ziel-Reichweite × Ø Verkäufe/Tag)
Sendemenge (an FBA) = Ziel-Reichweite × Ø Verkäufe/Tag − FBA − unterwegs
```

Schwellen: **28 Tage** kritisch (Low-Inventory-Fee), **35 Tage** Warnung
(Vorlauf zum Einsenden), **120 Tage** Überbestand.

## Datenhaltung & Backup

Alle Daten liegen im Browser (`localStorage`, Schlüssel `fba-cockpit-v1`) –
nichts verlässt deinen Rechner. Über **Export (JSON)** sicherst du den
kompletten Stand als Datei, über **Import** spielst du ihn zurück (auch auf
einem anderen Gerät nutzbar).

> Wichtig: Browserdaten löschen = Dashboard-Daten weg. Regelmäßig
> exportieren.

### Datenschema (Export-Format)

```jsonc
{
  "version": 1,
  "firma":     { "firma": "", "ustIdNr": "", "steuernummer": "", "eori": "", ... },
  "skus": [
    {
      "id": "…", "sku": "KUV-CUBE-WS-01", "asin": "", "name": "…",
      "fba": 220,          // Bestand bei Amazon
      "inbound": 0,        // an Amazon gesendet, noch nicht eingelagert
      "home": 130,         // Bestand zuhause
      "salesPerDay": 3,    // Ø Verkäufe/Tag (30 Tage)
      "leadTime": 45,      // Lieferzeit Lieferant → FBA in Tagen
      "moq": 500,          // Mindestbestellmenge Lieferant
      "targetDays": 60     // Ziel-Lagerreichweite
    }
  ],
  "dokumente": [ { "name": "", "kategorie": "", "datum": "", "link": "", "notiz": "" } ],
  "journal":   [ { "ts": "ISO-Zeit", "sku": "", "typ": "", "menge": 0, "notiz": "" } ],
  "ppc": null              // reserviert für die MCP-Anbindung
}
```

## Roadmap: Amazon-MCP-Anbindung

Das Schema oben ist bewusst die Andockstelle für die geplante
MCP-Verbindung zum Seller-Account. Sobald sie steht, ersetzt sie die
manuelle Eingabe:

1. **FBA-Bestand & Absatz automatisch:** `skus[].fba` und
   `skus[].salesPerDay` kommen aus dem Seller-Account statt aus der
   Inventur-Buchung (SP-API: FBA Inventory / Sales & Traffic).
2. **PPC-Daten:** `ppc` wird mit Kampagnendaten befüllt (Impressions,
   Klicks, CTR, CVR, ACoS, TACoS) und der PPC-Tab freigeschaltet.
3. Ablauf dann: Claude ruft die Daten per MCP ab, aktualisiert das JSON und
   du importierst es – oder das Dashboard wird auf direkten Datenabruf
   umgestellt.

Beim ersten Start ist eine Beispiel-SKU (Kuvio Steckdosenwürfel) angelegt,
damit man sieht, wie alles funktioniert – einfach bearbeiten oder löschen.

## Skills (Claude Code)

Das Repo bringt die öffentlich nutzbaren Skills von Anthropic mit
(Apache 2.0, unter `.claude/skills/`). In jeder Claude-Code-Sitzung in diesem
Ordner sind sie verfügbar. Die Dokument-Skills `docx`, `pdf`, `pptx` und
`xlsx` sind proprietär lizenziert und werden deshalb über den offiziellen
Anthropic-Marketplace eingebunden (`.claude/settings.json`). Dazu kommen
freie Skills von Drittanbietern (MIT): `last30days` für Trend-Recherche und
die Sammlung Superpowers, eine Arbeitsweise fürs Programmieren mit
Brainstorming, Plänen, TDD und Debugging. Für Reverse Engineering kommt
REA dazu (Skill `reverse-engineer-anything` plus MCP-Server, siehe unten).
Die vollständige
Liste mit Beschreibungen, Aufruf und Aktualisierung steht in
**[SKILLS.md](SKILLS.md)**.

## REA-MCP: Reverse Engineering (Claude Code)

[REA](https://github.com/morluto/rea) (MIT) untersucht Apps ohne deren
Quellcode: JavaScript-/Electron-Apps, .NET-Assemblies, Android-APKs,
Websites, Netzwerkmitschnitte und – mit Hopper, Ghidra oder IDA – native
Binärdateien. Die Analyse läuft lokal; jede Aussage kommt mit Belegen.

`.mcp.json` startet den Server als `npx -y rea-agents@6.4.0 mcp`. Kein
API-Key nötig, nur **Node.js 22.19+, 24.11+ oder 26+** und npm. Beim ersten
Start lädt `npx` das Paket herunter, danach meldet `/mcp` den Server `rea`
mit 170 Werkzeugen. Der Skill `reverse-engineer-anything` erklärt Claude,
wann und wie REA einzusetzen ist.

- **Native Analyse** braucht Hopper, Ghidra (`GHIDRA_INSTALL_DIR`) oder IDA
  auf deinem Rechner. Statische JavaScript- und .NET-Analysen laufen ohne.
- **Ohne MCP im Terminal:**
  `npx -y rea-agents@6.4.0 analyze-javascript-application /pfad/zur/app --json`
- **Nicht zusätzlich per `npx rea-agents setup` für Claude Code
  einrichten.** Setup trägt `rea` in `~/.claude.json` ein und legt den Skill
  unter `~/.claude/skills/` ab, dann ist beides doppelt aktiv.
- **Aktualisieren:** Version in `.mcp.json` und den Skill gemeinsam anheben,
  siehe `SKILLS.md`.
