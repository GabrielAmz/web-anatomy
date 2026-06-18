#!/usr/bin/env bash
# Bump the Web Anatomy pack version in every version source at once, so they
# never drift. Run this on each release, BEFORE tagging.
#
#   ./bump-version.sh 0.5.0
#
# Sources kept in sync:
#   - .claude-plugin/plugin.json        .version       (Claude Code plugin)
#   - .claude-plugin/marketplace.json   .metadata.version
#   - skills/webanatomy-setup/references/pack-version.txt   (the in-skill update check)
#
# After running: add the VERSIONS.md entry, commit, then tag + release.

set -euo pipefail

V="${1:-}"
if ! printf '%s' "$V" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "usage: ./bump-version.sh X.Y.Z" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")" && pwd)"

command -v jq >/dev/null 2>&1 || { echo "jq is required" >&2; exit 1; }

jq --arg v "$V" '.version = $v' "$ROOT/.claude-plugin/plugin.json" > "$ROOT/.claude-plugin/plugin.json.tmp" \
  && mv "$ROOT/.claude-plugin/plugin.json.tmp" "$ROOT/.claude-plugin/plugin.json"

jq --arg v "$V" '.metadata.version = $v' "$ROOT/.claude-plugin/marketplace.json" > "$ROOT/.claude-plugin/marketplace.json.tmp" \
  && mv "$ROOT/.claude-plugin/marketplace.json.tmp" "$ROOT/.claude-plugin/marketplace.json"

printf '%s\n' "$V" > "$ROOT/skills/webanatomy-setup/references/pack-version.txt"

echo "Bumped to $V:"
echo "  .claude-plugin/plugin.json"
echo "  .claude-plugin/marketplace.json"
echo "  skills/webanatomy-setup/references/pack-version.txt"
echo
echo "Next: add a VERSIONS.md entry, commit, then:"
echo "  git tag v$V && git push --tags && gh release create v$V --target main"
