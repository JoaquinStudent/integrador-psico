"""El transcriptor no debe poder romper una sesion ya grabada.

Sin red: lo que se prueba es la conversion de lo que devuelve Whisper y que la falta de
configuracion se note como tal. Que Whisper conteste es otro problema, y no uno que un
test pueda garantizar.
"""

import pytest

from psicograma.adapter.outbound.whisper.transcriber import (
    TranscripcionNoDisponible,
    WhisperTranscriber,
    _a_milisegundos,
)


def test_segundos_con_decimales_pasan_a_milisegundos_enteros():
    segmentos = [
        {"start": 0.0, "end": 2.48, "text": " no se dibujar bien "},
        {"start": 12.5, "end": 14.019, "text": "le pongo paraguas?"},
    ]
    assert _a_milisegundos(segmentos) == [
        (0, 2480, "no se dibujar bien"),
        (12500, 14019, "le pongo paraguas?"),
    ]


def test_los_segmentos_sin_texto_se_descartan():
    """Whisper emite tramos vacios en los silencios.

    En este test los silencios son largos —el paciente dibuja callado— asi que serian
    la mayoria de las filas del registro y no aportan nada.
    """
    segmentos = [
        {"start": 0.0, "end": 3.0, "text": "   "},
        {"start": 3.0, "end": 4.0, "text": "ya termine"},
        {"start": 4.0, "end": 9.0, "text": ""},
    ]
    assert _a_milisegundos(segmentos) == [(3000, 4000, "ya termine")]


def test_el_fin_nunca_queda_antes_del_inicio():
    """`transcript_segments` lo exige por CHECK, y redondear dos valores casi iguales
    puede invertirlos."""
    assert _a_milisegundos([{"start": 5.0006, "end": 5.0001, "text": "si"}]) == [
        (5001, 5001, "si")
    ]


def test_sin_clave_no_esta_disponible_y_lo_dice():
    t = WhisperTranscriber(api_key="")
    assert t.disponible is False


@pytest.mark.asyncio
async def test_sin_clave_falla_con_la_excepcion_del_adaptador():
    """No un error generico: la capa de aplicacion lo traduce a un 502 que explica
    que el proveedor no esta configurado, para que el examinador sepa si reintentar."""
    with pytest.raises(TranscripcionNoDisponible):
        await WhisperTranscriber(api_key="").transcribe(b"algo", "a.webm")


@pytest.mark.asyncio
async def test_una_grabacion_vacia_no_sale_a_la_red():
    """Subir 0 bytes pasa si el microfono fallo en silencio. Gastar una llamada al
    proveedor para que conteste que no hay audio no tiene sentido."""
    with pytest.raises(TranscripcionNoDisponible):
        await WhisperTranscriber(api_key="sk-de-prueba").transcribe(b"", "a.webm")
