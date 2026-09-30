"""Compara los modelos declarativos contra el esquema real.

Sin esto, un nombre de columna mal escrito se descubre en runtime, cuando la
consulta falla. Aqui falla al correr los tests, que es donde tiene que doler.

Requiere DATABASE_URL apuntando a la base con el esquema v2 aplicado.
"""

from __future__ import annotations

import pytest
from sqlalchemy import text

from psicograma.adapter.outbound.postgres.engine import engine
from psicograma.adapter.outbound.postgres.models import Base


async def _live_schema() -> dict[str, set[str]]:
    async with engine.connect() as conn:
        rows = (
            await conn.execute(
                text(
                    "select table_name, column_name from information_schema.columns "
                    "where table_schema = 'public'"
                )
            )
        ).all()
    out: dict[str, set[str]] = {}
    for table, column in rows:
        out.setdefault(table, set()).add(column)
    return out


@pytest.mark.asyncio
async def test_toda_tabla_modelada_existe():
    live = await _live_schema()
    faltan = {t for t in Base.metadata.tables if t not in live}
    assert not faltan, f"modeladas pero inexistentes en la base: {sorted(faltan)}"


@pytest.mark.asyncio
async def test_toda_columna_modelada_existe():
    live = await _live_schema()
    errores = []
    for name, table in Base.metadata.tables.items():
        if name not in live:
            continue
        for col in table.columns:
            if col.name not in live[name]:
                errores.append(f"{name}.{col.name}")
    assert not errores, f"columnas que no existen en la base: {sorted(errores)}"


@pytest.mark.asyncio
async def test_no_falta_modelar_ninguna_tabla():
    """Si el esquema crece y nadie modela la tabla nueva, esto lo avisa."""
    live = await _live_schema()
    sin_modelar = set(live) - set(Base.metadata.tables)
    assert not sin_modelar, f"tablas del esquema sin modelo: {sorted(sin_modelar)}"


@pytest.mark.asyncio
async def test_claves_primarias_coinciden():
    async with engine.connect() as conn:
        rows = (
            await conn.execute(
                text(
                    "select tc.table_name, kcu.column_name "
                    "from information_schema.table_constraints tc "
                    "join information_schema.key_column_usage kcu "
                    "  on kcu.constraint_name = tc.constraint_name "
                    " and kcu.table_schema = tc.table_schema "
                    "where tc.table_schema = 'public' "
                    "  and tc.constraint_type = 'PRIMARY KEY'"
                )
            )
        ).all()
    live_pks: dict[str, set[str]] = {}
    for table, column in rows:
        live_pks.setdefault(table, set()).add(column)

    errores = []
    for name, table in Base.metadata.tables.items():
        modeled = {c.name for c in table.primary_key.columns}
        actual = live_pks.get(name, set())
        if modeled != actual:
            errores.append(f"{name}: modelo {sorted(modeled)} vs base {sorted(actual)}")
    assert not errores, "PK distintas:\n  " + "\n  ".join(errores)


@pytest.mark.asyncio
async def test_toda_columna_con_default_lo_declara():
    """Si la base pone un default y el modelo no lo declara, SQLAlchemy manda NULL
    explicito y el insert falla con NotNullViolation.

    Es el bug que rompio 22 tests de la API: `patients.registered_at` tenia default
    en la base pero el modelo no lo sabia.
    """
    async with engine.connect() as conn:
        rows = (
            await conn.execute(
                text(
                    "select table_name, column_name from information_schema.columns "
                    "where table_schema = 'public' and column_default is not null"
                )
            )
        ).all()
    con_default = {(t, c) for t, c in rows}

    faltan = [
        f"{name}.{col.name}"
        for name, table in Base.metadata.tables.items()
        for col in table.columns
        if (name, col.name) in con_default and col.server_default is None
    ]
    assert not faltan, (
        "columnas con default en la base que el modelo no declara: " + str(sorted(faltan))
    )
