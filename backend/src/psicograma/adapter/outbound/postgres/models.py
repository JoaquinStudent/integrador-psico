"""Modelos declarativos de SQLAlchemy. Espejo del esquema v2.

Viven solo en este adaptador: **nunca cruzan la frontera del dominio.** Los
repositorios traducen estas filas a las dataclasses de `domain/model.py`, que es
lo que ve el resto de la aplicacion. Si un modelo de aqui apareciera importado
desde `domain/`, `scripts/check-hexagon.sh` falla.

Las columnas se copiaron del esquema real por reflexion, no de memoria.
`tests/adapter/test_models.py` compara estos modelos contra la base viva y falla
si alguno se desvia.
"""

from __future__ import annotations

import datetime as dt
import uuid
from typing import Any

from sqlalchemy import (
    REAL,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.schema import FetchedValue


class Base(DeclarativeBase):
    pass


# Los defaults (uuid, now()) los pone Postgres, no la aplicacion: asi una
# insercion por SQL directo y una por la API producen lo mismo.
#
# pk() es una fabrica y no una constante compartida: un objeto mapped_column no
# se puede reusar entre tablas, SQLAlchemy lo rechaza. Los objetos de tipo (TS)
# si son compartibles.
def pk() -> Mapped[uuid.UUID]:
    # server_default le dice a SQLAlchemy que el uuid lo genera Postgres. Sin eso
    # avisa (SAWarning) en cada insert que omite la PK y, lo importante, no sabe
    # que puede recuperarla con RETURNING.
    return mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuid_generate_v4()"),
    )


TS = DateTime(timezone=True)


# =============================================================================
# Catalogos
# =============================================================================


class Test(Base):
    __tablename__ = "tests"

    id: Mapped[uuid.UUID] = pk()
    code: Mapped[str] = mapped_column(Text, unique=True)
    name: Mapped[str] = mapped_column(Text)
    is_available: Mapped[bool] = mapped_column(Boolean, server_default=FetchedValue())
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


class IndicatorCategory(Base):
    __tablename__ = "indicator_categories"

    id: Mapped[uuid.UUID] = pk()
    test_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tests.id"))
    code: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)


class ManualSection(Base):
    __tablename__ = "manual_sections"

    id: Mapped[uuid.UUID] = pk()
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("indicator_categories.id"))
    code: Mapped[str] = mapped_column(Text)
    name: Mapped[str] = mapped_column(Text)
    code_prefix: Mapped[str] = mapped_column(Text)


class IndicatorCatalogRow(Base):
    """El manual del test. La PK es el codigo, no un uuid surrogate: `DIM-01` ya
    identifica al indicador de forma estable."""

    __tablename__ = "indicator_catalog"

    code: Mapped[str] = mapped_column(Text, primary_key=True)
    section_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("manual_sections.id"))
    title: Mapped[str] = mapped_column(Text)
    interpretation: Mapped[str] = mapped_column(Text)
    detection_type: Mapped[str] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=FetchedValue())


class QuickMarkCatalog(Base):
    __tablename__ = "quick_mark_catalog"

    code: Mapped[str] = mapped_column(Text, primary_key=True)
    label: Mapped[str] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(SmallInteger, server_default=FetchedValue())


class AttitudeCatalog(Base):
    __tablename__ = "attitude_catalog"

    code: Mapped[str] = mapped_column(Text, primary_key=True)
    label: Mapped[str] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(SmallInteger, server_default=FetchedValue())


# =============================================================================
# Identidad y pacientes
# =============================================================================


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = pk()  # referencia a auth.users, fuera de este schema
    full_name: Mapped[str] = mapped_column(Text)
    license_number: Mapped[str | None] = mapped_column(Text)
    specialty: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = pk()
    full_name: Mapped[str] = mapped_column(Text)
    document_number: Mapped[str] = mapped_column(Text)
    birth_date: Mapped[dt.date] = mapped_column(Date)
    sex: Mapped[str] = mapped_column(Text)
    registered_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=FetchedValue())
    anonymized_at: Mapped[dt.datetime | None] = mapped_column(TS)


# =============================================================================
# Sesiones
# =============================================================================


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = pk()
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"))
    test_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tests.id"))
    status: Mapped[str] = mapped_column(Text, server_default=FetchedValue())
    reason: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id"))
    started_at: Mapped[dt.datetime | None] = mapped_column(TS)
    completed_at: Mapped[dt.datetime | None] = mapped_column(TS)
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id: Mapped[uuid.UUID] = pk()
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id"), unique=True)
    audio_authorized: Mapped[bool] = mapped_column(Boolean, server_default=FetchedValue())
    digital_authorized: Mapped[bool] = mapped_column(Boolean, server_default=FetchedValue())
    confidential_ack: Mapped[bool] = mapped_column(Boolean, server_default=FetchedValue())
    signature_url: Mapped[str | None] = mapped_column(Text)
    signed_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


# =============================================================================
# Dibujo y trazos
# =============================================================================


class Drawing(Base):
    __tablename__ = "drawings"

    id: Mapped[uuid.UUID] = pk()
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id"), unique=True)
    final_image_url: Mapped[str | None] = mapped_column(Text)
    orientation: Mapped[str] = mapped_column(Text, server_default=FetchedValue())
    canvas_width: Mapped[int] = mapped_column(Integer)
    canvas_height: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


class Stroke(Base):
    """Un trazo. `points` se queda JSONB a proposito: es una serie temporal
    atomica que se lee y escribe entera y nunca se consulta punto por punto."""

    __tablename__ = "strokes"

    id: Mapped[uuid.UUID] = pk()
    drawing_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("drawings.id"))
    stroke_index: Mapped[int] = mapped_column(Integer)
    tool: Mapped[str] = mapped_column(Text, server_default=FetchedValue())
    started_at_ms: Mapped[int] = mapped_column(Integer)
    ended_at_ms: Mapped[int] = mapped_column(Integer)
    point_count: Mapped[int] = mapped_column(Integer)
    avg_pressure: Mapped[float | None] = mapped_column(REAL)
    bbox_x: Mapped[float] = mapped_column(REAL)
    bbox_y: Mapped[float] = mapped_column(REAL)
    bbox_width: Mapped[float] = mapped_column(REAL)
    bbox_height: Mapped[float] = mapped_column(REAL)
    points: Mapped[list[dict[str, Any]]] = mapped_column(JSONB)


class StrokeMetrics(Base):
    __tablename__ = "stroke_metrics"

    id: Mapped[uuid.UUID] = pk()
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id"), unique=True)
    total_time_ms: Mapped[int | None] = mapped_column(Integer)
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    stroke_count: Mapped[int] = mapped_column(Integer, server_default=FetchedValue())
    pressure_avg: Mapped[float | None] = mapped_column(REAL)
    pause_count: Mapped[int] = mapped_column(Integer, server_default=FetchedValue())
    erase_count: Mapped[int] = mapped_column(Integer, server_default=FetchedValue())
    area_pct: Mapped[float | None] = mapped_column(REAL)
    sequence_start: Mapped[str | None] = mapped_column(Text)
    computed_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


# =============================================================================
# Audio y transcripcion
# =============================================================================


class AudioRecording(Base):
    __tablename__ = "audio_recordings"

    id: Mapped[uuid.UUID] = pk()
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id"))
    storage_path: Mapped[str] = mapped_column(Text)
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    transcribed_at: Mapped[dt.datetime | None] = mapped_column(TS)
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id: Mapped[uuid.UUID] = pk()
    recording_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("audio_recordings.id"))
    segment_index: Mapped[int] = mapped_column(Integer)
    start_ms: Mapped[int] = mapped_column(Integer)
    end_ms: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    segment_type: Mapped[str] = mapped_column(Text, server_default=FetchedValue())


# =============================================================================
# Observaciones
# =============================================================================


class SessionObservation(Base):
    """PK natural: la sesion. Es 1:1, no hace falta un uuid surrogate."""

    __tablename__ = "session_observations"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id"), primary_key=True
    )
    additional_notes: Mapped[str] = mapped_column(Text, server_default=FetchedValue())
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())
    updated_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


class SessionQuickMark(Base):
    __tablename__ = "session_quick_marks"

    id: Mapped[uuid.UUID] = pk()
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id"))
    mark_code: Mapped[str] = mapped_column(ForeignKey("quick_mark_catalog.code"))
    marked_at_ms: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


class SessionAttitude(Base):
    __tablename__ = "session_attitudes"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id"), primary_key=True
    )
    attitude_code: Mapped[str] = mapped_column(
        ForeignKey("attitude_catalog.code"), primary_key=True
    )


class Verbalization(Base):
    __tablename__ = "verbalizations"

    id: Mapped[uuid.UUID] = pk()
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id"))
    offset_ms: Mapped[int | None] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(Text, server_default=FetchedValue())
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


# =============================================================================
# Indicadores de sesion
# =============================================================================


class SessionIndicator(Base):
    """PK compuesta `(session_id, indicator_code)`.

    Es la correccion de 2FN: en el esquema v1 la tabla `indicators` repetia
    titulo, categoria e interpretacion de cada indicador en cada sesion, porque
    esos atributos dependian solo del codigo y no de la clave completa.
    """

    __tablename__ = "session_indicators"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id"), primary_key=True
    )
    indicator_code: Mapped[str] = mapped_column(
        ForeignKey("indicator_catalog.code"), primary_key=True
    )
    status: Mapped[str] = mapped_column(Text, server_default=FetchedValue())
    source: Mapped[str] = mapped_column(Text, server_default=FetchedValue())
    confidence: Mapped[str | None] = mapped_column(Text)
    evidence: Mapped[str | None] = mapped_column(Text)
    validated_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("profiles.id"))
    validated_at: Mapped[dt.datetime | None] = mapped_column(TS)
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


# =============================================================================
# Informe
# =============================================================================


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = pk()
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sessions.id"), unique=True)
    status: Mapped[str] = mapped_column(Text, server_default=FetchedValue())
    validated_at: Mapped[dt.datetime | None] = mapped_column(TS)
    validated_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("profiles.id"))
    pdf_url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())
    updated_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())


class ReportSection(Base):
    __tablename__ = "report_sections"

    id: Mapped[uuid.UUID] = pk()
    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id"))
    section_number: Mapped[int] = mapped_column(SmallInteger)
    title: Mapped[str] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text, server_default=FetchedValue())
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, server_default=FetchedValue())
    edited_by_examiner: Mapped[bool] = mapped_column(Boolean, server_default=FetchedValue())
    updated_at: Mapped[dt.datetime] = mapped_column(TS, server_default=FetchedValue())
