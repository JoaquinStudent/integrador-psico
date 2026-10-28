"""Citas (agenda) y conexion con Google Calendar. SPEC-CAL-01."""

from alembic import op

revision = "0003_citas_y_google"
down_revision = "0002_privacidad_pacientes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Necesaria para la restriccion de exclusion (igualdad de uuid + solape de rango).
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")
    op.execute(
        """
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
            -- La carrera entre dos peticiones solo la cubre la base.
            EXCLUDE USING gist (
                created_by WITH =,
                tstzrange(starts_at, ends_at) WITH &&
            ) WHERE (status <> 'cancelled')
        )
        """
    )
    op.execute("CREATE INDEX idx_appointments_patient ON appointments(patient_id)")
    op.execute("CREATE INDEX idx_appointments_test ON appointments(test_id)")
    op.execute("CREATE INDEX idx_appointments_session ON appointments(session_id)")
    op.execute("ALTER TABLE appointments ENABLE ROW LEVEL SECURITY")
    # WITH CHECK: la cita no solo debe ser tuya, tambien el paciente y la sesion a los
    # que apunta. Sin esto, una insercion directa podria referenciar datos ajenos.
    op.execute(
        """
        CREATE POLICY "own appointments" ON appointments FOR ALL
            USING (auth.uid() = created_by)
            WITH CHECK (
                auth.uid() = created_by
                AND EXISTS (SELECT 1 FROM patients p
                            WHERE p.id = patient_id AND p.created_by = auth.uid())
                AND (session_id IS NULL OR owns_session(session_id))
            )
        """
    )

    # El navegador no consulta la base (todo pasa por la API); aun asi el token va cifrado.
    op.execute(
        """
        CREATE TABLE google_connections (
            user_id       UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
            refresh_token TEXT NOT NULL,          -- cifrado (Fernet)
            connected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY")
    op.execute(
        'CREATE POLICY "own google connection" ON google_connections '
        "FOR ALL USING (auth.uid() = user_id)"
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS google_connections")
    op.execute("DROP TABLE IF EXISTS appointments")
