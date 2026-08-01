# CLAUDE.md — Projekt-Kontext für die Kochkiste

Diese Datei wird von jeder Claude-Code-Sitzung beim Start gelesen. Sie sorgt dafür,
dass Claude das Projekt sofort versteht — egal von welchem Gerät aus gearbeitet wird.

## Was ist das hier?

**Kochkiste** — Hakans persönliche Koch-/Rezept-App. Eine **einzige, in sich
geschlossene HTML-Datei** (`index.html`): kein Backend, keine externen Abhängigkeiten,
alle Nutzerdaten liegen im Browser (`localStorage`). Läuft als statische Seite.

Live-Adresse: **https://kochkiste.erenstower.de**

## Sprache & Umgang

- Antworten auf **Deutsch**, einfach und konkret. Hakan ist kein Entwickler.
- Bei Server-/Terminal-Schritten: **fertige Befehle zum Kopieren**, ein Schritt nach dem anderen.

## Architektur (alles in `index.html`)

- **`const RECIPES = [...]`** — die fest eingebaute Rezept-Datenbank (aktuell bis `r47`).
- **`let userRecipes`** — vom Nutzer über den In-App-Button „➕ Eigenes Rezept" angelegte
  Rezepte, gespeichert in `localStorage` (`kk_userRecipes`), werden beim Laden in
  `RECIPES` gemischt. Diese sind **gerätegebunden** (nur im jeweiligen Browser).
- Ansichten (`<section class="view">`): Kühlschrank, Kochen, Reste, Einkauf, Verlauf, Detail.
  Startansicht ist **Einkauf**.
- Modale = `.sheet-bg`/`.sheet`, ein-/ausgeblendet über die CSS-Klasse `.open`.
- **`buyStats`** (`kk_buyStats`): lernt, was oft gekauft wird → „Häufig gekauft"-Vorschläge.
- **Geräte-Sync (optional, standardmäßig aus):** `syncCfg` (`kk_syncCfg` = `{url,key}`).
  Ist er gesetzt, gleicht die App den **geteilten Haushalt** (`shop, fridge, pantry, spices,
  buyStats`) über das Mini-Backend ab (Polling + Push, Konflikt-Merge). Siehe `sync/server.js`.

### Rezept-Schema (beim Hinzufügen exakt einhalten)

```js
{id:'rXX', title:'…', e:'🍽️', region:'<siehe REGIONS>', country:'…',
 taste:{sweet,salty,sour,bitter,umami,fatty}, // je 0–3
 spice:0-5, richness:0-3, protein:'…',        // protein ist reines Metadatenfeld
 ingr:['…'], opt:['…'],                        // Zutatennamen möglichst wiederverwenden
 ingrQty:[{n,amount,unit}], optQty:[{n,amount,unit}],
 kcal, servings, time, season:['frühling','sommer','herbst','winter'],
 source:'…' /*optional*/, steps:['…','…']}
```

- **Regionen** (feste Menge, nicht erweitern): `east_asian, southeast_asian, south_asian,
  middle_eastern, mediterranean, central_european, americas, african`.
- Neue Rezepte **vor dem abschließenden `];`** der `RECIPES`-Liste einfügen, ID fortlaufend.
- Danach **validieren**: das Array muss sauber parsen (z.B. mit einem kurzen `node`-Check),
  keine doppelten IDs, taste/spice/richness in gültigem Bereich, jede `ingr` hat eine Menge.

## Rezepte hinzufügen — der Ablauf

Hakan gibt ein Rezept **formlos** durch (getippt, eingesprochen/diktiert, oder als **Foto**
einer Kochbuchseite). Claude bringt es ins Schema oben, hängt es an `RECIPES` an, committet
und pusht. Bei Kochbüchern: nur die **Fakten** (Zutaten + Zubereitung) im knappen App-Format
übernehmen, keine ganzen Buchseiten/Einleitungstexte 1:1 kopieren.

## Deployment (Unraid-Server „Tower")

- App läuft als nginx-Container auf dem Tower (`192.168.178.32`), Port **8088**,
  angebunden über den bestehenden **Cloudflare-Tunnel** → `kochkiste.erenstower.de`.
- App-Ordner auf dem Server: `/mnt/user/appdata/kochkiste`
- Unraid hat **kein git** → Updates laufen per `curl` aus diesem öffentlichen Repo.
- Details/Schritt-für-Schritt: **`deploy/UNRAID-CLOUDFLARE.md`**.
- **Optionaler Sync-Server** (für den geteilten Haushalt / Geräte-Sync): eigener
  Node-Container (`sync/server.js`), Anleitung in **`deploy/SYNC-BACKEND.md`**,
  erreichbar unter `kk-api.erenstower.de`.

**Nach jeder Änderung an `index.html`:** committen + pushen. Dann holt Hakan die neue
Version auf den Server (eine Zeile, danach Browser neu laden):

```bash
B="https://raw.githubusercontent.com/Slim3joker/project1/refs/heads/claude/koch-app-unraid-cloudflare-ex3k2n"
curl -fL -o /mnt/user/appdata/kochkiste/index.html "$B/index.html"
```

## Git-Regeln

- Entwicklungs-Branch: **`claude/koch-app-unraid-cloudflare-ex3k2n`**.
- **Nicht** ohne ausdrückliche Erlaubnis nach `master` pushen.
- Änderungen immer committen **und** pushen (GitHub ist das Gedächtnis über alle Geräte hinweg).

## Bekannte nächste Ausbaustufen (Ideen)

- **Geräte-Sync**: Nutzerdaten (Vorräte, selbst getippte Rezepte, Log) sind aktuell pro
  Gerät getrennt (localStorage). Ein kleines Backend würde das geräteübergreifend machen.
- Einkaufsliste teilen/exportieren.
- Mehr Rezepte / Kochbücher einpflegen.
