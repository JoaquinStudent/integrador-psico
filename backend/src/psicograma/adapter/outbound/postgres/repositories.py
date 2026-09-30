"""Adaptadores de persistencia: implementan los puertos de `domain/ports.py`.

Dos reglas que sostienen la arquitectura:

1. **Los modelos de SQLAlchemy no salen de aqui.** Cada metodo traduce filas a las
   dataclasses de `domain/model.py`. El dominio no sabe que existe una base.

2. **La sesion se recibe, no se abre.** Cada repositorio trabaja sobre una
   `AsyncSession` que ya viene dentro de `session_for(user_id)`, con la identidad
   propagada para que RLS aplique. Asi varios repositorios comparten una
   transaccion y una escritura que toca tres tablas es atomica.

El filtro por examinador es la primera capa de autorizacion; RLS es la segunda.
Los `WHERE` de aqui no son la unica defensa, y por eso el rol de conexion no
tiene BYPASSRLS.
"""

from __future__ import annotations

import datetime as dt
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from ....domain.model import (
    Canvas,
    CatalogEntry,
    Confidence,
    DetectionType,
    Drawing,
    DrawingMetrics,
    IndicatorStatus,
    IndicatorSuggestion,
    Point,
    Stroke,
    Tool,
    ValidatedIndicator,
)
from . import models as m


def _to_point(raw: dict) -> Point:
    """Un punto del JSONB. El frontend lo serializa compacto: {x, y, t, p?}."""
    return Point(x=raw["x"], y=raw["y"], t=raw["t"], pressure=raw.get("p"))


def _to_stroke(row: m.Stroke) -> Stroke:
    return Stroke(
        stroke_index=row.stroke_index,
        tool=Tool(row.tool),
        started_at_ms=row.started_at_ms,
        ended_at_ms=row.ended_at_ms,
        points=tuple(_to_point(p) for p in row.points),
    )


def _to_metrics(row: m.StrokeMetrics) -> DrawingMetrics:
    return DrawingMetrics(
        total_time_ms=row.total_time_ms or 0,
        latency_ms=row.latency_ms or 0,
        stroke_count=row.stroke_count,
        pressure_avg=row.pressure_avg or 0.0,
        pause_count=row.pause_count,
        erase_count=row.erase_count,
        area_pct=row.area_pct or 0.0,
        sequence_start=row.sequence_start,
    )


class PostgresDrawingRepository:
    """Implementa `domain.ports.DrawingRepository`."""

    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def get_drawing(self, session_id: UUID) -> Drawing | None:
        drawing = (
            await self._s.execute(
                select(m.Drawing).where(m.Drawing.session_id == session_id)
            )
        ).scalar_one_or_none()
        if drawing is None:
            return None

        # Ordenado por stroke_index: la secuencia de ejecucion es un indicador
        # del manual (A-6), no un detalle de presentacion.
        strokes = (
            (
                await self._s.execute(
                    select(m.Stroke)
                    .where(m.Stroke.drawing_id == drawing.id)
                    .order_by(m.Stroke.stroke_index)
                )
            )
            .scalars()
            .all()
        )

        return Drawing(
            canvas=Canvas(width=drawing.canvas_width, height=drawing.canvas_height),
            strokes=tuple(_to_stroke(s) for s in strokes),
            orientation=drawing.orientation,
        )

    async def get_metrics(self, session_id: UUID) -> DrawingMetrics | None:
        row = (
            await self._s.execute(
                select(m.StrokeMetrics).where(m.StrokeMetrics.session_id == session_id)
            )
        ).scalar_one_or_none()
        return _to_metrics(row) if row else None

    async def save_metrics(self, session_id: UUID, metrics: DrawingMetrics) -> None:
        """Upsert por `session_id`, que es UNIQUE. Recalcular un analisis
        sobreescribe las metricas en vez de acumular filas."""
        values = {
            "session_id": session_id,
            "total_time_ms": metrics.total_time_ms,
            "latency_ms": metrics.latency_ms,
            "stroke_count": metrics.stroke_count,
            "pressure_avg": metrics.pressure_avg,
            "pause_count": metrics.pause_count,
            "erase_count": metrics.erase_count,
            "area_pct": metrics.area_pct,
            "sequence_start": metrics.sequence_start,
        }
        stmt = pg_insert(m.StrokeMetrics).values(**values)
        await self._s.execute(
            stmt.on_conflict_do_update(
                index_elements=[m.StrokeMetrics.session_id],
                set_={k: v for k, v in values.items() if k != "session_id"},
            )
        )


class PostgresIndicatorCatalog:
    """Implementa `domain.ports.IndicatorCatalog`.

    Lee el manual desde la base. En el esquema v1 estos datos vivian en un `.ts`
    del frontend y se duplicaban dentro de cada sesion; tenerlos aqui es lo que
    permite sumar HTP o DFH cargando sus criterios, sin tocar codigo.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    _JOIN = (
        select(
            m.IndicatorCatalogRow.code,
            m.ManualSection.code.label("section_code"),
            m.ManualSection.name.label("section_name"),
            m.IndicatorCategory.code.label("category_code"),
            m.IndicatorCatalogRow.title,
            m.IndicatorCatalogRow.interpretation,
            m.IndicatorCatalogRow.detection_type,
        )
        .join(m.ManualSection, m.ManualSection.id == m.IndicatorCatalogRow.section_id)
        .join(
            m.IndicatorCategory,
            m.IndicatorCategory.id == m.ManualSection.category_id,
        )
    )

    @staticmethod
    def _to_entry(row) -> CatalogEntry:
        return CatalogEntry(
            code=row.code,
            section_code=row.section_code,
            section_name=row.section_name,
            category_code=row.category_code,
            title=row.title,
            interpretation=row.interpretation,
            detection_type=DetectionType(row.detection_type),
        )

    async def get(self, code: str) -> CatalogEntry | None:
        row = (
            await self._s.execute(self._JOIN.where(m.IndicatorCatalogRow.code == code))
        ).one_or_none()
        return self._to_entry(row) if row else None

    async def list_for_test(self, test_code: str) -> list[CatalogEntry]:
        """Solo los activos: desactivar una categoria (por ejemplo C y D) la saca
        de las sugerencias sin borrarla del catalogo."""
        rows = (
            await self._s.execute(
                self._JOIN.join(m.Test, m.Test.id == m.IndicatorCategory.test_id)
                .where(m.Test.code == test_code)
                .where(m.IndicatorCatalogRow.is_active.is_(True))
                .order_by(m.IndicatorCatalogRow.code)
            )
        ).all()
        return [self._to_entry(r) for r in rows]


class PostgresSessionIndicatorRepository:
    """Implementa `domain.ports.SessionIndicatorRepository`."""

    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def upsert_suggestions(
        self, session_id: UUID, suggestions: list[IndicatorSuggestion]
    ) -> None:
        """Guarda sugerencias sin pisar el juicio del examinador.

        Si ya valido o rechazo un indicador, un reanalisis **no** lo devuelve a
        `suggestion`: el `WHERE` del upsert solo actualiza las filas que siguen
        en ese estado. Sin esa condicion, recalcular borraria trabajo humano.
        """
        if not suggestions:
            return

        rows = [
            {
                "session_id": session_id,
                "indicator_code": s.code,
                "status": IndicatorStatus.SUGGESTION.value,
                "source": "auto",
                "confidence": Confidence(s.confidence).value,
                "evidence": s.evidence,
            }
            for s in suggestions
        ]

        stmt = pg_insert(m.SessionIndicator).values(rows)
        await self._s.execute(
            stmt.on_conflict_do_update(
                index_elements=[
                    m.SessionIndicator.session_id,
                    m.SessionIndicator.indicator_code,
                ],
                set_={
                    "confidence": stmt.excluded.confidence,
                    "evidence": stmt.excluded.evidence,
                },
                where=m.SessionIndicator.status == IndicatorStatus.SUGGESTION.value,
            )
        )

    async def list_validated(self, session_id: UUID) -> list[ValidatedIndicator]:
        """Lo unico que puede entrar al informe.

        El generador recibe esta lista y nada mas: ni sugerencias pendientes ni
        rechazados. Es la regla que sostiene que el sistema no diagnostica.
        """
        catalog = PostgresIndicatorCatalog(self._s)
        rows = (
            await self._s.execute(
                select(m.SessionIndicator)
                .where(m.SessionIndicator.session_id == session_id)
                .where(m.SessionIndicator.status == IndicatorStatus.VALIDATED.value)
                .order_by(m.SessionIndicator.indicator_code)
            )
        ).scalars().all()

        out: list[ValidatedIndicator] = []
        for row in rows:
            entry = await catalog.get(row.indicator_code)
            if entry is not None:  # la FK lo garantiza; se es defensivo por si acaso
                out.append(ValidatedIndicator(entry=entry, evidence=row.evidence))
        return out

    async def list_for_session(self, session_id: UUID) -> list[dict]:
        rows = (
            await self._s.execute(
                select(m.SessionIndicator, m.IndicatorCatalogRow)
                .join(
                    m.IndicatorCatalogRow,
                    m.IndicatorCatalogRow.code == m.SessionIndicator.indicator_code,
                )
                .where(m.SessionIndicator.session_id == session_id)
                .order_by(m.SessionIndicator.indicator_code)
            )
        ).all()
        return [
            {
                "code": indicator.indicator_code,
                "status": indicator.status,
                "source": indicator.source,
                "confidence": indicator.confidence,
                "evidence": indicator.evidence,
                "validated_by": indicator.validated_by,
                "validated_at": indicator.validated_at,
                "title": catalog.title,
                "interpretation": catalog.interpretation,
                "category": "",
            }
            for indicator, catalog in rows
        ]

    async def set_status(
        self, session_id: UUID, code: str, status: IndicatorStatus, user_id: UUID
    ) -> dict:
        row = (
            await self._s.execute(
                select(m.SessionIndicator)
                .where(m.SessionIndicator.session_id == session_id)
                .where(m.SessionIndicator.indicator_code == code)
            )
        ).scalar_one_or_none()
        if row is None:
            raise KeyError(code)
        row.status = status.value
        row.validated_by = user_id
        row.validated_at = dt.datetime.now(dt.UTC)
        await self._s.flush()
        return {
            "code": row.indicator_code,
            "status": row.status,
            "source": row.source,
            "confidence": row.confidence,
            "evidence": row.evidence,
            "validated_by": row.validated_by,
            "validated_at": row.validated_at,
        }

    async def add_manual(self, session_id: UUID, codes: list[str], user_id: UUID) -> list[dict]:
        valid_codes = (
            await self._s.execute(
                select(m.IndicatorCatalogRow.code).where(
                    m.IndicatorCatalogRow.code.in_(codes)
                )
            )
        ).scalars().all()
        for code in valid_codes:
            stmt = pg_insert(m.SessionIndicator).values(
                session_id=session_id,
                indicator_code=code,
                status=IndicatorStatus.VALIDATED.value,
                source="manual",
                confidence="high",
                validated_by=user_id,
                validated_at=dt.datetime.now(dt.UTC),
            )
            await self._s.execute(
                stmt.on_conflict_do_update(
                    index_elements=[
                        m.SessionIndicator.session_id,
                        m.SessionIndicator.indicator_code,
                    ],
                    set_={
                        "status": IndicatorStatus.VALIDATED.value,
                        "source": "manual",
                        "validated_by": user_id,
                        "validated_at": dt.datetime.now(dt.UTC),
                    },
                )
            )
        return await self.list_for_session(session_id)
