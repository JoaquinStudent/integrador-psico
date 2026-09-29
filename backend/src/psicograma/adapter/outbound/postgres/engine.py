"""Adaptador de persistencia: motor y sesiones.

Dos cosas que no son obvias y rompen el dia 1 si se ignoran:

1. El **transaction pooler** de Supabase (puerto 6543) no soporta prepared
   statements. Con la config por defecto, asyncpg falla con
   `DuplicatePreparedStatementError` en la segunda request. De ahi
   `statement_cache_size: 0` y `NullPool` — el pooler ya agrupa conexiones, un
   pool del lado de la app encima solo agota el limite del backend.
   Alembic, en cambio, va contra el puerto 5432.

2. RLS sigue activa detras del backend. Cada transaccion declara de quien es la
   request, asi las policies del schema se evaluan igual que cuando el cliente
   hablaba con PostgREST. Si un `WHERE` se olvida, RLS tapa el hueco.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from ....config.settings import get_settings

_settings = get_settings()


def _async_dsn(url: str) -> str:
    """Fuerza el driver asyncpg.

    Supabase entrega la cadena como `postgresql://...`, y con eso SQLAlchemy
    resuelve el dialecto a psycopg y falla con ModuleNotFoundError. Corregirlo a
    mano en cada `.env` del equipo es una pieza de conocimiento que se pierde;
    normalizarlo aqui es una linea.
    """
    if url.startswith("postgresql+"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):  # forma antigua, aun circula
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


engine = create_async_engine(
    _async_dsn(_settings.database_url),
    echo=_settings.db_echo,
    poolclass=NullPool,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)

_session_factory = async_sessionmaker(engine, expire_on_commit=False)


@asynccontextmanager
async def session_for(user_id: UUID) -> AsyncIterator[AsyncSession]:
    """Transaccion con la identidad del usuario propagada, para que RLS aplique.

    El rol de conexion es dedicado y sin BYPASSRLS: esta es la segunda capa de
    autorizacion, no la unica. La primera es el filtro en los repositorios.
    """
    async with _session_factory() as session, session.begin():
        claims = json.dumps({"sub": str(user_id), "role": "authenticated"})

        # set_config en vez de SET LOCAL: `SET` es una sentencia utilitaria y
        # Postgres no admite parametros en ella ("syntax error at or near $1").
        # set_config es una funcion, acepta el bind, y con is_local=true equivale
        # a SET LOCAL. Interpolar el JSON en el SQL seria la otra salida, y seria
        # una via de inyeccion.
        await session.execute(
            text("select set_config('request.jwt.claims', :claims, true)"),
            {"claims": claims},
        )
        # El cambio de rol va despues: primero se deja la identidad puesta, luego
        # se bajan los privilegios. `authenticated` no tiene BYPASSRLS, asi que a
        # partir de aqui las policies se evaluan aunque el rol de conexion sea
        # superusuario.
        await session.execute(text("SET LOCAL ROLE authenticated"))
        yield session


async def ping() -> bool:
    """Para /health. No toca ninguna tabla."""
    async with engine.connect() as conn:
        return (await conn.scalar(text("SELECT 1"))) == 1
