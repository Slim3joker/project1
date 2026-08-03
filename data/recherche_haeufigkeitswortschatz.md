# Türkischer Häufigkeitswortschatz: Datenquellen, Zielgröße und Umsetzung für eine eigene Lern-App

## TL;DR
- **Zielgröße: 2.000 Lemmata als primäres Ziel, aufgebaut in Stufen (Basis 0–1.000 auffrischen → Kernziel 1.000–3.000).** Für einen Deutschtürken, der Alltagswortschatz bereits versteht, aber die nächste Ebene füllen will, ist der Bereich 2.000–3.000 Lemmata der Sweet Spot; 10.000 sind für reine Alltagssprache Overkill mit stark abnehmendem Ertrag.
- **Beste kostenlose Datenquelle:** die OpenSubtitles-basierte Häufigkeitsliste von hermitdave/FrequencyWords (GitHub, `tr_50k.txt`, gesprochene Alltagssprache, direkt als Textdatei ladbar) plus die Wiktionary-Frequenzliste; wissenschaftlicher Goldstandard ist „A Frequency Dictionary of Turkish" (Aksan et al. 2017, Routledge, 5.000 Lemmata [Pageplace](https://api.pageplace.de/preview/DT0400.9781317557579_A28992480/preview-9781317557579_A28992480.pdf) – aber kostenpflichtig/urheberrechtlich geschützt).
- **Wichtigster Fallstrick:** Türkisch ist agglutinierend — Untertitel-Häufigkeitslisten zählen Oberflächenformen (flektierte Wörter), nicht Lemmata (Wortstämme). Für Karteikarten müssen die Wörter zwingend auf Lemmata reduziert (lemmatisiert) werden, sonst lernt man dasselbe Wort mehrfach in verschiedenen Beugungen.

## Key Findings

**1. Die Zielgröße 1.000 vs. 10.000 – klare Empfehlung: rund 2.000 (gestaffelt bis 3.000).**
Die Abdeckungsforschung (v.a. Paul Nation) zeigt ein sprachübergreifend stabiles Muster mit stark abnehmendem Grenzertrag. Zahlen sind hier aus Vokabularforschungsübersichten (Dang & Webb; van Zeeland & Schmitt 2012; Nation 2006) zusammengefasst:
- Top 100 Wörter ≈ 50 % der gesprochenen Alltagssprache.
- Top 1.000 Wortfamilien: laut Dang & Webb-Übersicht (nach Nation) decken die häufigsten 1.000 Wortfamilien **„about 75% to 91% of spoken and written text"** [ScholarSpace](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/b9432fbc-3873-41fd-95a7-5363f711cc09/content) ab.
- Der Sprung von 1.000 → 2.000 bringt nur noch **„about 4% to 11%"**, [ScholarSpace](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/b9432fbc-3873-41fd-95a7-5363f711cc09/content) von 2.000 → 3.000 nur noch **„about 2% to 4%"** [ScholarSpace](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/b9432fbc-3873-41fd-95a7-5363f711cc09/content) hinzu — der klassische, mathematisch durch Zipfs Gesetz bedingte Ertragsabfall.
- Für 95 %-Abdeckung im **Hörverständnis** genügen laut van Zeeland & Schmitt (2012) etwa **2.000–3.000 Wortfamilien**. [cambridge](https://www.cambridge.org/core/journals/language-teaching/article/how-much-vocabulary-is-needed-to-use-english-replication-of-van-zeeland-schmitt-2012-nation-2006-and-cobb-2007/1D217A56A2E0056E67802A6A8360FDDE)
- Für die anspruchsvollere 98 %-Schwelle (selbstständiges Lesen/„reading for pleasure") nennt Nation (2006) ~**8.000–9.000 Wortfamilien fürs Lesen** und **6.000–7.000 fürs Hören**.

Konsequenz: **10.000 Wörter** steigern die Abdeckung gegenüber 5.000 in der Alltagssprache nur noch marginal, bei etwa doppeltem Zeitaufwand — für das erklärte Ziel (Alltagslücken schließen) ineffizient. Der beste Ertrag pro investierter Stunde liegt zwischen ~1.000 und ~3.000.

**2. Der Türkisch-spezifische Knackpunkt: Lemma vs. Oberflächenform.**
Türkisch bildet aus einem Wortstamm durch Suffixketten sehr viele Oberflächenformen. Das verzerrt rohe Häufigkeitslisten massiv:
- İlyas Göz, „Yazılı Türkçenin Kelime Sıklığı Sözlüğü" (Türk Dil Kurumu, Ankara 2003): Göz wertete ein schriftsprachliches Material von **1.006.306 Wörtern (Tokens)** aus dem Zeitraum 1995–2000 aus, woraus ein Häufigkeitswörterbuch mit **22.693 Einträgen (Lemmata)** [Internet Archive](https://archive.org/details/yazili-turkcenin-kelime-sikligi-sozlugu-1945-1950-arasi) [Dergipark](https://dergipark.org.tr/tr/download/article-file/54797) entstand. [Internet Archive](https://archive.org/details/yazili-turkcenin-kelime-sikligi-sozlugu-1945-1950-arasi) Die Zahl der unterschiedlichen Oberflächen-Typen lag dabei um ein Vielfaches höher — die Reduktion von Typen auf Lemmata illustriert die agglutinierende „Vervielfachung" von Wortformen.
- Türkisches Nationalkorpus (TNC v2): **fast 51 Millionen Wörter**, deren NLP-Wörterbuch auf **73.383 Lemmata** abbildet (belegt in Aksan et al., „The Turkish National Corpus (TNC): Comparing the Architectures of v1 and v2", z.B. „bu 'this' (ranking 6 among 73,383 lemmas in the NLP Dictionary of TNC)"). [Academia.edu](https://www.academia.edu/37779154/The_Turkish_National_Corpus_TNC_Comparing_the_Architectures_of_v1_and_v2)

Konsequenz für die App: Eine rohe OpenSubtitles-Liste enthält z.B. `geliyorum`, `geldi`, `gelecek` als drei separate Einträge. Diese müssen auf das Lemma `gelmek` (kommen) zusammengefasst werden. Sonst lernt der Nutzer Beugungen statt Vokabeln, und die vermeintlich „1.000 häufigsten Wörter" sind in Wahrheit vielleicht nur ~400–500 verschiedene Vokabeln.

**3. Konkrete kostenlose Datenquellen existieren; der wissenschaftliche Goldstandard ist proprietär.** Die praktikabelste offene Quelle ist hermitdave/FrequencyWords (OpenSubtitles, gesprochene Sprache). Der akademische Goldstandard (Aksan 2017) ist urheberrechtlich geschützt.

## Details

### A) Wissenschaftliche Häufigkeitswörterbücher / Korpora

**A Frequency Dictionary of Turkish** (Yeşim Aksan, Mustafa Aksan, Ümit Mersinli, Umut Ufuk Demirhan; Routledge 2017, ISBN 9781138839670). [Pageplace](https://api.pageplace.de/preview/DT0400.9781317557579_A28992480/preview-9781317557579_A28992480.pdf) Der akademische Goldstandard. Laut Verlagsangabe (Routledge, Produktseite 9781138839670): „Based on a 50-million word Turkish National Corpus … Each of the 5,000 entries are supported by detailed information including the English equivalent, an illustrative example with English translation and usage statistics." [pageplace +2](https://api.pageplace.de/preview/DT0400.9781317557579_A28992480/preview-9781317557579_A28992480.pdf) Es gibt eine tab-getrennte Datei (früher CD, jetzt Support-Material online unter www.routledge.com/9781138839670 im „tab-delimited format") [AbeBooks](https://www.abebooks.co.uk/9781138839670/Frequency-Dictionary-Turkish-Core-Vocabulary-1138839671/plp) [mit](https://mitpressbookstore.mit.edu/book/9781138839670) — ideal für Computerlinguisten. [Routledge](https://www.routledge.com/A-Frequency-Dictionary-of-Turkish/Aksan-Aksan-Mersinli-Demirhan/p/book/9781138839670) **Aber: urheberrechtlich geschützt und kostenpflichtig.** Die Daten dürfen nicht in eine veröffentlichte App kopiert werden; für den privaten Eigengebrauch als Lernquelle nutzbar. Einträge sind wahlweise nach Häufigkeit, nach Suffigierung und alphabetisch sortiert. [Routledge +2](https://www.routledge.com/A-Frequency-Dictionary-of-Turkish/Aksan-Aksan-Mersinli-Demirhan/p/book/9781138839670)

**Türkisches Nationalkorpus (TNC / Türkçe Ulusal Derlemi)**, tnc.org.tr — 50 Mio. Wörter, 98 % geschrieben / 2 % gesprochen, 1990–2013, nach Vorbild des British National Corpus. [Tnc](https://v3.tnc.org.tr/tnc/about-tnc) [Wikipedia](https://en.wikipedia.org/wiki/Most_common_words_in_Turkish) Kostenlos für nicht-kommerzielle Nutzung über die Weboberfläche recherchierbar; [Tnc](https://www.tnc.org.tr/) separate Häufigkeitsdaten unter tudfrekans.org.tr (Registrierung nötig). Kein einfacher Bulk-Download der kompletten Rangliste — eher zum Nachschlagen/Validieren als zum Massenimport.

**Weitere gedruckte Referenzen:** Göz (2003, siehe oben) und der neuere „Çağdaş Türkçenin Sıklık Sözlüğü" (Aksu & Adalı, Ötüken). [Dergipark](https://dergipark.org.tr/tr/download/article-file/1564333)

Wichtig: Selbst das Aksan-Wörterbuch stützt seine Abdeckungsaussagen in der Einleitung auf **englische** Zahlen (Nation 1990) und kennzeichnet sie explizit als „nur für Englisch". [pageplace](https://api.pageplace.de/preview/DT0400.9781317557579_A28992480/preview-9781317557579_A28992480.pdf) Eine saubere, publizierte türkische Tabelle „1.000/2.000/3.000/5.000 Lemmata = X % Abdeckung" ist in der frei zugänglichen Literatur nicht auffindbar — die kursierenden Prozentzahlen sind Extrapolationen aus dem Englischen.

### B) Kostenlose, wiederverwendbare Datensätze (CSV/JSON/TXT)

1. **hermitdave / FrequencyWords** (GitHub) — die praktischste offene Quelle.
   - Direktlink Türkisch (2018, gesprochennah): `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/tr/tr_50k.txt` (auch `tr_full.txt` für die Vollliste; ältere Version unter `/2016/tr/tr_50k.txt`).
   - Format: `wort häufigkeit` pro Zeile, absteigend sortiert [GitHub](https://github.com/hermitdave/FrequencyWords) — sehr leicht zu parsen.
   - Basis: OpenSubtitles → spiegelt gesprochene/konversationelle Alltagssprache gut wider (genau die Domäne des Nutzers).
   - Lizenz: Code MIT; [GitHub](https://github.com/hermitdave/FrequencyWords) Daten mit Attributionspflicht (OpenSubtitles). Achtung: nur grob bereinigt, enthält Tippfehler, englische Fremdwörter und **Oberflächenformen** (nicht lemmatisiert).

2. **Wiktionary Frequency lists / Turkish** — `https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Turkish`. Enthält „1K most used words", „Top 5000 Turkish words (OpenSubtitles)" [Wiktionary](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Turkish) und „Top 40.000". [wiktionary](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Turkish) Frei (CC-Lizenzen), gut als geprüfte Startliste.

3. **orgtre / top-open-subtitles-sentences** (GitHub) — bereinigte Häufigkeitslisten (bis 30.000 Wörter) plus die 10.000 häufigsten Sätze für alle OpenSubtitles-2018-Sprachen [GitHub](https://github.com/orgtre/top-open-subtitles-sentences) inkl. Türkisch, mit Python-Code zum Reproduzieren. Ideal, wenn Cloze-Sätze in die App sollen.

4. **rspeer / wordfreq** (Python-Bibliothek) — kombinierte Häufigkeitsdaten (OpenSubtitles + weitere Quellen) für Türkisch, programmatisch abfragbar. Praktisch, um eine Liste programmatisch zu erzeugen/zu ranken.

5. **Wikipedia „Most common words in Turkish"** (`https://en.wikipedia.org/wiki/Most_common_words_in_Turkish`) — saubere Tabelle der Top-100-**Lemmata** mit TNC-Rang, Wortart, englischer Bedeutung und Etymologie [Wikipedia](https://en.wikipedia.org/wiki/Most_common_words_in_Turkish) (bir, ol, ve, bu, da, et, o, yap, de, ben …). [pageplace](https://api.pageplace.de/preview/DT0400.9781317557579_A28992480/preview-9781317557579_A28992480.pdf) Bereits lemmatisierter, geprüfter Kern-Startdatensatz — perfekt für die ersten 100 Karten.

### C) Fertige Tools / Decks (als Referenz)

- **Anki-Shared-Decks (ankiweb.net):** „Turkish - English First 1000 Words By Frequency", „Turkish - 2000 Most Frequent Words", „The Ultimate Guide to Turkish – The Most Used 5000 Words" (mit Beispielsätzen, Studio-Audio, sortiert leicht→schwer). [Anki](https://forums.ankiweb.net/t/the-ultimate-deck-for-turkish/9064) Kostenlos ladbar; als `.apkg` exportierbar, Felder als Datenbasis inspizierbar.
- **Clozemaster Türkisch** — bietet Sammlungen „100 / 1.000 / 2.000 / 3.000 / 5.000 / 10.000 / 20.000 Most Common", [Clozemaster](https://www.clozemaster.com/languages/expand-turkish-vocabulary) Cloze-Sätze auf Häufigkeitsbasis, sowohl Single-Choice (passives Erkennen) als auch Texteingabe (aktives Abrufen). [Clozemaster](https://www.clozemaster.com/languages/expand-turkish-vocabulary) Genau das Format, das der Nutzer bauen will — beste Referenz für UX.
- **Memrise** „Turkish 1000 most common words, frequency sorted" — Community-Kurs auf Basis der Wiktionary-Liste [Memrise](https://www.memrise.com/course/108691/turkish-1000-most-common-words-frequency-sorted/1/) (Community-Kurse werden allerdings zunehmend eingestellt).
- **Flashcardo** (`flashcardo.com/turkish-flashcards/`) — kostenlose türkische Karteikarten (Pinhok-Frequenzbasis), auch als PDF; teilbar, nicht verkaufbar. [Flashcardo](https://flashcardo.com/turkish-flashcards/)
- **Pinhok Languages** Turkish Frequency Dictionary — günstige kommerzielle CSV/Buch-Quelle.
- **Lingo Mastery „2000 Most Common Turkish Words in Context"** — kommerzielles Buch (ISBN 9781951949174). Wirbt: „according to an important study — learning the top two thousand (2000) most frequently used words will enable you to understand up to 84% of all non-fiction and 86.1% of fiction literature and 92.7% of oral speech." [Lingo Mastery](https://www.lingomastery.com/2000-most-common-turkish-words-in-context/) [Everand](https://www.everand.com/book/513013052/2000-Most-Common-Turkish-Words-in-Context-Get-Fluent-Increase-Your-Turkish-Vocabulary-with-2000-Turkish-Phrases) Die „important study" bleibt ungenannt; die Zahlen sind mit hoher Wahrscheinlichkeit aus dem Englischen übernommen und **nicht als türkische Korpusbelege zu werten**.

## Recommendations

**Stufe 1 — Sofort (Datenbasis aufbauen):**
1. Lade `tr_50k.txt` von hermitdave/FrequencyWords als Rohbasis herunter (gesprochennahe Alltagssprache).
2. **Lemmatisiere die Liste** mit einem türkischen NLP-Tool (Zemberek oder das spaCy-Türkisch-Modell), um Oberflächenformen auf Lemmata zu reduzieren. Das ist der entscheidende Schritt — ohne ihn ist die Liste für Lerner irreführend. Ergebnis: eine bereinigte Lemma-Rangliste.
3. Ergänze Übersetzungen (Deutsch/Englisch): die Wikipedia-Top-100-Tabelle und Wiktionary liefern geprüfte Startdaten; für den Rest ein Wörterbuch-API oder die Felder eines Anki-Decks nutzen.

**Stufe 2 — Zielsetzung für das Lernen:**
- Setze **2.000 Lemmata** als Hauptziel. Beginne aber nicht bei Rang 1, sondern markiere den bereits sicher bekannten Basiswortschatz (grob Rang 1–500/1.000) als „bekannt" und konzentriere die Karten auf die **Lücke ~Rang 1.000–3.000** — genau die „nächste Ebene" des Alltagswortschatzes, die der Nutzer schließen will.
- Danach optional auf 3.000 erweitern. **Auf 5.000–10.000 nur**, wenn später Ziele wie Zeitunglesen, Literatur oder Fachtexte hinzukommen.

**Stufe 3 — App-Design:**
- Eine Karteikarte pro **Lemma**, nicht pro Oberflächenform. Zeige zusätzlich die häufigste flektierte Form + einen Beispielsatz (Cloze), weil man im agglutinierenden Türkisch das Wort im Kontext/in Beugung sehen muss, um es nutzen zu können.
- Single-Choice-Quiz: Distraktoren aus Wörtern ähnlichen Häufigkeitsrangs ziehen (gleiche Schwierigkeit, plausibel).
- Spaced Repetition (SRS) einbauen; Funktion „bereits bekannt → aussortieren" vorsehen.

**Schwellenwerte, die die Empfehlung ändern:**
- Ziel = Bücher/Zeitungen lesen → auf 5.000 erhöhen.
- Wenn nach ~2.000 gelernten Karten im Alltag noch sehr viele unbekannte Wörter auftauchen → die Datenbasis war vermutlich nicht sauber lemmatisiert; Liste prüfen.
- Wenn Fachdomänen (Beruf, Behörde, Medizin) wichtig werden → gezielt themenspezifische Wörter ergänzen, nicht blind die Häufigkeitsliste verlängern.

## Caveats
- **Keine saubere türkische Abdeckungstabelle:** Die konkreten Prozentzahlen (75–91 %, 95 %, 98 % etc.) stammen aus der englischsprachigen Forschung (Nation; Dang & Webb; van Zeeland & Schmitt) und sind auf Türkisch übertragen. Ein publizierter, frei zugänglicher türkischer „1.000/2.000/3.000/5.000-Lemma = X %"-Datensatz existiert nicht. Aussagen wie „2.000 Wörter = 92,7 % gesprochene Sprache" (Lingo Mastery) stützen sich auf eine ungenannte Quelle und sollten nicht als türkischer Korpusbeleg zitiert werden.
- **Ein häufig zitierter, aber ungeprüfter Datenpunkt:** In meinen Recherchenotizen taucht „Öztürk (2013): 500 Lemmata ≈ 57 % Abdeckung vs. 500 Oberflächenformen ≈ 19 %" auf. Diese exakten Werte konnten **nicht in einer zugänglichen Primärquelle verifiziert** werden — vor einer Veröffentlichung bitte gegenprüfen. Die Größenordnung (Lemmata decken viel mehr ab als gleich viele Oberflächenformen) ist jedoch qualitativ korrekt und durch die Göz-/TNC-Zahlen gestützt.
- **OpenSubtitles-Bias:** Untertitel-Korpora überrepräsentieren dialoglastige, umgangssprachliche Wörter (gut für Konversation, schwächer für formelles Schreiben). Für das Ziel des Nutzers (Alltag) ist das eher ein Vorteil.
- **Lizenz:** Aksan 2017 und Pinhok sind urheberrechtlich geschützt — nicht in eine veröffentlichte App kopieren. OpenSubtitles-/Wiktionary-Daten sind frei nutzbar, aber attributionspflichtig.
- **Rohlisten sind ungeputzt:** hermitdave enthält Nicht-Wörter, Eigennamen und Fremdsprachfragmente — automatische und/oder manuelle Nachbereinigung ist nötig, bevor daraus Karteikarten werden.