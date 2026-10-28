"""Politicas RLS con WITH CHECK en sesiones, indicadores de sesion e informes.

Para bases que ya tenian las politicas anteriores. En una base armada con
`sdd/database/desde-cero/` (o con el `schema.sql` actual) ya nacen asi.

- sessions: el paciente referenciado tambien debe ser del examinador.
- session_indicators y reports: `validated_by` solo puede ser quien escribe (o NULL),
  para que no se pueda atribuir una validacion a otro profesional.
"""

from alembic import op

revision = "0004_politicas_con_with_check"
down_revision = "0003_citas_y_google"
branch_labels = None
depends_on = None

_VALIDADO = "(validated_by IS NULL OR validated_by = auth.uid())"


def upgrade() -> None:
    op.execute('DROP POLICY IF EXISTS "own sessions" ON sessions')
    op.execute(
        """
        CREATE POLICY "own sessions" ON sessions FOR ALL
            USING (auth.uid() = created_by)
            WITH CHECK (
                auth.uid() = created_by
                AND EXISTS (SELECT 1 FROM patients p
                            WHERE p.id = patient_id AND p.created_by = auth.uid())
            )
        """
    )
    for tabla in ("session_indicators", "reports"):
        op.execute(f'DROP POLICY IF EXISTS "via session" ON {tabla}')
        op.execute(
            f"""
            CREATE POLICY "via session" ON {tabla} FOR ALL
                USING (owns_session(session_id))
                WITH CHECK (owns_session(session_id) AND {_VALIDADO})
            """
        )


def downgrade() -> None:
    op.execute('DROP POLICY IF EXISTS "own sessions" ON sessions')
    op.execute('CREATE POLICY "own sessions" ON sessions FOR ALL USING (auth.uid() = created_by)')
    for tabla in ("session_indicators", "reports"):
        op.execute(f'DROP POLICY IF EXISTS "via session" ON {tabla}')
        op.execute(
            f'CREATE POLICY "via session" ON {tabla} FOR ALL USING (owns_session(session_id))'
        )
