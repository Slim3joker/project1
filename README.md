# Goldwörter 🪙 – Türkisch-Vokabeltrainer

Eine Quiz-App zum Lernen der **häufigsten türkischen Wörter** – gebaut auf einer
lemmatisierten Frequenzliste aus gesprochener Alltagssprache (OpenSubtitles-Korpus).
Sammle Goldstücke, halte deinen Tages-Streak und sieh live, wie viel Prozent der
türkischen Alltagssprache du schon verstehst.

## Features

- **956 kuratierte Wörter** nach Häufigkeitsrang (decken zusammen ~81 % aller
  gesprochenen Wörter des Korpus ab), mit deutschen **und** englischen Übersetzungen
  sowie Alltagsbeispielen (z. B. *üzgünüm = es tut mir leid*)
- **Abdeckungs-Anzeige**: „Du verstehst X % der gesprochenen Alltagssprache" –
  berechnet aus den echten Korpus-Frequenzen deiner Wortliste
- **Spaced Repetition** (Leitner-System, Boxen 1–7 mit wachsenden Intervallen)
- **Quiz-Modi**: Türkisch→Deutsch & Deutsch→Türkisch (Multiple Choice mit
  Distraktoren aus ähnlichem Häufigkeitsrang), Schreib-Modus mit türkischer
  Sonderzeichen-Tastatur, Blitz-Quiz
- **Belohnungssystem**: Goldstücke 🪙, Combo-Bonus, Tages-Streak 🔥 mit
  Tagesbonus, 11 Level vom *Çaylak* (Frischling) bis zum *Padişah* (Sultan),
  16 Abzeichen
- **„Kenne ich schon"**: Basiswortschatz mit einem Tipp aussortieren –
  zählt trotzdem zur Abdeckung
- **Wackelkandidaten 🔄**: Wörter, die man kennt, aber schnell vergisst,
  separat markieren; eigener „Auffrischen"-Modus mit aktivem Abruf
  (überwiegend Deutsch→Türkisch). Erreicht ein Wackelkandidat Box 5,
  gilt er als im Langzeitgedächtnis verankert (Bonus-Gold + Abzeichen)
- **Aussprache**: Vorlesen per Browser-Sprachausgabe (tr-TR)
- Fortschritt wird lokal gespeichert (localStorage), Export/Import als JSON
- Kein Build, keine Abhängigkeiten – reines HTML/CSS/JS, läuft auch am Handy

## Starten

Einfach `index.html` im Browser öffnen – fertig. Oder lokal serven:

```bash
python3 -m http.server 8000
# -> http://localhost:8000
```

**Kostenlos online stellen (GitHub Pages):** Repo-Einstellungen → *Pages* →
Branch auswählen → Ordner `/ (root)` → Speichern. Danach ist die App unter
`https://<user>.github.io/<repo>/` erreichbar, auch am Handy (dort über
„Zum Startbildschirm hinzufügen" quasi als App nutzbar).

## Projektstruktur

```
index.html              App-Einstieg
css/style.css           Design (dark, mobile-first)
js/app.js               App-Logik (Quiz, SRS, Belohnungen)
js/data.js              GENERIERT – Wortdaten (nicht von Hand bearbeiten)
tools/translations.psv  Kuratierte Übersetzungen (lemma|anzeige|deutsch|englisch)
tools/build_data.py     Baut js/data.js aus CSV + Übersetzungen
data/*.csv              Lemmatisierte Frequenzliste (Quelldaten)
data/*.md               Recherche zu Datenquellen & Zielgröße
```

## Wörter ergänzen oder korrigieren

1. Zeile in `tools/translations.psv` ergänzen/ändern
   (das `lemma` muss exakt in der CSV vorkommen; über das Feld `anzeige`
   lassen sich Lemmatisierungs-Artefakte reparieren, z. B. `laz|lazım|…`).
2. `python3 tools/build_data.py` ausführen → `js/data.js` wird neu generiert.

Die nächste Ausbaustufe wäre der Bereich Rang 1.100–3.000 – einfach weitere
Zeilen an die PSV-Datei anhängen.

## Datenquellen & Attribution

- Frequenzdaten: [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
  (Basis: [OpenSubtitles](https://www.opensubtitles.org/) / OPUS), anschließend
  lemmatisiert und von Hand bereinigt.
- Übersetzungen: eigenhändig kuratiert für dieses Projekt.
