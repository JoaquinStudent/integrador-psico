"""Tests de la composicion del informe. Sin base de datos, sin red, sin mocks.

Que estos tests puedan correr asi es la consecuencia practica de que el dominio no
llame al LLM: `compose_report` recibe datos y devuelve secciones.

Los tres que importan de verdad son los que prueban que **el sistema no inventa
contenido clinico**: sin indicadores validados las secciones 7 y 8 salen vacias, y
la 9 sale vacia siempre.
"""

from __future__ import annotations

import datetime as dt

from psicograma.domain.model import (
    CatalogEntry,
    ComposedReport,
    ConsentSummary,
    DetectionType,
    DrawingMetrics,
    ReportContext,
    ValidatedIndicator,
)
from psicograma.domain.services.compose_report import (
    compose_report,
    edad_en_anios_y_meses,
)

HOY = dt.date(2024, 5, 24)


def contexto(**cambios) -> ReportContext:
    """Contexto minimo: lo imprescindible y nada mas."""
    base = {
        "patient_name": "Alexia Rossi",
        "patient_birth_date": dt.date(2015, 8, 15),
        "patient_document": "12345678",
        "examiner_name": "Dra. Martinez",
        "test_name": "Persona bajo la lluvia",
        "test_code": "PBLL",
        "session_date": HOY,
    }
    return ReportContext(**{**base, **cambios})


def indicador(code: str, categoria: str, evidencia: str | None = None) -> ValidatedIndicator:
    return ValidatedIndicator(
        entry=CatalogEntry(
            code=code,
            section_code="A-1" if categoria == "A" else "B-9",
            section_name="Dimensiones" if categoria == "A" else "Partes del cuerpo",
            category_code=categoria,
            title=f"Titulo de {code}",
            interpretation=f"Interpretacion de {code}",
            detection_type=DetectionType.AUTO,
        ),
        evidence=evidencia,
    )


def seccion(informe: ComposedReport, numero: int):
    for s in informe.ready:
        if s.section_number == numero:
            return s
    return None


def pedido(informe: ComposedReport, numero: int):
    for d in informe.to_draft:
        if d.section_number == numero:
            return d
    return None


# =============================================================================
# Los tres que prueban la regla clinica
# =============================================================================


def test_siempre_hay_nueve_secciones():
    """Con el contexto mas pobre posible: sin metricas, sin validados, sin notas."""
    informe = compose_report(contexto())
    assert informe.section_count == 9
    numeros = sorted(
        [s.section_number for s in informe.ready] + [d.section_number for d in informe.to_draft]
    )
    assert numeros == [1, 2, 3, 4, 5, 6, 7, 8, 9]


def test_la_seccion_nueve_llega_siempre_vacia():
    """En todos los casos, sin excepcion: la conclusion la escribe el psicologo."""
    casos = [
        contexto(),
        contexto(validated=(indicador("DIM-01", "A"), indicador("CUE-05", "B"))),
        contexto(metrics=metricas(), observations="Notas del examinador"),
    ]
    for ctx in casos:
        s9 = seccion(compose_report(ctx), 9)
        assert s9 is not None, "la 9 nunca se pide redactar"
        assert s9.content == ""


def test_sin_validados_las_secciones_siete_y_ocho_salen_vacias():
    """El test que mas importa del sprint.

    Sin indicadores validados **no se emite pedido de redaccion**. Que el sistema
    no invente no depende de que la capa de aplicacion se acuerde.
    """
    informe = compose_report(contexto())

    for numero in (7, 8):
        assert pedido(informe, numero) is None, f"no debe pedirse redactar la {numero}"
        s = seccion(informe, numero)
        assert s is not None and s.content == ""


def test_con_sugerencias_sin_validar_tampoco_se_redacta():
    """`validated` es lo unico que el dominio mira. Una sugerencia pendiente no
    entra por ningun camino, porque no llega hasta aca."""
    informe = compose_report(contexto(validated=()))
    assert informe.to_draft == () or all(d.section_number == 5 for d in informe.to_draft)


# =============================================================================
# Reparto por categoria
# =============================================================================


def test_los_indicadores_se_reparten_por_categoria_del_manual():
    informe = compose_report(
        contexto(validated=(indicador("DIM-01", "A"), indicador("CUE-05", "B")))
    )
    s7, s8 = pedido(informe, 7), pedido(informe, 8)
    assert s7 is not None and s8 is not None
    assert "DIM-01" in s7.facts and "DIM-01" not in s8.facts
    assert "CUE-05" in s8.facts and "CUE-05" not in s7.facts


def test_solo_categoria_a_deja_la_ocho_vacia():
    informe = compose_report(contexto(validated=(indicador("DIM-01", "A"),)))
    assert pedido(informe, 7) is not None
    assert pedido(informe, 8) is None
    assert seccion(informe, 8).content == ""


def test_las_categorias_c_y_d_no_entran_en_ninguna_seccion():
    """Coherente con el Capitulo 1, que las excluye citando Lin et al. (2022).

    Si el motor llegara a cargarlas, el informe igual no las usa: las secciones 7 y
    8 son de categoria A y B.
    """
    informe = compose_report(
        contexto(validated=(indicador("EXP-04", "C"), indicador("DEF-03", "D")))
    )
    assert pedido(informe, 7) is None
    assert pedido(informe, 8) is None


def test_cada_indicador_cita_su_seccion_del_manual():
    """RNF-19: toda afirmacion tiene que poder verificarse contra el manual."""
    informe = compose_report(contexto(validated=(indicador("DIM-01", "A"),)))
    facts = pedido(informe, 7).facts
    assert "A-1" in facts
    assert "manual" in facts.lower()


def test_la_evidencia_de_la_medicion_llega_al_material():
    informe = compose_report(
        contexto(validated=(indicador("DIM-01", "A", evidencia="Area: 4.0% de la hoja"),))
    )
    assert "4.0%" in pedido(informe, 7).facts


def test_el_prompt_prohibe_diagnosticar():
    informe = compose_report(contexto(validated=(indicador("DIM-01", "A"),)))
    facts = pedido(informe, 7).facts.lower()
    assert "no formule diagnósticos" in facts
    assert "no agregue indicadores" in facts


# =============================================================================
# Secciones deterministas
# =============================================================================


def metricas(**cambios) -> DrawingMetrics:
    base = {
        "total_time_ms": 725_000,
        "latency_ms": 18_400,
        "stroke_count": 47,
        "pressure_avg": 0.42,
        "pause_count": 3,
        "erase_count": 5,
        "area_pct": 0.076,
    }
    return DrawingMetrics(**{**base, **cambios})


def test_identificacion_incluye_los_datos_del_mock():
    s1 = seccion(compose_report(contexto(examiner_license="12345")), 1)
    for esperado in ("Alexia Rossi", "15/08/2015", "24/05/2024", "Dra. Martinez", "12345"):
        assert esperado in s1.content


def test_sin_matricula_no_aparece_la_fila():
    s1 = seccion(compose_report(contexto()), 1)
    assert "Matrícula" not in s1.content


def test_motivo_vacio_queda_vacio():
    """No se rellena con texto generico: un parrafo de relleno en un informe
    clinico es peor que un espacio en blanco."""
    assert seccion(compose_report(contexto()), 2).content == ""
    assert seccion(compose_report(contexto(reason="  ")), 2).content == ""


def test_motivo_se_transcribe_textual():
    texto = "Derivación escolar por dificultades atencionales."
    assert seccion(compose_report(contexto(reason=texto)), 2).content == texto


def test_instrumento_nombra_el_test():
    s3 = seccion(compose_report(contexto()), 3).content
    assert "Persona bajo la lluvia" in s3 and "PBLL" in s3


def test_condiciones_arma_prosa_con_los_datos_de_la_sesion():
    ctx = contexto(
        session_duration_min=12,
        consent=ConsentSummary(
            audio_authorized=True,
            digital_authorized=True,
            confidential_ack=True,
            signed_at=HOY,
        ),
        attitudes=("Colaborador", "Ansioso"),
    )
    s4 = seccion(compose_report(ctx), 4).content
    assert "24/05/2024" in s4
    assert "12 minutos" in s4
    assert "consentimiento informado" in s4
    assert "grabación de audio" in s4
    assert "colaborador, ansioso" in s4


def test_condiciones_declara_cuando_no_se_autorizo_audio():
    ctx = contexto(
        consent=ConsentSummary(
            audio_authorized=False, digital_authorized=True, confidential_ack=True
        )
    )
    s4 = seccion(compose_report(ctx), 4).content
    assert "el uso del medio digital" in s4
    assert "grabación de audio" not in s4.replace("No se autorizó la grabación de audio.", "")


def test_observaciones_no_se_parafrasean():
    """El dato es del profesional: reescribirlo puede cambiar su significado."""
    notas = "Tono de voz bajo al responder consignas. Contacto visual intermitente."
    s6 = seccion(compose_report(contexto(observations=notas)), 6).content
    assert notas in s6


def test_observaciones_anexan_marcas_con_su_tiempo():
    ctx = contexto(
        observations="Colaboradora.",
        quick_marks=(("Pausa prolongada", 125_000), ("Uso borrador", 310_000)),
    )
    s6 = seccion(compose_report(ctx), 6).content
    assert "Pausa prolongada (02:05)" in s6
    assert "Uso borrador (05:10)" in s6


def test_observaciones_anexan_verbalizaciones():
    ctx = contexto(verbalizations=("No sé cómo dibujar la lluvia.",))
    assert "No sé cómo dibujar la lluvia." in seccion(compose_report(ctx), 6).content


def test_observaciones_vacias_quedan_vacias():
    assert seccion(compose_report(contexto()), 6).content == ""


# =============================================================================
# Seccion 5: metricas
# =============================================================================


def test_sin_metricas_la_cinco_no_miente():
    """Sin medicion la seccion sale vacia, no con ceros: un "0% de la hoja" seria
    un dato falso, y en un informe clinico eso es peor que un hueco."""
    informe = compose_report(contexto(metrics=None))
    assert pedido(informe, 5) is None
    assert seccion(informe, 5).content == ""


def test_con_metricas_se_pide_redactar_y_el_material_las_trae():
    informe = compose_report(contexto(metrics=metricas()))
    d5 = pedido(informe, 5)
    assert d5 is not None
    assert "7.6%" in d5.facts          # area
    assert "12 min" in d5.facts        # tiempo total
    assert "18.4 s" in d5.facts        # latencia
    assert "47" in d5.facts            # trazos
    assert "5" in d5.facts             # borrados


def test_el_material_de_la_cinco_prohibe_interpretar():
    d5 = pedido(compose_report(contexto(metrics=metricas())), 5)
    assert "sin interpretarlas" in d5.facts


def test_metricas_en_cero_no_generan_filas_falsas():
    informe = compose_report(
        contexto(metrics=metricas(pause_count=0, erase_count=0, pressure_avg=0.0))
    )
    facts = pedido(informe, 5).facts
    assert "Pausas" not in facts
    assert "Borrados" not in facts
    assert "Presión" not in facts


# =============================================================================
# Edad
# =============================================================================


def test_edad_en_anios_y_meses():
    assert edad_en_anios_y_meses(dt.date(2015, 8, 15), dt.date(2024, 5, 24)) == "8 años, 9 meses"


def test_edad_en_anios_exactos():
    assert edad_en_anios_y_meses(dt.date(2015, 5, 24), dt.date(2024, 5, 24)) == "9 años"


def test_edad_antes_del_dia_del_mes_no_cuenta_el_mes():
    assert edad_en_anios_y_meses(dt.date(2015, 5, 25), dt.date(2024, 5, 24)) == "8 años, 11 meses"


def test_edad_de_un_mes():
    assert edad_en_anios_y_meses(dt.date(2024, 4, 24), dt.date(2024, 5, 24)) == "1 mes"


def test_edad_nunca_es_negativa():
    """Defensivo: el esquema ya impide fechas futuras, pero el dominio no depende
    de esa validacion para no romperse."""
    assert edad_en_anios_y_meses(dt.date(2030, 1, 1), HOY) == "0 meses"


# =============================================================================
# Determinismo
# =============================================================================


def test_dos_llamadas_con_el_mismo_contexto_dan_lo_mismo():
    ctx = contexto(
        metrics=metricas(),
        observations="Notas",
        validated=(indicador("DIM-01", "A"), indicador("CUE-05", "B")),
    )
    assert compose_report(ctx) == compose_report(ctx)


def test_las_secciones_salen_ordenadas():
    informe = compose_report(contexto(metrics=metricas(), validated=(indicador("DIM-01", "A"),)))
    assert [s.section_number for s in informe.ready] == sorted(
        s.section_number for s in informe.ready
    )
    assert [d.section_number for d in informe.to_draft] == sorted(
        d.section_number for d in informe.to_draft
    )


def test_ninguna_seccion_lista_se_marca_como_generada_por_ia():
    """Lo que sale por plantilla no es IA, y el editor tiene que poder distinguirlo."""
    informe = compose_report(contexto(metrics=metricas()))
    assert all(not s.is_ai_generated for s in informe.ready)
