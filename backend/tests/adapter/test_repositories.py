"""Tests de integracion de los repositorios. Los escenarios de SPEC-S5-04.

El que importa de verdad es `test_rls_tapa_un_where_olvidado`: prueba que la
segunda capa de autorizacion existe. Si ese test pasa, un bug en un `WHERE` no
expone historias clinicas de otro profesional. Si falla, la unica defensa es el
codigo de la aplicacion.
"""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import text

from psicograma.adapter.outbound.postgres.repositories import (
    PostgresDrawingRepository,
    PostgresIndicatorCatalog,
    PostgresSessionIndicatorRepository,
)
from psicograma.domain.model import Confidence, DrawingMetrics, IndicatorSuggestion, Tool
from psicograma.domain.services import evaluate, measure, strokes_bounds

# =============================================================================
# Escenario 1 y 2 — propagacion de identidad y RLS
# =============================================================================


@pytest.mark.asyncio
async def test_la_transaccion_declara_la_identidad(db_a, perfiles_creados):
    a, _ = perfiles_creados
    assert await db_a.scalar(text("select auth.uid()")) == a.id
    assert await db_a.scalar(text("select current_user")) == "authenticated"


@pytest.mark.asyncio
async def test_el_rol_efectivo_no_puede_saltarse_rls(db_a):
    """Dentro de la transaccion el rol es `authenticated`, que no tiene bypassrls.

    Es lo que hace que RLS aplique aunque el rol de conexion sea superusuario.
    """
    bypass = await db_a.scalar(
        text("select rolbypassrls from pg_roles where rolname = current_user")
    )
    assert bypass is False


@pytest.mark.asyncio
async def test_rls_tapa_un_where_olvidado(db_b, sesion_con_dibujo):
    """El examinador B consulta pacientes SIN filtrar por dueno.

    Aun asi no ve el paciente de A. La proteccion viene de la policy, no del
    codigo de la aplicacion.
    """
    filas = (await db_b.execute(text("select id from patients"))).scalars().all()
    assert sesion_con_dibujo["patient_id"] not in filas


@pytest.mark.asyncio
async def test_el_dueno_si_ve_lo_suyo(db_a, sesion_con_dibujo):
    filas = (await db_a.execute(text("select id from patients"))).scalars().all()
    assert sesion_con_dibujo["patient_id"] in filas


# =============================================================================
# Escenario 5 — lectura del dibujo
# =============================================================================


@pytest.mark.asyncio
async def test_el_dibujo_llega_con_los_trazos_ordenados(db_a, sesion_con_dibujo):
    repo = PostgresDrawingRepository(db_a)
    dibujo = await repo.get_drawing(sesion_con_dibujo["session_id"])

    assert dibujo is not None
    assert dibujo.canvas.width == 1000
    assert dibujo.canvas.height == 800
    assert [s.stroke_index for s in dibujo.strokes] == [0, 1, 2]
    assert [s.tool for s in dibujo.strokes] == [Tool.PEN, Tool.PEN, Tool.ERASER]
    assert dibujo.strokes[0].points[0].pressure == pytest.approx(0.5)


@pytest.mark.asyncio
async def test_el_dominio_mide_sobre_lo_que_devuelve_el_repositorio(db_a, sesion_con_dibujo):
    """La prueba de que la frontera funciona: el servicio de dominio consume lo
    que sale del repositorio sin saber que hubo una base de datos."""
    dibujo = await PostgresDrawingRepository(db_a).get_drawing(
        sesion_con_dibujo["session_id"]
    )
    metricas = measure(dibujo, session_duration_ms=25_000)

    assert metricas.stroke_count == 2      # el borrador no cuenta como trazo
    assert metricas.erase_count == 1
    assert metricas.latency_ms == 2_000    # primer trazo a los 2 s
    assert metricas.pause_count == 1       # el hueco antes del borrador

    sugerencias = evaluate(metricas, dibujo.canvas, strokes_bounds(dibujo))
    assert sugerencias
    assert all(s.status == "suggestion" for s in sugerencias)


@pytest.mark.asyncio
async def test_dibujo_inexistente_devuelve_none(db_a):
    repo = PostgresDrawingRepository(db_a)
    assert await repo.get_drawing(uuid.uuid4()) is None


# =============================================================================
# Metricas
# =============================================================================


@pytest.mark.asyncio
async def test_guardar_metricas_es_idempotente(db_a, sesion_con_dibujo):
    """Recalcular el analisis sobreescribe, no acumula filas."""
    repo = PostgresDrawingRepository(db_a)
    sid = sesion_con_dibujo["session_id"]

    await repo.save_metrics(sid, DrawingMetrics(
        total_time_ms=1000, latency_ms=10, stroke_count=1, pressure_avg=0.4,
        pause_count=0, erase_count=0, area_pct=0.1))
    await repo.save_metrics(sid, DrawingMetrics(
        total_time_ms=2000, latency_ms=20, stroke_count=2, pressure_avg=0.6,
        pause_count=1, erase_count=1, area_pct=0.2))

    n = await db_a.scalar(
        text("select count(*) from stroke_metrics where session_id = :s"), {"s": sid}
    )
    assert n == 1

    leidas = await repo.get_metrics(sid)
    assert leidas.total_time_ms == 2000
    assert leidas.stroke_count == 2


# =============================================================================
# Escenario 6 — catalogo del manual
# =============================================================================


@pytest.mark.asyncio
async def test_catalogo_devuelve_la_seccion_y_la_categoria(db_a):
    entrada = await PostgresIndicatorCatalog(db_a).get("DIM-01")
    assert entrada is not None
    assert entrada.section_code == "A-1"
    assert entrada.section_name == "Dimensiones"
    assert entrada.category_code == "A"
    assert entrada.detection_type == "auto"
    assert entrada.interpretation


@pytest.mark.asyncio
async def test_catalogo_completo_del_pbll(db_a):
    entradas = await PostgresIndicatorCatalog(db_a).list_for_test("PBLL")
    assert len(entradas) == 201
    assert len({e.section_code for e in entradas}) == 18
    assert {e.category_code for e in entradas} == {"A", "B", "C", "D"}


@pytest.mark.asyncio
async def test_codigo_inexistente_devuelve_none(db_a):
    assert await PostgresIndicatorCatalog(db_a).get("NO-EXISTE") is None


# =============================================================================
# Escenarios 7 y 8 — indicadores de sesion
# =============================================================================


@pytest.mark.asyncio
async def test_upsert_de_sugerencias_no_duplica(db_a, sesion_con_dibujo):
    repo = PostgresSessionIndicatorRepository(db_a)
    sid = sesion_con_dibujo["session_id"]
    sugerencias = [
        IndicatorSuggestion(code="DIM-01", confidence=Confidence.HIGH, evidence="area 4%"),
        IndicatorSuggestion(code="PRE-01", confidence=Confidence.HIGH, evidence="presion 0.50"),
    ]

    await repo.upsert_suggestions(sid, sugerencias)
    await repo.upsert_suggestions(sid, sugerencias)

    n = await db_a.scalar(
        text("select count(*) from session_indicators where session_id = :s"), {"s": sid}
    )
    assert n == 2


@pytest.mark.asyncio
async def test_reanalizar_no_pisa_lo_que_el_examinador_valido(
    db_a, sesion_con_dibujo, perfiles_creados
):
    """Si el examinador ya valido un indicador, recalcular no lo devuelve a
    `suggestion`. Sin esta condicion, reanalizar borraria trabajo humano."""
    a, _ = perfiles_creados
    repo = PostgresSessionIndicatorRepository(db_a)
    sid = sesion_con_dibujo["session_id"]
    sug = [IndicatorSuggestion(code="DIM-01", confidence=Confidence.HIGH, evidence="area 4%")]

    await repo.upsert_suggestions(sid, sug)
    await db_a.execute(
        text(
            "update session_indicators set status='validated', validated_by=:by, "
            "validated_at=now() where session_id=:s and indicator_code='DIM-01'"
        ),
        {"by": a.id, "s": sid},
    )

    await repo.upsert_suggestions(sid, sug)

    estado = await db_a.scalar(
        text(
            "select status from session_indicators "
            "where session_id=:s and indicator_code='DIM-01'"
        ),
        {"s": sid},
    )
    assert estado == "validated"


@pytest.mark.asyncio
async def test_solo_los_validados_salen_para_el_informe(
    db_a, sesion_con_dibujo, perfiles_creados
):
    """Es la regla que sostiene que el sistema no diagnostica: el generador del
    informe solo recibe lo que el profesional valido."""
    a, _ = perfiles_creados
    repo = PostgresSessionIndicatorRepository(db_a)
    sid = sesion_con_dibujo["session_id"]

    await repo.upsert_suggestions(sid, [
        IndicatorSuggestion(code="DIM-01", confidence=Confidence.HIGH, evidence="e1"),
        IndicatorSuggestion(code="PRE-01", confidence=Confidence.HIGH, evidence="e2"),
        IndicatorSuggestion(code="TMP-04", confidence=Confidence.LOW, evidence="e3"),
    ])
    await db_a.execute(
        text(
            "update session_indicators set status='validated', validated_by=:by, "
            "validated_at=now() where session_id=:s and indicator_code='DIM-01'"
        ),
        {"by": a.id, "s": sid},
    )
    await db_a.execute(
        text(
            "update session_indicators set status='rejected', validated_by=:by, "
            "validated_at=now() where session_id=:s and indicator_code='PRE-01'"
        ),
        {"by": a.id, "s": sid},
    )

    validados = await repo.list_validated(sid)

    assert [v.entry.code for v in validados] == ["DIM-01"]
    assert validados[0].entry.section_name == "Dimensiones"
    assert validados[0].evidence == "e1"


@pytest.mark.asyncio
async def test_sin_validados_la_lista_sale_vacia(db_a, sesion_con_dibujo):
    repo = PostgresSessionIndicatorRepository(db_a)
    await repo.upsert_suggestions(
        sesion_con_dibujo["session_id"],
        [IndicatorSuggestion(code="DIM-01", confidence=Confidence.HIGH, evidence="e")],
    )
    assert await repo.list_validated(sesion_con_dibujo["session_id"]) == []


# =============================================================================
# Escenario 9 — sesion de otro examinador
# =============================================================================


@pytest.mark.asyncio
async def test_el_dibujo_de_otro_examinador_no_se_lee(db_b, sesion_con_dibujo):
    repo = PostgresDrawingRepository(db_b)
    assert await repo.get_drawing(sesion_con_dibujo["session_id"]) is None


@pytest.mark.asyncio
async def test_los_indicadores_de_otro_examinador_no_se_leen(
    db_a, db_b, sesion_con_dibujo, perfiles_creados
):
    a, _ = perfiles_creados
    sid = sesion_con_dibujo["session_id"]

    await PostgresSessionIndicatorRepository(db_a).upsert_suggestions(
        sid, [IndicatorSuggestion(code="DIM-01", confidence=Confidence.HIGH, evidence="e")]
    )
    await db_a.execute(
        text(
            "update session_indicators set status='validated', validated_by=:by, "
            "validated_at=now() where session_id=:s"
        ),
        {"by": a.id, "s": sid},
    )
    await db_a.commit()

    assert await PostgresSessionIndicatorRepository(db_b).list_validated(sid) == []
