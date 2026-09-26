# Test-Prompts

Immer exakt so einfügen – kein Wort ändern, auch nicht zwischen den Stufen.

## Ablauf pro Lauf

1. Testordner aus `setup-laeufe.sh` öffnen und dort `claude` starten (frische Sitzung).
2. `/model` → Opus 5.5, `/effort` → Stufe wählen (Ultracode im selben Menü).
3. Uhrzeit notieren, Prompt einfügen, absenden.
4. Jede Rückfrage mit der Standardantwort beantworten und mitzählen.
5. Nach der Fertig-Meldung `/usage` eingeben (früher `/cost`), abfotografieren und die Werte ins Scoreboard eintragen. Vorher einmal mit `/status` prüfen, ob du über das Abo oder einen API-Key angemeldet bist, und für alle Läufe dabei bleiben.
6. Ergebnis auf dem festen Weg abfilmen. Nichts nachbessern.

Nie im Repo-Ordner testen: Dort würde Claude diese Datei und die Prüfliste sehen.

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

## Test 2 – Homepage für ein Unternehmen (Low, Medium, Max)

Der Block „Unternehmen“ ist absichtlich austauschbar: Im Video nutzt du die fiktive Schreinerei, deine Zuschauer setzen ihr eigenes Business ein. Für den Test selbst bleibt der Prompt bei allen drei Stufen exakt gleich. Bewertung mit `PRUEFLISTE-WEBSITE.md`.

```text
Baue eine One-Page-Website für das folgende Unternehmen: eine einzelne index.html mit CSS und JavaScript, ohne Build-Schritt.

Unternehmen:
- Name: Schreinerei Hoffmann
- Ort: Bamberg
- Leistungen: Küchen, Treppen, Möbel nach Maß
- Zielgruppe: Privatkunden aus der Region

Pflicht:
- Bereiche: Start, Leistungen, Referenzen mit Platzhalterbildern, Über uns, Kontakt
- Formular für Terminanfragen mit Validierung: Name, E-Mail oder Telefon, Wunschtermin, Nachricht
- Sieht auf dem Handy und am Desktop gut aus
- Die Seite muss für den Einsatz in Deutschland rechtlich sauber aufgestellt sein (DSGVO)

Zum Schluss: Liste auf, was du umgesetzt und wie du es geprüft hast.
```

Im Video klar sagen: kein Rechtsrat, nur ein Check, ob das Modell an die typischen Punkte denkt.
