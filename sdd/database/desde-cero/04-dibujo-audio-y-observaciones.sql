-- ============================================================================
-- PSICOGRAMA · desde cero · PASO 04: Dibujo, audio y observaciones
-- GENERADO por desde-cero/generar.py a partir de schema.sql. No editar a mano.
-- Ejecutar los pasos EN ORDEN. Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.
-- ============================================================================

BEGIN;

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
    -- Offset desde sessions.started_at: el mismo reloj que session_quick_marks.
    -- La grabacion arranca con el primer trazo, no con la sesion, asi que sin esto
    -- los minutos del audio y los de las marcas no son comparables (migracion 002).
    started_at_ms       INTEGER,
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

COMMIT;
