---
name: kubolt-style
description: "Der KUBOLT-Style – der visuelle Hausstil für alles, was im Video gezeigt wird: YouTube-Folien, Kurs-Lektionen, Website-Recherchen als Screenshot, Zahlen-Folien und Thumbnails. Sand/Navy-Pastell mit Kobaltblau als einzigem Akzent, Würfelraster-Grafiken (variabel große Würfel statt Punkte), Bricolage Grotesque + Unbounded, jede Folie exakt 16:9. Nutzen bei „/kubolt-style“, „KUBOLT-Style“, „im KUBOLT-Look“, „Folien fürs Video“, „Kurs-Folie“, „Lektion“, „Recherche im Video zeigen“, „Thumbnail im KUBOLT-Look“. Für Maskottchen KUBI, Logo/Wortmarke, Markenstimme und Markenrecht gilt zusätzlich der Skill kubolt-brand."
---

# /kubolt-style – Der KUBOLT-Style

Ein fester Hausstil für Video und Kurs: ruhig, warm, klar – Pastell als Fläche, **Kobalt als einziger Akzent**, Grafiken aus **variabel großen Würfeln**. Alles hier gilt für **jeden** Build in diesem Stil.

**Brand-Book (ZUERST öffnen):** [`brand-book.html`](brand-book.html) in diesem Ordner – der Stil dokumentiert sich selbst: Farben, Schrift, Würfelraster, acht Motive, Karten + Icons, Recherche-Rahmen, Thumbnail und Regeln. Blättern mit ← → / Leertaste, **F** = Vollbild. Wenn du etwas baust: Es muss aussehen wie das Brand-Book.

**Abgrenzung zu `kubolt-brand`:** Dieser Skill regelt *wie es aussieht*. Für KUBI (immer das gespeicherte Higgsfield-Element verwenden), die Wortmarke, die Kobold→Kobalt→Strom-Story, die Markenstimme und die Markenrecht-Regeln gilt `kubolt-brand`. Insbesondere: Maskottchen und Produkte **nie „Kobold“ nennen** (Vorwerk-Marke) – der Name ist **KUBI**.

---

## Farben (LOCKED)

| Rolle | Wert | Einsatz |
|---|---|---|
| Fläche | `#efe7d6` Sand (Karten `#f7f2e7`) | Standard-Hintergrund |
| Schrift + dunkle Folien | `#16294d` Navy | aller Text auf Sand · Hintergrund für Betonungs-Folien |
| Ruhige Fläche | `#9caf9a` Salbei | Flächen, Karten-Schatten, Nebenserien |
| Warme Fläche | `#d2a6a1` Altrosa | Flächen, kleine Deko (Sterne, Punkte) |
| **Akzent** | `#1e50e6` Kobalt | der EINE Akzent auf Sand: Betonungswort, Zahl, Highlight-Karte, Marker |
| Akzent auf Navy | `#6e9bff` Kobalt-Glut | ersetzt Kobalt auf Navy, darf glühen |
| Gedämpft | `#56607a` auf Sand · `#a3aeca` auf Navy | Nebentext, Labels |
| Rand (Letterbox) | `#0b1530` | Fläche um die 16:9-Bühne |

Keine weiteren Farben. Kein Orange, kein Gelb, kein Feuerrot – auch nicht für den Blitz.

**Kobalt-Disziplin:** Kobalt markiert genau **eine** Sache pro Folie – das, worauf der Zuschauer schauen soll. Braucht nichts Betonung, bleibt alles Navy auf Sand. Pastell ist immer Fläche, nie Betonung.

**Kontrast (geprüft):** Navy auf Sand 11,7 : 1 · Kobalt auf Sand 5,1 : 1 · Kobalt-Glut auf Navy 5,4 : 1. Kobalt direkt auf Navy hat nur 2,3 : 1 → auf Navy **immer** Kobalt-Glut. Kein Kobalt-Text auf Salbei oder Altrosa (zu schwach) – dort Navy.

**Hinweis:** Die Markenfarben in `kubolt-brand` sind als „vorgeschlagen“ markiert. Ändern sich die finalen Hex-Werte, hier die Tabelle und im Brand-Book den `:root`-Block anpassen – sonst nirgends.

## Schrift (LOCKED)

| Schrift | Rolle | Regeln |
|---|---|---|
| **Bricolage Grotesque** | alles | Überschriften **700**, `letter-spacing: -0.02em`. Text **400**. Kicker **600**, Versalien, `letter-spacing: .32em`, in Kobalt. |
| **Unbounded** 800 | Betonung | **1–2 Wörter oder eine Zahl** in einer Überschrift, in Kobalt (`.em`). Auch für große Einzelzahlen und Badge-Ziffern. Nie Fließtext, nie ganze Zeilen. |

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Unbounded:wght@500..900&display=swap" rel="stylesheet">
```
```css
.em { font-family: 'Unbounded', sans-serif; font-weight: 800; font-size: .86em; letter-spacing: -.01em; color: var(--cobalt); margin-left: .06em; }
.dark .em { color: var(--glow); text-shadow: 0 0 .4em rgba(110,155,255,.45); }   /* auf Navy glüht die Betonung */
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
:root { --sand:#efe7d6; --card:#f7f2e7; --navy:#16294d; --night:#0b1530; --sage:#9caf9a; --rose:#d2a6a1;
        --cobalt:#1e50e6; --glow:#6e9bff; --mut:#56607a; --mutd:#a3aeca; }
html { color-scheme: light; scroll-snap-type: y mandatory; }
body { margin: 0; background: var(--night); font-family: 'Bricolage Grotesque', system-ui, sans-serif; }
.frame { height: 100vh; height: 100dvh; display: grid; place-items: center; scroll-snap-align: start; overflow: hidden; }
.slide { width: min(100vw, 177.78vh); width: min(100vw, calc(100dvh * 16 / 9)); aspect-ratio: 16 / 9;
         container-type: inline-size; position: relative; overflow: hidden; box-sizing: border-box;
         padding: 4.5cqw 6cqw 6.75cqw; }            /* Sicherheitsrand: oben 8 %, seitlich 6 %, unten 12 % */
.light { background: var(--sand); color: var(--navy); }
.dark  { background: var(--navy); color: var(--sand); }
```
```html
<section class="frame"><div class="slide light werk"> … </div></section>
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

Folien mischen: überwiegend Sand, Navy für Betonungs-Momente (Regeln, große Zahl, Abschluss).

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

const NAVY = 'rgba(22,41,77,0.9)', SAND = 'rgba(239,231,214,0.88)', KOBALT = '#1e50e6', GLUT = '#6e9bff';
const LIGHT = { color: NAVY, color2: KOBALT };              // auf Sand
const DARK  = { color: SAND, color2: GLUT, glow: 0.9 };     // auf Navy: Kobalt glüht

// Zeichnen – und bei jeder Größenänderung (Vollbild!) neu, damit es scharf bleibt
const ART = [], art = f => ART.push(f), drawAll = () => ART.forEach(f => f());
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(drawAll, 150); });
addEventListener('load', drawAll); if (document.fonts) document.fonts.ready.then(drawAll);
// art(() => raster('cWuerfel', 44, M.wuerfel.f, { ...LIGHT, f2: M.wuerfel.f2 }));
```

Regeln:
- **Die Funktion bekommt `(u, v, a, k)`:** `u, v` = Position 0…1, `a` = Breite/Höhe (für runde Formen `X = (u - .5) * a, Y = v - .5` rechnen), `k` = Würfelgröße in Höhen-Einheiten (für Fugen und Linien, die genau einen Würfel breit sein sollen). Rückgabe 0…1 = Würfelgröße.
- **Spalten statt Pixel:** `cols` legt die Auflösung fest – 40–50 für Hauptmotive, ~46 für kleine Vorschauen, 120–160 für Bänder über die volle Breite.
- **Zwei Ebenen, nie mehr:** Feld (`f`, Navy auf Sand bzw. Sand auf Navy) + ein Kobalt-Motiv (`f2`). `glow` nur auf Navy, nur für die Kobalt-Ebene.
- **Text gewinnt:** Liegt Text über einem Raster, steht das Raster auf `alpha` ≤ 0.2 – oder die Funktion lässt dort eine Lücke.
- **Würfel, keine Punkte:** Abrundung `round` 0.2–0.3. Runde Punkte sind nicht dieser Stil.
- `noise()` für Textur, nie `Math.random()` (jedes Rendern muss gleich aussehen).
- Neue Formen = neue Dichte-Funktion (10–30 Zeilen). Nie Würfel einzeln platzieren, nie tausende SVG-Rechtecke ausgeben.

**Motiv-Bibliothek** – alle als lauffähiger Code im `<script>` von `brand-book.html` (Objekt `M`), einfach kopieren:
- **Würfel** – isometrischer Würfel, Deckel in Kobalt, Fugen zwischen den Flächen (`cubeFace` + `segDist`). Das Leitmotiv.
- **Kristall** – Kobalt-Kristalle auf Gestein. Auf Navy mit Glow = der Kobalt-Edelstein von KUBIs Ring.
- **Blitz** – Blitz mit flacher Oberkante, Funken als Feld.
- **Erzader** – Gesteinsschichten mit Kobalt-Ader. Auch als Hintergrund-Textur (alpha ≤ 0.2).
- **Würfeltürme** – Balkendiagramm aus gestapelten Würfeln, der wichtige Balken in Kobalt. Daten bleiben im Stil.
- **Wachstum** – Kurve in Kobalt mit Endpunkt, Fläche darunter verblasst.
- **Fortschritt** – Ring mit Kobalt-Anteil (`P`), Mitte frei für die Zahl.
- **Steckdose** – Schuko-Steckdose mit Kobalt-Ring – das Produkt-Motiv.
- **Flöz** – Gesteinsband mit Kobalt-Ader für die Unterkante von Abschluss-Folien.

## Karten + Würfel-Icons

```css
.card { background: var(--card); border: .16cqw solid var(--navy); border-radius: 1cqw; box-shadow: .45cqw .45cqw 0 var(--sage); }
.card.hot { border-color: var(--cobalt); box-shadow: .45cqw .45cqw 0 var(--cobalt); }   /* DIE eine Highlight-Karte */
```
3 px Navy-Rahmen, runde Ecken, harter Versatz-Schatten in **Salbei**. Kobalt-Rahmen + Kobalt-Schatten nur für die eine Karte, auf die es ankommt. Karten-Inhalt: Icon-Spalte links, Titel (700) + Unterzeile (600, Versalien, gesperrt) rechts.

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
// art(() => icon('icLupe', ['............', '..kkkkk.....', …], { k: '#16294d' }));   // Canvas per CSS quadratisch, z. B. 3.8cqw
```
- Umriss-Icons in Navy; gefüllt in Kobalt nur das Icon der Highlight-Karte. Auf Navy: Sand bzw. Kobalt-Glut.
- Fertige Icons im Brand-Book: Lupe (Recherche), Balken (Analyse), Blitz (Umsetzen, gefüllt).

## Video-Bausteine

**Recherche zeigen (Browser-Rahmen + Marker)** – für Screenshots von Websites, Amazon-Listings, Tools:
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
- **Ein Marker pro Bild** (Kobalt-Rahmen 0.3cqw, runde Ecken, Badge oben links). Höchstens drei nummerierte Stellen – nur die gerade besprochene in Kobalt, die anderen in Navy.
- Marker-Position in **%** innerhalb von `.shot` – Bild und Marker teilen denselben Kasten und skalieren zusammen. Nie absolute Pixel über HTML legen.
- **Badge-Zahl = Zahl im Text:** daneben eine `.card.hot` mit derselben Badge-Ziffer und der Erkenntnis in 2–4 Wörtern.
- Vollständige CSS für Rahmen, Leiste, Marker und Badge: Folie „06 · Recherche zeigen“ im Brand-Book.

**Zahlen-Folie** (Bühne, gern Navy): eine Zahl in Unbounded 900 (Kobalt-Glut + Glow), darunter 2–4 Wörter. Optional ein Fortschrittsring oder Würfeltürme.

**Lektions-Titel** (Kurs): Kicker `Lektion 03 · Thema` + h1 mit einem Betonungswort + ein Motiv (Werkbank). Kicker nur hier und für Kapitel – sonst kein Etikett über der Überschrift.

**Abschluss-Folie**: Navy, eine Zeile Text oben in der Mitte, große ruhige Fläche (Platz für YouTube-Endcards), optional Flöz-Band unten.

## Thumbnails

- **1280 × 720** – dieselbe Bühne, Screenshot bei 1280 × 720.
- **Höchstens vier Wörter.** Navy-Fläche, Sand-Schrift, **Kobalt-Glut nur auf der einen Zahl oder dem einen Wort** (Unbounded 900, Glow).
- **Unten rechts frei** – dort liegt YouTubes Zeitstempel.
- Gesicht oder KUBI auf **eine** Seite, Text auf die andere. KUBI nur über das Higgsfield-Element aus `kubolt-brand` erzeugen.
- Hintergrund-Textur (Erzader) höchstens alpha 0.15.
- Muster: Folie „07 · Thumbnail“ im Brand-Book.

## Regeln für Video & Kurs

- **Sicherer Rand:** 6 % links/rechts, 8 % oben – nichts Wichtiges ganz außen.
- **Unten frei:** die unteren 12 % gehören Player-Leiste und Untertiteln – dort nur Deko (Raster-Bänder), nie Text.
- **Handy-lesbar:** Kernaussage ≥ 3.8cqw, Text ≥ 1.6cqw, Labels ≥ 1.3cqw (siehe Größen-Tabelle).
- **Eine Idee pro Folie:** eine Überschrift (≤ 6 Wörter), ein Motiv, höchstens eine Zeile Text. Lieber zwei Folien als eine volle – den Rest sagst du im Video.
- **Kobalt = eine Sache** pro Folie.
- **Schnitt statt Effekt:** Folien sind statisch. Bewegung kommt vom Schnitt, nicht von Animationen.
- **Keine Ecktexte:** keine Wasserzeichen, Foliennummern, Logos in Ecken.

## Arbeitsablauf

1. `brand-book.html` ansehen (und bei Bedarf den Skill `kubolt-brand` für KUBI, Story und Wortlaut).
2. Pro Folie eine Idee festlegen, Layout wählen (Werkbank / Bühne / Split), Sand oder Navy.
3. **Eine** HTML-Datei bauen: alle Folien als `.frame > .slide`, Bühnen-CSS, Präsentieren-Steuerung, Engine und nur die Motive, die gebraucht werden.
4. **Headless prüfen:** jede Folie bei 1920 × 1080 als Screenshot (Playwright: `page.locator('.slide').nth(i).screenshot()` oder pro `.frame` `scrollIntoView` + Screenshot). Prüfen: nichts ragt über die Folie, nichts liegt in den unteren 12 %, Kobalt nur einmal pro Folie, Schriften geladen (`document.fonts`).
5. Erst dann abgeben.

## Canvas-Fallen

1. **Canvas braucht Größe vom Container.** Die Engine liest `getBoundingClientRect()` – Canvas immer in einen Container mit fester Größe (in `cqw`) setzen und mit `width: 100%; height: 100%; display: block` füllen. `inset: 0` allein dehnt kein Canvas.
2. **Unsichtbare Canvas werden nicht gezeichnet** (`display: none` → Größe 0). Nach dem Einblenden `drawAll()` aufrufen.
3. **`shadowBlur` ignoriert die Transformation** – darum multipliziert die Engine den Glow mit `dpr`. Nicht „reparieren“.
4. **`color-scheme: light`** auf `html`, damit Chromes Auto-Dark-Mode die Farben nicht umdreht.

## Was dieser Style NICHT ist

- Kein Orange, kein Papierweiß/Schwarz, keine Pixelschrift, keine runden Rasterpunkte – das ist Robo, unser Ursprung, nicht unser Look.
- Keine knalligen Primärfarben, keine Farbverläufe, kein Mehrfarben-Mix.
- Keine Textwände, keine Bullet-Listen mit mehr als drei Punkten auf Video-Folien.
- Keine Animationen, keine Ecktexte, keine Wasserzeichen.
- Nie „Kobold“ als Name – KUBI.

## Herkunft

Weiterentwicklung von „Robo Style“ (CC BY 4.0) – Details in [`ATTRIBUTION.md`](ATTRIBUTION.md). Wird dieser Skill weitergegeben (z. B. an Kursteilnehmer), `ATTRIBUTION.md` mitgeben.
