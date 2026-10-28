# Psicograma

Aplicación web que **reduce el tiempo de elaboración de informes** de tests proyectivos de dibujo
(piloto: *Persona bajo la lluvia*) para el **Centro Psicológico Ser Integral E.I.R.L.**, San Juan de
Lurigancho, Lima. Proyecto del curso *Integrador I: Sistemas Software*.

El paciente dibuja en una tablet; el sistema captura **el proceso del trazo** (orden, tiempo, pausas, presión,
borrados) además del resultado, el examinador lo ve en vivo, y al cerrar la sesión recibe la medición objetiva,
un catálogo de **183 indicadores** del manual para verificar y un **borrador de informe** de 9 secciones que
revisa, edita y valida. El sistema **no emite diagnósticos**: apoya al psicólogo, no lo reemplaza.

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| [`backend/`](backend/README.md) | API FastAPI con arquitectura hexagonal, PostgreSQL (Supabase), migraciones y pruebas |
| [`frontend/`](frontend/README.md) | React + TypeScript: interfaz del examinador y del paciente |
| [`sdd/`](sdd/) | Especificaciones (Given-When-Then), decisiones técnicas, esquema de la base y contrato de la API |
| [`entregas/`](entregas/README.md) | Informes y anexos de cada avance del curso |
| [`mocks/`](mocks/) | Prototipos de pantallas |

## Cómo se trabaja

El proyecto sigue **desarrollo guiado por especificaciones**: primero la especificación (`sdd/spec/`), luego la
prueba y después el código. Las decisiones técnicas se numeran (DT-xxx) en [`sdd/memory.md`](sdd/memory.md).

## Puesta en marcha

```bash
# 1. Backend  (http://localhost:8000)
cd backend && cp .env.example .env     # completar variables
uv sync --group dev
uv run uvicorn psicograma.adapter.inbound.http.app:app --reload

# 2. Frontend (http://localhost:5173)
cd frontend && cp .env.example .env    # completar variables
npm install && npm run dev
```

Detalles, variables de entorno y solución de problemas en el README de cada carpeta.

## Verificación

```bash
cd backend  && bash scripts/check-hexagon.sh && uv run pytest tests/test_domain.py tests/domain
cd frontend && npm run build && npm test
```

## Base de datos

El esquema (24 tablas, normalizado a 2FN, con RLS en todas) está en
[`sdd/database/schema.sql`](sdd/database/schema.sql); los cambios se versionan con Alembic en
`backend/migrations/`. Los scripts SQL para el *SQL Editor* de Supabase están en `sdd/database/`.

## Equipo

Bernable Pantaleon, Yefrei Eyder · Diaz Fernandez, Jose Eduardo · Arias Yaranga, Iam Kaled Fabricio ·
Tuppia Lozano, Jonathan Edilson · Chaparro Villavicencio, Joaquin Sebastian
