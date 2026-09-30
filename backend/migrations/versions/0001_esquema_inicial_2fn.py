"""Registra el esquema v2 y crea una base vacia cuando corresponde.

La revision es deliberadamente no destructiva para el entorno existente. Si la
base ya contiene `tests` y `sessions.test_id`, solo registra que el esquema v2
esta bajo Alembic. Las tablas heredadas no se eliminan; su limpieza requiere una
revision posterior y confirmacion explicita.
"""

from __future__ import annotations

from pathlib import Path

from alembic import op
from sqlalchemy import inspect, text

revision = "0001_esquema_inicial_2fn"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    tables = set(inspect(bind).get_table_names(schema="public"))
    if "tests" in tables and "sessions" in tables:
        columns = {c["name"] for c in inspect(bind).get_columns("sessions", schema="public")}
        if "test_id" not in columns:
            raise RuntimeError(
                "La base contiene el esquema v1 (sessions.test_type). "
                "Ejecuta primero la migracion de compatibilidad preservando datos."
            )
        return

    schema_path = Path(__file__).parents[3] / "sdd" / "database" / "schema.sql"
    if not schema_path.exists():
        raise RuntimeError(f"No se encontro el esquema v2 en {schema_path}")
    bind.exec_driver_sql(schema_path.read_text(encoding="utf-8"))


def downgrade() -> None:
    bind = op.get_bind()
    if not inspect(bind).has_table("tests", schema="public"):
        return
    # Nunca se ejecuta implicitamente: contiene perdida de datos y debe ser
    # invocado despues de un backup y una confirmacion del operador.
    raise RuntimeError(
        "Downgrade destructivo bloqueado. Respaldar la base y ejecutar una "
        "revision de limpieza aprobada antes de volver a base."
    )
