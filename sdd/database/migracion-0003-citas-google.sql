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


-- =============================================================================
-- PARTE 9 — AGENDA Y GOOGLE CALENDAR (migracion 0003, SPEC-CAL-01)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE appointments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_id         UUID NOT NULL REFERENCES tests(id),
    created_by      UUID NOT NULL REFERENCES profiles(id),
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'started', 'cancelled')),
    notes           TEXT,
    session_id      UUID REFERENCES sessions(id) ON DELETE SET NULL,
    google_event_id TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (ends_at > starts_at),
    EXCLUDE USING gist (created_by WITH =, tstzrange(starts_at, ends_at) WITH &&)
        WHERE (status <> 'cancelled')
);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_test    ON appointments(test_id);
CREATE INDEX idx_appointments_session ON appointments(session_id);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own appointments" ON appointments FOR ALL
    USING (auth.uid() = created_by)
    WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (SELECT 1 FROM patients p WHERE p.id = patient_id AND p.created_by = auth.uid())
        AND (session_id IS NULL OR owns_session(session_id))
    );

CREATE TABLE google_connections (
    user_id       UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    connected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own google connection" ON google_connections FOR ALL USING (auth.uid() = user_id);
