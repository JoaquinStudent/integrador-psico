#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
if [[ "${1:-upgrade}" == "downgrade" && "${ALLOW_DESTRUCTIVE_MIGRATION:-}" != "I_UNDERSTAND_DATA_LOSS" ]]; then
  echo "Las migraciones destructivas requieren ALLOW_DESTRUCTIVE_MIGRATION=I_UNDERSTAND_DATA_LOSS" >&2
  exit 1
fi

if [[ $# -eq 0 ]]; then
  set -- upgrade head
fi
exec uv run alembic "$@"
