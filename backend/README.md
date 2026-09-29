# Psicograma — Backend

API en FastAPI con arquitectura hexagonal. **Unico punto de acceso a la base de datos**: el frontend
no consulta Postgres directamente.

## Arranque

```bash
cp .env.example .env        # rellenar DATABASE_URL y SUPABASE_JWT_SECRET
uv sync --group dev
uv run uvicorn psicograma.adapter.inbound.http.app:app --reload
```

- API: http://localhost:8000
- OpenAPI: http://localhost:8000/docs

## Verificacion

```bash
bash scripts/check-hexagon.sh    # el dominio no importa infraestructura
uv run pytest                    # dominio, sin BD ni red
uv run ruff check src tests
```

## Estructura

```
src/psicograma/
  domain/                  Python puro. Ni FastAPI, ni SQLAlchemy, ni HTTP.
    model.py               Entidades y valores
    ports.py               Protocol de lo que el dominio necesita del mundo
    services/
      measure_drawing.py   Capa 1: las 7 metricas objetivas. Determinista
      evaluate_indicators.py  Capa 2: metricas -> indicadores `auto` del manual
  application/             Casos de uso que orquestan puertos
  adapter/
    inbound/http/          FastAPI: app, auth JWT, routers
    outbound/postgres/     SQLAlchemy async
  config/                  Settings y wiring
```

La regla que sostiene todo: **`domain/` no importa infraestructura.** Sin ese limite verificable,
"hexagonal" es un diagrama. `scripts/check-hexagon.sh` lo comprueba, y `pyproject.toml` prohibe
los imports en el linter para que falle ya en el editor.

## Dos cosas que muerden

**1. Pooler de Supabase.** El transaction pooler (puerto 6543) no soporta prepared statements:
asyncpg falla con `DuplicatePreparedStatementError` en la segunda request. `engine.py` ya pasa
`statement_cache_size: 0` y `NullPool`. **Alembic va contra el puerto 5432**, no el 6543.

**2. RLS sigue viva.** El backend no usa service role para datos. Cada transaccion declara de quien
es la request (`SET LOCAL ROLE authenticated` + `request.jwt.claims`), asi las policies del schema se
evaluan igual que cuando el cliente hablaba con PostgREST. El filtro en los repositorios es la
primera capa; RLS es la segunda. El rol de conexion **no** debe tener `BYPASSRLS`.

## Estado

| Pieza | Estado |
|---|---|
| Modelo de dominio + puertos | Hecho |
| Medicion objetiva (7 metricas) | Hecho, 14 tests |
| Motor de indicadores `auto` (DIM, UBI, PRE, TMP, BOR) | Hecho |
| App FastAPI + auth JWT + errores RFC 9457 + `/health` | Hecho |
| Motor + engine Postgres | Configurado, sin repositorios aun |
| Repositorios, routers, Whisper, LLM, PDF | Pendiente — requiere el schema aplicado |
| Alembic | Pendiente |

El siguiente paso depende de aplicar `sdd/database/schema.sql` y correr
`sdd/database/seed-catalog.sql` contra Supabase.

## Contrato

`sdd/api-contracts.md`. El dominio y los nombres siguen `sdd/domain.md` (regla R4).
