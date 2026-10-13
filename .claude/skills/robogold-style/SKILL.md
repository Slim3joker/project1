---
name: robogold-style
description: "Der RoboGold-Style – der visuelle Hausstil der Marke RoboGold für alles, was im Video gezeigt wird: YouTube-Folien, Kurs-Lektionen, Website- und Tool-Recherchen als Screenshot, Zahlen-Folien, Thumbnails und Instagram-Karussells. Dunkel zuerst (Navy, Tiefnacht), Gold als einziger Akzent (Altgold auf hellen Folien), Würfelraster-Grafiken (variabel große Würfel statt Punkte) mit Technik-Motiven wie Chip, Netz und Leiterbahn, Bricolage Grotesque + Unbounded, jede Folie exakt 16:9 – plus „Glut-Bühne“: Gold-Glow, leuchtender Glaswürfel und Serif-Titel für Kapitel-Intros, Kurs-Cover und Karussells im Hochformat 4:5. Nutzen bei „/robogold-style“, „RoboGold-Style“, „im RoboGold-Look“, „Folien fürs Video“, „Kurs-Folie“, „Lektion“, „Recherche im Video zeigen“, „Thumbnail“, „Glut-Bühne“, „leuchtender Würfel“, „Karussell“, „Instagram-Post“, „Kapitel-Intro“. Bewusst abstrakte Gestaltungskunst: keine Maskottchen-, Comic- oder Kinderfiguren, keine Produktmotive oder Produktfotos."
---

# /robogold-style – Der RoboGold-Style

Ein fester Hausstil für Video und Kurs rund um KI und Automatisierung: dunkel, präzise, wertig – **Navy als Grund, Gold als einziger Akzent**, Grafiken aus **variabel großen Würfeln**. Alles hier gilt für **jeden** Build in diesem Stil.

**Grundsatz: abstrakte Gestaltungskunst.** Der Stil arbeitet ausschließlich mit Form, Raster, Licht, Fläche und Typografie. **Keine Figuren** – kein Maskottchen, keine Comic-, Kinder- oder 2D-Charaktere, keine Roboter-Figuren, keine Illustrationen von Personen. **Keine Produktmotive** – keine Produktfotos, keine gezeichneten Produkte. Würfel, Chip, Netz und Leiterbahn sind reine Geometrie. Echte Inhalte (Screenshots, dein Gesicht im Thumbnail) bleiben erlaubt; erfunden wird nur Abstraktes.

**Brand-Book (ZUERST öffnen):** [`brand-book.html`](brand-book.html) in diesem Ordner – der Stil dokumentiert sich selbst: Farben, Schrift, Würfelraster, acht Motive, Karten + Icons, Recherche-Rahmen, Thumbnail, Glut-Bühne (16:9 und 4:5) und Regeln. Blättern mit ← → / Leertaste, **F** = Vollbild. Wenn du etwas baust: Es muss aussehen wie das Brand-Book.

---

## Farben (LOCKED)

| Rolle | Wert | Einsatz |
|---|---|---|
| **Grund** | `#16294d` Navy | Standard-Hintergrund · Schrift auf Sand |
| Karte auf Navy | `#1f3561` Panel | Karten, Swatches, Motiv-Kacheln auf Navy |
| Tiefnacht | `#08090f` | Grund der Glut-Bühne |
| Helle Fläche | `#efe7d6` Sand (Karten `#f7f2e7`) | helle Inhalts-Folien (Screenshots, Tabellen) · Schrift auf Navy |
| Schatten auf Sand | `#d6cbb3` | Karten-Schatten, ruhige Deko auf hellen Folien |
| **Akzent** | `#e3a92b` Gold | der EINE Akzent auf Dunkel: Betonungswort, Zahl, Highlight-Karte, Motiv – darf glühen |
| Akzent auf Sand | `#8a5e08` Altgold | ersetzt Gold auf hellen Folien (Gold selbst ist dort zu schwach) |
| Goldglanz | `#f6d27a` (Glanzlicht `#fff1cc`) | **nur Glut-Bühne:** Glanz und Lichtkante im Glaswürfel, Rand der Glas-Pille |
| Gedämpft | `#a3aeca` auf Navy · `#56607a` auf Sand | Nebentext, Labels |
| Rand (Letterbox) | `#0b1530` | Fläche um die 16:9-Bühne |

Keine weiteren Farben. Kein Orange, kein Cyan, keine Regenbogen-Verläufe – das Leuchten bleibt Gold.

**Gold-Disziplin:** Gold markiert genau **eine** Sache pro Folie – das, worauf der Zuschauer schauen soll. Braucht nichts Betonung, bleibt alles Sand auf Navy.

**Dunkel zuerst:** Navy ist der Grund. Sand nur für Inhalt, der hell besser lesbar ist – Screenshots, Tabellen, Details – und für Muster-Seiten. Etwa 3 von 4 Folien sind dunkel.

**Kontrast (geprüft):** Sand auf Navy 11,7 : 1 · Gold auf Navy 6,8 : 1 · Gold auf Panel 5,7 : 1 · Gold auf Tiefnacht 9,4 : 1 · Altgold auf Sand 4,6 : 1 · Navy auf Gold 6,8 : 1. Gold direkt auf Sand hat nur 1,7 : 1 → auf Sand **immer** Altgold.

## Schrift (LOCKED)

| Schrift | Rolle | Regeln |
|---|---|---|
| **Bricolage Grotesque** | alles | Überschriften **700**, `letter-spacing: -0.02em`. Text **400**. Kicker **600**, Versalien, `letter-spacing: .32em`, in Gold. |
| **Unbounded** 800 | Betonung | **1–2 Wörter oder eine Zahl** in einer Überschrift, in Gold (`.em`). Auch für große Einzelzahlen und Badge-Ziffern. Nie Fließtext, nie ganze Zeilen. |
| **Instrument Serif** 400 | Titel der Glut-Bühne | **Nur** im Glut-Modus, nur für den Titel, hell (`#f7f2e7`). Betonung dort per *Kursiv*, nicht per Unbounded. Sonst nirgends. |

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Unbounded:wght@500..900&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```
```css
.em { font-family: 'Unbounded', sans-serif; font-weight: 800; font-size: .86em; letter-spacing: -.01em; margin-left: .06em;
      color: var(--gold); text-shadow: 0 0 .4em rgba(227,169,43,.4); }
.light .em { color: var(--altgold); text-shadow: none; }
```
Unbounded ist breit – darum `.86em`, damit es optisch zur Überschrift passt. Betonungswörter in Versalien.

**Größen** (alle Maße in `cqw` = 1 % der Folienbreite):

| Element | cqw | bei 1080p |
|---|---|---|
| Titel (h1) | 6.2 | ≈ 120 px |
| Folien-Überschrift (h2) | 3.8 | ≈ 72 px |
| Text | 1.6 | ≈ 31 px |
| Label / Quelle (Minimum) | 1.3 | ≈ 25 px |
| Kicker | 1.3 · gesperrt | ≈ 25 px |

## Die 16:9-Bühne

Jede Folie ist exakt 16:9 und skaliert mit dem Fenster (Letterbox in `#0b1530`). Weil alles in `cqw` gemessen ist, sieht eine Folie bei 720p, 1080p und 4K identisch aus. Aufnehmen: Datei im Browser öffnen, **F** für Vollbild, Bildschirm aufnehmen – oder Screenshots bei 1920 × 1080.

```css
:root {
    --navy: #16294d; --panel: #1f3561; --night: #0b1530; --deep: #08090f;
    --sand: #efe7d6; --card: #f7f2e7; --shade: #d6cbb3;
    --gold: #e3a92b; --glanz: #f6d27a; --altgold: #8a5e08; --light: #fff1cc;
    --mut: #56607a; --mutd: #a3aeca;
}
html { color-scheme: light; scroll-snap-type: y mandatory; }
body { margin: 0; background: var(--night); font-family: 'Bricolage Grotesque', system-ui, sans-serif; }
.frame { height: 100vh; height: 100dvh; display: grid; place-items: center; scroll-snap-align: start; overflow: hidden; }
.slide { width: min(100vw, 177.78vh); width: min(100vw, calc(100dvh * 16 / 9)); aspect-ratio: 16 / 9;
         container-type: inline-size; position: relative; overflow: hidden; box-sizing: border-box;
         padding: 4.5cqw 6cqw 6.75cqw; }            /* Sicherheitsrand: oben 8 %, seitlich 6 %, unten 12 % */
.dark  { background: var(--navy); color: var(--sand); }
.light { background: var(--sand); color: var(--navy); }
```
```html
<section class="frame"><div class="slide dark werk"> … </div></section>
```
Präsentieren-Steuerung (in jede Datei):
```js
const frames = [...document.querySelectorAll('.frame')];
const go = i => frames[Math.max(0, Math.min(frames.length - 1, i))].scrollIntoView({ behavior: 'instant', block: 'start' });
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const cur = Math.round(scrollY / innerHeight);
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(cur + 1); }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
  else if (e.key === 'f' || e.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
});
```

**Drei Layouts:**
- **Werkbank** (Standard): Text links, Motiv rechts – `display: grid; grid-template-columns: 1fr auto; align-items: center; align-content: center; gap: 5cqw;`. Für Screenshots gespiegelt (Rahmen links, Text rechts).
- **Bühne**: alles zentriert – für Kernaussagen, eine große Zahl, Lektionstitel, Abschluss.
- **Split**: halb Navy, halb Sand – für Vorher/Nachher und Vergleiche.

## Würfelraster (DIE Haus-Technik)

Jede Grafik ist ein **Raster aus abgerundeten Würfeln**: feste Spalten, die Würfel*größe* kommt aus einer Dichte-Funktion – Formen entstehen aus der Größe. Gerendert auf `<canvas>` mit dieser Engine (unverändert in jeden Build kopieren):

```js
function raster(id, cols, f, o = {}) {
  const c = document.getElementById(id); if (!c) return;
  const { width: w, height: h } = c.getBoundingClientRect(); if (!w || !h) return;
  const dpr = window.devicePixelRatio || 1, a = w / h, step = w / cols, k = step / h, max = step * (o.fill || 0.84);
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = o.alpha ?? 1;
  for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) {
    const u = x / w, v = y / h; let b = f(u, v, a, k), col = o.color, hot = false;
    if (o.f2) { const b2 = o.f2(u, v, a, k); if (b2 > b) { b = b2; col = o.color2; hot = true; } }
    if (b <= 0.03) continue;
    const s = Math.min(1, b) * max;
    ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = hot && o.glow ? o.glow * step * dpr : 0;
    ctx.beginPath(); box(ctx, x - s / 2, y - s / 2, s, s, s * (o.round ?? 0.24)); ctx.fill();
  }
}
function box(ctx, x, y, w, h, r) { if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
function segDist(px, py, [ax, ay], [bx, by]) { const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(px - ax - t * dx, py - ay - t * dy); }
function noise(x, y) { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); }   // reproduzierbar, nie Math.random()
function inPoly(p, x, y) { let s = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) s = !s; return s; }

const NAVY = 'rgba(22,41,77,0.9)', SAND = 'rgba(239,231,214,0.88)', GOLD = '#e3a92b', ALTGOLD = '#8a5e08';
const DARK  = { color: SAND, color2: GOLD, glow: 0.9 };     // auf Navy (Standard): Gold glüht
const LIGHT = { color: NAVY, color2: ALTGOLD };             // auf Sand: Altgold, kein Glow

// Zeichnen – und bei jeder Größenänderung (Vollbild!) neu, damit es scharf bleibt
const ART = [], art = f => ART.push(f), drawAll = () => ART.forEach(f => f());
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(drawAll, 150); });
addEventListener('load', drawAll); if (document.fonts) document.fonts.ready.then(drawAll);
// art(() => raster('cChip', 44, M.chip.f, { ...DARK, f2: M.chip.f2 }));
```

Regeln:
- **Die Funktion bekommt `(u, v, a, k)`:** `u, v` = Position 0…1, `a` = Breite/Höhe (für runde Formen `X = (u - .5) * a, Y = v - .5` rechnen), `k` = Würfelgröße in Höhen-Einheiten (für Fugen, Linien und Pins, die genau einen Würfel breit sein sollen). Rückgabe 0…1 = Würfelgröße.
- **Spalten statt Pixel:** `cols` legt die Auflösung fest – 40–50 für Hauptmotive, ~46 für kleine Vorschauen, 13–17 für den Kern im Glaswürfel, 120–160 für Bänder über die volle Breite.
- **Zwei Ebenen, nie mehr:** Feld (`f`, Sand auf Navy bzw. Navy auf Sand) + ein Gold-Motiv (`f2`). `glow` nur auf Dunkel, nur für die Gold-Ebene.
- **Text gewinnt:** Liegt Text über einem Raster, steht das Raster auf `alpha` ≤ 0.2 – oder die Funktion lässt dort eine Lücke.
- **Würfel, keine Punkte:** Abrundung `round` 0.2–0.3. Runde Punkte sind nicht dieser Stil.
- `noise()` für Textur, nie `Math.random()` (jedes Rendern muss gleich aussehen).
- Neue Formen = neue Dichte-Funktion (10–30 Zeilen). Nie Würfel einzeln platzieren, nie tausende SVG-Rechtecke ausgeben.

**Motiv-Bibliothek** – alle als lauffähiger Code im `<script>` von `brand-book.html` (Objekt `M`), einfach kopieren:
- **Würfel** – isometrischer Würfel, Deckel in Gold, Fugen zwischen den Flächen (`cubeFace` + `segDist`). Das Leitmotiv.
- **Chip** – Prozessor mit Pins an allen vier Seiten, Kern in Gold. Pins an jedem zweiten Würfel (über `k`), sauber in jeder Auflösung. Auch der Kern im Glaswürfel.
- **Netz** – neuronales Netz aus drei Schichten, ein aktiver Pfad in Gold.
- **Leiterbahn** – Platinen-Bahnen mit 45°-Knick und Durchkontaktierungen, eine Bahn in Gold. Breit gerendert (`cols` 150) als Band für die Unterkante von Abschluss-Folien, mit `alpha` ≤ 0.15 als Thumbnail-Textur.
- **Würfeltürme** – Balkendiagramm aus gestapelten Würfeln, der wichtige Balken in Gold. Daten bleiben im Stil.
- **Wachstum** – Kurve in Gold mit Endpunkt, Fläche darunter verblasst.
- **Fortschritt** – Ring mit Gold-Anteil (`P`), Mitte frei für die Zahl.
- **Spirale** – logarithmische Spirale mit drei Armen und Gold-Kern. Gut als Kapitel- oder Cover-Motiv.

## Karten + Würfel-Icons

```css
.card { background: var(--panel); border: .16cqw solid rgba(239,231,214,.5); border-radius: 1cqw; box-shadow: .45cqw .45cqw 0 rgba(8,9,15,.6); }
.card.hot { border-color: var(--gold); box-shadow: .45cqw .45cqw 0 var(--gold); }
.light .card { background: var(--card); border-color: var(--navy); box-shadow: .45cqw .45cqw 0 var(--shade); }
.light .card.hot { border-color: var(--altgold); box-shadow: .45cqw .45cqw 0 var(--altgold); }
```
Auf Navy: Panel-Fläche, 3 px heller Rahmen, harter Versatz-Schatten in Tiefnacht. Auf Sand: helle Karte, Navy-Rahmen, Schatten in `#d6cbb3`. Gold- bzw. Altgold-Rahmen + Schatten nur für die eine Karte, auf die es ankommt. Karten-Inhalt: Icon-Spalte links, Titel (700) + Unterzeile (600, Versalien, gesperrt) rechts.

**Icons sind Würfel-Raster, keine Vektor-SVGs** – 12 × 12 Zellen, jede Zelle ein abgerundeter Würfel mit Fuge:
```js
function icon(id, rows, pal) {
  const c = document.getElementById(id); if (!c) return;
  const w = c.getBoundingClientRect().width, n = rows[0].length, m = rows.length, cell = w / n, dpr = window.devicePixelRatio || 1;
  c.width = Math.round(w * dpr); c.height = Math.round(cell * m * dpr);
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = cell * 0.09;
  rows.forEach((row, y) => [...row].forEach((k, x) => {
    if (k === '.') return;
    ctx.fillStyle = pal[k]; ctx.beginPath(); box(ctx, x * cell + g, y * cell + g, cell - 2 * g, cell - 2 * g, cell * 0.22); ctx.fill();
  }));
}
// art(() => icon('icLupe', ['............', '..kkkkk.....', …], { k: '#efe7d6' }));   // Canvas per CSS quadratisch, z. B. 3.8cqw
```
- Auf Navy: Umriss-Icons in Sand, gefüllt in Gold nur das Icon der Highlight-Karte. Auf Sand: Navy bzw. Altgold.
- Fertige Icons im Brand-Book: Lupe (Daten sammeln), Balken (Auswerten), Blitz (Automatisieren, gefüllt).

## Video-Bausteine

**Recherche zeigen (Browser-Rahmen + Marker)** – für Screenshots von Websites, Tools, Dashboards. Läuft auf einer **hellen** Folie (`.slide.light`), weil Screenshots meist hell sind:
```html
<div class="card browser">
  <div class="bar"><i></i><i></i><i></i><span class="url">example.com/seite</span></div>
  <div class="shot">                                   <!-- position: relative -->
    <img src="screenshot.png" alt="">                   <!-- füllt .shot -->
    <div class="mark" style="left:48%;top:34%;width:33%;height:17%"><div class="badge">1</div></div>
  </div>
</div>
```
- Screenshot **immer im Rahmen**, nie randlos auf die Folie.
- **Ein Marker pro Bild** (Altgold-Rahmen 0.3cqw, runde Ecken, Badge oben links). Höchstens drei nummerierte Stellen – nur die gerade besprochene in Altgold, die anderen in Navy.
- Marker-Position in **%** innerhalb von `.shot` – Bild und Marker teilen denselben Kasten und skalieren zusammen. Nie absolute Pixel über HTML legen.
- **Badge-Zahl = Zahl im Text:** daneben eine `.card.hot` mit derselben Badge-Ziffer und der Erkenntnis in 2–4 Wörtern.
- Vollständige CSS für Rahmen, Leiste, Marker und Badge: Folie „06 · Recherche zeigen“ im Brand-Book.

**Zahlen-Folie** (Bühne, Navy): eine Zahl in Unbounded 900 (Gold + Glow), darunter 2–4 Wörter. Optional ein Fortschrittsring oder Würfeltürme.

**Lektions-Titel** (Kurs): Kicker `Lektion 03 · Thema` + h1 mit einem Betonungswort + ein Motiv (Werkbank). Kicker nur hier und für Kapitel – sonst kein Etikett über der Überschrift.

**Abschluss-Folie**: Navy, eine Zeile Text oben in der Mitte, große ruhige Fläche (Platz für YouTube-Endcards), optional Leiterbahn-Band unten.

## Thumbnails

- **1280 × 720** – dieselbe Bühne, Screenshot bei 1280 × 720.
- **Höchstens vier Wörter.** Navy-Fläche, Sand-Schrift, **Gold nur auf der einen Zahl oder dem einen Wort** (Unbounded 900, Glow).
- **Unten rechts frei** – dort liegt YouTubes Zeitstempel.
- Dein Gesicht (echtes Foto) oder **ein abstraktes Motiv** auf **eine** Seite, Text auf die andere. Keine gezeichneten Figuren, keine Produktbilder.
- Hintergrund-Textur (Leiterbahn) höchstens alpha 0.15.
- Muster: Folie „07 · Thumbnail“ im Brand-Book.

## Glut-Bühne (Showcase-Modus)

Der dramatische Modus: **Tiefnacht, ein Gold-Glow, ein leuchtender Glaswürfel** mit Chip-Kern, darüber ein großer **Serif-Titel** und eine **Glas-Pille**. Der Glaswürfel ist der Akzent – Daten, die zu Gold werden.

**Wann:** Kapitel- und Lektions-Intros, Kurs-Cover, Instagram-Karussell-Cover, Abschluss-Momente. **Sparsam:** höchstens eine Glut-Folie pro Kapitel (etwa jede 5.–10. Folie) – sonst verliert sie ihre Wirkung.

```css
.glut { background: radial-gradient(46% 62% at 50% var(--gy, 58%), rgba(227,169,43,.7) 0%, rgba(205,140,30,.42) 22%, rgba(110,70,12,.3) 46%, rgba(8,9,15,0) 78%), var(--deep); color: var(--card); }
.serif { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; letter-spacing: -.025em; line-height: .96; }
.serif i { font-style: italic; }
.pill { display: inline-block; padding: .55em 1.5em; border-radius: 999px; border: .1cqw solid rgba(246,210,122,.3); background: rgba(246,210,122,.08);
        color: var(--card); font-weight: 400; font-size: 1.5cqw; letter-spacing: .01em; }
.glass { position: relative; aspect-ratio: 1; border-radius: 23%; display: grid; place-items: center;
         background: radial-gradient(circle at 50% 46%, rgba(255,255,255,.6), rgba(255,255,255,0) 58%), linear-gradient(158deg, var(--light) 0%, var(--glanz) 30%, var(--gold) 60%, #a8740f 100%);
         box-shadow: inset 0 0 0 .3cqw rgba(255,255,255,.65), inset 0 1.2cqw 2.2cqw rgba(255,255,255,.5), inset 0 -1.4cqw 2.6cqw rgba(150,95,10,.55),
                     0 .7cqw 0 rgba(255,236,190,.5), 0 0 1.6cqw rgba(255,236,190,.85), 0 0 5cqw rgba(227,169,43,.95); }
.glass::before { content: ''; position: absolute; inset: 5% 7% 52% 7%; border-radius: 30% 30% 45% 45%; background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0)); }
.glass::after { content: ''; position: absolute; inset: -75%; z-index: -1; border-radius: 50%;   /* Lichthof statt Riesen-Schatten (Chromium kappt große Blur-Radien) */
                background: radial-gradient(closest-side, rgba(246,210,122,.7), rgba(227,169,43,.42) 42%, rgba(227,169,43,0)); }
.glass .core { position: relative; width: 62%; height: 62%; }
.glut-buehne { display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 5cqw; }
.glut-buehne h1 { font-size: 7cqw; margin: 0; }
.glut-buehne .pill { margin-top: 1.6cqw; }
.glut-buehne .glass { width: 18cqw; margin-top: 4cqw; }
```
```html
<section class="frame"><div class="slide glut glut-buehne">
  <h1 class="serif">Wenn Daten <i>leuchten</i></h1>
  <div class="pill">Lektion 3</div>
  <div class="glass"><div class="core"><canvas id="gKern" class="art"></canvas></div></div>
</div></section>
```
```js
// Kern im Glaswürfel: Navy-Würfelraster auf Gold, grob (13–17 Spalten), ohne Glow
const GLAS = { color: 'rgba(22,41,77,0.92)', color2: 'rgba(22,41,77,0.92)', fill: 0.88 };   // Kern im Glaswürfel: Navy auf Gold
art(() => raster('gKern', 15, M.chip.f, { ...GLAS, f2: M.chip.f2 }));   // oder M.wuerfel, M.spirale
```

Regeln:
- **Ein leuchtendes Objekt pro Folie** – der Glaswürfel. Kein zweiter Glow, keine Unbounded-Betonung, kein Gold-Text: das Objekt ist der Akzent.
- **Titel in Instrument Serif**, hell, zentriert, höchstens zwei Zeilen; ein Wort darf *kursiv* sein. Der Titel steht oben im dunklen Teil – nie über dem hellen Glow-Zentrum.
- **Glas-Pille** für „Teil 1“, „Lektion 3“, „Kapitel 2“ – ein bis drei Wörter.
- **Kern im Glas** immer aus dem Würfelraster (Chip, Würfel oder Spirale) in Navy – nie ein fremdes Logo, nie ein Vektor-Icon.
- **Glow-Zentrum** mit `--gy` auf die Mitte des Glaswürfels legen (16:9 ≈ 58 %, 4:5 ≈ 62 %).
- **Nur abstrakt:** Der Glaswürfel schwebt frei. Keine Figuren, keine Maskottchen, keine Hände oder Produktfotos davor.
- Kein `backdrop-filter` auf der Pille – Chromium malt damit einen dunklen Streifen in den Glow.

**Hochformat 4:5 (Instagram-Karussell, 1080 × 1350)** – dieselbe Bühne, andere Proportion. Alle Maße in `cqw` beziehen sich hier auf die Postbreite:
```css
.slide.hoch { width: min(100vw, 80vh); width: min(100vw, calc(100dvh * 4 / 5)); aspect-ratio: 4 / 5; }
.hoch { --gy: 62%; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 11cqw 7cqw 0; }
.hoch .titel { font-size: 15cqw; margin: 0; }
.hoch .pill { margin-top: 5cqw; font-size: 4.2cqw; border-width: .3cqw; }
.hoch .glass { width: 42cqw; margin-top: 10cqw; box-shadow: inset 0 0 0 .9cqw rgba(255,255,255,.65), inset 0 3.5cqw 6cqw rgba(255,255,255,.5), inset 0 -4cqw 7cqw rgba(150,95,10,.55),
               0 2cqw 0 rgba(255,236,190,.5), 0 0 4.5cqw rgba(255,236,190,.85), 0 0 14cqw rgba(227,169,43,.95); }
.hoch .from { position: absolute; left: 7cqw; bottom: 7cqw; text-align: left; font-size: 4cqw; line-height: 1.3; }
.hoch .from b { font-weight: 700; }
.hoch .next { position: absolute; right: 7cqw; bottom: 7cqw; width: 12cqw; height: 12cqw; border-radius: 50%; display: grid; place-items: center;
              background: rgba(246,210,122,.1); border: .3cqw solid rgba(246,210,122,.3); color: var(--card); font-size: 6cqw; line-height: 1; }
```
```html
<section class="frame"><div class="slide hoch glut">
  <h1 class="serif titel">Automatisieren in <i>5&nbsp;Minuten</i></h1>
  <div class="pill">Teil 1</div>
  <div class="glass"><div class="core"><canvas id="pKern" class="art"></canvas></div></div>
  <div class="from"><b>RoboGold</b><br>@kanal</div>   <!-- echtes Logo/Handle einsetzen -->
  <div class="next">→</div>                            <!-- Weiter-Hinweis fürs Karussell -->
</div></section>
```
- Absender unten links, Weiter-Pfeil unten rechts – nur auf dem Cover und Zwischenseiten, nicht auf der letzten Karte.
- Folgekarten des Karussells sind normale Navy-Inhalte im Hochformat (`.slide.hoch.dark`) – die Glut-Bühne ist das Cover.
- Screenshot bei **1080 × 1350**.

## Regeln für Video & Kurs

- **Sicherer Rand:** 6 % links/rechts, 8 % oben – nichts Wichtiges ganz außen.
- **Unten frei:** die unteren 12 % gehören Player-Leiste und Untertiteln – dort nur Deko (Raster-Bänder), nie Text.
- **Handy-lesbar:** Kernaussage ≥ 3.8cqw, Text ≥ 1.6cqw, Labels ≥ 1.3cqw (siehe Größen-Tabelle).
- **Eine Idee pro Folie:** eine Überschrift (≤ 6 Wörter), ein Motiv, höchstens eine Zeile Text. Lieber zwei Folien als eine volle – den Rest sagst du im Video.
- **Gold = eine Sache** pro Folie.
- **Dunkel zuerst:** Navy ist der Grund, Sand nur für Inhalt.
- **Schnitt statt Effekt:** Folien sind statisch. Bewegung kommt vom Schnitt, nicht von Animationen.
- **Keine Ecktexte:** keine Wasserzeichen, Foliennummern, Logos in Ecken.

## Arbeitsablauf

1. `brand-book.html` ansehen.
2. Pro Folie eine Idee festlegen, Layout wählen (Werkbank / Bühne / Split), Navy oder – für Inhalt – Sand.
3. **Eine** HTML-Datei bauen: alle Folien als `.frame > .slide`, Bühnen-CSS, Präsentieren-Steuerung, Engine und nur die Motive, die gebraucht werden.
4. **Headless prüfen:** jede Folie bei 1920 × 1080 (Hochformat: 1080 × 1350) als Screenshot (Playwright: `page.locator('.slide').nth(i).screenshot()` oder pro `.frame` `scrollIntoView` + Screenshot). Prüfen: nichts ragt über die Folie, nichts liegt in den unteren 12 %, Gold nur einmal pro Folie, Schriften geladen (`document.fonts`).
5. Erst dann abgeben.

## Canvas-Fallen

1. **Canvas braucht Größe vom Container.** Die Engine liest `getBoundingClientRect()` – Canvas immer in einen Container mit fester Größe (in `cqw`) setzen und mit `width: 100%; height: 100%; display: block` füllen. `inset: 0` allein dehnt kein Canvas.
2. **Unsichtbare Canvas werden nicht gezeichnet** (`display: none` → Größe 0). Nach dem Einblenden `drawAll()` aufrufen.
3. **`shadowBlur` ignoriert die Transformation** – darum multipliziert die Engine den Glow mit `dpr`. Nicht „reparieren“.
4. **`color-scheme: light`** auf `html`, damit Chromes Auto-Dark-Mode die Farben nicht umdreht.

## Was dieser Style NICHT ist

- Kein Orange (#ff6b1a), kein Papierweiß/Schwarz-Druck-Look, keine Pixelschrift, keine runden Rasterpunkte – das ist der Look der Vorlage, nicht unser Look.
- Keine Serifenschrift außerhalb der Glut-Bühne, kein Cyan- oder Regenbogen-Glow, keine fremden Logos im Glaswürfel.
- Keine Gold-Schrift auf Sand (zu schwach) – dort Altgold.
- Keine knalligen Primärfarben, kein Mehrfarben-Mix. Farbverläufe nur als Gold-Glow und Glas in der Glut-Bühne.
- Keine Textwände, keine Bullet-Listen mit mehr als drei Punkten auf Video-Folien.
- Keine Animationen, keine Ecktexte, keine Wasserzeichen.
- **Keine Figuren:** kein Maskottchen, keine Roboter-Figuren, keine Comic-, Kinder- oder 2D-Charaktere – auch nicht als Deko.
- **Keine Produktmotive:** keine Produktfotos, keine gezeichneten Produkte.

## Herkunft

Weiterentwicklung von „Robo Style“ (CC BY 4.0); die Glut-Bühne ist von einer allgemeinen Glow-/Glas-Ästhetik inspiriert – Details in [`ATTRIBUTION.md`](ATTRIBUTION.md). Wird dieser Skill weitergegeben (z. B. an Kursteilnehmer), `ATTRIBUTION.md` mitgeben.
