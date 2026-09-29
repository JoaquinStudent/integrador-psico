"""DTO de la frontera HTTP.

Viven en el adaptador de entrada, no en el dominio: el dominio trabaja con las
dataclasses de `domain/model.py` y no sabe que existe HTTP. Estos modelos son lo
que se serializa, se valida y se documenta en OpenAPI.

snake_case en todo, alineado con `sdd/domain.md` y con la base.
"""

from __future__ import annotations

import datetime as dt
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

# =============================================================================
# Comunes
# =============================================================================


class Model(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Page[T](Model):
    items: list[T]
    total: int
    page: int
    page_size: int


# =============================================================================
# Pacientes
# =============================================================================


class PatientIn(Model):
    full_name: str = Field(min_length=2, max_length=200)
    document_number: str = Field(min_length=4, max_length=30)
    birth_date: dt.date
    sex: Literal["M", "F"]

    @field_validator("birth_date")
    @classmethod
    def no_futura(cls, v: dt.date) -> dt.date:
        if v > dt.date.today():
            raise ValueError("la fecha de nacimiento no puede ser futura")
        return v


class PatientOut(Model):
    id: UUID
    full_name: str
    document_number: str
    birth_date: dt.date
    sex: str
    registered_at: dt.datetime
    is_active: bool
    # Derivados que calcula el backend: el cliente no deberia recalcular la edad
    # ni el estado de evaluacion pendiente, porque esa regla vive en un solo lugar.
    age: int | None = None
    evaluation_count: int | None = None
    has_pending_evaluation: bool | None = None


# =============================================================================
# Tests
# =============================================================================


class TestOut(Model):
    id: UUID
    code: str
    name: str
    is_available: bool


# =============================================================================
# Sesiones
# =============================================================================

SessionStatus = Literal["setup", "consent", "active", "completed", "cancelled"]


class SessionIn(Model):
    patient_id: UUID
    test_code: str = "PBLL"
    reason: str | None = None


class SessionPatch(Model):
    status: SessionStatus | None = None
    reason: str | None = None


class SessionOut(Model):
    id: UUID
    patient_id: UUID
    test: TestOut
    status: str
    reason: str | None
    started_at: dt.datetime | None
    completed_at: dt.datetime | None
    created_at: dt.datetime
    patient: PatientOut | None = None


class ConsentIn(Model):
    audio_authorized: bool
    digital_authorized: bool
    confidential_ack: bool
    signature_url: str | None = None

    @field_validator("confidential_ack")
    @classmethod
    def obligatorio(cls, v: bool) -> bool:
        # RNF-14: ninguna sesion arranca sin reconocimiento de confidencialidad.
        # Es una restriccion clinica, no una casilla de formulario.
        if not v:
            raise ValueError("el reconocimiento de confidencialidad es obligatorio")
        return v


class ConsentOut(Model):
    audio_authorized: bool
    digital_authorized: bool
    confidential_ack: bool
    signature_url: str | None
    signed_at: dt.datetime


# =============================================================================
# Dibujo
# =============================================================================


class PointIn(Model):
    x: float
    y: float
    t: int
    p: float | None = None


class StrokeIn(Model):
    stroke_index: int = Field(ge=0)
    tool: Literal["pen", "eraser"]
    # Offsets absolutos desde el inicio de la sesion. El `t` de cada punto es
    # relativo al trazo y no alcanza para medir las pausas entre trazos, que fue
    # el error E-002.
    started_at_ms: int = Field(ge=0)
    ended_at_ms: int = Field(ge=0)
    points: list[PointIn] = Field(min_length=1)

    @field_validator("ended_at_ms")
    @classmethod
    def coherente(cls, v: int, info) -> int:
        ini = info.data.get("started_at_ms")
        if ini is not None and v < ini:
            raise ValueError("ended_at_ms no puede ser anterior a started_at_ms")
        return v


class DrawingIn(Model):
    canvas_width: int = Field(gt=0)
    canvas_height: int = Field(gt=0)
    orientation: Literal["horizontal", "vertical"] = "horizontal"
    strokes: list[StrokeIn]


class StrokeOut(Model):
    stroke_index: int
    tool: str
    started_at_ms: int
    ended_at_ms: int
    points: list[PointIn]


class DrawingOut(Model):
    session_id: UUID
    canvas_width: int
    canvas_height: int
    orientation: str
    # URL firmada, no publica: el bucket es privado y la firma expira. Guardar una
    # URL firmada en la base seria guardar algo que caduca.
    final_image_url: str | None
    strokes: list[StrokeOut]


class MetricsOut(Model):
    total_time_ms: int
    latency_ms: int
    stroke_count: int
    pressure_avg: float
    pause_count: int
    erase_count: int
    area_pct: float
    sequence_start: str | None


# =============================================================================
# Observaciones
# =============================================================================


class QuickMarkIn(Model):
    mark_code: str
    marked_at_ms: int = Field(ge=0)


class QuickMarkOut(Model):
    mark_code: str
    marked_at_ms: int


class ObservationsIn(Model):
    additional_notes: str = ""
    attitudes: list[str] = Field(default_factory=list)


class ObservationsOut(Model):
    additional_notes: str
    quick_marks: list[QuickMarkOut]
    attitudes: list[str]


# =============================================================================
# Catalogos
# =============================================================================


class CatalogIndicatorOut(Model):
    code: str
    section_code: str
    section_name: str
    category_code: str
    title: str
    interpretation: str
    detection_type: str


class LabeledOut(Model):
    code: str
    label: str
    display_order: int
