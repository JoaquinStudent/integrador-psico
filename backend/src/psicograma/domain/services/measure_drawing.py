"""Capa 1 del analisis: medicion objetiva. Determinista, sin LLM.

Port de `frontend/src/canvas/metricsCalculator.ts`. Cambia una cosa a proposito:
las pausas se miden con offsets absolutos entre trazos, no con el tiempo relativo
dentro de cada trazo. Eso corrige el error E-002 documentado en `sdd/memory.md`,
que la version TS marcaba como aproximacion aceptable para el MVP.
"""

from __future__ import annotations

from ..model import Bounds, Drawing, DrawingMetrics, Tool

DEFAULT_PRESSURE = 0.5
"""Cuando el lapiz no reporta presion. El stylus de la tablet si la reporta; un
raton no. No se inventa un valor mas alto: 0.5 es el punto medio y deja el
indicador de presion en 'normal' en vez de sesgarlo."""

PAUSE_THRESHOLD_MS = 3_000
"""Hueco entre el fin de un trazo y el inicio del siguiente que cuenta como pausa.
El manual (A-5, 'momentos de quietud') no da un valor numerico: es una perilla de
calibracion, no una constante del dominio. Ajustar con sesiones reales."""


def strokes_bounds(drawing: Drawing) -> Bounds | None:
    """Caja que contiene el dibujo. Solo trazos de lapiz: el borrador no dibuja."""
    boxes = [b for s in drawing.pen_strokes if (b := s.bounds) is not None]
    if not boxes:
        return None
    return Bounds(
        left=min(b.left for b in boxes),
        top=min(b.top for b in boxes),
        right=max(b.right for b in boxes),
        bottom=max(b.bottom for b in boxes),
    )


def measure(drawing: Drawing, session_duration_ms: int) -> DrawingMetrics:
    pen = drawing.pen_strokes
    erase_count = sum(1 for s in drawing.strokes if s.tool is Tool.ERASER)

    # A-5: latencia hasta el primer trazo.
    latency_ms = pen[0].started_at_ms if pen else 0

    # A-4: presion promedio sobre todos los puntos de lapiz.
    pressures = [
        p.pressure if p.pressure is not None else DEFAULT_PRESSURE
        for s in pen
        for p in s.points
    ]
    pressure_avg = sum(pressures) / len(pressures) if pressures else 0.0

    # A-5: pausas. Con offsets absolutos el hueco es real.
    ordered = sorted(drawing.strokes, key=lambda s: s.started_at_ms)
    pause_count = sum(
        1
        for prev, cur in zip(ordered, ordered[1:], strict=False)
        if cur.started_at_ms - prev.ended_at_ms > PAUSE_THRESHOLD_MS
    )

    # A-1: fraccion de hoja ocupada por la caja del dibujo.
    area_pct = 0.0
    if (b := strokes_bounds(drawing)) is not None and drawing.canvas.area > 0:
        area_pct = min((b.width * b.height) / drawing.canvas.area, 1.0)

    return DrawingMetrics(
        total_time_ms=max(session_duration_ms, 0),
        latency_ms=latency_ms,
        stroke_count=len(pen),
        pressure_avg=pressure_avg,
        pause_count=pause_count,
        erase_count=erase_count,
        area_pct=area_pct,
        sequence_start=None,  # A-6: requiere reconocer partes del cuerpo. Fuera del MVP.
    )
