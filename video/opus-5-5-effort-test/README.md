# Video: Opus 5.5 auf jeder Effort-Stufe (deutsch)

Konzept, Faktenblatt, Skript und Checkliste stehen im Doc
**„Opus 5.5 Effort-Test – Videokonzept & Skript (DE)“**:
https://claude.ai/artifact/PVafeaNX9xgT76d5SFxbZz

Das Scoreboard zum Abfilmen gibt es auch online:
https://claude.ai/artifact/4sVRUuMqzfVgF3FUhfT6YA

Hier liegt alles, was du für die Testläufe und den Dreh brauchst:

| Datei | Wofür |
|---|---|
| `PROMPTS.md` | Die Test-Prompts zum Kopieren, Standardantwort auf Rückfragen, Ablauf pro Lauf |
| `setup-laeufe.sh` | Legt die Testordner mit identischem Startzustand an – außerhalb dieses Repos |
| `testdaten/suchbegriffe.csv` | Beispiel-Suchbegriffbericht für Test 2A, mit eingebauten Fallen |
| `testdaten/LOESUNG.md` | Lösungsblatt zu Test 2A: richtige Summen, typische Fehlbilder, erwartete Empfehlungen |
| `scoreboard.html` | Mess-Tabelle zum Abfilmen: im Browser öffnen, Werte eintragen (E), Spalten aufdecken (Leertaste) |

Die Analyse des Originalvideos steht zusätzlich in `knowledge/swipe.md`.

## Schnellstart

```bash
./setup-laeufe.sh            # Test 1 + Test 2A (PPC-Tab) in ~/opus55-effort-test
./setup-laeufe.sh ~/tests b  # Variante B (Handwerker-Website) in ~/tests
```

Dann pro Ordner `claude` starten und nach `PROMPTS.md` vorgehen.

Wichtig: Die Läufe nie in diesem Repo starten. Claude würde sonst `LOESUNG.md` und die Prompts sehen.

## Scoreboard-Tasten

| Taste | Aktion |
|---|---|
| Leertaste, →, Bild ab | Nächste Spalte aufdecken (Presenter-Klicker gehen auch) |
| ←, Bild auf | Letzte Spalte wieder zudecken |
| A / R | Alle aufdecken / alle zudecken |
| E | Werte eintragen (Titel, Stufen, Blind-Buchstaben, Währung) |
| 1 / 2 | Tafel Test 1 / Test 2 |
| T | Helle oder dunkle Tafel |
| F | Vollbild |
| H | Steuerleiste für die Aufnahme ausblenden |

Die Tafel startet mit markierten Beispielwerten. Sobald du einen Wert einträgst, verschwindet das Etikett „Beispielwerte“. Die Daten bleiben nur in deinem Browser. Über „Daten kopieren“ und „Eingefügte Daten übernehmen“ nimmst du sie auf ein anderes Gerät mit.
