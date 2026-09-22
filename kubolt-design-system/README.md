# KUBOLT Design System

Design-Tokens + React-Komponenten für **KUBOLT** — premium, warme,
design-bewusste Elektronik. Ruhige Pastellwelt mit **einem** glühenden
Kobaltblau-Akzent.

> Quelle der Wahrheit: [`docs/brand-brief.md`](./docs/brand-brief.md)
> (Brand- & Design-System-Brief, Stand 16.08.2026).

## Prinzipien (Kurzfassung)

1. **Pastell als Basis, Kobalt als der EINE Akzent.** Keine lauten
   Primärfarben, kein Gelb im digitalen System.
2. **Warm, nicht klinisch.** Creme-Neutrals, navy-getönte weiche Schatten,
   großzügiger Weißraum.
3. **Ruhe trägt Premium.** Persönlichkeit kommt aus KUBI, Copy und Farbe —
   nicht aus Deko.
4. **Der Würfel ist die Geometrie.** Definiert-weiche Radien, nicht
   cartoon-rund.
5. **`glow-cobalt` ist das Signature-Detail** — sparsam: CTA-Hover,
   Focus-Ring, Story-Akzente.

## Installation & Verwendung

Das Package wird als Source ausgeliefert (TS + CSS) und setzt einen Bundler
voraus (Vite, Next.js, …). React 18 oder 19 als Peer-Dependency.

```tsx
// Einmal global (z. B. in main.tsx / layout.tsx):
import 'kubolt-design-system/styles.css'; // Tokens + alle Komponenten-Styles
import 'kubolt-design-system/fonts.css';  // DM Sans via Google Fonts (optional, falls nicht self-hosted)

import { Button, Card, CardBody, CardTitle, SectionHeader } from 'kubolt-design-system';

export function Beispiel() {
  return (
    <Card interactive>
      <CardBody>
        <CardTitle>Power Cube</CardTitle>
        <p>Drei Steckdosen und ein USB-C-Schnelllader — in einem Würfel,
        den du nicht mehr verstecken willst.</p>
        <Button variant="primary">In den Warenkorb</Button>
      </CardBody>
    </Card>
  );
}
```

Die Seite (oder ein Wurzel-Element) bekommt die Klasse `kb-root`, damit
Hintergrund (`cream-50`), Schrift und Textfarbe gesetzt sind:

```html
<body class="kb-root">…</body>
```

## Design-Tokens

TypeScript-Tokens unter `kubolt-design-system/tokens`, CSS Custom Properties
in `theme.css` (Präfix `--kb-`). Komponenten referenzieren **nur** die
semantische Ebene:

| Semantic Token | CSS-Variable | Wert |
|---|---|---|
| background | `--kb-background` | cream-50 `#FAF8F3` |
| surface | `--kb-surface` | white `#FFFFFF` |
| surface-sunken | `--kb-surface-sunken` | sand-100 `#EFE7D6` |
| text-primary | `--kb-text-primary` | navy-900 `#16294D` |
| text-secondary | `--kb-text-secondary` | warm-600 `#635F56` |
| text-inverse | `--kb-text-inverse` | cream-50 `#FAF8F3` |
| border / border-strong | `--kb-border` / `--kb-border-strong` | line-200 / warm-400 |
| accent | `--kb-accent` | cobalt `#1E50E6` |
| accent-hover / accent-text | `--kb-accent-hover` / `--kb-accent-text` | cobalt-deep `#0047AB` |
| focus-ring | `--kb-focus-ring` (+ `--kb-glow-cobalt`) | cobalt `#1E50E6` |

Dazu: Colorways (`--kb-colorway-<name>-base/-ink`), Status
(`--kb-success/-warning/-error`), Typo-Skala (`--kb-text-xs`…`--kb-text-6xl`),
Spacing (`--kb-space-1`…`--kb-space-32`), Radii (`--kb-radius-sm`…`-full`),
Schatten (`--kb-shadow-xs`…`-lg`, `--kb-glow-cobalt`), Motion
(`--kb-transition` = 180ms ease-out).

**Font-Upgrade-Pfad:** Headings hängen an `--kb-font-display`
(Default: DM Sans). Für `General Sans`/`Söhne` genügt ein Override dieser
einen Variable.

## Komponenten

| Komponente | Zweck |
|---|---|
| `Button` | `primary` (Kobalt-Fill, Glow-Hover) · `secondary` (Navy-Outline) · `ghost`; Größen `sm/md/lg` |
| `Badge` | Pastell-Pill mit Ink- oder Navy-Text (`tone`: sage/rose/dove/sand) |
| `Card` + `CardMedia/CardTitle/CardBody/CardFooter` | Produkt- & Content-Cards |
| `ColorwaySwatch` | Varianten-Auswahl der Produkt-Farbwelten (selektierbar) |
| `StoryBlock` | Text-Bild-Modul für die Kobalt-Story, optionaler Glow |
| `FeatureRow` | Kobalt-Icon + Titel + Beschreibung (Specs/Vorteile) |
| `Callout` | Hinweis-Block mit kobaltfarbenem (oder Status-) Rand |
| `Input` / `Textarea` | Formularfelder mit Label, Helper, Error-State, Glow-Focus |
| `SectionHeader` | Eyebrow (nur mit echter Info) + H2/H3 + Lead |
| `Header` | Logo-Lockup links, Nav, CTA rechts |
| `Footer` | Navy-Fläche, Inverse-Text, glühende Kobalt-Kante |
| `KubiSlot` | Reservierter Platz für KUBI-Renders (Glow, Rahmen) — der Code baut KUBI nicht |
| `Container` / `Section` / `Grid` | Layout-Primitiven (Weißraum-Rhythmus) |

## Kontrast-Regeln (WCAG, geprüft)

- Navy auf hellen Flächen: 11–14:1 · warm-600 auf Hell: ~6:1.
- Kobalt auf Weiß bzw. Weiß auf Kobalt-Fill: 6.28:1 (AA, auch normaler Text).
- **Ausnahme:** Colorway-Ink auf eigener Pastell-Basis ≈ 3:1 → nur große
  Schrift/Display/Packaging, nie Fließtext. Fließtext auf Pastell = Navy.
- Kobalt auf Navy ≈ 2:1 → im Footer nur dekorativ (Glow-Kante), nie als
  Linkfarbe.

## Harte Regeln

- Maskottchen/Produkt **nie „Kobold" nennen** — der Name ist **KUBI**.
- Kein Gelb, kein Terrakotta, keine lauten Primärfarben im digitalen System.
- KUBI nicht umdesignen; Renders kommen aus dem gespeicherten
  Charakter-Element (siehe Brief §7/§11).

## Entwicklung

```bash
npm install
npm run typecheck
```
