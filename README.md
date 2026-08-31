# FBA Cockpit – Amazon Business Command Center

Ein Dashboard, um das eigene Amazon-FBA-Business (Amazon.de) zu steuern –
Zahlen, Bestände, Werbung, Rankings, Reviews, Aufgaben und die eigenen
Claude-Skills an einem Ort. Eine einzige Datei, kein Server, kein
Build-Tool: **`index.html` im Browser öffnen – fertig.**

## Module

| Modul | Was es kann |
|---|---|
| **Übersicht** | KPI-Kacheln (Umsatz, TACoS, FBA-Bestand, Alarme, offene Aufgaben), Handlungsbedarf über alle Module hinweg (Bestand, überfällige Aufgaben, auffällige Kampagnen), Reichweiten-Chart, Bewegungsjournal. |
| **Umsatz & Profit** | Wöchentliches KPI-Reporting: je Kalenderwoche Umsatz, Einheiten, Werbekosten, Werbeumsatz, Wareneinsatz, Gebühren, Retouren erfassen – ACoS, TACoS, Profit, Marge und Retourenquote werden berechnet. Charts: Umsatz je Woche, TACoS-Verlauf mit Ziellinie (Ziel einstellbar). |
| **Aufgaben & Routine** | Wochenroutine (8 wiederkehrende Checks, setzt sich jeden Montag automatisch zurück) plus Aufgabenboard (Offen / In Arbeit / Erledigt) mit Bereich, Priorität und Fälligkeit. |
| **Bestand & SKUs** | Bestände je SKU an drei Orten (FBA / unterwegs / zuhause). Bewegungen werden gebucht statt überschrieben – Wareneingang, Sendung, Einlagerung, Inventur. Je SKU zusätzlich Preis, Landed Cost, Review-Stand und Vine-Status. |
| **Nachschub** | Empfehlungen nach der eCommerce.de-Methodik: *An Amazon senden* unter 35 Tagen Amazon-Reichweite (Ziel: nie unter 28 Tage / Low-Inventory-Level-Fee), *beim Lieferanten bestellen* unter dem Nachbestellpunkt, *Überbestand* ab 120 Tagen. |
| **PPC & Werbung** | Kampagnen-Stände aus der Werbekonsole erfassen – CTR, CPC, CVR, ACoS werden berechnet; Ziel-ACoS einstellbar. Ausgaben-Chart je Kampagne plus Kurzreferenz der Low-Bid-Spielregeln. |
| **Keywords & SEO** | Keyword-Tracker (MKL-Auszug): Suchvolumen, Rang, Ziel, Indexierung, Priorität. Kacheln für Top 10, Striking Distance (Rang 11–30) und nicht indexierte Keywords. |
| **Reviews** | Bewertungsstand je SKU (Anzahl, Sterne, Vine) mit Fortschritt zum nächsten Meilenstein (10 → 25 → 50 → 100 → 200 → 500 → 1000). |
| **Claude Skill-Hub** | Die eigenen Amazon-Skills als Arbeitsoberfläche: je Skill fertige Prompts mit Kopieren-Button – einfügen in claude.ai oder Claude Code, Ergebnis zurück ins Dashboard. |
| **Firma & Dokumente** | Firmendaten (USt-IdNr., EORI, IBAN, Seller-ID …) mit Kopieren-Button plus Dokumentenliste mit Ablageort. |
| **Links** | Schnellzugriff auf Seller Central, Werbekonsole, Brand Registry, Helium 10 … (frei erweiterbar). |

Beim ersten Start sind Beispieldaten angelegt (überall mit „Beispiel“
markiert), damit man sieht, wie alles funktioniert – über die Übersicht mit
einem Klick zu entfernen.

## Formeln

```
Reichweite (Tage)   = Bestand ÷ Ø Verkäufe/Tag
Nachbestellpunkt    = Ø Verkäufe/Tag × (Lieferzeit + 14 Tage Sicherheitspuffer)
Bestellmenge        = max(MOQ, Ziel-Reichweite × Ø Verkäufe/Tag)
Sendemenge (an FBA) = Ziel-Reichweite × Ø Verkäufe/Tag − FBA − unterwegs

ACoS   = Werbekosten ÷ Werbeumsatz
TACoS  = Werbekosten ÷ Gesamtumsatz
CTR    = Klicks ÷ Impressionen        CPC = Ausgaben ÷ Klicks
CVR    = Bestellungen ÷ Klicks
Profit = Umsatz − Werbekosten − Wareneinsatz − Gebühren/Sonstiges
Marge  = Profit ÷ Umsatz
```

Schwellen Bestand: **28 Tage** kritisch (Low-Inventory-Level-Fee),
**35 Tage** Warnung (Vorlauf zum Einsenden), **120 Tage** Überbestand.
Ziel-TACoS und Ziel-ACoS sind im jeweiligen Modul einstellbar.

## Datenhaltung & Backup

Alle Daten liegen im Browser (`localStorage`, Schlüssel `fba-cockpit-v2`) –
nichts verlässt deinen Rechner. Über **Export (JSON)** sicherst du den
kompletten Stand als Datei, über **Import** spielst du ihn zurück (auch auf
einem anderen Gerät nutzbar). Backups aus dem alten FBA Cockpit (v1) werden
beim Import automatisch migriert; ebenso werden vorhandene v1-Daten im
Browser beim ersten Start übernommen (der alte Schlüssel bleibt unberührt).

> Wichtig: Browserdaten löschen = Dashboard-Daten weg. Regelmäßig
> exportieren.

### Datenschema (Export-Format, v2)

```jsonc
{
  "version": 2,
  "einstellungen": { "tacosZiel": 15, "acosZiel": 25 },
  "firma":    { "firma": "", "ustIdNr": "", "eori": "", ... },
  "skus": [{
    "id": "…", "sku": "KUB-CUBE-BL-01", "asin": "", "name": "…",
    "fba": 220, "inbound": 0, "home": 130,        // Bestände an drei Orten
    "salesPerDay": 3, "leadTime": 45, "moq": 500, "targetDays": 60,
    "preis": 24.99, "landedCost": 6.5,            // für Margenrechnung
    "reviewCount": 14, "reviewRating": 4.6, "vine": "läuft"
  }],
  "wochen": [{                                     // Wochen-KPI-Reporting
    "id": "…", "start": "2026-08-24",              // Montag der Woche
    "umsatz": 634.8, "einheiten": 26, "adSpend": 88.2, "adUmsatz": 305,
    "wareneinsatz": 169, "kosten": 214, "retouren": 0, "notiz": ""
  }],
  "kampagnen": [{ "id": "…", "name": "", "typ": "SP Auto", "status": "Aktiv",
    "budget": 10, "impressionen": 0, "klicks": 0, "ausgaben": 0,
    "umsatz": 0, "bestellungen": 0, "stand": "2026-08-31", "notiz": "" }],
  "keywords": [{ "id": "…", "keyword": "", "sku": "", "sv": 0, "rang": 18,
    "ziel": 8, "indexiert": "ja", "prio": "Haupt", "geprueft": "", "notiz": "" }],
  "aufgaben": [{ "id": "…", "titel": "", "bereich": "PPC", "prio": "Mittel",
    "status": "offen", "faellig": "", "notiz": "", "erstellt": "ISO-Zeit" }],
  "routine": { "woche": "2026-W36", "done": {} },  // Wochenroutine-Haken
  "links": [{ "id": "…", "name": "", "url": "", "kategorie": "Amazon" }],
  "dokumente": [ { "name": "", "kategorie": "", "datum": "", "link": "", "notiz": "" } ],
  "journal":   [ { "ts": "ISO-Zeit", "sku": "", "typ": "", "menge": 0, "notiz": "" } ],
  "ppc": null              // reserviert für die MCP-Anbindung
}
```

## Arbeiten mit Claude (Skill-Hub)

Das Modul **Claude Skill-Hub** listet die installierten Amazon-Skills
(PPC, SEO, Listing, Bilder, Reviews/Logistik, Versand, Pricing, Promos,
Katalog, Brand Registry, KUBOLT-Brand, Sourcing, Produktscout,
Nischen-Radar, Produktbewertung, Marketing) mit fertigen Prompts.
Typischer Ablauf:

1. Zahlen im Dashboard pflegen (oder **Export (JSON)** ziehen).
2. Passenden Prompt im Skill-Hub kopieren, in Claude einfügen, ggf.
   Export/Bericht anhängen.
3. Ergebnis (z. B. Negativ-Keywords, Listing-Texte, Nachbestellmenge)
   umsetzen und den neuen Stand im Dashboard erfassen.

## Roadmap: Amazon-MCP-Anbindung

Das Schema oben ist bewusst die Andockstelle für eine spätere
MCP-Verbindung zum Seller-Account. Sobald sie steht, ersetzt sie die
manuelle Eingabe:

1. **FBA-Bestand & Absatz automatisch:** `skus[].fba` und
   `skus[].salesPerDay` aus der SP-API (FBA Inventory / Sales & Traffic).
2. **Wochen-KPIs automatisch:** `wochen[]` aus Zahlungs- und
   Geschäftsberichten.
3. **PPC-Daten:** `kampagnen[]` aus der Advertising-API.
4. Ablauf dann: Claude ruft die Daten per MCP ab, aktualisiert das JSON und
   du importierst es – oder das Dashboard wird auf direkten Datenabruf
   umgestellt.
