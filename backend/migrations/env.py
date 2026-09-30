"""Alembic contra la conexion directa de Postgres, nunca contra el pooler."""

from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from psicograma.adapter.outbound.postgres.engine import _async_dsn
from psicograma.config.settings import get_settings

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = None


def database_url() -> str:
    url = get_settings().database_url
    # El puerto 5432 es obligatorio para DDL; el transaction pooler (6543) no
    # soporta las transacciones DDL/prepared statements que usa Alembic.
    return _async_dsn(url.replace(":6543/", ":5432/"))


def run_migrations_offline() -> None:
    context.configure(url=database_url(), literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        {"sqlalchemy.url": database_url()},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
