"""Modelo de dominio. Python puro: ni FastAPI, ni SQLAlchemy, ni HTTP.

Si este modulo llega a importar infraestructura, `scripts/check-hexagon.sh` falla.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

# --- Valores del manual -----------------------------------------------------


class Confidence(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class DetectionType(StrEnum):
    """Como se detecta un indicador del manual."""

    AUTO = "auto"      # medible desde los datos del trazo
    SEMI = "semi"      # los datos del trazo ayudan, el LLM propone
    MANUAL = "manual"  # juicio visual o clinico del examinador


class IndicatorStatus(StrEnum):
    SUGGESTION = "suggestion"
    VALIDATED = "validated"
    REJECTED = "rejected"


class Tool(StrEnum):
    PEN = "pen"
    ERASER = "eraser"


# --- Captura del dibujo -----------------------------------------------------


@dataclass(frozen=True, slots=True)
class Point:
    """Un punto del trazo. `t` es offset en ms desde el inicio de la sesion."""

    x: float
    y: float
    t: int
    pressure: float | None = None


@dataclass(frozen=True, slots=True)
class Bounds:
    left: float
    top: float
    right: float
    bottom: float

    @property
    def width(self) -> float:
        return self.right - self.left

    @property
    def height(self) -> float:
        return self.bottom - self.top


@dataclass(frozen=True, slots=True)
class Stroke:
    """Un trazo: de pen-down a pen-up.

    `started_at_ms` y `ended_at_ms` son offsets absolutos desde el inicio de la
    sesion. En el schema v1 los tiempos eran relativos a cada trazo, lo que hacia
    imposible medir las pausas entre trazos (error E-002). Aqui ya no.
    """

    stroke_index: int
    tool: Tool
    started_at_ms: int
    ended_at_ms: int
    points: tuple[Point, ...]

    @property
    def bounds(self) -> Bounds | None:
        if not self.points:
            return None
        xs = [p.x for p in self.points]
        ys = [p.y for p in self.points]
        return Bounds(min(xs), min(ys), max(xs), max(ys))


@dataclass(frozen=True, slots=True)
class Canvas:
    width: int
    height: int

    @property
    def area(self) -> float:
        return float(self.width * self.height)


@dataclass(frozen=True, slots=True)
class Drawing:
    canvas: Canvas
    strokes: tuple[Stroke, ...]
    orientation: str = "horizontal"

    @property
    def pen_strokes(self) -> tuple[Stroke, ...]:
        return tuple(s for s in self.strokes if s.tool is Tool.PEN)


# --- Medicion objetiva ------------------------------------------------------


@dataclass(frozen=True, slots=True)
class DrawingMetrics:
    """Las 7 metricas objetivas que el manual PBLL usa como indicadores."""

    total_time_ms: int
    latency_ms: int        # A-5: hasta el primer trazo
    stroke_count: int
    pressure_avg: float    # 0.0 a 1.0
    pause_count: int       # A-5: pausas por encima del umbral
    erase_count: int       # B-3
    area_pct: float        # A-1: fraccion de hoja ocupada, 0.0 a 1.0
    sequence_start: str | None = None  # A-6: primera parte dibujada

    @property
    def strokes_per_second(self) -> float:
        if self.total_time_ms <= 0:
            return 0.0
        return self.stroke_count / (self.total_time_ms / 1000)


# --- Indicadores ------------------------------------------------------------


@dataclass(frozen=True, slots=True)
class IndicatorSuggestion:
    """Lo que el dominio propone. Siempre `suggestion`: nada entra al informe sin
    que el examinador lo valide."""

    code: str
    confidence: Confidence
    evidence: str  # la medicion legible que la disparo

    status: IndicatorStatus = IndicatorStatus.SUGGESTION


@dataclass(frozen=True, slots=True)
class CatalogEntry:
    """Un indicador del manual, tal como vive en `indicator_catalog`."""

    code: str
    section_code: str      # 'A-1', 'B-9', 'C', 'D'
    section_name: str      # 'Dimensiones'
    category_code: str     # 'A' | 'B' | 'C' | 'D'
    title: str
    interpretation: str
    detection_type: DetectionType


@dataclass(frozen=True, slots=True)
class ValidatedIndicator:
    """Un indicador ya validado por el examinador, listo para el informe."""

    entry: CatalogEntry
    evidence: str | None = None


# --- Informe ----------------------------------------------------------------

REPORT_SECTIONS: tuple[tuple[int, str, bool], ...] = (
    # (numero, titulo, necesita_llm)
    (1, "Datos de identificacion", False),
    (2, "Motivo de evaluacion", False),
    (3, "Instrumento aplicado", False),
    (4, "Condiciones de administracion", False),
    (5, "Descripcion del dibujo", True),
    (6, "Observaciones conductuales", True),
    (7, "Indicadores de recursos expresivos", True),
    (8, "Indicadores de contenido", True),
    (9, "Conclusiones del profesional", False),  # se entrega vacia, a proposito
)

CONCLUSIONS_SECTION = 9
"""La seccion 9 la escribe el psicologo. El sistema no emite conclusiones
diagnosticas: es la linea que el Capitulo 1 del proyecto declara y defiende."""


@dataclass(frozen=True, slots=True)
class ReportSection:
    section_number: int
    title: str
    content: str
    is_ai_generated: bool = False
