#!/usr/bin/env bash
# La prueba de que el hexagono existe: el dominio no importa infraestructura.
#
# Sin este check, "arquitectura hexagonal" es un diagrama. Con el, es una
# propiedad verificable del repo. Va a CI y al informe como evidencia.
#
#   bash scripts/check-hexagon.sh
set -uo pipefail

DOMAIN="$(dirname "$0")/../src/psicograma/domain"
BANNED='fastapi|starlette|sqlalchemy|asyncpg|alembic|supabase|httpx|openai|jwt|pydantic|uvicorn'

hits=$(grep -rnE "^[[:space:]]*(from|import)[[:space:]]+($BANNED)\b" "$DOMAIN" || true)

if [[ -n "$hits" ]]; then
    echo "check-hexagon: FALLO — el dominio importa infraestructura:"
    echo "$hits"
    echo
    echo "El nucleo de dominio tiene que ser Python puro. Mueve esa dependencia a"
    echo "un adaptador en adapter/outbound/ y declara un Protocol en domain/ports.py."
    exit 1
fi

echo "check-hexagon: OK — el dominio no importa infraestructura"
