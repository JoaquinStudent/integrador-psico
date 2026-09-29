"""Tests del nucleo de dominio. Sin base de datos, sin HTTP, sin red.

Que puedan correr asi es la consecuencia practica de la arquitectura hexagonal:
la logica del manual PBLL se prueba sin levantar nada.
"""

from __future__ import annotations

from psicograma.domain.model import Canvas, Drawing, Point, Stroke, Tool
from psicograma.domain.services import evaluate, measure, strokes_bounds
from psicograma.domain.services.measure_drawing import PAUSE_THRESHOLD_MS

CANVAS = Canvas(width=1000, height=800)


def stroke(idx: int, x0: float, y0: float, x1: float, y1: float,
           start: int, end: int, pressure: float | None = 0.5,
           tool: Tool = Tool.PEN) -> Stroke:
    return Stroke(
        stroke_index=idx,
        tool=tool,
        started_at_ms=start,
        ended_at_ms=end,
        points=(Point(x0, y0, start, pressure), Point(x1, y1, end, pressure)),
    )


def drawing(*strokes: Stroke) -> Drawing:
    return Drawing(canvas=CANVAS, strokes=strokes)


# --- Medicion ---------------------------------------------------------------


def test_latencia_es_el_inicio_del_primer_trazo():
    d = drawing(stroke(0, 10, 10, 20, 20, start=18_000, end=19_000))
    assert measure(d, session_duration_ms=30_000).latency_ms == 18_000


def test_sin_trazos_no_revienta():
    m = measure(drawing(), session_duration_ms=5_000)
    assert m.stroke_count == 0
    assert m.area_pct == 0.0
    assert m.pressure_avg == 0.0
    assert m.latency_ms == 0


def test_el_borrador_no_cuenta_como_trazo_ni_entra_en_la_caja():
    d = drawing(
        stroke(0, 100, 100, 200, 200, 0, 500),
        stroke(1, 900, 700, 950, 750, 600, 900, tool=Tool.ERASER),
    )
    m = measure(d, session_duration_ms=1_000)
    assert m.stroke_count == 1
    assert m.erase_count == 1
    b = strokes_bounds(d)
    assert b == b.__class__(left=100, top=100, right=200, bottom=200)


def test_pausas_usan_offsets_absolutos_entre_trazos():
    """Regresion de E-002: la version TS medía el hueco con tiempos relativos a
    cada trazo, por lo que no detectaba pausas reales."""
    gap = PAUSE_THRESHOLD_MS + 1_000
    d = drawing(
        stroke(0, 0, 0, 10, 10, start=0, end=1_000),
        stroke(1, 20, 20, 30, 30, start=1_000 + gap, end=2_000 + gap),
    )
    assert measure(d, session_duration_ms=60_000).pause_count == 1


def test_trazos_consecutivos_sin_hueco_no_son_pausa():
    d = drawing(
        stroke(0, 0, 0, 10, 10, start=0, end=1_000),
        stroke(1, 20, 20, 30, 30, start=1_100, end=2_000),
    )
    assert measure(d, session_duration_ms=60_000).pause_count == 0


def test_area_pct_no_pasa_de_1():
    d = drawing(stroke(0, -500, -500, 5_000, 5_000, 0, 1_000))
    assert measure(d, session_duration_ms=1_000).area_pct == 1.0


def test_presion_ausente_usa_el_punto_medio():
    d = drawing(stroke(0, 0, 0, 10, 10, 0, 100, pressure=None))
    assert measure(d, session_duration_ms=1_000).pressure_avg == 0.5


# --- Evaluacion de indicadores ---------------------------------------------


def codes(suggestions) -> set[str]:
    return {s.code for s in suggestions}


def test_dibujo_pequeno_dispara_dim_01():
    d = drawing(stroke(0, 0, 0, 50, 50, 0, 500))  # 2500 / 800000 = 0.3%
    m = measure(d, session_duration_ms=120_000)
    assert "DIM-01" in codes(evaluate(m, CANVAS, strokes_bounds(d)))


def test_dibujo_que_ocupa_casi_todo_dispara_dim_03():
    d = drawing(stroke(0, 0, 0, 1_000, 800, 0, 500))
    m = measure(d, session_duration_ms=120_000)
    assert "DIM-03" in codes(evaluate(m, CANVAS, strokes_bounds(d)))


def test_las_dimensiones_son_mutuamente_excluyentes():
    """Exactamente un indicador DIM por dibujo: el manual no admite dos tamanos."""
    for box in [(0, 0, 50, 50), (0, 0, 500, 500), (0, 0, 1_000, 800)]:
        d = drawing(stroke(0, *box[:2], *box[2:], 0, 500))
        m = measure(d, session_duration_ms=120_000)
        dims = [c for c in codes(evaluate(m, CANVAS, strokes_bounds(d))) if c.startswith("DIM-")]
        assert len(dims) == 1, f"caja {box} disparo {dims}"


def test_emplazamiento_derecha_y_centrado_no_coexisten():
    d = drawing(stroke(0, 800, 350, 900, 450, 0, 500))
    m = measure(d, session_duration_ms=120_000)
    got = codes(evaluate(m, CANVAS, strokes_bounds(d)))
    assert "UBI-01" in got          # derecha
    assert "UBI-05" not in got      # no centrado


def test_latencia_alta_dispara_tmp_01():
    d = drawing(stroke(0, 400, 350, 500, 450, start=20_000, end=21_000))
    m = measure(d, session_duration_ms=120_000)
    assert "TMP-01" in codes(evaluate(m, CANVAS, strokes_bounds(d)))


def test_borrados_por_encima_del_umbral_disparan_bor_01():
    strokes = [stroke(0, 400, 350, 500, 450, 0, 500)]
    strokes += [
        stroke(i, 400, 350, 410, 360, 1_000 * i, 1_000 * i + 100, tool=Tool.ERASER)
        for i in range(1, 7)
    ]
    d = drawing(*strokes)
    m = measure(d, session_duration_ms=120_000)
    assert m.erase_count == 6
    assert "BOR-01" in codes(evaluate(m, CANVAS, strokes_bounds(d)))


def test_toda_sugerencia_nace_sin_validar():
    """Ninguna sugerencia puede entrar al informe sin que el examinador la valide."""
    d = drawing(stroke(0, 400, 350, 500, 450, 0, 500))
    m = measure(d, session_duration_ms=120_000)
    suggestions = evaluate(m, CANVAS, strokes_bounds(d))
    assert suggestions
    assert all(s.status == "suggestion" for s in suggestions)
    assert all(s.evidence for s in suggestions), "cada sugerencia declara su medicion"
