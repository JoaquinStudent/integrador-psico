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

### Exportar PDF (RF-38)

El PDF usa WeasyPrint, que necesita pango del sistema:

```bash
brew install pango                                  # una vez
uv sync --extra pdf --group dev                     # una vez
DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib \
  uv run uvicorn psicograma.adapter.inbound.http.app:app --reload
```

Sin esa variable en macOS, `GET /reports/{id}/pdf` responde 502 "WeasyPrint no esta
instalado" aunque el paquete este instalado (falla el enlace con pango, no el import).

## Verificacion

```bash
bash scripts/check-hexagon.sh    # el dominio no importa infraestructura
uv run pytest                    # dominio, sin BD ni red
uv run ruff check src tests
```

## Conectar Google Calendar (SPEC-CAL-01)

Opcional: sin estas variables la agenda de citas funciona igual, solo no se refleja en Google.

1. Google Cloud Console: proyecto propio, habilitar **Google Calendar API**, configurar la pantalla
   de consentimiento con el permiso `.../auth/calendar.events` y crear un **ID de cliente OAuth
   (aplicacion web)** con el URI de redireccion `http://localhost:8000/api/v1/integrations/google/callback`.
2. En `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (identico al
   registrado) y `GOOGLE_TOKEN_KEY` (**obligatoria**: clave Fernet propia, ver `.env.example`; sin ella Google queda deshabilitado).
3. Aplicar la migracion `0003_citas_y_google` y reiniciar el backend.
4. En la app: **Ajustes → Conectar Google Calendar**.

El evento lleva solo las iniciales del paciente, nunca nombre ni documento.

## Migraciones

Alembic usa la conexion directa de Postgres (`5432`), no el transaction pooler (`6543`).
Antes de migrar un entorno con datos, hacer un backup y revisar el estado con:

```bash
uv run alembic current
uv run alembic upgrade head
```

La revision inicial no elimina tablas heredadas. Un downgrade o una limpieza destructiva requieren
una revision separada y confirmacion explicita del operador.

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
| Medicion objetiva (7 metricas) y motor de indicadores | Hecho, 14 tests sin red |
| App FastAPI + auth JWT (ES256/JWKS) + errores RFC 9457 + `/health` | Hecho |
| Repositorios, stores y routers (pacientes, sesiones, analisis, audio, informes, panel, perfil) | Hecho, tests de integracion contra Supabase |
| Whisper (transcripcion) y OpenRouter (secciones 5, 7 y 8) | Hecho, con respaldo determinista |
| PDF del informe | Hecho; requiere pango (ver arriba) |
| Alembic | Hecho, revisiones 0001 y 0002 |

Riesgos abiertos de seguridad: R-07 (canal realtime sin token) y R-08 (rol de conexion
con `BYPASSRLS`). Detalle en `sdd/informe-sprints.md`.

## Contrato

`sdd/api-contracts.md`. El dominio y los nombres siguen `sdd/domain.md` (regla R4).
