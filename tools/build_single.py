#!/usr/bin/env python3
"""Baut goldwoerter.html – die komplette App als eine einzige Datei.

Praktisch fürs Handy: Datei herunterladen/teilen und direkt im Browser öffnen,
kein Server nötig. Vorher tools/build_data.py ausführen, falls sich die
Wortdaten geändert haben.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

css = (ROOT / "css" / "style.css").read_text(encoding="utf-8")
data = (ROOT / "js" / "data.js").read_text(encoding="utf-8")
app = (ROOT / "js" / "app.js").read_text(encoding="utf-8")

html = f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#14101e">
  <title>Goldwörter – Türkisch Vokabeltrainer</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🪙</text></svg>">
  <style>
{css}
  </style>
</head>
<body>
  <div id="app" class="app"></div>
  <div id="toasts" class="toasts"></div>
  <script>
{data}
{app}
  </script>
</body>
</html>
"""

out = ROOT / "goldwoerter.html"
out.write_text(html, encoding="utf-8")
print(f"OK: {out} ({out.stat().st_size // 1024} KB)")
