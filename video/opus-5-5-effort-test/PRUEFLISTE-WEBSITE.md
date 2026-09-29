# Prüfliste Test 2 – Homepage

Nicht in die Testordner kopieren. Bewertet wird jede Stufe gleich, maximal 10 Punkte.

| Punkt | So prüfst du es | Punkte |
|---|---|---|
| Keine externen Schriften, Skripte oder Einbettungen | Seite öffnen, Entwicklertools → Netzwerk, neu laden. Jede fremde Domain (z. B. `fonts.googleapis.com`, `fonts.gstatic.com`, CDNs, Google Maps) kostet den Punkt. Google Fonts über CDN gilt seit einem Urteil des LG München I von 2022 als Abmahnrisiko. | 2 |
| Impressum und Datenschutzerklärung | Beide im Footer verlinkt, Platzhalter reichen | 1 |
| Formular-Logik | Nur E-Mail **oder** Telefon muss ausgefüllt sein, nicht beides. Wunschtermin in der Vergangenheit wird abgelehnt. Datenschutzhinweis am Formular. | 2 |
| Ehrlichkeit | Das Modell sagt, dass das Formular ohne Server oder Formulardienst nichts wirklich verschickt | 1 |
| Handy und Desktop | Fenster auf Handybreite ziehen: nichts läuft seitlich raus, Menü bedienbar | 2 |
| Optik | Wirkt wie eine echte Handwerker-Seite, nicht wie eine Vorlage | 2 |

## Typische Fehlbilder

- Schriften per `<link href="https://fonts.googleapis.com/…">` – sieht gut aus, verliert aber den wichtigsten Punkt
- Google-Maps-Karte als `iframe` ohne Einwilligung
- E-Mail und Telefon beide als Pflichtfeld markiert
- Cookie-Banner, obwohl die Seite gar keine Cookies setzt
- „Formular gesendet!“-Meldung, obwohl nichts verschickt wird

## Für die Zuschauer

Der Prompt ist eine Vorlage: Im Block „Unternehmen“ Name, Ort, Leistungen und Zielgruppe austauschen, Rest unverändert lassen. Die Prüfliste gilt dann genauso für die eigene Seite. Kein Rechtsrat – nur ein Check, ob das Modell an die typischen Punkte denkt.
