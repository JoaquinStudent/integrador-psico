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


# =============================================================================
# Defensa en profundidad: el filtro de aplicacion, aislado de RLS
# =============================================================================
#
# Los tests de la API pasan tanto si el filtro existe como si no, porque RLS tapa
# igual. Estos corren el store con una conexion **que salta RLS** —el rol de la
# cadena todavia es superusuario, riesgo R-08— de modo que lo unico que puede
# proteger es el `WHERE` de la aplicacion. Si alguien lo quita, estos fallan.


@pytest.mark.asyncio
async def test_el_listado_de_sesiones_filtra_sin_depender_de_rls(
    sesion_con_dibujo, perfiles_creados
):
    from psicograma.adapter.outbound.postgres.engine import engine
    from psicograma.adapter.outbound.postgres.store import SessionStore

    _, b = perfiles_creados
    async with engine.begin() as raw:       # sin session_for: RLS no aplica
        assert await raw.scalar(
            text("select rolbypassrls from pg_roles where rolname = current_user")
        ) is True, "si el rol dejara de tener bypassrls, este test ya no prueba nada"

        rows, total = await SessionStore(raw, b.id).list_all()
        ajenas = [r for r in rows if r.created_by != b.id]
        assert not ajenas, "el listado devolvio sesiones de otro examinador"
        assert total == 0


@pytest.mark.asyncio
async def test_el_resumen_del_panel_filtra_sin_depender_de_rls(
    sesion_con_dibujo, perfiles_creados
):
    """Un conteo que suma filas ajenas filtra informacion aunque no muestre nombres:
    revela cuantos pacientes y sesiones atiende el otro profesional."""
    from psicograma.adapter.outbound.postgres.engine import engine
    from psicograma.adapter.outbound.postgres.store import SessionStore

    _, b = perfiles_creados
    async with engine.begin() as raw:
        datos = await SessionStore(raw, b.id).summary()

    assert datos["sessions_this_week"] == 0
    assert datos["active_patients"] == 0
    assert datos["recent_sessions"] == []


# =============================================================================
# Generacion del informe — el cableado router -> redactor -> store
# =============================================================================


@pytest.mark.asyncio
async def test_generar_informe_deja_las_nueve_secciones(
    db_a, sesion_con_dibujo, perfiles_creados, monkeypatch
):
    """Recorre `generate_report` de punta a punta contra la base real, con el
    redactor sustituido.

    Sin este test el unico sitio donde se descubre un error de cableado del router
    —un import que falta, un campo de mas en el dict de secciones— es el navegador
    del examinador. El redactor va monkeypatcheado porque la suite no debe salir a
    la red: que OpenRouter contesta es otro problema, y no uno que un test de
    integracion pueda garantizar.
    """
    from psicograma.adapter.inbound.http.routers import reports as router_mod
    from psicograma.adapter.outbound.postgres.store import ReportStore

    a, _ = perfiles_creados
    sid = sesion_con_dibujo["session_id"]

    # Sin metricas persistidas la 5 no pide redaccion: `compose_report` la deja vacia
    # antes que inventar un "0% de la hoja". Solo POST /analyze las escribe, asi que
    # aqui se insertan a mano.
    await db_a.execute(
        text(
            "insert into stroke_metrics (session_id, total_time_ms, latency_ms, "
            "stroke_count, pressure_avg, pause_count, erase_count, area_pct) "
            "values (:s, 372000, 4200, 142, 0.62, 4, 2, 0.59)"
        ),
        {"s": sid},
    )

    # Uno de categoria A (va a la 7) y uno de B (va a la 8): sin un validado de cada
    # categoria la seccion correspondiente sale vacia a proposito.
    repo = PostgresSessionIndicatorRepository(db_a)
    await repo.upsert_suggestions(sid, [
        IndicatorSuggestion(code="DIM-01", confidence=Confidence.HIGH, evidence="e1"),
        IndicatorSuggestion(code="CUE-01", confidence=Confidence.HIGH, evidence="e2"),
    ])
    await db_a.execute(
        text(
            "update session_indicators set status='validated', validated_by=:by, "
            "validated_at=now() where session_id=:s"
        ),
        {"by": a.id, "s": sid},
    )

    class Redactor:
        disponible = True

        async def draft_section(self, title: str, facts: str) -> str:
            return f"prosa de prueba para {title}"

    monkeypatch.setattr(router_mod, "build_drafter", Redactor)

    out = await router_mod.generate_report(sid, ReportStore(db_a, a.id))

    assert [s.section_number for s in out.sections] == list(range(1, 10))
    assert out.pending_sections == []
    assert out.llm_available is True

    # La 9 vacia y la 5/7/8 con contenido: es el reparto que define el sprint.
    por_numero = {s.section_number: s for s in out.sections}
    assert por_numero[9].content == ""
    for n in (5, 7, 8):
        assert por_numero[n].content, f"la seccion {n} quedo vacia"
        assert por_numero[n].is_ai_generated is True


@pytest.mark.asyncio
async def test_si_el_redactor_cae_la_cinco_sale_con_la_plantilla(
    db_a, sesion_con_dibujo, perfiles_creados, monkeypatch
):
    """La garantia del sprint: el informe se entrega completo sin el modelo.

    La 5 tiene version por plantilla —las mediciones listadas— y la 7 y la 8 no,
    porque son interpretacion: sin redaccion no hay nada honesto que poner ahi.
    """
    from psicograma.adapter.inbound.http.routers import reports as router_mod
    from psicograma.adapter.outbound.llm.drafter import LlmNoDisponible
    from psicograma.adapter.outbound.postgres.store import ReportStore

    a, _ = perfiles_creados
    sid = sesion_con_dibujo["session_id"]
    await db_a.execute(
        text(
            "insert into stroke_metrics (session_id, total_time_ms, latency_ms, "
            "stroke_count, pressure_avg, pause_count, erase_count, area_pct) "
            "values (:s, 372000, 4200, 142, 0.62, 4, 2, 0.59)"
        ),
        {"s": sid},
    )

    class Caido:
        disponible = False

        async def draft_section(self, title: str, facts: str) -> str:
            raise LlmNoDisponible("sin clave")

    monkeypatch.setattr(router_mod, "build_drafter", Caido)

    out = await router_mod.generate_report(sid, ReportStore(db_a, a.id))

    por_numero = {s.section_number: s for s in out.sections}
    assert out.llm_available is False
    assert out.pending_sections == [5]
    assert "142" in por_numero[5].content
    assert por_numero[5].is_ai_generated is False


# =============================================================================
# Audio: transcripcion, reintento y verbalizaciones
# =============================================================================


async def _grabacion(db, session_id, started_at_ms=None):
    """Inserta una grabacion. El archivo en Storage no hace falta: estos tests no
    bajan nada, sustituyen al transcriptor."""
    return await db.scalar(
        text(
            "insert into audio_recordings (session_id, storage_path, duration_seconds, "
            "started_at_ms) values (:s, :p, 300, :o) returning id"
        ),
        {"s": session_id, "p": f"sessions/{session_id}/audio_test.webm", "o": started_at_ms},
    )


@pytest.mark.asyncio
async def test_reintentar_la_transcripcion_no_duplica_segmentos(db_a, sesion_con_dibujo):
    """`transcript_segments` tiene UNIQUE (recording_id, segment_index).

    Reintentar tiene que ser seguro: un fallo del proveedor a mitad de camino es normal
    y el examinador va a volver a pulsar. Sin el borrado previo, el segundo intento
    reventaria con un conflicto de clave.
    """
    from psicograma.adapter.outbound.postgres.store import AudioStore

    store = AudioStore(db_a)
    rid = await _grabacion(db_a, sesion_con_dibujo["session_id"])

    primero = [(0, 2000, "no se dibujar bien"), (5000, 6000, "ya termine")]
    await store.save_segments(rid, primero)
    assert [s.text for s in await store.transcript(rid)] == [t for _, _, t in primero]

    # Segundo intento, con un resultado distinto: reemplaza, no acumula.
    segundo = [(0, 1500, "no se dibujar")]
    await store.save_segments(rid, segundo)
    filas = await store.transcript(rid)
    assert [s.text for s in filas] == ["no se dibujar"]
    assert [s.segment_index for s in filas] == [0]

    grabacion = await store.get(rid)
    assert grabacion.transcribed_at is not None


@pytest.mark.asyncio
async def test_el_offset_de_la_grabacion_alinea_el_audio_con_las_marcas(
    db_a, sesion_con_dibujo, perfiles_creados
):
    """El cruce que pedia la tarea, y la razon por la que existe la migracion 002.

    La grabacion arranca con el primer trazo, no con la sesion. Si un segmento del audio
    se leyera con su tiempo crudo, caeria en un momento distinto de la sesion que la
    marca que lo acompaña. Con `started_at_ms` los dos quedan en el mismo reloj.
    """
    from psicograma.adapter.outbound.postgres.store import AudioStore, ObservationStore

    sid = sesion_con_dibujo["session_id"]
    obs = ObservationStore(db_a)
    audio = AudioStore(db_a)

    # El paciente tardo 90 s en empezar a dibujar: ahi arranco la grabacion.
    LATENCIA = 90_000
    rid = await _grabacion(db_a, sid, started_at_ms=LATENCIA)

    # El examinador marca en el minuto 2:30 de la SESION.
    await obs.save(sid, "", [])
    await obs.add_quick_mark(sid, "pregunto_por_el_paraguas", 150_000)

    # Whisper situa la frase en el segundo 60 del AUDIO, que es el 2:30 de la sesion.
    await audio.save_segments(rid, [(60_000, 62_000, "le pongo paraguas?")])

    grabacion = await audio.get(rid)
    segmento = (await audio.transcript(rid))[0]
    en_la_sesion = grabacion.started_at_ms + segmento.start_ms

    marcas = (await obs.get(sid))["quick_marks"]
    assert en_la_sesion == marcas[0]["marked_at_ms"] == 150_000
    # Y sin el offset caeria un minuto y medio antes: el error que esto evita.
    assert segmento.start_ms != marcas[0]["marked_at_ms"]


@pytest.mark.asyncio
async def test_promover_una_frase_la_deja_en_el_informe(db_a, sesion_con_dibujo):
    """Las verbalizaciones se leian desde `compose_report` pero nadie las escribia, asi
    que el bloque "Verbalizaciones del paciente" nunca aparecia."""
    from psicograma.adapter.outbound.postgres.store import ObservationStore

    obs = ObservationStore(db_a)
    sid = sesion_con_dibujo["session_id"]

    tarde = await obs.add_verbalization(sid, "ya termine", 200_000, "transcription")
    await obs.add_verbalization(sid, "no se dibujar bien", 30_000, "transcription")

    # Orden por momento, no por cuando se eligieron: en el informe tienen que salir en
    # el orden en que se dijeron.
    assert [v.text for v in await obs.list_verbalizations(sid)] == [
        "no se dibujar bien",
        "ya termine",
    ]

    # Pulsar dos veces el mismo boton no duplica el dato en la seccion 6.
    otra_vez = await obs.add_verbalization(sid, "ya termine", 200_000, "transcription")
    assert otra_vez.id == tarde.id
    assert len(await obs.list_verbalizations(sid)) == 2

    await obs.delete_verbalization(sid, tarde.id)
    assert [v.text for v in await obs.list_verbalizations(sid)] == ["no se dibujar bien"]


@pytest.mark.asyncio
async def test_no_se_puede_borrar_una_verbalizacion_de_otra_sesion(
    db_a, sesion_con_dibujo, perfiles_creados
):
    """El `session_id` va en el WHERE del DELETE aunque el id ya sea unico: es el filtro
    de aplicacion de DT-029, la primera capa antes de RLS."""
    from psicograma.adapter.outbound.postgres.store import NotFound, ObservationStore

    obs = ObservationStore(db_a)
    sid = sesion_con_dibujo["session_id"]
    v = await obs.add_verbalization(sid, "una frase", 1000, "examiner")

    with pytest.raises(NotFound):
        await obs.delete_verbalization(uuid.uuid4(), v.id)
    assert len(await obs.list_verbalizations(sid)) == 1
