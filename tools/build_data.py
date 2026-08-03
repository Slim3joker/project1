#!/usr/bin/env python3
"""Baut js/data.js aus der Frequenzliste (CSV) und den kuratierten Übersetzungen.

Nutzung:  python3 tools/build_data.py

Liest:
  data/tuerkisch_frequenzliste_lemmatisiert.csv  (rank,lemma,frequency,...)
  tools/translations.psv                          (lemma|anzeige|deutsch|englisch)

Schreibt:
  js/data.js  – WORDS-Array sortiert nach Frequenzrang, inkl. Abdeckungsanteil
                (cov = Anteil des Wortes an allen Korpus-Tokens in Prozent).
"""
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "data" / "tuerkisch_frequenzliste_lemmatisiert.csv"
TRANS_PATH = ROOT / "tools" / "translations.psv"
OUT_PATH = ROOT / "js" / "data.js"


def main() -> int:
    freq = {}
    with CSV_PATH.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        first_row = None
        for row in reader:
            if first_row is None:
                first_row = row
            lemma = row["lemma"]
            if lemma not in freq:  # bei Duplikaten gewinnt der bessere Rang
                freq[lemma] = {
                    "rank": int(row["rank"]),
                    "f": int(row["frequency"]),
                    "ex": row.get("example_surface_form", ""),
                }

    # Gesamtzahl der Tokens aus Rang 1 rückrechnen (frequency / cumulative_pct)
    total_tokens = int(first_row["frequency"]) / (float(first_row["cumulative_pct"]) / 100.0)

    entries = []
    missing = []
    seen = set()
    with TRANS_PATH.open(encoding="utf-8") as f:
        for lineno, raw in enumerate(f, 1):
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("|")
            if len(parts) != 4:
                print(f"WARNUNG Zeile {lineno}: erwartet 4 Felder, {len(parts)} gefunden: {line[:60]}")
                continue
            lemma, display, de, en = (p.strip() for p in parts)
            if lemma in seen:
                print(f"WARNUNG Zeile {lineno}: Duplikat '{lemma}' – übersprungen")
                continue
            seen.add(lemma)
            if lemma not in freq:
                missing.append(lemma)
                continue
            info = freq[lemma]
            word = display or lemma
            entry = {
                "tr": word,
                "de": de,
                "en": en,
                "r": info["rank"],
                "cov": round(info["f"] / total_tokens * 100, 4),
            }
            ex = info["ex"]
            if ex and ex != word and ex != lemma:
                entry["ex"] = ex
            entries.append(entry)

    entries.sort(key=lambda e: e["r"])
    for i, e in enumerate(entries):
        e["i"] = i  # laufender Index nach Bereinigung (für Distraktoren/Packs)

    if missing:
        print(f"FEHLER: {len(missing)} Lemmata nicht in der CSV gefunden:")
        for m in missing:
            print(f"  - {m}")

    js = (
        "// Automatisch generiert von tools/build_data.py – nicht von Hand bearbeiten.\n"
        "// Quelle Frequenzdaten: OpenSubtitles via hermitdave/FrequencyWords (lemmatisiert),\n"
        "// Übersetzungen kuratiert. cov = Anteil an allen Korpus-Tokens in %.\n"
        "const WORDS = " + json.dumps(entries, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    OUT_PATH.write_text(js, encoding="utf-8")
    total_cov = sum(e["cov"] for e in entries)
    print(f"OK: {len(entries)} Wörter -> {OUT_PATH}")
    print(f"Abdeckung aller enthaltenen Wörter zusammen: {total_cov:.1f}% der Korpus-Tokens")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
