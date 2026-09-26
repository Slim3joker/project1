#!/usr/bin/env bash
# Legt die Testordner für den Opus-5.5-Effort-Test mit identischem Startzustand an.
# Nutzung: ./setup-laeufe.sh [Zielordner] [a|b]
#   Zielordner  Standard: ~/opus55-effort-test (bewusst außerhalb des Repos)
#   a | b       Variante von Test 2: a = PPC-Tab im FBA Cockpit (Standard), b = Handwerker-Website
set -euo pipefail

HIER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HIER/../.." && pwd)"
ZIEL="${1:-$HOME/opus55-effort-test}"
VARIANTE="${2:-a}"

if [ "$VARIANTE" != "a" ] && [ "$VARIANTE" != "b" ]; then
  echo "Variante muss a oder b sein, nicht: $VARIANTE" >&2
  exit 1
fi
if [ -e "$ZIEL" ]; then
  echo "Abbruch: $ZIEL existiert schon. Anderen Zielordner angeben oder den alten löschen." >&2
  exit 1
fi
case "$ZIEL/" in
  "$REPO"/*) echo "Abbruch: Zielordner liegt im Repo – Claude würde dort das Lösungsblatt sehen." >&2; exit 1 ;;
esac

startzustand() {
  git -C "$1" init -q
  git -C "$1" add -A
  git -C "$1" -c user.name=opus-test -c user.email=opus-test@example.invalid \
    commit -q --allow-empty -m "Startzustand"
}

for stufe in low medium high extra max ultracode; do
  d="$ZIEL/test1-altstadt-$stufe"
  mkdir -p "$d"
  startzustand "$d"
done

for stufe in low medium max; do
  if [ "$VARIANTE" = "a" ]; then
    d="$ZIEL/test2a-fba-ppc-$stufe"
    mkdir -p "$d/testdaten"
    cp "$REPO/index.html" "$d/"
    cp "$HIER/testdaten/suchbegriffe.csv" "$d/testdaten/"
  else
    d="$ZIEL/test2b-website-$stufe"
    mkdir -p "$d"
  fi
  startzustand "$d"
done

echo "Fertig. Testordner in $ZIEL:"
ls -1 "$ZIEL"
