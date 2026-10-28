-- ============================================================================
-- PSICOGRAMA · desde cero · PASO 02: Extensiones y tablas de catalogo
-- GENERADO por desde-cero/generar.py a partir de schema.sql. No editar a mano.
-- Ejecutar los pasos EN ORDEN. Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



-- =============================================================================
-- PARTE 1 — CATALOGOS (el manual del test, no datos de sesion)
-- =============================================================================

-- Tests proyectivos soportados. En v1 esto era sessions.test_type TEXT.
CREATE TABLE tests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            TEXT NOT NULL UNIQUE,     -- 'PBLL', 'HTP', 'DFH', 'DF'
    name            TEXT NOT NULL,
    is_available    BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categorias A-D del manual.
CREATE TABLE indicator_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    code            TEXT NOT NULL,            -- 'A', 'B', 'C', 'D'
    name            TEXT NOT NULL,            -- 'Recursos expresivos'

    UNIQUE (test_id, code)
);

-- Secciones del manual (A-1 a D). En v1 era indicators.manual_section TEXT.
CREATE TABLE manual_sections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID NOT NULL REFERENCES indicator_categories(id) ON DELETE CASCADE,
    code            TEXT NOT NULL,            -- 'A-1', 'B-9', 'C', 'D'
    name            TEXT NOT NULL,            -- 'Dimensiones', 'Partes del cuerpo'
    code_prefix     TEXT NOT NULL,            -- 'DIM', 'CUE' — prefijo de los indicadores

    UNIQUE (category_id, code)
);

-- El manual PBLL: 202 indicadores. En v1 vivia en src/data/pbll-indicators.ts
-- y se duplicaba dentro de la tabla indicators por cada sesion.
CREATE TABLE indicator_catalog (
    code            TEXT PRIMARY KEY,         -- 'DIM-01', 'CUE-34'
    section_id      UUID NOT NULL REFERENCES manual_sections(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    interpretation  TEXT NOT NULL,
    detection_type  TEXT NOT NULL
                    CHECK (detection_type IN ('auto', 'semi', 'manual')),
    is_active       BOOLEAN NOT NULL DEFAULT true
);

-- Marcas rapidas que el examinador pulsa en vivo.
-- En v1 era observations.quick_marks JSONB[].
CREATE TABLE quick_mark_catalog (
    code            TEXT PRIMARY KEY,         -- 'pausa_prolongada', 'uso_borrador'
    label           TEXT NOT NULL,
    display_order   SMALLINT NOT NULL DEFAULT 0
);

-- Actitudes observables. En v1 era observations.attitude_flags JSONB{}.
CREATE TABLE attitude_catalog (
    code            TEXT PRIMARY KEY,         -- 'colaborador', 'ansioso'
    label           TEXT NOT NULL,
    display_order   SMALLINT NOT NULL DEFAULT 0
);

-- Postgres no indexa las FK solo. Esta se recorre en cada consulta del catalogo
-- y en el join de secciones al generar el informe.
CREATE INDEX idx_indicator_catalog_section ON indicator_catalog(section_id);

ALTER TABLE tests                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_catalog     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_mark_catalog    ENABLE ROW LEVEL SECURITY;
ALTER TABLE attitude_catalog      ENABLE ROW LEVEL SECURITY;

-- Los catalogos son de solo lectura para cualquier usuario autenticado.
-- Se escriben por migracion/seed con la service key, que salta RLS.
CREATE POLICY "catalog readable" ON tests                FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalog readable" ON indicator_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalog readable" ON manual_sections      FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalog readable" ON indicator_catalog    FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalog readable" ON quick_mark_catalog   FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalog readable" ON attitude_catalog     FOR SELECT TO authenticated USING (true);

COMMIT;
