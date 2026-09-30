"""Catalogos: tests, indicadores del manual, marcas rapidas y actitudes.

Solo lectura. Reemplazan las constantes que el frontend tenia escritas a mano
—las 6 marcas rapidas vivian en `ObservationsPanel.tsx` y los 201 indicadores en
un `.ts`—, que es lo que impedia sumar un test nuevo sin tocar codigo.
"""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Query
from sqlalchemy import select

from .....config.container import Catalog, DbSession
from ....outbound.postgres import models as m
from ..schemas import CatalogIndicatorOut, LabeledOut, TestOut

router = APIRouter(tags=["catalogos"])


@router.get("/tests", response_model=list[TestOut])
async def tests(db: DbSession) -> list[TestOut]:
    rows = (
        (await db.execute(select(m.Test).order_by(m.Test.code))).scalars().all()
    )
    return [TestOut.model_validate(r) for r in rows]


@router.get("/tests/{code}/indicators", response_model=list[CatalogIndicatorOut])
async def indicadores(
    code: str,
    catalog: Catalog,
    detection: Literal["auto", "semi", "manual"] | None = Query(None),
    section: str | None = Query(None, description="codigo de seccion, por ejemplo A-1"),
) -> list[CatalogIndicatorOut]:
    """Los indicadores del manual. Con `detection=manual` sale el checklist de
    verificacion profesional."""
    entradas = await catalog.list_for_test(code.upper())
    if detection:
        entradas = [e for e in entradas if e.detection_type == detection]
    if section:
        entradas = [e for e in entradas if e.section_code == section]
    return [CatalogIndicatorOut.model_validate(e) for e in entradas]


@router.get("/catalogs/quick-marks", response_model=list[LabeledOut])
async def marcas(db: DbSession) -> list[LabeledOut]:
    rows = (
        (
            await db.execute(
                select(m.QuickMarkCatalog).order_by(m.QuickMarkCatalog.display_order)
            )
        )
        .scalars()
        .all()
    )
    return [LabeledOut.model_validate(r) for r in rows]


@router.get("/catalogs/attitudes", response_model=list[LabeledOut])
async def actitudes(db: DbSession) -> list[LabeledOut]:
    rows = (
        (
            await db.execute(
                select(m.AttitudeCatalog).order_by(m.AttitudeCatalog.display_order)
            )
        )
        .scalars()
        .all()
    )
    return [LabeledOut.model_validate(r) for r in rows]
