"""Añade marca de anonimización y permite conservar sexo desconocido."""

from alembic import op

revision = "0002_privacidad_pacientes"
down_revision = "0001_esquema_inicial_2fn"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE patients ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ")
    op.execute("ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_sex_check")
    op.execute("ALTER TABLE patients ADD CONSTRAINT patients_sex_check CHECK (sex IN ('M', 'F', 'U'))")


def downgrade() -> None:
    op.execute("ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_sex_check")
    op.execute("ALTER TABLE patients ADD CONSTRAINT patients_sex_check CHECK (sex IN ('M', 'F'))")
    op.execute("ALTER TABLE patients DROP COLUMN IF EXISTS anonymized_at")
