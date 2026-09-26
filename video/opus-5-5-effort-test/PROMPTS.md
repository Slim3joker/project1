# Test-Prompts

Immer exakt so einfügen – kein Wort ändern, auch nicht zwischen den Stufen.

## Ablauf pro Lauf

1. Testordner aus `setup-laeufe.sh` öffnen und dort `claude` starten (frische Sitzung).
2. `/model` → Opus 5.5, `/effort` → Stufe wählen (Ultracode im selben Menü).
3. Uhrzeit notieren, Prompt einfügen, absenden.
4. Jede Rückfrage mit der Standardantwort beantworten und mitzählen.
5. Nach der Fertig-Meldung die Kostenanzeige (`/cost`) abfotografieren und die Werte ins Scoreboard eintragen.
6. Ergebnis auf dem festen Weg abfilmen. Nichts nachbessern.

Nie im Repo-Ordner testen: Dort würde Claude `testdaten/LOESUNG.md` und diese Datei sehen.

## Standardantwort auf jede Rückfrage

```text
Triff eine sinnvolle Annahme und mach weiter.
```

## Test 1 – begehbare 3D-Altstadt (alle sechs Stufen)

```text
Baue eine begehbare 3D-Szene einer kleinen deutschen Altstadt als Web-App, die ohne Build-Schritt im Browser läuft (Three.js per CDN ist erlaubt).

Pflicht:
- Marktplatz mit Brunnen, mindestens 8 Fachwerkhäuser in unterschiedlichen Farben und Dachformen, Kopfsteinpflaster-Optik und ein Kirchturm als Orientierungspunkt
- Steuerung: WASD und Maus aus der Ich-Perspektive, auf dem Handy per Touch
- Tag-/Nacht-Wechsel mit der Taste N: Nachts leuchten Straßenlaternen und Fenster
- Minikarte oben rechts mit der eigenen Position
- Mindestens drei kleine Interaktionen, zum Beispiel: Klick auf den Kirchturm lässt die Glocke läuten, ein Marktstand zeigt ein Schild, der Brunnen plätschert
- Soll auf einem normalen Laptop flüssig laufen

Zum Schluss: Erkläre, wie man es startet, und liste auf, was du umgesetzt und wie du es geprüft hast.
```

Abfilmen: Start am Brunnen, einmal um den Marktplatz, dann Taste N – bei jeder Stufe gleich.

## Test 2A – PPC-Tab im FBA Cockpit (Low, Medium, Max)

Jeder Ordner enthält eine frische Kopie von `index.html` und `testdaten/suchbegriffe.csv`. Bewertung mit `testdaten/LOESUNG.md`.

```text
In diesem Ordner liegt mein FBA Cockpit: index.html, eine einzige Datei ohne Build. Der Tab „PPC“ ist bisher nur ein Platzhalter.

Baue den PPC-Tab fertig:
1. Import eines Amazon-Suchbegriffberichts als CSV per Dateiauswahl (Beispieldatei: testdaten/suchbegriffe.csv)
2. KPI-Kacheln für den gesamten Zeitraum: Ausgaben, Umsatz, ACoS, ROAS, CTR, CPC und Conversion Rate
3. Eine sortierbare Tabelle aller Suchbegriffe mit Ampel nach ACoS: grün unter 20 %, gelb 20–35 %, rot über 35 % oder Ausgaben ohne Umsatz
4. Einen Bereich „Empfehlungen“ mit konkreten Handlungen, jeweils mit Begründung aus den Zahlen, zum Beispiel negativ setzen, Gebot senken oder als exaktes Keyword übernehmen
5. Speichere die Daten wie den Rest der App im localStorage (Feld „ppc“ im bestehenden Schema). Export und Import müssen weiter funktionieren.

Bleib beim bestehenden Stil der App. Zum Schluss: Liste auf, was du umgesetzt und wie du es geprüft hast.
```

## Test 2B – Website für einen Handwerksbetrieb (Low, Medium, Max)

```text
Baue eine One-Page-Website für die fiktive „Schreinerei Hoffmann“ in Bamberg: eine einzelne index.html mit CSS und JavaScript, ohne Build-Schritt.

Pflicht:
- Bereiche: Start, Leistungen (Küchen, Treppen, Möbel nach Maß), Referenzen mit Platzhalterbildern, Über uns, Kontakt
- Formular für Terminanfragen mit Validierung (Name, E-Mail oder Telefon, Wunschtermin, Nachricht)
- Sieht auf dem Handy und am Desktop gut aus
- Die Seite muss für den Einsatz in Deutschland rechtlich sauber aufgestellt sein (DSGVO)

Zum Schluss: Liste auf, was du umgesetzt und wie du es geprüft hast.
```

Worauf du achtest: extern geladene Schriften oder Skripte (Google Fonts über CDN), Impressum und Datenschutzerklärung, Datenschutzhinweis am Formular, keine Tracker. Im Video klar sagen: kein Rechtsrat, nur ein Check, ob das Modell an die typischen Punkte denkt.
