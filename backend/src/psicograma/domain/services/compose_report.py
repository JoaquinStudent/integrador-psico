"""Composicion del borrador de informe. Sincrono, puro y determinista.

**No recibe el `LlmDrafter`.** Devuelve dos cosas: las secciones que ya estan
listas y los pedidos de redaccion para las que hacen falta. La capa de aplicacion
resuelve esos pedidos contra el puerto.

Esa separacion compra la garantia que sostiene el proyecto: **si no hay
indicadores validados, no se emite pedido de redaccion**, se emite una seccion
vacia. Que el sistema no invente contenido clinico no queda a criterio de la capa
de aplicacion, y se prueba sin mockear nada.

Seis de las nueve secciones son deterministas. La 5, la 7 y la 8 son las unicas
que piden redaccion, y la 5 ademas trae una version por plantilla, de modo que el
informe esta completo aunque el proveedor de LLM no responda.

Los literales van **con acentos**: son el texto del documento clinico que lee el
profesional y que se entrega al paciente (RNF-21). La convencion sin acentos del
repo aplica a identificadores y comentarios, no al contenido.
"""

from __future__ import annotations

import datetime as dt

from ..model import (
    CONCLUSIONS_SECTION,
    REPORT_SECTIONS,
    ComposedReport,
    DraftRequest,
    DrawingMetrics,
    ReportContext,
    ReportSection,
    ValidatedIndicator,
)

SIN_DATO = ""
"""Una seccion sin material sale vacia. No se rellena con texto generico: un
parrafo de relleno en un informe clinico es peor que un espacio en blanco, porque
el lector no distingue lo que falta de lo que se midio."""


# --- Utilidades --------------------------------------------------------------


def edad_en_anios_y_meses(nacimiento: dt.date, referencia: dt.date) -> str:
    """Edad como la escribe un psicologo: "8 años, 9 meses".

    Los meses importan: en evaluacion infantil la diferencia de unos meses cambia
    la interpretacion de un indicador, asi que no se redondea a anios.
    """
    meses = (referencia.year - nacimiento.year) * 12 + (referencia.month - nacimiento.month)
    if referencia.day < nacimiento.day:
        meses -= 1
    meses = max(meses, 0)

    anios, resto = divmod(meses, 12)
    if anios and resto:
        return f"{anios} años, {resto} {'mes' if resto == 1 else 'meses'}"
    if anios:
        return f"{anios} {'año' if anios == 1 else 'años'}"
    return f"{resto} {'mes' if resto == 1 else 'meses'}"


def _fecha(d: dt.date) -> str:
    return d.strftime("%d/%m/%Y")


def _titulo(numero: int) -> str:
    return next(t for n, t, _ in REPORT_SECTIONS if n == numero)


def _lista(items: list[str]) -> str:
    return "\n".join(f"- {i}" for i in items)


def _mmss(ms: int) -> str:
    total = ms // 1000
    return f"{total // 60:02d}:{total % 60:02d}"


# --- Secciones deterministas -------------------------------------------------


def _s1_identificacion(ctx: ReportContext) -> str:
    filas = [
        ("Nombre", ctx.patient_name),
        ("Documento", ctx.patient_document),
        ("Fecha de nacimiento", _fecha(ctx.patient_birth_date)),
        ("Edad", edad_en_anios_y_meses(ctx.patient_birth_date, ctx.session_date)),
        ("Fecha de evaluación", _fecha(ctx.session_date)),
        ("Profesional", ctx.examiner_name),
    ]
    if ctx.examiner_license:
        filas.append(("Matrícula", ctx.examiner_license))
    return "\n".join(f"{k}: {v}" for k, v in filas)


def _s2_motivo(ctx: ReportContext) -> str:
    # Textual. Si el examinador no declaro motivo, la seccion queda vacia para que
    # la complete: no se inventa uno.
    return (ctx.reason or "").strip()


def _s3_instrumento(ctx: ReportContext) -> str:
    return f"{ctx.test_name} ({ctx.test_code})"


def _s4_condiciones(ctx: ReportContext) -> str:
    """Factual: fecha, duracion, consentimiento y actitudes observadas.

    El mock marcaba esta seccion como sugerencia de IA. Va por plantilla a
    proposito: son datos estructurados, y una plantilla no puede inventar un
    detalle de la sesion que no ocurrio.
    """
    partes = [f"La evaluación se administró el {_fecha(ctx.session_date)}."]

    if ctx.session_duration_min is not None:
        partes.append(f"Duración total de la sesión: {ctx.session_duration_min} minutos.")

    c = ctx.consent
    if c is not None:
        if c.confidential_ack:
            firma = f" el {_fecha(c.signed_at)}" if c.signed_at else ""
            partes.append(
                f"Se contó con consentimiento informado{firma}, "
                "con reconocimiento del carácter confidencial de la evaluación."
            )
        autorizaciones = []
        if c.digital_authorized:
            autorizaciones.append("el uso del medio digital")
        if c.audio_authorized:
            autorizaciones.append("la grabación de audio")
        if autorizaciones:
            partes.append(f"Se autorizó {' y '.join(autorizaciones)}.")
        elif c.confidential_ack:
            partes.append("No se autorizó la grabación de audio.")

    if ctx.attitudes:
        partes.append(
            "Durante la aplicación el paciente se mostró "
            + ", ".join(ctx.attitudes).lower()
            + "."
        )

    return " ".join(partes)


def _s6_observaciones(ctx: ReportContext) -> str:
    """Las observaciones del examinador, **textuales**.

    No se parafrasean. Reescribir una observacion clinica puede cambiar su
    significado, y el dato es del profesional, no del sistema. Las marcas y las
    verbalizaciones se anexan como registro, sin interpretarlas.
    """
    bloques: list[str] = []

    if ctx.observations.strip():
        bloques.append(ctx.observations.strip())

    if ctx.quick_marks:
        marcas = [f"{etiqueta} ({_mmss(offset)})" for etiqueta, offset in ctx.quick_marks]
        bloques.append("Registro de observación durante la aplicación:\n" + _lista(marcas))

    if ctx.verbalizations:
        bloques.append("Verbalizaciones del paciente:\n" + _lista(list(ctx.verbalizations)))

    return "\n\n".join(bloques)


def _s5_plantilla(m: DrawingMetrics) -> str:
    """Version por plantilla de la descripcion del dibujo.

    Es la base que el modelo redacta si esta disponible. Si no lo esta, esto es lo
    que queda: las mediciones listadas en vez de en prosa, pero el informe no sale
    incompleto.
    """
    filas = [
        f"Emplazamiento y dimensión: el dibujo ocupa el {m.area_pct * 100:.1f}% de la hoja.",
        f"Tiempo total de ejecución: {m.total_time_ms // 60000} min "
        f"{(m.total_time_ms % 60000) // 1000} s.",
        f"Latencia de inicio: {m.latency_ms / 1000:.1f} s.",
        f"Número de trazos: {m.stroke_count}.",
    ]
    if m.pressure_avg > 0:
        filas.append(f"Presión promedio del trazo: {m.pressure_avg:.2f} (escala 0 a 1).")
    if m.pause_count:
        filas.append(f"Pausas durante la ejecución: {m.pause_count}.")
    if m.erase_count:
        filas.append(f"Borrados: {m.erase_count}.")
    if m.sequence_start:
        filas.append(f"Secuencia de inicio: {m.sequence_start}.")
    return _lista(filas)


# --- Material para las secciones que se redactan -----------------------------


def _hechos_metricas(m: DrawingMetrics) -> str:
    return (
        "Mediciones objetivas extraídas del proceso de trazado:\n"
        + _s5_plantilla(m)
        + "\n\nRedacte una descripción en prosa de estas mediciones, sin interpretarlas "
        "ni agregar datos que no estén en la lista."
    )


def _hechos_indicadores(validados: list[ValidatedIndicator]) -> str:
    """Solo indicadores validados, cada uno con su cita al manual.

    Esta es la regla dura: el modelo nunca recibe sugerencias pendientes ni el
    catalogo completo. Y cada entrada trae su `section_code` para que el parrafo
    pueda referenciar el manual (RNF-19).
    """
    lineas = []
    for v in validados:
        e = v.entry
        linea = f"- [{e.code} · manual sección {e.section_code}] {e.title}: {e.interpretation}"
        if v.evidence:
            linea += f" (medición: {v.evidence})"
        lineas.append(linea)

    return (
        "Indicadores validados por el profesional:\n"
        + "\n".join(lineas)
        + "\n\nRedacte estos indicadores en prosa clínica. Cada afirmación debe citar la "
        "sección del manual que la origina. No agregue indicadores que no estén en la "
        "lista, no formule diagnósticos y no extraiga conclusiones."
    )


# --- Punto de entrada --------------------------------------------------------


def compose_report(ctx: ReportContext) -> ComposedReport:
    """Arma las 9 secciones. Determinista: mismo contexto, mismo resultado."""
    listas: list[ReportSection] = []
    pedidos: list[DraftRequest] = []

    def lista(numero: int, contenido: str) -> None:
        listas.append(ReportSection(numero, _titulo(numero), contenido))

    def pedir(numero: int, hechos: str, respaldo: str = "") -> None:
        pedidos.append(DraftRequest(numero, _titulo(numero), hechos, respaldo))

    # 1 a 4: plantillas sobre datos estructurados.
    lista(1, _s1_identificacion(ctx))
    lista(2, _s2_motivo(ctx))
    lista(3, _s3_instrumento(ctx))
    lista(4, _s4_condiciones(ctx))

    # 5: se pide redaccion solo si hay mediciones. Sin metricas la seccion queda
    # vacia, no con ceros: un "0% de la hoja" seria un dato falso.
    if ctx.metrics is not None:
        pedir(5, _hechos_metricas(ctx.metrics), _s5_plantilla(ctx.metrics))
    else:
        lista(5, SIN_DATO)

    # 6: textual del examinador, nunca parafraseada.
    lista(6, _s6_observaciones(ctx))

    # 7 y 8: solo indicadores validados, separados por categoria del manual.
    # Sin validados **no se emite pedido**: la seccion sale vacia. Es la garantia
    # de que el sistema no inventa contenido clinico.
    for numero, categoria in ((7, "A"), (8, "B")):
        del_grupo = [v for v in ctx.validated if v.entry.category_code == categoria]
        if del_grupo:
            pedir(numero, _hechos_indicadores(del_grupo))
        else:
            lista(numero, SIN_DATO)

    # 9: la escribe el psicologo. Siempre vacia.
    lista(CONCLUSIONS_SECTION, SIN_DATO)

    listas.sort(key=lambda s: s.section_number)
    pedidos.sort(key=lambda d: d.section_number)
    return ComposedReport(ready=tuple(listas), to_draft=tuple(pedidos))
