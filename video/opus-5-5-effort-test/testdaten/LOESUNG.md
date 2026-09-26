# Lösungsblatt Test 2A – `suchbegriffe.csv`

Nicht in die Testordner kopieren – Claude darf diese Datei während der Läufe nie sehen.

Zeitraum 01.09.–21.09.2026, 16 Zeilen, 15 verschiedene Suchbegriffe, Währung EUR.

## Richtige Gesamtwerte (KPI-Kacheln)

| KPI | Richtig | Typisches Fehlbild |
|---|---|---|
| Impressionen | 74.300 | ≈ 1.722,65 → Tausenderpunkt als Dezimalpunkt gelesen |
| Klicks | 2.032 | – |
| Ausgaben | 1.508,85 € | 1.501 € → Nachkommastellen abgeschnitten (`parseFloat("187,20")` = 187) |
| Umsatz | 4.633,20 € | ≈ 3.372,26 € → „1.258,40“ als 1,258 gelesen |
| Bestellungen | 162 | – |
| CTR | 2,73 % | ≈ 118 % → sollte jedem sorgfältigen Modell auffallen |
| CPC | 0,74 € | – |
| Conversion Rate | 7,97 % | – |
| ACoS | 32,57 % | ≈ 44,5 % |
| ROAS | 3,07 | – |

## Die fünf gewerteten Fallen (je 1 Punkt)

1. **Semikolon als Trennzeichen.** Spaltennamen („7 Tage, Umsatz gesamt“) und Zahlen enthalten Kommas. Wer nach Komma trennt, bekommt Datenmüll.
2. **Deutsches Zahlenformat.** Tausenderpunkt („12.880“) und Dezimalkomma („1.258,40“). Richtig: Punkte entfernen, Komma zu Punkt.
3. **Ausgaben ohne Umsatz.** Drei Begriffe mit 0,00 € Umsatz – der Export zeigt dort „0,00 %“ ACoS. Wer die Spalte übernimmt, färbt sie grün. Richtig: rot, ACoS nicht berechenbar („–“).
4. **Derselbe Suchbegriff in zwei Kampagnen.** „steckdosenwürfel“ steht in `SP_Exact_Wuerfel` und `SP_Auto_Wuerfel`. Richtig: zusammenfassen oder klar pro Kampagne trennen – und ihn **nicht** „als exaktes Keyword übernehmen“, denn er ist schon exakt gebucht.
5. **ASINs als Suchbegriffe.** „b0xxtest01“ und „b0xxtest02“ sind Produkt-Targets aus der Auto-Kampagne. Richtig: als Produkt behandeln (negatives Produkt-Targeting), nicht als Keyword übernehmen.

Bonus ohne Punkte: Die Datei beginnt mit einem BOM-Zeichen wie echte Excel-Exporte. Es stört nur, wenn die erste Spalte („Startdatum“) per Namen gesucht wird.

## Alle Suchbegriffe (zusammengefasst, nach Ausgaben)

| Suchbegriff | Kampagne(n) | Impr. | Klicks | Ausgaben | Umsatz | Best. | ACoS | CVR | Ampel |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| steckdosenleiste mit usb | Broad | 12.880 | 402 | 325,62 € | 572,00 € | 20 | 56,9 % | 5,0 % | rot |
| steckdosenleiste | Broad | 15.400 | 356 | 302,60 € | 400,40 € | 14 | 75,6 % | 3,9 % | rot |
| steckdosenwürfel | Exact + Auto | 10.550 | 383 | 236,90 € | 1.515,80 € | 53 | 15,6 % | 13,8 % | grün |
| mehrfachsteckdose | Broad | 9.340 | 251 | 200,80 € | 686,40 € | 24 | 29,3 % | 9,6 % | gelb |
| mehrfachsteckdose würfel | Broad | 5.960 | 188 | 131,60 € | 400,40 € | 14 | 32,9 % | 7,4 % | gelb |
| tischsteckdose | Broad (Wortgruppe) | 3.210 | 97 | 72,75 € | 114,40 € | 4 | 63,6 % | 4,1 % | rot |
| steckdosenadapter | Broad | 4.120 | 64 | 44,16 € | 0,00 € | 0 | – | 0,0 % | rot (ohne Umsatz) |
| steckdose würfel usb c | Auto | 1.540 | 58 | 34,80 € | 286,00 € | 10 | 12,2 % | 17,2 % | grün |
| steckdosenwürfel mit schalter | Broad (Wortgruppe) | 1.230 | 47 | 32,43 € | 200,20 € | 7 | 16,2 % | 14,9 % | grün |
| b0xxtest01 (ASIN) | Auto (substitutes) | 1.980 | 36 | 30,24 € | 57,20 € | 2 | 52,9 % | 5,6 % | rot |
| steckdosenwürfel weiß | Auto | 890 | 41 | 24,19 € | 171,60 € | 6 | 14,1 % | 14,6 % | grün |
| steckdosen würfel | Auto | 1.120 | 38 | 22,42 € | 143,00 € | 5 | 15,7 % | 13,2 % | grün |
| b0xxtest02 (ASIN) | Auto (complements) | 2.450 | 29 | 21,17 € | 85,80 € | 3 | 24,7 % | 10,3 % | gelb |
| würfel steckdose ohne kabel | Auto | 760 | 23 | 15,87 € | 0,00 € | 0 | – | 0,0 % | rot (ohne Umsatz) |
| reisestecker usa | Broad | 2.870 | 19 | 13,30 € | 0,00 € | 0 | – | 0,0 % | rot (ohne Umsatz) |

„steckdosenwürfel“ getrennt: Exact 312 Klicks, 187,20 € → 1.258,40 €, ACoS 14,9 %, CPC 0,60 € · Auto 71 Klicks, 49,70 € → 257,40 €, ACoS 19,3 %, CPC 0,70 €.

## Erwartete Empfehlungen

- **Negativ setzen (exakt):** „reisestecker usa“, „steckdosenadapter“, „würfel steckdose ohne kabel“ – kein Umsatz, falsche Suchabsicht. Zusammen 73,33 € verbrannt.
- **Gebot senken oder begrenzen:** „steckdosenleiste“ (ACoS 75,6 %, größter Kostenblock), „tischsteckdose“ (63,6 %), „steckdosenleiste mit usb“ (56,9 %).
- **Als exaktes Keyword übernehmen:** „steckdose würfel usb c“ (12,2 %, beste CVR), „steckdosenwürfel weiß“ (14,1 %), „steckdosen würfel“ (15,7 %, Schreibvariante), „steckdosenwürfel mit schalter“ (16,2 %).
- **Nicht übernehmen:** „steckdosenwürfel“ ist schon exakt gebucht. Besser in der Auto-Kampagne negativ-exakt setzen, damit die günstigere Exact-Kampagne (CPC 0,60 € statt 0,70 €) den Traffic bekommt.
- **ASINs:** „b0xxtest01“ (52,9 %) per negativem Produkt-Targeting ausschließen, „b0xxtest02“ (24,7 %) beobachten. Pluspunkt, wenn das Modell die dünne Datenbasis (2–3 Bestellungen) erwähnt.
- **Beobachten:** „mehrfachsteckdose“ (29,3 %) und „mehrfachsteckdose würfel“ (32,9 %).
- **Pluspunkt:** Hinweis, dass die Ampel-Grenzen eigentlich von der Marge (Break-even-ACoS) abhängen sollten.
