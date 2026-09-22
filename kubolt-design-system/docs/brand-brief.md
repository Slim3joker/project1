# KUBOLT — Brand & Design-System Brief

> **Zweck dieser Datei:** Übergabe-Brief an **Claude Code**, um daraus ein
> **Design-System-Package** (Design-Tokens + React-Komponenten) zu bauen, das
> anschließend per `/design-sync` in **Claude Design** importiert wird.
>
> **Sprach-Konvention:** Fließtext auf Deutsch (zum Review). Token-Namen,
> Komponenten-Namen und Code-Identifier auf Englisch (Standard, damit nichts
> beim Sync verloren geht).
>
> **Stand:** 16.08.2026 · Marke: KUBOLT (Hakan Kocdemir, Einzelunternehmen)

---

## 0. Anweisung an Claude Code

Baue ein installierbares Design-System-Package mit dieser groben Struktur
(passe an dein bevorzugtes Setup an — Tailwind-Preset **oder** CSS-Variablen +
TS-Tokens sind beide okay):

```
kubolt-design-system/
├── package.json
├── src/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radii.ts
│   │   ├── shadows.ts
│   │   └── index.ts
│   ├── theme.css            # CSS custom properties (:root)
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── ColorwaySwatch.tsx
│   │   ├── StoryBlock.tsx
│   │   ├── FeatureRow.tsx
│   │   ├── Callout.tsx
│   │   ├── Input.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── index.ts
└── README.md
```

**Wichtig:** Alle konkreten Werte stehen unten. Wo unten „**Empfehlung**" steht,
ist die Entscheidung noch offen (siehe §10) — nimm den empfohlenen Wert als
Default, aber halte ihn leicht austauschbar (eine zentrale Token-Variable).

---

## 1. Die Marke in einem Absatz

**KUBOLT** ist eine **Dachmarke** für premium, design-bewusste Elektronik —
Start mit einem **pastellfarbenen Steckdosenwürfel** (Power Cube, ~49,99 €) auf
Amazon.de, weitere Produkte folgen. Positionierung: **premium, warm,
design-bewusst** — für Menschen, die Wert darauf legen, wie Dinge zuhause
aussehen. Nicht kalt-minimalistisch, nicht billiges White-Label. Das
Alleinstellungsmerkmal ist eine echte, deutsch verwurzelte **Herkunftsstory**
(Kobold → Kobalt → Strom) plus ein wiedererkennbares Maskottchen (**KUBI**) —
eine Kombination, die es im gesamten Power-/Charger-Segment (auch US) **nirgends
gibt**.

---

## 2. Die Geschichte = der Moat (überall nutzen)

**Kobold → Kobalt → Strom.** Im 16. Jh. glaubten Bergleute im Erzgebirge, ein
**Kobold** habe ihr Silber verhext; sie tauften das rätselhafte Erz **„Kobalt"**
(Agricola 1530; Georg Brandt isolierte das Metall 1735). Heute steckt **Kobalt
im Herzen jeder Lithium-Ionen-Batterie** — der Kern moderner Stromversorgung.
KUBOLTs Kobold hat diesen kleinen Geist gezähmt: Er schürft das Kobalt, das
deinen Strom zuverlässig fließen lässt.

→ Diese Story ist wahr, un-kopierbar und emotional. Sie ist das Rückgrat von
Landingpage-Hero, A+ Content, Verpackung und Social. **Immer damit führen.**

---

## 3. Design-Prinzipien & Signature

**Aesthetik in einem Satz:** Ruhige, warme Pastellwelt mit **einem einzigen
gesättigten Kobaltblau-Akzent** — das Produkt (und die UI) fühlt sich an wie ein
**Design-Objekt**, nicht wie Elektrozubehör.

**Prinzipien:**
1. **Pastell als Basis, Kobalt als der EINE Akzent.** Ein satter Ton gegen
   Pastell wirkt bewusst. Keine knalligen Primärfarben (kein Feuerrot,
   kein Grellgelb als Fläche).
2. **Warm, nicht klinisch.** Warme Neutrals (Richtung Creme), weiche diffuse
   Schatten, großzügiger Weißraum. Kein kaltes Reinweiß-Minimal.
3. **Ruhe trägt Premium, KUBI trägt Wärme.** Die Persönlichkeit kommt aus dem
   Maskottchen, der Copy und der Farbe — **nicht** aus verspielten Rundungen
   oder lauter Deko.
4. **Der Würfel ist die Geometrie.** Klare, definierte Formen mit leicht weichen
   Kanten — spiegelt das Produkt.

**Signature-Element (das eine Merk-Element):** der **glühende Kobalt-Punkt** —
er taucht auf als KUBIs Ring-Edelstein, als Erz in der Truhe, als Blitz und als
der eine Akzent in jeder UI. Alles andere bleibt ruhig; dieser Punkt leuchtet.
Claude Code soll dafür einen dedizierten Glow-Token bereitstellen (siehe §4.8).

**Anti-Patterns (bewusst vermeiden):**
- Knallige Primärfarben als Fläche
- Kaltes Reinweiß-„Apple-Klinik"-Minimal
- Cheap-White-Label-Look (nackte schwarze/weiße Ware)
- Cartoon-Rundungen / „zu kindlich" für die erwachsene Premium-Zielgruppe
- Hochglanz-Optik (signalisiert Massenware) — Matte/Softtouch = Premium
- Der generische „AI-Default": warmes Creme + High-Contrast-Serif +
  Terrakotta-Akzent. Unser Akzent ist **Kobalt, nicht Terrakotta** — bitte
  strikt Kobalt.

---

## 4. Design Tokens

### 4.1 Farben — Brand Core

| Token | Hex | Rolle |
|---|---|---|
| `navy` | `#16294D` | Primär-Brandfarbe · Wordmark · Text auf Hell · dunkle Flächen |
| `cobalt` | `#1E50E6` | **Signature-Akzent** (glühend) · Fills, Icons, CTA, Glow |
| `cobalt-deep` | `#0047AB` | Kobalt für **Text auf Hell** (AA-Kontrast) · gedeckte Variante |
| `sage` | `#9CAF9A` | Pastell-Basis (Flächen, Sektionen, Badges) |
| `rose` | `#D2A6A1` | Pastell-Sekundärakzent |
| `sand` | `#EFE7D6` | Warmer Creme-Hintergrund / Surface |

**Kontrast-Regel (WCAG-geprüft):** `cobalt` (#1E50E6) auf Weiß = **6.28:1 →
AA-tauglich auch für normalen Text**. `cobalt-deep` (#0047AB, 8.4:1) ist die
etwas ruhigere Variante für Links/Fließtext-Akzente. Für Flächen/Icons/Glow
immer `cobalt`.

**Bolt Yellow — nicht Teil des digitalen Systems.** Die gelbe-Blitz-Logo-Variante
(`~#F5B700`) existiert nur als alternatives Amazon-Thumbnail-Logo. Im
Design-System **kein** Gelb — der eine Akzent ist Kobalt.

### 4.2 Farben — Produkt-Farbwelten (Colorways)

Für Swatches, Varianten-Auswahl und Packaging-Mockups. Jede Farbwelt hat einen
**Base** (Pastell) + einen **Ink** (dunkler Ton derselben Familie für Text).
**Regel: Text immer im Ink-Ton der Variante, niemals Weiß auf Pastell.**

| Colorway | Base | Ink (Text/Druck) |
|---|---|---|
| `sage-green` | `#9CAF9A` | `#2C5C46` |
| `dusty-rose` | `#D2A6A1` | `#8C4A4A` |
| `dove-blue` | `#7FA8BA` | `#2C4E5C` |
| `sand-cream` | `#D4C5A9` | `#6B5A3C` |

### 4.3 Farben — Neutrals (warm)

Warm getönte Grautöne (Richtung Creme), damit die UI nie kalt/klinisch wirkt.

| Token | Hex |
|---|---|
| `white` | `#FFFFFF` |
| `cream-50` | `#FAF8F3` |
| `sand-100` | `#EFE7D6` |
| `line-200` | `#E5E0D3` |
| `warm-300` | `#D6CFBF` |
| `warm-400` | `#B7B0A1` |
| `warm-500` | `#8C877B` |
| `warm-600` | `#635F56` |
| `ink-800` | `#2B2A26` |
| `navy-900` | `#16294D` |

### 4.4 Farben — Semantic Tokens

Das ist die Ebene, die Komponenten tatsächlich referenzieren:

| Semantic Token | Wert (referenziert) |
|---|---|
| `background` | `cream-50` |
| `surface` | `white` |
| `surface-sunken` | `sand-100` |
| `text-primary` | `navy-900` |
| `text-secondary` | `warm-600` |
| `text-inverse` | `cream-50` |
| `border` | `line-200` |
| `border-strong` | `warm-400` |
| `accent` | `cobalt` |
| `accent-hover` | `cobalt-deep` |
| `accent-text` | `cobalt-deep` |
| `focus-ring` | `cobalt` (mit Glow, siehe §4.8) |

**Status-Farben** (gedeckt gehalten, damit sie ins warme Set passen):

| Token | Hex |
|---|---|
| `success` | `#5B8C6E` |
| `warning` | `#C99A3B` |
| `error` | `#B5544C` |

**Kontrast-Regeln (WCAG-geprüft, 16.08.):**
- `text-primary` (navy) auf allen hellen Flächen: **11–14:1** ✓ (weit über AA).
- `text-secondary` (warm-600) auf Hell: **~6:1** ✓.
- `accent` (cobalt) auf Weiß: **6.28:1** — AA auch für normalen Text; weißer
  Button-Text auf cobalt-Fill ebenso 6.28:1 ✓.
- Navy-Text auf Pastell-Badges (sage/rose/sand): **6–12:1** ✓.
- **Ausnahme — Colorway-Ink auf eigener Pastell-Basis** (z. B. `sage-ink` auf
  `sage-base`): nur **~3:1** → **nur große Schrift / Display / Packaging**, NICHT
  für Fließtext. Für Fließtext auf einer Pastellfläche `navy` verwenden.

### 4.5 Typografie

- **Wordmark:** eigenes KUBOLT-Logotype (Asset, **keine** System-Schrift) — siehe §6.
- **Display / Headings + Body / UI:** **Gesetzt: `DM Sans`** (Google Fonts,
  OFL, kostenlos) — warm-geometrische Grotesk, professionell, aber freundlich.
  Weights: 400 / 500 / 700.
- **Utility / Captions / Data:** dieselbe Familie, kleiner + `warm-600`.
- **Premium-Upgrade-Pfad (optional, später):** `General Sans` oder `Söhne` als
  Heading-Schrift für mehr „Design-Store"-Charakter. Als eine Token-Variable
  vorsehen, damit swap-bar.

**Verboten** (aus Zielgruppen-Sicht): Serifen · Script-Fonts · stark gerundete
Fonts (wirken zu kindlich fürs Premium-Segment). KUBI liefert das Verspielte,
nicht die Schrift.

**Type Scale** (Base 16px = `1rem`, Verhältnis ~1.25):

| Token | Größe | Line-height | Weight | Einsatz |
|---|---|---|---|---|
| `text-xs` | 0.75rem | 1.4 | 400 | Captions, Labels |
| `text-sm` | 0.875rem | 1.5 | 400/500 | Sekundärtext |
| `text-base` | 1rem | 1.6 | 400 | Fließtext |
| `text-lg` | 1.125rem | 1.5 | 500 | Lead-Text |
| `text-xl` | 1.25rem | 1.4 | 500/700 | Sub-Headings |
| `text-2xl` | 1.5rem | 1.3 | 700 | H3 |
| `text-3xl` | 2rem | 1.2 | 700 | H2 |
| `text-4xl` | 2.5rem | 1.15 | 700 | H1 (Sektionen) |
| `text-5xl` | 3.25rem | 1.05 | 700 | Hero |
| `text-6xl` | 4rem | 1.0 | 700 | Hero (groß) |

Buchstabenabstand: Headings leicht negativ (`-0.01em` bis `-0.02em`),
Fließtext neutral. Großbuchstaben-Labels (`text-xs`) leicht positiv (`+0.04em`).

### 4.6 Spacing

4px-Basis-Skala:

| Token | px |
|---|---|
| `space-1` | 4 |
| `space-2` | 8 |
| `space-3` | 12 |
| `space-4` | 16 |
| `space-5` | 20 |
| `space-6` | 24 |
| `space-8` | 32 |
| `space-10` | 40 |
| `space-12` | 48 |
| `space-16` | 64 |
| `space-20` | 80 |
| `space-24` | 96 |
| `space-32` | 128 |

Sektions-Padding großzügig (Weißraum = Premium): Desktop `space-24`/`space-32`
vertikal, Mobile `space-12`/`space-16`.

### 4.7 Radii

Definiert-weich (spiegelt die leicht gerundeten Würfelkanten) — **nicht**
cartoon-rund.

| Token | px | Einsatz |
|---|---|---|
| `radius-sm` | 6 | Inputs, kleine Chips |
| `radius-md` | 10 | Buttons, Standard |
| `radius-lg` | 16 | Cards |
| `radius-xl` | 24 | große Panels, Hero-Bildrahmen |
| `radius-2xl` | 32 | Feature-Blöcke |
| `radius-full` | 9999 | Pills, Avatare, Icon-Buttons |

Default für Cards/Buttons: `radius-md`–`radius-lg`.

### 4.8 Shadows & Elevation

Weiche, **navy-getönte** (nicht schwarze) Schatten — passt zur diffusen
Foto-Beleuchtung „weich von links oben".

| Token | Wert |
|---|---|
| `shadow-xs` | `0 1px 2px rgba(22,41,77,.06)` |
| `shadow-sm` | `0 2px 8px rgba(22,41,77,.08)` |
| `shadow-md` | `0 8px 24px rgba(22,41,77,.10)` |
| `shadow-lg` | `0 16px 48px rgba(22,41,77,.12)` |
| **`glow-cobalt`** | `0 0 24px rgba(30,80,230,.35)` |

**`glow-cobalt` = das Signature-Detail.** Nur sparsam einsetzen: Ring-Edelstein,
Blitz, CTA-Hover, Focus-Ring, „Story"-Akzente. Es ist DER Moment, in dem etwas
leuchtet — nicht überall.

### 4.9 Motion (optional, dezent)

- Standard-Transition: `180ms ease-out` (Hover/Focus).
- Ein orchestrierter Moment schlägt gestreute Effekte. Kein Dauer-Animieren
  (wirkt sonst AI-generiert).
- Reduced-Motion respektieren (`prefers-reduced-motion`).

---

## 5. Komponenten (was Claude Code bauen soll)

Kern-Set fürs Package. Jede Komponente referenziert **nur** Semantic Tokens.

| Komponente | Kurz-Spec |
|---|---|
| `Button` | Varianten: `primary` (cobalt-Fill, weißer Text, Hover→`glow-cobalt`), `secondary` (navy-Outline, navy-Text), `ghost` (transparent, navy-Text). Größen: `sm`/`md`/`lg`. `radius-md`. |
| `Badge` / `Tag` | Für Colorway-Tags, „Klub der Kubis"-Badge, Story-Badge. Pastell-Fill + Ink-Text der jeweiligen Familie. `radius-full`. |
| `Card` | `surface`, `border`, `shadow-sm`→Hover `shadow-md`, `radius-lg`. Slots: Media / Title / Body / Footer. Basis für Produkt- und Content-Cards. |
| `ColorwaySwatch` | Farb-Kreis/Quadrat pro Farbwelt (§4.2) mit Ink-Rand + Label. Selektierbar (Varianten-Auswahl). |
| `StoryBlock` | Text-Bild-Modul für die Kobalt-Story. Platz für KUBI-Illustration + Fließtext. Optional dezenter `glow-cobalt` am Akzent. |
| `FeatureRow` | Icon (cobalt) + Titel + kurze Beschreibung. Für Specs/Vorteile (z. B. „USB-C 20W", „3× Schuko", „CE zertifiziert"). |
| `Callout` | Info-Block: linker cobalt-Rand (4px), `surface`, `radius-md`. Für Hinweise/Highlights. |
| `Input` / Formularfelder | `surface`, `border`, Focus → `focus-ring` + `glow-cobalt`. `radius-sm`. Label + Helper + Error-State (`error`). |
| `SectionHeader` | Eyebrow-Label (`text-xs`, uppercase, `warm-600`) + H2/H3. Eyebrow nur, wenn er echte Info trägt (kein Deko-Nummerieren). |
| `Header` / Nav | Logo-Lockup links, Nav rechts, CTA-Button (`primary`). `background` transparent/`cream-50`. |
| `Footer` | `navy-900`-Fläche, `text-inverse`. Logo (reduzierte einfarbige Version), Links, Kobalt-Akzent. |

**Layout-Primitiven** zusätzlich sinnvoll: `Container` (max-width, seitliches
Padding), `Section` (vertikaler Rhythmus), `Grid`.

**Hero-These (für spätere Seiten):** Nicht mit „großer Zahl + Label" öffnen
(Template-Default). Öffnen mit dem Charakteristischsten aus KUBOLTs Welt — dem
Produkt als Design-Objekt **oder** KUBI + der Kobalt-Story. Das ist der Aufhänger.

---

## 6. Logo & Wordmark

- **Wordmark:** fettes „KUBOLT" (Navy), Blitz integriert im „O", Blitz-Schwung
  als Unterstrich. Bereits von Hakan gestaltet → **Haupt-Logo** (eigene
  Display-Type, keine System-Schrift nachbauen). Charakter: energetisch,
  bold, sportlich.
- **Lockup:** KUBI oben, Wordmark darunter.
- **Blitzfarbe: Kobaltblau (gesetzt).** Der Blitz im digitalen Logo/Lockup ist
  kobaltblau — konsistent mit dem einen Akzent, KUBIs Ring und der Story. Die
  gelbe-Blitz-Variante existiert nur als alternatives Amazon-Thumbnail-Logo und
  ist **nicht** Teil des digitalen Token-Systems.
- **Zwei Modi:** vollfarbiger KUBI (Packaging, A+, Social) **+** reduzierte
  einfarbige Version / Kopf-Icon (Stempel, Favicon, Prägung).
- **Do/Don't:** Wordmark nicht verzerren, nicht recolorieren außer definierten
  Modi, nicht auf unruhigem Hintergrund ohne Schutzraum platzieren.
  Falls ein KI-Composite die Type verhunzt → sauber am Rechner mit der
  Original-Wortmarke neu setzen (exakte Typo).

---

## 7. KUBI — Maskottchen (Asset-Specs)

Ein niedlicher, freundlich-verschmitzter **Kobold-Bergmann** im klaren
**japanischen Manga/Anime-Stil** (selbstbewusste Tuschelinien, große
ausdrucksstarke Augen).

**Feste Merkmale (immer identisch — nie stillschweigend umdesignen):**
- Spitze Elfenohren
- Kleiner Bart **und** Schnurrbart
- Kleiner Zahn, der aus dem fröhlichen Grinsen blitzt
- Kleine runde Knopfnase, große freundliche Augen
- Sage-grüner Bergmannshelm mit runder Stirnlampe
- Schlichtes sage-grünes Outfit + schlichte braune Ledertasche —
  **KEINE Blitz-Symbole auf ihm**
- **Signature: klobiger Ring mit glühend kobaltblauem Edelstein**
- Stämmiger, zwergenhafter Körperbau
- Trägt eine Spitzhacke locker über der Schulter

**Generierung (kritisch für Konsistenz):**
- Immer das gespeicherte **Higgsfield-Charakter-Element** referenzieren:
  - Element `KUBI-final` · **ID `1b6af278-2a34-4ba9-a70d-955d6b0730df`**
  - Im Higgsfield-Prompt Platzhalter `<<<1b6af278-2a34-4ba9-a70d-955d6b0730df>>>` einfügen.
  - (Alte Version `KUBI-Kobold` `1264e17a` hatte Blitze → **abgelöst, nicht mehr nutzen.**)
- Bevorzugte Modelle: `nano_banana_2` (Nano Banana Pro) oder `gpt_image_2`.
  Für konsistente neue Posen einen früheren KUBI-Job als Bildreferenz übergeben
  und „identisch halten, nur X ändern" sagen.
- **Nie einen realen Künstler nennen** (z. B. „Akira Toriyama") — triggert
  IP-Filter. Stil beschreiben: „clean Japanese shonen manga style, expressive
  eyes, soft cel shading".
- Immer in der Pastell-Palette mit Kobaltblau als einzigem Akzent halten.
  Keine lauten Primärfarben.

**Für das Design-System:** Eine `KubiSlot`-Komponente / Bild-Platzhalter
vorsehen, wo KUBI-Renders eingesetzt werden (transparente PNGs). Der Code baut
KUBI nicht — er reserviert nur den Platz und die Umgebung (Glow, Rahmen).

---

## 8. Brand Voice (für generierte Copy in Claude Design)

**Voice-Attribute:** Präzise · Warmherzig · Designbewusst · Vertrauenswürdig ·
Lebendig. KUBI ist der verlässliche kleine Helfer, der im Verborgenen dafür
sorgt, dass alles läuft — mit einem Augenzwinkern. Schreib konkret und warm,
**kein** Corporate-Füllstoff.

**Ton nach Kontext:** Amazon-Listing = klar/nutzenorientiert. Verpackungstext =
warm/persönlich. Landingpage-Hero = Story-getrieben. UI-Microcopy = knapp,
aktive Verben, Satzschreibung (kein Marketing-Geschrei).

**Beispiel — gleicher Punkt, generisch vs. KUBOLT-Voice:**
- Generisch: „3 Steckdosen + USB-C. Kompaktes Würfeldesign."
- KUBOLT: „Drei Steckdosen und ein USB-C-Schnelllader — in einem Würfel, den du
  nicht mehr verstecken willst."

**UI-Copy-Regeln** (Design-System-Microcopy):
- Aus Nutzersicht schreiben, nach dem benennen, was man kontrolliert.
- Aktive Verben: Button sagt exakt, was passiert („Speichern", nicht „Absenden").
- Aktion behält denselben Namen durch den Flow (Button „Veröffentlichen" →
  Toast „Veröffentlicht").
- Fehler entschuldigen sich nicht und sind nie vage: was ging schief + wie beheben.
- Leere Zustände sind eine Einladung zum Handeln, keine Stimmung.

---

## 9. Harte Regeln / Guardrails (nicht brechen)

1. **Maskottchen/Produkt NIE „Kobold" nennen.** Vorwerk hält die bekannte
   Wortmarke „Kobold" (erweiterter Schutz, § 14 Abs. 2 Nr. 3 MarkenG). Name ist
   **KUBI**; die Kobold-Story nur **erzählerisch** nutzen.
2. **Amazon-Reviews:** Belohnung / Schatz-Freischaltung / Klub-Zugang **nie** an
   eine (positive) Bewertung koppeln — Verstoß gegen Amazon ToS. Belohnungen
   bleiben bedingungslos; eine ehrliche Bewertung getrennt und ohne Gegenleistung
   einladen.
3. **Paletten-Disziplin:** Pastell + **ein** Kobalt-Akzent. Keine lauten
   Primärfarben als Fläche.
4. **„Epictore" nie wiederbeleben** (alter, fremder Name).
5. **Konsistenz zuerst:** immer die KUBI-Element-ID wiederverwenden — KUBI nicht
   stillschweigend umdesignen.

**Markenschutz-Kontext (Info):** Anmeldeplan Wortmarke „KUBOLT" + Bildmarke
(Logo/KUBI) beim DPMA (Klasse 9, ~290 €) bzw. EUIPO (~850 €). Vor jeder
Namens-/Zeichenwahl DPMAregister + TMview prüfen. (Nicht Aufgabe des
Design-Systems, aber relevant für neue Wortmarken/Claims.)

---

## 10. Entscheidungen (bestätigt am 16.08.2026)

Alle drei Kern-Entscheidungen sind gesetzt — Claude Code kann direkt bauen:

1. **Akzent-/Blitzfarbe: Kobaltblau ✓** — der eine digitale Akzent (`cobalt`
   #1E50E6 glühend / `cobalt-deep` #0047AB für Text). Gelb nur als
   Amazon-Thumbnail-Logo, nicht im System.
2. **Font: DM Sans ✓** (frei, OFL, warm-geometrisch). Upgrade-Pfad zu
   `General Sans` / `Söhne` bleibt optional als eine Token-Variable.
3. **Hex-Werte: geprüft & übernommen ✓** — alle UI-Text-, Link-, Button- und
   Badge-Paarungen erfüllen WCAG AA (siehe Kontrast-Regeln in §4.4). Die
   digitalen Werte sind einsetzbar.

**Einzige reale To-do (außerhalb des Design-Systems):** Vor dem **Verpackungs-
druck** die Pastelltöne im CMYK-Proof final freigeben — Pastell kippt im
CMYK-Druck leicht (betrifft nur Print, nicht die digitale UI).

---

## 11. Asset-Referenzen

- **Higgsfield-Element `KUBI-final`:** `1b6af278-2a34-4ba9-a70d-955d6b0730df`
- **Alt-Element `KUBI-Kobold` (mit Blitzen, abgelöst):** `1264e17a` — nicht nutzen
- **KUBOLT-Wordmark (Job):** `378ca668-6e19-4fca-905c-174e062c3160`
- **Vorhandene Bild-Assets:** KUBI-Vollfigur mit Schatztruhe · Wordmark (Navy +
  gelber Blitz) · Logo-Lockup (KUBI + Wordmark, kobaltblauer Blitz)
- **Volle Doku:** Notion → „🎨 Markenidentität, KUBI-Maskottchen & Klub der
  Kubis" (unter „🔌 KUBOLT – Amazon FBA Projekt")

---

*Ende des Briefs. Kern-Entscheidungen sind gesetzt (§10) — Claude Code kann
direkt bauen.*
