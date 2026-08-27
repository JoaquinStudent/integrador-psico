-- =============================================================================
-- PSICOGRAMA — Schema SQL (Supabase/Postgres)
-- Ultima actualizacion: 2026-08-25
-- Estado: Pendiente de ejecucion (requiere proyecto Supabase activo)
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PROFILES (extiende auth.users)
-- =============================================================================
CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    license_number  TEXT,                    -- matricula profesional
    specialty       TEXT,                    -- ej: "Psicologia Clinica"
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger: auto-crear perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- PATIENTS
-- =============================================================================
CREATE TABLE patients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       TEXT NOT NULL,
    document_number TEXT NOT NULL,
    birth_date      DATE NOT NULL,
    sex             TEXT NOT NULL CHECK (sex IN ('M', 'F')),
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by      UUID NOT NULL REFERENCES profiles(id),
    is_active       BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiner can CRUD own patients"
    ON patients FOR ALL
    USING (auth.uid() = created_by);

-- =============================================================================
-- SESSIONS
-- =============================================================================
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_type       TEXT NOT NULL DEFAULT 'PBLL',
    status          TEXT NOT NULL DEFAULT 'setup'
                    CHECK (status IN ('setup', 'consent', 'active', 'completed', 'cancelled')),
    created_by      UUID NOT NULL REFERENCES profiles(id),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiner can CRUD own sessions"
    ON sessions FOR ALL
    USING (auth.uid() = created_by);

-- =============================================================================
-- CONSENT_RECORDS
-- =============================================================================
CREATE TABLE consent_records (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    audio_authorized    BOOLEAN NOT NULL DEFAULT false,
    digital_authorized  BOOLEAN NOT NULL DEFAULT false,
    confidential_ack    BOOLEAN NOT NULL DEFAULT false,
    signature_url       TEXT,                -- Storage path to signature image
    signed_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiner can manage consent via session"
    ON consent_records FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = consent_records.session_id
            AND sessions.created_by = auth.uid()
        )
    );

-- =============================================================================
-- DRAWING_DATA
-- =============================================================================
CREATE TABLE drawing_data (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    strokes_json    JSONB NOT NULL DEFAULT '[]'::jsonb,
    final_image_url TEXT,                    -- Storage path to PNG
    orientation     TEXT DEFAULT 'horizontal'
                    CHECK (orientation IN ('horizontal', 'vertical')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE drawing_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiner can manage drawing via session"
    ON drawing_data FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = drawing_data.session_id
            AND sessions.created_by = auth.uid()
        )
    );

-- =============================================================================
-- STROKE_METRICS
-- =============================================================================
CREATE TABLE stroke_metrics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    total_time_ms   INTEGER,                -- tiempo total de ejecucion
    latency_ms      INTEGER,                -- tiempo hasta primer trazo
    stroke_count    INTEGER DEFAULT 0,
    pressure_avg    REAL,                    -- 0.0 a 1.0
    pause_count     INTEGER DEFAULT 0,      -- pausas > 20s
    erase_count     INTEGER DEFAULT 0,
    area_pct        REAL,                    -- % de hoja ocupada
    sequence_start  TEXT,                    -- primera parte dibujada
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE stroke_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiner can manage metrics via session"
    ON stroke_metrics FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = stroke_metrics.session_id
            AND sessions.created_by = auth.uid()
        )
    );

-- =============================================================================
-- AUDIO_RECORDINGS
-- =============================================================================
CREATE TABLE audio_recordings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    storage_path        TEXT NOT NULL,        -- Supabase Storage path
    duration_seconds    INTEGER,
    transcription_json  JSONB,               -- resultado de Whisper
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiner can manage audio via session"
    ON audio_recordings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = audio_recordings.session_id
            AND sessions.created_by = auth.uid()
        )
    );

-- =============================================================================
-- OBSERVATIONS
-- =============================================================================
CREATE TABLE observations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    attitude_flags      JSONB NOT NULL DEFAULT '{}'::jsonb,
    quick_marks         JSONB NOT NULL DEFAULT '[]'::jsonb,
    verbalizations      JSONB NOT NULL DEFAULT '[]'::jsonb,
    additional_notes    TEXT DEFAULT '',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiner can manage observations via session"
    ON observations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = observations.session_id
            AND sessions.created_by = auth.uid()
        )
    );

-- =============================================================================
-- INDICATORS
-- =============================================================================
CREATE TABLE indicators (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    code            TEXT NOT NULL,            -- ej: "DIM-01", "PAR-03"
    category        TEXT NOT NULL,            -- ej: "Dimensiones", "Paraguas"
    manual_section  TEXT,                     -- ej: "A-1", "B-7"
    title           TEXT NOT NULL,
    interpretation  TEXT,
    source          TEXT NOT NULL DEFAULT 'auto'
                    CHECK (source IN ('auto', 'manual')),
    status          TEXT NOT NULL DEFAULT 'suggestion'
                    CHECK (status IN ('suggestion', 'validated', 'rejected')),
    confidence      TEXT DEFAULT 'medium'
                    CHECK (confidence IN ('high', 'medium', 'low')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(session_id, code)
);

ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiner can manage indicators via session"
    ON indicators FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = indicators.session_id
            AND sessions.created_by = auth.uid()
        )
    );

-- =============================================================================
-- REPORTS
-- =============================================================================
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
    sections_json   JSONB NOT NULL DEFAULT '[]'::jsonb,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'validated')),
    validated_at    TIMESTAMPTZ,
    pdf_url         TEXT,                    -- Storage path to exported PDF
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Examiner can manage reports via session"
    ON reports FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = reports.session_id
            AND sessions.created_by = auth.uid()
        )
    );
