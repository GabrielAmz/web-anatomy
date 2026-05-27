#!/usr/bin/env bash
# Web Anatomy — skill validator
#
# Checks every skills/*/SKILL.md against the Agent Skills spec:
#   1. SKILL.md exists in each skill directory
#   2. Has YAML front matter (--- ... ---)
#   3. front matter `name:` field matches the directory name
#   4. front matter `description:` field exists and is non-empty
#   5. Body is < 500 lines (per spec recommendation)
#   6. Plugin-bundled skills mirror the source skills directory

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"
PLUGIN_SKILLS_DIR="$SCRIPT_DIR/plugins/webanatomy/skills"
FAILED=0
PASSED=0

trim() {
  # Strip leading/trailing whitespace without xargs (xargs chokes on quotes).
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

if [ ! -d "$SKILLS_DIR" ]; then
  echo "ERROR: $SKILLS_DIR does not exist"
  exit 1
fi

for dir in "$SKILLS_DIR"/*/; do
  skill_name="$(basename "$dir")"
  skill_file="${dir}SKILL.md"

  if [ ! -f "$skill_file" ]; then
    echo "FAIL  $skill_name — missing SKILL.md"
    FAILED=$((FAILED + 1))
    continue
  fi

  # Extract front matter (between first two --- lines).
  front_matter="$(awk '/^---$/{c++; if (c==2) exit; next} c==1' "$skill_file")"

  if [ -z "$front_matter" ]; then
    echo "FAIL  $skill_name — no YAML front matter"
    FAILED=$((FAILED + 1))
    continue
  fi

  # name: field
  declared_name_raw="$(printf '%s' "$front_matter" | grep -E '^name:' | head -n1 | sed 's/^name:[[:space:]]*//')"
  declared_name="$(trim "$declared_name_raw")"
  declared_name="${declared_name%\"}"; declared_name="${declared_name#\"}"
  declared_name="${declared_name%\'}"; declared_name="${declared_name#\'}"

  # description: field
  description_raw="$(printf '%s' "$front_matter" | grep -E '^description:' | head -n1 | sed 's/^description:[[:space:]]*//')"
  description="$(trim "$description_raw")"

  if [ "$declared_name" != "$skill_name" ]; then
    echo "FAIL  $skill_name — directory name does not match name: field ('$declared_name')"
    FAILED=$((FAILED + 1))
    continue
  fi

  if [ -z "$description" ]; then
    echo "FAIL  $skill_name — description field is empty"
    FAILED=$((FAILED + 1))
    continue
  fi

  # Unquoted colon+space inside the description value breaks YAML parsers
  # by being interpreted as a `key: value` mapping. Catch before publish.
  if printf '%s' "$description" | grep -q ': '; then
    echo "FAIL  $skill_name — description contains ': ' (unquoted YAML colon — replace with ' — ' or quote the whole description)"
    FAILED=$((FAILED + 1))
    continue
  fi

  body_lines="$(wc -l < "$skill_file" | tr -d '[:space:]')"
  if [ "$body_lines" -gt 500 ]; then
    echo "WARN  $skill_name — body is $body_lines lines (spec recommends <500; push detail into references/)"
  fi

  echo "OK    $skill_name"
  PASSED=$((PASSED + 1))
done

echo ""
echo "Source skill pass: $PASSED · Failed so far: $FAILED"

if [ -d "$PLUGIN_SKILLS_DIR" ]; then
  source_list="$(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort)"
  plugin_list="$(find "$PLUGIN_SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort)"

  if [ "$source_list" != "$plugin_list" ]; then
    echo "FAIL  plugin skills — plugins/webanatomy/skills does not mirror skills/"
    echo "Source skills:"
    printf '%s\n' "$source_list"
    echo "Plugin skills:"
    printf '%s\n' "$plugin_list"
    FAILED=$((FAILED + 1))
  else
    while IFS= read -r skill_name; do
      [ -z "$skill_name" ] && continue
      if ! diff -qr "$SKILLS_DIR/$skill_name" "$PLUGIN_SKILLS_DIR/$skill_name" >/dev/null; then
        echo "FAIL  plugin skills — $skill_name differs from source"
        FAILED=$((FAILED + 1))
      fi
    done <<< "$source_list"
  fi
fi

echo ""
echo "Passed: $PASSED · Failed: $FAILED"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
