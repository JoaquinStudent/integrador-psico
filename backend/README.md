# Psicograma — Backend

API en **FastAPI** con **arquitectura hexagonal**. Es el **único punto de acceso a la base de datos**:
el frontend no consulta Postgres directamente (RNF-12).

Sostiene el flujo completo de una evaluación con el test de la *Persona bajo la lluvia*: pacientes,
citas, sesiones con consentimiento, captura del dibujo y sus tiempos, audio y transcripción,
medición objetiva, catálogo de **183 indicadores**, borrador de informe de 9 secciones y PDF.

> El sistema **no emite diagnósticos**. La sección de conclusiones del informe se entrega vacía y toda
> sugerencia requiere validación del profesional (RNF-17).

---

## Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Python | 3.12 | Lenguaje |
| [uv](https://docs.astral.sh/uv/) | reciente | Entorno y dependencias |
| Proyecto de Supabase | — | PostgreSQL 17, Auth, Storage y Realtime |
| pango (solo PDF) | — | `brew install pango` en macOS |

## Arranque rápido

```bash
cd backend
cp .env.example .env            # completar las variables de abajo
uv sync --group dev             # instala dependencias y herramientas de desarrollo
uv run uvicorn psicograma.adapter.inbound.http.app:app --reload
```

- API: <http://localhost:8000> · Salud: <http://localhost:8000/health>
- OpenAPI interactivo: <http://localhost:8000/docs>

> **El `.env` se lee una sola vez al arrancar.** Cambiarlo no basta: hay que **reiniciar** el servidor
> (ni siquiera `--reload` lo recarga, solo vigila los `.py`). Y ojo: una variable **exportada en el
> shell** (por ejemplo en `~/.zshrc`) **gana** sobre el `.env`.

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | `postgresql+asyncpg://…` del *transaction pooler* (puerto **6543**) |
| `SUPABASE_URL` | Sí | URL del proyecto de Supabase |
| `SUPABASE_JWT_SECRET` | Sí | Secreto JWT *legacy* (verifica tokens HS256) |
| `SUPABASE_SERVICE_KEY` | Para Storage y pruebas | Clave de servicio; **nunca** al frontend |
| `STORAGE_BUCKET` | No | Bucket privado de archivos (`session-files`) |
| `OPENAI_API_KEY` | Para transcribir | Whisper |
| `OPENROUTER_API_KEY` | Para redactar | Secciones del informe; sin ella el informe se genera con texto de respaldo |
| `LLM_MODEL` | No | Modelo de OpenRouter |
| `CORS_ORIGINS` | Sí en red | Lista JSON de orígenes del frontend (incluye la IP LAN para la tablet) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Para Google | Credenciales OAuth |
| `GOOGLE_TOKEN_KEY` | Para Google | Clave Fernet propia (cifra el token y firma el estado de OAuth) |
| `CALENDAR_TIMEZONE`, `FRONTEND_URL` | No | `America/Lima` y `http://localhost:5173` por defecto |
| `DB_ECHO`, `API_PREFIX` | No | Depuración de SQL y prefijo de la API (`/api/v1`) |

Nunca subas el `.env`: está en `.gitignore`.

### Exportar PDF (RF-38)

WeasyPrint necesita *pango* del sistema:

```bash
brew install pango                      # una vez
uv sync --extra pdf --group dev         # una vez
DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib \
  uv run uvicorn psicograma.adapter.inbound.http.app:app --reload
```

Sin esa variable, en macOS, `GET /reports/{id}/pdf` responde 502 «WeasyPrint no está instalado» aunque
el paquete lo esté (falla el enlace con pango, no el `import`).

### Conectar Google Calendar (SPEC-CAL-01)

Opcional: sin estas variables la agenda de citas funciona igual, solo no se refleja en Google.

1. **Google Cloud Console:** proyecto propio, habilitar *Google Calendar API*, configurar la pantalla de
   consentimiento con el permiso `…/auth/calendar.events` y crear un **ID de cliente OAuth (aplicación
   web)** con el URI de redirección `http://localhost:8000/api/v1/integrations/google/callback`.
2. **`.env`:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (idéntico al registrado)
   y `GOOGLE_TOKEN_KEY` (**obligatoria**; sin ella Google queda deshabilitado):
   ```bash
   uv run python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```
3. Aplicar la migración `0003_citas_y_google` (ver *Migraciones*) y reiniciar.
4. En la app: **Ajustes → Conectar Google Calendar**.

El evento lleva **solo las iniciales** del paciente y un enlace, nunca nombre, documento ni motivo. Con la
app de Google en modo «Prueba», el token de refresco caduca a los 7 días: publícala para evitarlo.

---

## Arquitectura

```
src/psicograma/
  domain/                      Python puro. Ni FastAPI, ni SQLAlchemy, ni HTTP.
    model.py                   Entidades y valores (Point, Stroke, Drawing, DrawingMetrics…)
    ports.py                   Protocol de lo que el dominio necesita del mundo (7 puertos)
    services/
      measure_drawing.py       Las 7 métricas objetivas del trazo. Determinista
      evaluate_indicators.py   Métricas → indicadores automáticos del manual
      compose_report.py        Arma las 9 secciones del informe
      appointments.py          Cruces de horario y contenido del evento de Google
  adapter/
    inbound/http/              FastAPI: app, auth JWT, esquemas Pydantic y routers
    outbound/
      postgres/                SQLAlchemy async: modelos, repositorios y stores
      whisper/                 Transcripción (OpenAI)
      llm/                     Redacción asistida (OpenRouter)
      google_calendar.py       Google Calendar, cifrado del token y estado de OAuth
      storage.py               Archivos en el bucket privado
  config/                      Settings y wiring (container.py)
migrations/                    Alembic (0001 esquema 2FN, 0002 privacidad, 0003 agenda)
scripts/                       Verificaciones y utilidades (ver abajo)
tests/                         domain/ (sin red), adapter/ (contra la base real)
```

**La regla que lo sostiene todo: `domain/` no importa infraestructura.** Sin ese límite verificable,
«hexagonal» es un dibujo. `scripts/check-hexagon.sh` lo comprueba y falla si el dominio importa FastAPI,
SQLAlchemy, httpx, Pydantic, etc.

| Patrón | Dónde |
|---|---|
| Puertos y adaptadores (DAO/repositorio) | `domain/ports.py` ↔ `adapter/outbound/postgres/repositories.py` |
| CRUD sin reglas de negocio | `store.py` (no pasa por el dominio a propósito) |
| Inyección de dependencias | `config/container.py` (único lugar donde dominio e infraestructura se encuentran) |
| Una transacción por petición | `db_session` → `session_for(user_id)` |

### Dos cosas que muerden

1. **Pooler de Supabase.** El *transaction pooler* (6543) no soporta *prepared statements*: asyncpg falla
   con `DuplicatePreparedStatementError`. `engine.py` ya usa `statement_cache_size: 0` y `NullPool`.
   **Alembic va contra el puerto 5432**, no el 6543.
2. **RLS sigue viva.** El backend no usa *service role* para datos. Cada transacción declara de quién es
   la petición (`SET LOCAL ROLE authenticated` + `request.jwt.claims`), así las políticas del esquema se
   evalúan igual que si el cliente hablara directo con la base. El filtro en los repositorios es la primera
   capa; RLS es la segunda.

---

## API

Contrato completo en [`sdd/api-contracts.md`](../sdd/api-contracts.md). Resumen:

| Grupo | Rutas |
|---|---|
| Salud y catálogos | `/health`, `/tests`, `/tests/{code}/indicators`, `/catalogs/*` |
| Perfil y panel | `/profile`, `/dashboard/summary` |
| Pacientes | `/patients` (+ estado, anonimizar, sesiones, informes) |
| Agenda | `/appointments` (+ cancelar, iniciar sesión) |
| Sesiones | `/sessions` (+ consentimiento, dibujo, observaciones, marcas, verbalizaciones, finalizar) |
| Audio | `/sessions/{id}/recordings`, `/recordings/{id}/transcript`, `/recordings/{id}/audio` |
| Análisis | `/sessions/{id}/analyze`, `/metrics`, `/indicators` |
| Informes | `/sessions/{id}/report`, `/reports/{id}` (+ secciones, validar, PDF) |
| Google | `/integrations/google` (+ conectar, completar, desconectar) |

Los errores siguen RFC 9457 (`application/problem+json`). Un recurso ajeno responde **404** (no 403) para
no confirmar su existencia.

## Pruebas y verificación

```bash
bash scripts/check-hexagon.sh                  # el dominio no importa infraestructura
uv run ruff check src tests                    # linter
uv run pytest tests/test_domain.py tests/domain tests/test_google_calendar.py   # sin red ni base
uv run pytest                                  # todo (integración contra Supabase)
```

- **Sin red ni base:** dominio, adaptador de Google (con respuestas simuladas), reglas de agenda y redacción.
- **De integración:** usan **cuentas de prueba reales** creadas con la Admin API (dominio `@psicograma.test`)
  y verifican, entre otras cosas, que RLS tape los datos de un examinador frente a otro. Requieren
  `SUPABASE_SERVICE_KEY` y tardan varios minutos contra una base remota.
- Los tests siguen el método del proyecto: **especificación → prueba → código** (`sdd/AGENTS.md`).

Si la base no tiene aplicados el catálogo de 183 indicadores o la migración `0003`, fallarán las pruebas
de catálogo, de citas y de modelos: es esperado hasta aplicarlos.

### Scripts

| Script | Qué hace |
|---|---|
| `scripts/check-hexagon.sh` | Falla si el dominio importa infraestructura |
| `scripts/check-migration.sh` | Corre Alembic con la salvaguarda contra *downgrades* destructivos |
| `scripts/smoke-test.py` | Comprueba que el `.env` apunta a una base con el esquema y el catálogo (solo lectura) |
| `scripts/check-storage.py` | Verifica las políticas del bucket (solo lectura) |
| `scripts/seed-demo.py` | Siembra datos de demostración **por la API** sobre una cuenta real |
| `scripts/limpiar-cuentas-test.py` | Borra las cuentas de prueba (`@psicograma.test`) y sus datos |

## Migraciones

Alembic usa la conexión **directa** (`5432`), no el *pooler* (`6543`).

```bash
uv run alembic current           # en qué revisión está la base
uv run alembic upgrade head      # aplica las pendientes
```

- **Haz un backup** antes de migrar un entorno con datos.
- Si `alembic current` no devuelve ninguna revisión, la base no está registrada en Alembic: antes de
  `upgrade head`, registra la revisión en la que ya está (`alembic stamp <revisión>`), o aplicará desde la
  `0001` sobre tablas que ya existen.
- Para armar o reparar la base **desde cero** con el SQL Editor de Supabase, sigue la guía numerada
  `sdd/database/desde-cero/00-LEEME.md` (pasos 01 a 11). No ejecutes nada de `sdd/database/peligro/`: borra todas las tablas.
- Un *downgrade* o una limpieza destructiva requieren una revisión aparte y confirmación explícita.

## Seguridad

- JWT de Supabase verificado en el backend (ES256 por JWKS o HS256), con `aud=authenticated`.
- RLS en las 24 tablas, más el filtro en los repositorios (doble capa).
- Sin credenciales de base de datos en el navegador.
- Los registros de errores **no** incluyen datos de pacientes (solo el nombre de la restricción y el SQLSTATE).
- El token de Google se guarda **cifrado** (Fernet) con una clave propia; el estado de OAuth se firma con una
  clave derivada de esa y solo vale para el usuario que lo pidió.

**Riesgos abiertos:** R-07 (el canal de tiempo real no es privado) y R-08 (el rol de conexión tiene
`BYPASSRLS`; RLS sí rige dentro de `session_for()`). Detalle en [`sdd/informe-sprints.md`](../sdd/informe-sprints.md).

## Referencias

- Dominio y nombres: [`sdd/domain.md`](../sdd/domain.md) · Decisiones técnicas: [`sdd/memory.md`](../sdd/memory.md)
- Especificaciones: [`sdd/spec/`](../sdd/spec/) · Esquema: [`sdd/database/schema.sql`](../sdd/database/schema.sql)
