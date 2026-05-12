#!/bin/zsh
set -euo pipefail

ROOT="/Users/kilian/.openclaw/workspace/projects/knowledge-campus"

open -a Tiled "$ROOT"
open "$ROOT/TILED-BOOTSTRAP-CHECKLIST.md"
open "$ROOT/NEXT-AUTHORING-STEPS.md"
open "$ROOT/ASSET-SELECTION.md"

printf '\nOpened Tiled authoring workspace:\n- %s\n' "$ROOT"
