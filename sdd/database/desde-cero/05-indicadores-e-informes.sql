-- ============================================================================
-- PSICOGRAMA · desde cero · PASO 05: Indicadores de sesion, informes y disparadores
-- GENERADO por desde-cero/generar.py a partir de schema.sql. No editar a mano.
-- Ejecutar los pasos EN ORDEN. Debe terminar en COMMIT; si el editor corto el texto, copia de nuevo.
-- ============================================================================

BEGIN;

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
-- WITH CHECK: quien valida es quien firma; no se puede atribuir una validacion a otro profesional.
CREATE POLICY "via session" ON session_indicators FOR ALL
    USING (owns_session(session_id))
    WITH CHECK (owns_session(session_id) AND (validated_by IS NULL OR validated_by = auth.uid()));

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
CREATE POLICY "via session" ON reports FOR ALL
    USING (owns_session(session_id))
    WITH CHECK (owns_session(session_id) AND (validated_by IS NULL OR validated_by = auth.uid()));

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

COMMIT;
