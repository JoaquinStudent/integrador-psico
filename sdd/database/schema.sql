-- =============================================================================
-- PSICOGRAMA — Schema SQL v2 (Supabase/Postgres)
-- Normalizado hasta 2FN. Reemplaza el schema v1 de 10 tablas (ver git).
-- Ultima actualizacion: 2026-09-28
-- =============================================================================
--
-- POR QUE v2: el schema v1 violaba 1FN y 2FN.
--
--   2FN — tabla `indicators`, clave candidata (session_id, code):
--         category, manual_section, title e interpretation dependian SOLO de
--         `code`, no de la clave completa. Dependencia parcial. Los 202
--         indicadores del manual se repetian en cada sesion.
--         -> Se parte en `indicator_catalog` (el manual) + `session_indicators`
--            (lo que pasa en una sesion concreta).
--
--   1FN — columnas JSONB que guardaban listas: observations.quick_marks,
--         observations.verbalizations, observations.attitude_flags,
--         reports.sections_json, audio_recordings.transcription_json.
--         -> Cada una pasa a ser su propia tabla.
--
--   EXCEPCION DOCUMENTADA: strokes.points se queda JSONB. Un trazo es una
--   serie temporal de miles de puntos {x,y,t,p} que se lee y escribe como
--   unidad y nunca se consulta punto por punto. Normalizarla serian ~5.000
--   filas por sesion sin beneficio de query. Lo que SI se normaliza es el
--   nivel de trazo, que en v1 estaba enterrado en un unico blob: asi los
--   indicadores A-6 (secuencia de ejecucion) y B-3 (borrados) pasan a ser
--   consultables por SQL.
--
-- =============================================================================

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

-- =============================================================================
-- PARTE 2 — IDENTIDAD Y PACIENTES
-- =============================================================================

CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    license_number  TEXT,
    specialty       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile readable"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile updatable" ON profiles FOR UPDATE USING (auth.uid() = id);
-- El trigger inserta con SECURITY DEFINER pero la policy tiene que permitirlo (L-006).
CREATE POLICY "trigger can insert"    ON profiles FOR INSERT WITH CHECK (true);

-- SET search_path = public es obligatorio o el trigger no encuentra profiles (DT-004).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'));
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE patients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       TEXT NOT NULL,
    document_number TEXT NOT NULL,
    birth_date      DATE NOT NULL,
    sex             TEXT NOT NULL CHECK (sex IN ('M', 'F', 'U')),
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      UUID NOT NULL REFERENCES profiles(id),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    anonymized_at   TIMESTAMPTZ,

    UNIQUE (created_by, document_number)
);

CREATE INDEX idx_patients_created_by ON patients(created_by);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own patients" ON patients FOR ALL USING (auth.uid() = created_by);

-- =============================================================================
-- PARTE 3 — SESIONES
-- =============================================================================

CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_id         UUID NOT NULL REFERENCES tests(id),   -- v1: test_type TEXT
    status          TEXT NOT NULL DEFAULT 'setup'
                    CHECK (status IN ('setup', 'consent', 'active', 'completed', 'cancelled')),
    reason          TEXT,                     -- motivo de evaluacion (seccion 2 del informe)
    created_by      UUID NOT NULL REFERENCES profiles(id),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_patient    ON sessions(patient_id);
CREATE INDEX idx_sessions_created_by ON sessions(created_by);
CREATE INDEX idx_sessions_test       ON sessions(test_id);
CREATE INDEX idx_sessions_status     ON sessions(status) WHERE status <> 'completed';

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own sessions" ON sessions FOR ALL USING (auth.uid() = created_by);

-- Helper: toda tabla hija de sessions usa esto en su policy.
CREATE OR REPLACE FUNCTION owns_session(sid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM sessions WHERE id = sid AND created_by = auth.uid()
    );
$$;

CREATE TABLE consent_records (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    audio_authorized    BOOLEAN NOT NULL DEFAULT false,
    digital_authorized  BOOLEAN NOT NULL DEFAULT false,
    confidential_ack    BOOLEAN NOT NULL DEFAULT false,
    signature_url       TEXT,
    signed_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON consent_records FOR ALL USING (owns_session(session_id));

-- =============================================================================
-- PARTE 4 — DIBUJO Y TRAZOS
-- =============================================================================

CREATE TABLE drawings (                      -- v1: drawing_data
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    final_image_url TEXT,
    orientation     TEXT NOT NULL DEFAULT 'horizontal'
                    CHECK (orientation IN ('horizontal', 'vertical')),
    canvas_width    INTEGER NOT NULL,        -- necesario para calcular area_pct y emplazamiento
    canvas_height   INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON drawings FOR ALL USING (owns_session(session_id));

-- En v1 todos los trazos eran un unico drawing_data.strokes_json.
-- Normalizar a nivel de trazo hace consultables A-6 (secuencia) y B-3 (borrados).
CREATE TABLE strokes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drawing_id      UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
    stroke_index    INTEGER NOT NULL,        -- orden de ejecucion (A-6)
    tool            TEXT NOT NULL DEFAULT 'pen' CHECK (tool IN ('pen', 'eraser')),
    started_at_ms   INTEGER NOT NULL,        -- offset desde el inicio de la sesion
    ended_at_ms     INTEGER NOT NULL,
    point_count     INTEGER NOT NULL,
    avg_pressure    REAL,                    -- 0.0 a 1.0
    bbox_x          REAL NOT NULL,
    bbox_y          REAL NOT NULL,
    bbox_width      REAL NOT NULL,
    bbox_height     REAL NOT NULL,
    -- ponytail: los puntos se quedan JSONB. Serie temporal atomica, se lee y
    -- escribe entera, nunca se consulta punto por punto. Normalizar = ~5.000
    -- filas por sesion sin beneficio. Ver EXCEPCION DOCUMENTADA arriba.
    points          JSONB NOT NULL,          -- [{x,y,t,p?}, ...]

    UNIQUE (drawing_id, stroke_index),
    CHECK (ended_at_ms >= started_at_ms)
);

CREATE INDEX idx_strokes_drawing ON strokes(drawing_id, stroke_index);

ALTER TABLE strokes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via drawing" ON strokes FOR ALL USING (
    EXISTS (SELECT 1 FROM drawings d WHERE d.id = strokes.drawing_id AND owns_session(d.session_id))
);

-- Metricas derivadas. Se recalculan desde strokes; se materializan porque el
-- informe y el dashboard las leen muchas veces y el calculo recorre todos los puntos.
CREATE TABLE stroke_metrics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    total_time_ms   INTEGER,
    latency_ms      INTEGER,                 -- A-5: tiempo hasta el primer trazo
    stroke_count    INTEGER NOT NULL DEFAULT 0,
    pressure_avg    REAL,
    pause_count     INTEGER NOT NULL DEFAULT 0,
    erase_count     INTEGER NOT NULL DEFAULT 0,
    area_pct        REAL,                    -- A-1: % de hoja ocupada
    sequence_start  TEXT,                    -- A-6: primera parte dibujada
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stroke_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON stroke_metrics FOR ALL USING (owns_session(session_id));

-- =============================================================================
-- PARTE 5 — AUDIO Y TRANSCRIPCION
-- =============================================================================

CREATE TABLE audio_recordings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    storage_path        TEXT NOT NULL,
    duration_seconds    INTEGER,
    transcribed_at      TIMESTAMPTZ,         -- NULL = pendiente de Whisper
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audio_session ON audio_recordings(session_id);

ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON audio_recordings FOR ALL USING (owns_session(session_id));

-- v1: audio_recordings.transcription_json JSONB[]
CREATE TABLE transcript_segments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_id    UUID NOT NULL REFERENCES audio_recordings(id) ON DELETE CASCADE,
    segment_index   INTEGER NOT NULL,
    start_ms        INTEGER NOT NULL,
    end_ms          INTEGER NOT NULL,
    text            TEXT NOT NULL,
    segment_type    TEXT NOT NULL DEFAULT 'speech'
                    CHECK (segment_type IN ('speech', 'annotation')),

    UNIQUE (recording_id, segment_index),
    CHECK (end_ms >= start_ms)
);

CREATE INDEX idx_transcript_recording ON transcript_segments(recording_id, segment_index);

ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via recording" ON transcript_segments FOR ALL USING (
    EXISTS (SELECT 1 FROM audio_recordings a
            WHERE a.id = transcript_segments.recording_id AND owns_session(a.session_id))
);

-- =============================================================================
-- PARTE 6 — OBSERVACIONES
-- =============================================================================

-- Solo lo que es 1:1 con la sesion. Las listas salieron a sus propias tablas.
CREATE TABLE session_observations (          -- v1: observations
    session_id          UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
    additional_notes    TEXT NOT NULL DEFAULT '',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE session_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON session_observations FOR ALL USING (owns_session(session_id));

-- v1: observations.quick_marks JSONB[]
CREATE TABLE session_quick_marks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    mark_code       TEXT NOT NULL REFERENCES quick_mark_catalog(code),
    marked_at_ms    INTEGER NOT NULL,        -- offset desde el inicio de la sesion
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quick_marks_session ON session_quick_marks(session_id);
CREATE INDEX idx_quick_marks_code    ON session_quick_marks(mark_code);

ALTER TABLE session_quick_marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON session_quick_marks FOR ALL USING (owns_session(session_id));

-- v1: observations.attitude_flags JSONB{}
CREATE TABLE session_attitudes (
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    attitude_code   TEXT NOT NULL REFERENCES attitude_catalog(code),

    PRIMARY KEY (session_id, attitude_code)
);

CREATE INDEX idx_attitudes_code ON session_attitudes(attitude_code);

ALTER TABLE session_attitudes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON session_attitudes FOR ALL USING (owns_session(session_id));

-- v1: observations.verbalizations JSONB[]
CREATE TABLE verbalizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    offset_ms       INTEGER,                 -- NULL si la anoto el examinador a mano
    text            TEXT NOT NULL,
    source          TEXT NOT NULL DEFAULT 'transcription'
                    CHECK (source IN ('transcription', 'examiner')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verbalizations_session ON verbalizations(session_id);

ALTER TABLE verbalizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON verbalizations FOR ALL USING (owns_session(session_id));

-- =============================================================================
-- PARTE 7 — INDICADORES DE SESION (la correccion de 2FN)
-- =============================================================================

-- v1: tabla `indicators` con clave candidata (session_id, code) donde category,
-- manual_section, title e interpretation dependian solo de code.
-- Ahora esos atributos viven una sola vez en indicator_catalog.
CREATE TABLE session_indicators (
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    indicator_code  TEXT NOT NULL REFERENCES indicator_catalog(code),
    status          TEXT NOT NULL DEFAULT 'suggestion'
                    CHECK (status IN ('suggestion', 'validated', 'rejected')),
    source          TEXT NOT NULL DEFAULT 'auto'
                    CHECK (source IN ('auto', 'llm', 'manual')),
    confidence      TEXT CHECK (confidence IN ('high', 'medium', 'low')),
    evidence        TEXT,                    -- por que se sugirio: metrica y umbral
    validated_by    UUID REFERENCES profiles(id),
    validated_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (session_id, indicator_code),
    -- Un indicador validado o rechazado tiene que tener autor y fecha.
    CHECK (status = 'suggestion' OR (validated_by IS NOT NULL AND validated_at IS NOT NULL))
);

CREATE INDEX idx_session_indicators_code   ON session_indicators(indicator_code);
CREATE INDEX idx_session_indicators_status ON session_indicators(session_id, status);

ALTER TABLE session_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON session_indicators FOR ALL USING (owns_session(session_id));

-- =============================================================================
-- PARTE 8 — INFORME
-- =============================================================================

CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'validated')),
    validated_at    TIMESTAMPTZ,
    validated_by    UUID REFERENCES profiles(id),
    pdf_url         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (status = 'draft' OR (validated_at IS NOT NULL AND validated_by IS NOT NULL))
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via session" ON reports FOR ALL USING (owns_session(session_id));

-- v1: reports.sections_json JSONB[]
-- Las 9 secciones estandar del informe psicologico.
CREATE TABLE report_sections (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id           UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    section_number      SMALLINT NOT NULL CHECK (section_number BETWEEN 1 AND 9),
    title               TEXT NOT NULL,
    content             TEXT NOT NULL DEFAULT '',
    is_ai_generated     BOOLEAN NOT NULL DEFAULT false,
    edited_by_examiner  BOOLEAN NOT NULL DEFAULT false,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (report_id, section_number)
);

CREATE INDEX idx_report_sections ON report_sections(report_id, section_number);

ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via report" ON report_sections FOR ALL USING (
    EXISTS (SELECT 1 FROM reports r WHERE r.id = report_sections.report_id AND owns_session(r.session_id))
);

-- =============================================================================
-- PARTE 9 — updated_at automatico
-- =============================================================================

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER touch_session_observations BEFORE UPDATE ON session_observations
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER touch_reports BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER touch_report_sections BEFORE UPDATE ON report_sections
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
