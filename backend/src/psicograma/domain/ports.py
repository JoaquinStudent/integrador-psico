"""Puertos: lo que el dominio necesita del mundo, declarado como Protocol.

El dominio define la forma; los adaptadores de `adapter/outbound/` la implementan.
Nada aqui importa infraestructura.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable
from uuid import UUID

from .model import (
    CatalogEntry,
    Drawing,
    DrawingMetrics,
    IndicatorStatus,
    IndicatorSuggestion,
    ReportSection,
    ValidatedIndicator,
)


@runtime_checkable
class DrawingRepository(Protocol):
    async def get_drawing(self, session_id: UUID) -> Drawing | None: ...
    async def save_metrics(self, session_id: UUID, metrics: DrawingMetrics) -> None: ...
    async def get_metrics(self, session_id: UUID) -> DrawingMetrics | None: ...


@runtime_checkable
class IndicatorCatalog(Protocol):
    """Lectura del manual. En v1 vivia en un .ts del frontend; ahora es la tabla
    `indicator_catalog`, que es lo que permite anadir HTP/DFH sin tocar codigo."""

    async def get(self, code: str) -> CatalogEntry | None: ...
    async def list_for_test(self, test_code: str) -> list[CatalogEntry]: ...


@runtime_checkable
class SessionIndicatorRepository(Protocol):
    async def upsert_suggestions(
        self, session_id: UUID, suggestions: list[IndicatorSuggestion]
    ) -> None: ...
    async def list_validated(self, session_id: UUID) -> list[ValidatedIndicator]: ...

    async def list_for_session(self, session_id: UUID) -> list[dict]: ...

    async def set_status(
        self, session_id: UUID, code: str, status: IndicatorStatus, user_id: UUID
    ) -> dict: ...

    async def add_manual(
        self, session_id: UUID, codes: list[str], user_id: UUID
    ) -> list[dict]: ...


@runtime_checkable
class Transcriber(Protocol):
    """Whisper u equivalente. Devuelve segmentos (start_ms, end_ms, text)."""

    async def transcribe(self, audio: bytes, filename: str) -> list[tuple[int, int, str]]: ...


@runtime_checkable
class LlmDrafter(Protocol):
    """Redacta prosa a partir de datos ya validados. Nunca interpreta por su cuenta."""

    async def draft_section(self, title: str, facts: str) -> str: ...


@runtime_checkable
class FileStore(Protocol):
    async def put(self, path: str, data: bytes, content_type: str) -> str: ...
    async def signed_url(self, path: str, expires_in_s: int = 3600) -> str: ...


@runtime_checkable
class PdfRenderer(Protocol):
    async def render(self, sections: list[ReportSection], header: dict[str, str]) -> bytes: ...
