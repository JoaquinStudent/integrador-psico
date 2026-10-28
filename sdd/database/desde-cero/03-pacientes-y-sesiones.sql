-- ============================================================================
-- PSICOGRAMA · desde cero · PASO 03: Perfiles, pacientes y sesiones
-- GENERADO por desde-cero/generar.py a partir de schema.sql. No editar a mano.
-- Ejecutar los pasos EN ORDEN. Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.
-- ============================================================================

BEGIN;

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
-- Se mantiene permisiva a proposito (L-006): durante el registro auth.uid() es NULL y el
-- disparador necesita insertar. No es explotable: `id` es clave primaria y FK a auth.users, y
-- cada cuenta ya tiene su perfil, asi que no se puede crear uno nuevo ni pisar uno existente.
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

-- WITH CHECK: la sesion no solo debe ser tuya, tambien el paciente al que apunta. Sin esto,
-- una escritura directa podria colgar una sesion de un paciente ajeno si se conoce su UUID.
CREATE POLICY "own sessions" ON sessions FOR ALL
    USING (auth.uid() = created_by)
    WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_id AND p.created_by = auth.uid())
    );

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

COMMIT;
