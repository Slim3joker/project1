---
name: video-schnitt
description: Video-Schnitt-Workflow nach Christian Peverelli ("I Fully Automated My Video Editing Using Claude Code") – Claude Code ist der Editor und koordiniert Transkription, Animationen (Hyperframes), Recherche/B-Roll, Musik & Soundeffekte (Epidemic Sound), Voiceover (ElevenLabs) und das Finish mit FFmpeg; gesteuert von Stilregeln, die mit jedem Feedback wachsen. Nutzen, wenn der Nutzer ein Video schneiden oder bearbeiten lassen will, Rohmaterial/Aufnahmen liefert ("schneid das", "mach daraus ein Video"), Feedback zu einem Schnitt gibt oder nach "dem Workflow vom YouTuber" fragt. Gilt vor allem für den Yumi-Kanal (Retro-Games, ROM-Hacks, Fan-Übersetzungen).
---

# Video-Schnitt-Workflow

Vorlage: [I Fully Automated My Video Editing Using Claude Code (Full Walkthrough)](https://www.youtube.com/watch?v=HzXD4GVqXwM)
von Christian Peverelli (4. Oktober 2026). Kerngedanke: **Der Mensch nimmt auf und
gibt Feedback, Claude macht den Rest.** Bei ihm wurden aus 2:46 Minuten
Rohmaterial in 10–20 Minuten ein fertiger 31-Sekunden-Hook, für rund 27 $ pro Video.

## Die Rollen – Original und bei uns

| Rolle | Tool im Video | Bei Yumi |
|---|---|---|
| Editor/Projektleitung | Claude Code, lokal auf dem PC | Claude Code – lokal auf Jacktown oder aus der Cloud über den Skill `pc-zugriff` |
| Transkription | Parakeet (NVIDIA, gratis) | Nur nötig bei gesprochenem Rohmaterial (z. B. Live-Kommentar für den Voice Changer). Yumis Voiceover kommt aus unserem Skript, die Zeitmarken kennen wir. Alternative: ElevenLabs Scribe |
| „Augen“ fürs Material | – | Claude sieht das Gameplay nicht (so wie er seins nicht hört): FFmpeg zieht Standbilder (Szenenwechsel bzw. alle N Sekunden) und Lautstärke-Spitzen, Claude schaut die Bilder an und wählt die Highlights |
| Animator | Hyperframes (HeyGen, Open Source, HTML → MP4 bis 4K) | Titelkarten, Spiel-Infokarten („Never released outside Japan“, Jahr, Konsole, Übersetzergruppe), Kapitel, Logo-Pop-ins |
| Recherche/B-Roll | Browser (Chrome) | Infos zu Spiel/Hack, Screenshots der Patch-Seite oder Box-Art – über den Browser auf Jacktown |
| Screen-Editor | Tella (MCP) | Entfällt (kein Facecam/Screencast). Nur bei Tutorials nötig |
| Sound-Designer | Epidemic Sound (MCP) | Verbunden. Musik + Soundeffekte, lernt den Stil mit |
| Stimme | – | ElevenLabs Eleven v4 mit Yumis Stimme, Audio-Tags wie `[giggles]`, `[gasps]` |
| Finisher | FFmpeg | Auf Jacktown installiert: zusammensetzen, Schwarzbilder raus, Audio-Sync und Lautheit prüfen, exportieren |
| **Stil-Skill** | „YouTube-Edit“, ~1.400 Zeilen, 36 Regeln | Abschnitt **Stilregeln** unten – das Herzstück |

## Einrichtung (einmalig)

Vor jeder Installation oder neuen Ordnern auf Jacktown den Nutzer fragen.

- [ ] Ordner auf Jacktown, z. B. `Videos\Yumi\` mit `Rohmaterial`, `Voiceover`, `Assets`, `Export`
- [ ] Hyperframes installieren: `npx skills add heygen-com/hyperframes` (Node ist auf Jacktown vorhanden)
- [x] FFmpeg (per winget installiert)
- [x] Epidemic-Sound-Connector
- [x] ElevenLabs-Connector – Yumis Stimme: Callie oder Marissa (Entscheidung offen)
- [ ] Parakeet nur bei Bedarf (gesprochenes Rohmaterial)

Im Video läuft alles in der Claude-Desktop-App → Claude Code → **Local**, mit festem
Projektordner, Berechtigungen auf Auto, fürs Einrichten das neueste Modell und
Browser-Zugriff eingeschaltet. Sein Einrichtungs-Prompt war: *„Could you please create a
video editing system for me? I'd like to use Hyperframes, FFmpeg, Tella, and
Epidemic Sound for this system. Run me through how to set it up step by step.“*

## Ablauf pro Video

1. **Rohmaterial** liegt in `Rohmaterial` (Dateiname = Spiel + Hack, z. B. `Sweet Home - English Translation.mp4`).
2. **Sichten:** `ffprobe` für Länge und Format, Standbilder per FFmpeg ziehen, Highlights pro Spiel auswählen.
3. **Recherche und Skript:** Hintergrund zu Spiel und Hack, englisches Skript in Yumis Ton, mit v4-Audio-Tags. Pro Kapitel etwa 1 Minute.
4. **Voiceover** mit ElevenLabs v4 erzeugen und in `Voiceover` ablegen.
5. **Animationen** mit Hyperframes: Intro, Kapitel- und Infokarten.
6. **Musik und Soundeffekte** über Epidemic Sound auswählen.
7. **Zusammensetzen** mit FFmpeg. Danach prüfen: Schwarzbilder (`blackdetect`), Audio-Sync, Lautheit (YouTube ≈ −14 LUFS, `loudnorm`), Musik unter der Stimme absenken.
8. **V1 an den Nutzer**, der Feedback mit Zeitstempeln gibt („bei 0:22 …“) → V2.
9. **Lernen speichern – der Schlüssel:** Nach jeder Feedback-Runde die Erkenntnis
   als Regel unten unter „Regeln aus Feedback“ eintragen (Datum + Regel), committen
   und pushen. So passiert derselbe Fehler kein zweites Mal.

**Klein anfangen:** Erst nur Hooks und Intros (30–60 s) schneiden, bis der Stil sitzt.
Bei Soundeffekten 8–10 Varianten an einem Hook testen. Im Video war der erste
Entwurf zu „busy“, weniger ist mehr.

## Lange Renders aus der Cloud

`start_process` im Remote Desktop Commander wartet nur 3 Sekunden. Lange
FFmpeg- oder Hyperframes-Läufe deshalb mit Log-Datei starten
(`… 2>&1 | Tee-Object "$env:TEMP\render.log"`) und mit `read_process_output`
bzw. durch Lesen des Logs nachverfolgen. Bequemer ist es, wenn der Nutzer
Claude Code lokal auf Jacktown mit diesem Repo startet. Dann gibt es kein Zeitlimit,
und dieser Skill wird genauso geladen.

## Stilregeln Yumi

Startwerte – vorläufig, vom Nutzer noch nicht bestätigt:

- Kanal-Sprache Englisch, Voiceover mit ElevenLabs v4, Stimme Callie oder Marissa
- 16:9, 1080p (Animationen dürfen 4K sein); Gameplay im Originalformat (meist 4:3) mittig mit Rahmen
- Pro Spiel/Hack ein Kapitel mit Titelkarte; Kapitelmarken in die Beschreibung
- Hack-/Übersetzergruppe im Bild und in der Beschreibung nennen; **nie ROMs verlinken**
- Fremdes Gameplay nur mit Erlaubnis des Urhebers
- Musik leise unter dem Voiceover
- Videos mit realistisch wirkender KI-Person bei YouTube als synthetisch kennzeichnen

### Regeln aus Feedback

_Noch keine. Jede Feedback-Runde ergänzt hier eine datierte Regel._

## Kosten (Referenz aus dem Video)

Claude Max 200 $/Monat (anteilig gemessen ~24 $ pro Video), Hyperframes und
Parakeet gratis, Tella 13 $/Monat, Epidemic Sound 9,99 $/Monat – zusammen ~27 $
pro Video gegenüber 250–1.000 $ für einen menschlichen Editor. Bei uns kommen
ElevenLabs-Credits fürs Voiceover dazu, Tella entfällt.

Seinen fertigen Stil-Skill gibt der Autor gratis in seiner Skool-Community
„We Are No Code“ heraus. Den kann der Nutzer herunterladen und uns als Vorlage geben.
