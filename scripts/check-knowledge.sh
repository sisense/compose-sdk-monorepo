#!/usr/bin/env bash
# Structural conformance checks for an OKF knowledge bundle.
# Usage: check-knowledge.sh [bundle-dir]   (default: $BUNDLE_DIR or docs/knowledge)
# Exit 1 on any finding. Needs only find/grep/sed.
set -u
BUNDLE_DIR="${1:-${BUNDLE_DIR:-knowledge}}"
cd "$BUNDLE_DIR" 2>/dev/null || { echo "ERROR: bundle dir not found: $BUNDLE_DIR"; exit 1; }
fail=0
say() { echo "$1"; fail=1; }

# 1. Every non-reserved .md has frontmatter with a non-empty `type`.
while IFS= read -r f; do
  [ "$(head -1 "$f")" = "---" ] || say "NO FRONTMATTER:      $f"
  awk 'NR==1{next} /^---$/{exit} {print}' "$f" | grep -q '^type:[[:space:]]*[^[:space:]]' || say "MISSING/EMPTY type:  $f"
done < <(find . -name '*.md' ! -name 'index.md' ! -name 'log.md')

# 2. Reserved files carry no frontmatter (root index.md excepted, which must declare okf_version).
while IFS= read -r f; do
  if [ "$f" = "./index.md" ]; then
    grep -q '^okf_version:' "$f" || say "ROOT index.md lacks okf_version"
    continue
  fi
  [ "$(head -1 "$f")" = "---" ] && say "UNEXPECTED FRONTMATTER: $f"
done < <(find . \( -name index.md -o -name log.md \))

# 3. Every internal .md link resolves; no bundle-absolute links.
while IFS= read -r f; do
  d=$(dirname "$f")
  grep -oE '\]\([^)]+\.md([#?][^)]*)?\)' "$f" | sed -E 's/\]\(([^)]+)\)/\1/' | while read -r l; do
    l="${l%%#*}"; l="${l%%\?*}"
    case "$l" in
      http*) continue ;;
      /*) echo "BUNDLE-ABSOLUTE LINK (renders broken): $f -> $l"; t=".${l}" ;;
      *) t="${d}/${l}" ;;
    esac
    [ -f "$t" ] || echo "BROKEN LINK:         $f -> $l"
  done
done < <(find . -name '*.md') | { out=$(cat); if [ -n "$out" ]; then echo "$out"; exit 1; fi; } || fail=1

# 4. Every concept doc is registered in its ENCLOSING index.md (the maintenance rule's
# "register it in the enclosing index.md") — links are resolved relative to that index
# (fragments/queries stripped) and compared as normalized paths, so a same-named doc
# elsewhere or a link from another directory's index cannot cross-register, while
# `doc.md#section` links count. Bundle-absolute links are already flagged by check 3.
while IFS= read -r f; do
  d=$(dirname "$f")
  idx="$d/index.md"
  [ -f "$idx" ] || { say "NO INDEX:            $d/ (holds concept docs but no index.md)"; continue; }
  abs="$(cd "$d" && pwd)/$(basename "$f")"
  found=0
  while IFS= read -r l; do
    l="${l%%#*}"; l="${l%%\?*}"
    case "$l" in (http*|/*) continue ;; esac
    ld=$(cd "$d/$(dirname "$l")" 2>/dev/null && pwd) || continue
    [ "$ld/$(basename "$l")" = "$abs" ] && { found=1; break; }
  done < <(grep -oE '\]\([^)]+\.md([#?][^)]*)?\)' "$idx" | sed -E 's/\]\(([^)]+)\)/\1/')
  [ "$found" -eq 1 ] || say "UNREGISTERED:        $f (not linked from $idx)"
done < <(find . -name '*.md' ! -name 'index.md' ! -name 'log.md')

if [ $fail -eq 0 ]; then echo "OK: $BUNDLE_DIR conforms ($(find . -name '*.md' ! -name index.md ! -name log.md | wc -l | tr -d ' ') concept docs)"; fi
exit $fail
