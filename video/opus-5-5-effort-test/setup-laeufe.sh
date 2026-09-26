#!/usr/bin/env bash
# Legt die Testordner für den Opus-5.5-Effort-Test mit identischem Startzustand an.
# Nutzung: ./setup-laeufe.sh [Zielordner]
#   Zielordner  Standard: ~/opus55-effort-test (bewusst außerhalb des Repos)
set -euo pipefail

HIER="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HIER/../.." && pwd)"
ZIEL="${1:-$HOME/opus55-effort-test}"
if [ -e "$ZIEL" ]; then
  echo "Abbruch: $ZIEL existiert schon. Anderen Zielordner angeben oder den alten löschen." >&2
  exit 1
fi
case "$ZIEL/" in
  "$REPO"/*) echo "Abbruch: Zielordner liegt im Repo – Claude würde dort Prompts und Prüfliste sehen." >&2; exit 1 ;;
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
  d="$ZIEL/test2-homepage-$stufe"
  mkdir -p "$d"
  startzustand "$d"
done

echo "Fertig. Testordner in $ZIEL:"
ls -1 "$ZIEL"
