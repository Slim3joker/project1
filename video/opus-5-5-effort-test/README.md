# Video: Opus 5.5 auf jeder Effort-Stufe (deutsch)

Konzept, Faktenblatt, Skript und Checkliste stehen im Doc
**„Opus 5.5 Effort-Test – Videokonzept & Skript (DE)“**:
https://claude.ai/artifact/PVafeaNX9xgT76d5SFxbZz

Das Scoreboard zum Abfilmen gibt es auch online:
https://claude.ai/artifact/4sVRUuMqzfVgF3FUhfT6YA

Den Prompter für die Kamera-Teile ebenfalls:
https://claude.ai/artifact/81UiRNxZaJpg2KWr1dnwbz

Hier liegt alles, was du für die Testläufe und den Dreh brauchst:

| Datei | Wofür |
|---|---|
| `PROMPTS.md` | Die Test-Prompts zum Kopieren, Standardantwort auf Rückfragen, Ablauf pro Lauf |
| `setup-laeufe.sh` | Legt die Testordner mit identischem Startzustand an – außerhalb dieses Repos |
| `PRUEFLISTE-WEBSITE.md` | Bewertung für Test 2 (Homepage): DSGVO-Punkte, Formular-Logik, typische Fehlbilder |
| `scoreboard.html` | Mess-Tabelle zum Abfilmen: im Browser öffnen, Werte eintragen (E), Spalten aufdecken (Leertaste), Balken-Ansicht (B) |
| `prompter.html` | Teleprompter für die Kamera-Teile: Skript für Video 1 ist geladen, hält an jeder Freestyle-Stelle an, eigener Text mit E |

Die Analyse des Originalvideos steht zusätzlich in `knowledge/swipe.md`.

## Thumbnail-Hintergründe (Idee „Der Regler“, Higgsfield, 2688 × 1520)

Links bleibt Platz für dein freigestelltes Foto, Text setzt du erst nach den Testläufen.

- [Schieberegler auf MAX](https://d8j0ntlcm91z4.cloudfront.net/user_3BI1zTL6lFRuy3VBbUMVFjlwA6V/hf_20260926_074331_31801d6d-f667-46a4-8b64-2f90071b2ab1.png)
- [Schieberegler auf MEDIUM](https://d8j0ntlcm91z4.cloudfront.net/user_3BI1zTL6lFRuy3VBbUMVFjlwA6V/hf_20260926_074332_5a246b17-0250-4e3e-9167-746e46ce83ae.png)
- [Drehregler auf ULTRACODE](https://d8j0ntlcm91z4.cloudfront.net/user_3BI1zTL6lFRuy3VBbUMVFjlwA6V/hf_20260926_074331_23e83920-d9a4-465d-a8e6-b86544603938.png)
- [Schieberegler ohne Beschriftung](https://d8j0ntlcm91z4.cloudfront.net/user_3BI1zTL6lFRuy3VBbUMVFjlwA6V/hf_20260926_074331_dc5664d1-da50-4b21-8e71-dd3b36463dd1.png)

Beschriftungen vor der Verwendung auf Rechtschreibung prüfen.

## Schnellstart

```bash
./setup-laeufe.sh           # Test 1 (3D-Altstadt) + Test 2 (Homepage) in ~/opus55-effort-test
./setup-laeufe.sh ~/tests   # oder in einen eigenen Ordner
```

Dann pro Ordner `claude` starten und nach `PROMPTS.md` vorgehen.

Wichtig: Die Läufe nie in diesem Repo starten. Claude würde sonst Prompts und Prüfliste sehen.

## Scoreboard-Tasten

| Taste | Aktion |
|---|---|
| Leertaste, →, Bild ab | Nächste Spalte aufdecken (Presenter-Klicker gehen auch) |
| ←, Bild auf | Letzte Spalte wieder zudecken |
| A / R | Alle aufdecken / alle zudecken |
| B | Balken-Ansicht: pro Klick eine Messgröße, die Balken wachsen von links nach rechts (A wiederholt, R zurück auf Anfang) |
| E | Werte eintragen (Titel, Stufen, Blind-Buchstaben, Währung) |
| 1 / 2 | Tafel Test 1 / Test 2 |
| T | Helle oder dunkle Tafel |
| F | Vollbild |
| H | Steuerleiste für die Aufnahme ausblenden |

Die Tafel startet mit markierten Beispielwerten. Sobald du einen Wert einträgst, verschwindet das Etikett „Beispielwerte“. Die Daten bleiben nur in deinem Browser. Über „Daten kopieren“ und „Eingefügte Daten übernehmen“ nimmst du sie auf ein anderes Gerät mit.

## Prompter

Browserfenster schmal machen (etwa ein Drittel der Bildschirmbreite) und direkt unter die Webcam schieben. Gelesen wird an den gelben Pfeilen im oberen Drittel. Je näher die Pfeile an der Linse sind, desto mehr wirkt es wie Blickkontakt. OBS nimmt den Prompter nicht auf, solange du das Fenster nicht als Quelle hinzufügst.

Im Skript für Video 1 sind Platzhalter wie `[BETRAG]` gelb markiert. Trag die Werte nach den Testläufen mit E ein. An gelb umrandeten Freestyle-Stellen hält der Text an, du redest frei und machst mit der Leertaste weiter.

| Taste | Aktion |
|---|---|
| Leertaste, →, Bild ab | Start mit 3-2-1, Pause, nach einer Freestyle-Stelle weiter (Presenter-Klicker gehen auch) |
| ←, Bild auf | Einen Absatz zurück |
| ↑ / ↓ | Schneller / langsamer, in Wörtern pro Minute |
| + / − | Schrift größer / kleiner |
| 1–9 | Zu einem Abschnitt springen, zum Beispiel für eine neue Aufnahme |
| R, Pos1 | Zurück an den Anfang |
| M | Spiegeln für Prompter mit Glasscheibe |
| E | Text bearbeiten oder eigenes Skript einfügen |
| F / H | Vollbild / Steuerleiste ausblenden |

Syntax im Skript: Eine Leerzeile trennt Absätze, `# Titel` beginnt einen Abschnitt, `[FREI] Stichworte` ist eine Freestyle-Stelle. Text, Tempo und Schriftgröße bleiben in deinem Browser gespeichert.
