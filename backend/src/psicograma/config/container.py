"""Wiring: puertos del dominio -> adaptadores concretos.

Este es el unico modulo donde el dominio y la infraestructura se encuentran. Los
routers piden puertos (`DrawingRepository`), no implementaciones
(`PostgresDrawingRepository`), asi que cambiar de motor de base de datos se
resuelve aqui y en ningun otro lado.

**Una transaccion por request.** `db_session` abre `session_for(user_id)`, que
propaga la identidad para que RLS aplique, y todos los repositorios de esa request
comparten esa sesion. Consecuencia practica: una operacion que escribe en tres
tablas es atomica sin que el caso de uso tenga que coordinar nada.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..adapter.inbound.http.auth import CurrentUser
from ..adapter.outbound.postgres.engine import session_for
from ..adapter.outbound.postgres.repositories import (
    PostgresDrawingRepository,
    PostgresIndicatorCatalog,
    PostgresSessionIndicatorRepository,
)
from ..domain.ports import (
    DrawingRepository,
    IndicatorCatalog,
    SessionIndicatorRepository,
)


async def db_session(user_id: CurrentUser) -> AsyncIterator[AsyncSession]:
    """Transaccion de la request, con la identidad del examinador propagada.

    Hace commit al salir sin excepcion y rollback si algo falla, porque
    `session_for` envuelve en `session.begin()`.
    """
    async with session_for(user_id) as session:
        yield session


DbSession = Annotated[AsyncSession, Depends(db_session)]


# --- Puertos ------------------------------------------------------------------
# El tipo de retorno es el Protocol, no la clase: si un router se apoyara en algo
# especifico del adaptador de Postgres, el type checker lo marca.


def drawing_repository(session: DbSession) -> DrawingRepository:
    return PostgresDrawingRepository(session)


def indicator_catalog(session: DbSession) -> IndicatorCatalog:
    return PostgresIndicatorCatalog(session)


def session_indicator_repository(session: DbSession) -> SessionIndicatorRepository:
    return PostgresSessionIndicatorRepository(session)


Drawings = Annotated[DrawingRepository, Depends(drawing_repository)]
Catalog = Annotated[IndicatorCatalog, Depends(indicator_catalog)]
SessionIndicators = Annotated[
    SessionIndicatorRepository, Depends(session_indicator_repository)
]
