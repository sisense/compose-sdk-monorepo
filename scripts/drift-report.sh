#!/usr/bin/env bash
# Heuristic drift report: concept docs whose `resource:` path has commits newer than the doc.
# Usage: drift-report.sh [bundle-dir] [--days N]   (flag docs older than resource by > N days; default 0)
# Always exits 0 — this is advisory. Run from anywhere inside the repo.
set -u
BUNDLE_DIR="${BUNDLE_DIR:-knowledge}"; DAYS=0
while [ $# -gt 0 ]; do case "$1" in --days) DAYS="$2"; shift 2;; *) BUNDLE_DIR="$1"; shift;; esac; done
ROOT=$(git rev-parse --show-toplevel) || exit 0
cd "$ROOT"
[ -d "$BUNDLE_DIR" ] || { echo "no bundle at $BUNDLE_DIR"; exit 0; }

to_epoch() { date -j -f '%Y-%m-%d' "$1" '+%s' 2>/dev/null || date -d "$1" '+%s' 2>/dev/null || echo 0; }

printf '%-45s %-12s %-12s %5s  %s\n' "concept doc" "doc last" "code last" "lag" "resource"
printf '%-45s %-12s %-12s %5s  %s\n' "-----------" "--------" "---------" "---" "--------"
flagged=0
while IFS= read -r f; do
  res=$(awk 'NR==1{next} /^---$/{exit} /^resource:/{sub(/^resource:[[:space:]]*/,""); gsub(/["'"'"']/,""); print; exit}' "$f")
  [ -n "$res" ] || { printf '%-45s %-12s %-12s %5s  %s\n' "${f#./}" "-" "-" "-" "(no resource field)"; continue; }
  [ -e "$res" ] || { printf '%-45s %-12s %-12s %5s  %s\n' "${f#./}" "-" "-" "  !!" "$res (MISSING on disk)"; flagged=$((flagged+1)); continue; }
  doc_d=$(git log -1 --format=%cs -- "$f" 2>/dev/null); code_d=$(git log -1 --format=%cs -- "$res" 2>/dev/null)
  [ -n "$doc_d" ] && [ -n "$code_d" ] || { printf '%-45s %-12s %-12s %5s  %s\n' "${f#./}" "${doc_d:-uncommitted}" "${code_d:--}" "-" "$res"; continue; }
  lag=$(( ( $(to_epoch "$code_d") - $(to_epoch "$doc_d") ) / 86400 ))
  mark=""; if [ "$lag" -gt "$DAYS" ]; then mark="  <-- code moved after doc"; flagged=$((flagged+1)); fi
  printf '%-45s %-12s %-12s %5s  %s%s\n' "${f#./}" "$doc_d" "$code_d" "$lag" "$res" "$mark"
done < <(cd "$BUNDLE_DIR" && find . -name '*.md' ! -name index.md ! -name log.md | sort | sed "s#^\./#$BUNDLE_DIR/#")
echo
echo "$flagged doc(s) flagged. A flag is a prompt to read the doc against the code, not proof of staleness."
exit 0
