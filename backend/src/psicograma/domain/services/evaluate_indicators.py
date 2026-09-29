"""Capa 2 del analisis: cruce de las metricas con los indicadores `auto` del manual.

Port de `frontend/src/lib/objectiveMeasurement.ts`. Determinista y sin LLM: cada
sugerencia sale de un umbral explicito y lleva la medicion que la disparo, de modo
que el examinador pueda discutirla. El LLM solo entra despues, para los `semi`.

Cubre DIM (A-1), UBI (A-2), PRE (A-4), TMP (A-5) y BOR (B-3).
"""

from __future__ import annotations

from dataclasses import dataclass

from ..model import Bounds, Canvas, Confidence, DrawingMetrics, IndicatorSuggestion


@dataclass(frozen=True, slots=True)
class Thresholds:
    """Perillas de calibracion, no constantes del dominio.

    El manual PBLL describe estos criterios en terminos de proporcion o intensidad
    ("dibujo pequeno", "presion debil") sin dar valores numericos — es la limitacion
    tecnica que el Capitulo 1 reconoce. Estos valores son el punto de partida
    heredado de la version TS; se ajustan con sesiones reales del centro.
    """

    area_pct_small: float = 0.08
    area_pct_large: float = 0.45
    area_pct_very_large: float = 0.70

    pressure_weak: float = 0.30
    pressure_strong: float = 0.70
    pressure_very_strong: float = 0.85

    latency_high_ms: int = 15_000
    total_time_low_ms: int = 60_000
    total_time_high_ms: int = 600_000
    total_time_very_high_ms: int = 900_000

    pause_count_high: int = 3
    erase_count_high: int = 5

    strokes_per_sec_fast: float = 0.15
    strokes_per_sec_slow: float = 0.03

    # A-2: margenes relativos del centro del dibujo sobre la hoja.
    margin_right: float = 0.65
    margin_left: float = 0.35
    margin_top: float = 0.33
    margin_bottom: float = 0.67


DEFAULT_THRESHOLDS = Thresholds()


def evaluate(
    metrics: DrawingMetrics,
    canvas: Canvas,
    bounds: Bounds | None,
    thresholds: Thresholds = DEFAULT_THRESHOLDS,
) -> list[IndicatorSuggestion]:
    t = thresholds
    out: list[IndicatorSuggestion] = []

    def add(code: str, confidence: Confidence, evidence: str) -> None:
        out.append(IndicatorSuggestion(code=code, confidence=confidence, evidence=evidence))

    # --- A-1 Dimensiones ---------------------------------------------------
    area = f"Area: {metrics.area_pct * 100:.1f}% de la hoja"
    if metrics.area_pct <= t.area_pct_small:
        add("DIM-01", Confidence.HIGH, area)          # dibujo pequeno
    elif metrics.area_pct >= t.area_pct_very_large:
        add("DIM-03", Confidence.HIGH, area)          # muy grande
    elif metrics.area_pct >= t.area_pct_large:
        add("DIM-02", Confidence.MEDIUM, area)        # grande
    else:
        add("DIM-04", Confidence.HIGH, area)          # mediano

    # --- A-2 Emplazamiento -------------------------------------------------
    if bounds is not None and canvas.width > 0 and canvas.height > 0:
        rel_x = ((bounds.left + bounds.right) / 2) / canvas.width
        rel_y = ((bounds.top + bounds.bottom) / 2) / canvas.height
        pos = f"Centro: {rel_x * 100:.0f}%, {rel_y * 100:.0f}%"

        if rel_x > t.margin_right:
            add("UBI-01", Confidence.HIGH, f"{pos} (derecha)")
        elif rel_x < t.margin_left:
            add("UBI-02", Confidence.HIGH, f"{pos} (izquierda)")

        if rel_y < t.margin_top:
            add("UBI-03", Confidence.HIGH, f"{pos} (superior)")
        elif rel_y > t.margin_bottom:
            add("UBI-04", Confidence.HIGH, f"{pos} (inferior)")

        centered = (
            t.margin_left <= rel_x <= t.margin_right
            and t.margin_top <= rel_y <= t.margin_bottom
        )
        if centered:
            add("UBI-05", Confidence.HIGH, f"{pos} (centrado)")

    # --- A-4 Presion -------------------------------------------------------
    p = metrics.pressure_avg
    sps = metrics.strokes_per_second
    if p > 0:
        if p < t.pressure_weak and sps > t.strokes_per_sec_fast:
            add("PRE-02", Confidence.MEDIUM, f"Presion {p:.2f}, velocidad {sps:.2f} trazos/s")
        elif p < t.pressure_weak:
            add("PRE-03", Confidence.MEDIUM, f"Presion {p:.2f} (debil)")
        elif p >= t.pressure_very_strong:
            add("PRE-06", Confidence.HIGH, f"Presion {p:.2f} (muy fuerte)")
        elif p >= t.pressure_strong:
            add("PRE-04", Confidence.MEDIUM, f"Presion {p:.2f} (fuerte)")
        else:
            add("PRE-01", Confidence.HIGH, f"Presion {p:.2f} (normal)")

    # --- A-5 Tiempo --------------------------------------------------------
    if metrics.latency_ms > t.latency_high_ms:
        add("TMP-01", Confidence.HIGH,
            f"Latencia {metrics.latency_ms / 1000:.1f}s hasta el primer trazo")

    if metrics.pause_count >= t.pause_count_high:
        add("TMP-03", Confidence.MEDIUM, f"{metrics.pause_count} pausas detectadas")

    secs = metrics.total_time_ms / 1000
    if metrics.total_time_ms < t.total_time_low_ms and metrics.stroke_count > 5:
        add("TMP-07", Confidence.MEDIUM, f"Precipitada: {secs:.0f}s, {metrics.stroke_count} trazos")
    elif sps > t.strokes_per_sec_fast:
        add("TMP-06", Confidence.MEDIUM, f"Rapida: {sps:.2f} trazos/s")
    elif sps < t.strokes_per_sec_slow and metrics.total_time_ms > t.total_time_high_ms:
        add("TMP-05", Confidence.MEDIUM, f"Lenta: {secs / 60:.1f} min, {sps:.3f} trazos/s")
    elif metrics.total_time_ms > 0:
        add("TMP-04", Confidence.LOW, f"Velocidad normal: {secs:.0f}s")

    if metrics.total_time_ms > t.total_time_very_high_ms:
        add("TMP-02", Confidence.MEDIUM,
            f"Tiempo total {secs / 60:.1f} min (dificultad para concluir)")

    # --- B-3 Borrados ------------------------------------------------------
    if metrics.erase_count >= t.erase_count_high:
        add("BOR-01", Confidence.HIGH, f"{metrics.erase_count} borrados")

    return out
