"""Adaptador de salida: implementa `Transcriber` contra la API de Whisper de OpenAI.

httpx directo y no el SDK de OpenAI, por la misma razón que en el adaptador de
OpenRouter: es un POST multipart, el SDK no aporta nada y añade una dependencia y una
versión que mantener.

**Lo que este adaptador no hace, y conviene tener presente:** Whisper no separa
hablantes. Devuelve el audio de la sesión con la voz del examinador y la del paciente
mezcladas, sin etiqueta. Por eso la transcripción entra al sistema como *registro* y
nada pasa al informe solo: el examinador elige qué segmento fue del paciente, y
elegirlo es atribuirlo. Volcar todo al bloque "Verbalizaciones del paciente" firmaría
como dicho por el paciente cosas que dijo el profesional.
"""

from __future__ import annotations

import logging

import httpx

from ....config.settings import get_settings

logger = logging.getLogger("psicograma.whisper")

URL = "https://api.openai.com/v1/audio/transcriptions"

MODELO = "whisper-1"

TIMEOUT = httpx.Timeout(180.0, connect=10.0)
"""Una sesión son 45 minutos de audio y Whisper trabaja sobre el archivo completo, no
en streaming. 180 s es holgado para eso y sigue estando acotado."""

IDIOMA = "es"
"""Declararlo mejora la precisión y evita que un silencio largo se detecte como otro
idioma. El proyecto es de un centro peruano y la sesión es en español (RNF-21)."""


class TranscripcionNoDisponible(Exception):
    """El proveedor no respondió o no está configurado.

    Es una excepción del adaptador, no del dominio: la capa de aplicación la traduce a
    un 502 que explica qué pasó, y la grabación queda sin `transcribed_at` para poder
    reintentar sin perder nada.
    """


class WhisperTranscriber:
    """Implementa `domain.ports.Transcriber`."""

    def __init__(self, api_key: str) -> None:
        self._key = api_key

    @property
    def disponible(self) -> bool:
        return bool(self._key)

    async def transcribe(self, audio: bytes, filename: str) -> list[tuple[int, int, str]]:
        """Devuelve `(start_ms, end_ms, texto)` por segmento, en orden."""
        if not self._key:
            raise TranscripcionNoDisponible("OPENAI_API_KEY no esta configurada")
        if not audio:
            raise TranscripcionNoDisponible("la grabacion esta vacia")

        # `verbose_json` es lo que trae los tiempos; el formato por defecto devuelve
        # solo el texto y sin tiempos no hay nada que cruzar con las marcas.
        datos = {
            "model": MODELO,
            "response_format": "verbose_json",
            "language": IDIOMA,
            "timestamp_granularities[]": "segment",
        }
        files = {"file": (filename, audio, "audio/webm")}

        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                r = await client.post(
                    URL,
                    headers={"Authorization": f"Bearer {self._key}"},
                    data=datos,
                    files=files,
                )
        except httpx.HTTPError as exc:
            raise TranscripcionNoDisponible(f"fallo de red: {type(exc).__name__}") from exc

        if r.status_code >= 400:
            # Status sí, cuerpo no: la respuesta del proveedor puede traer la clave.
            logger.warning("Whisper respondio %s al transcribir %r", r.status_code, filename)
            raise TranscripcionNoDisponible(f"el proveedor respondio {r.status_code}")

        try:
            segmentos = r.json().get("segments") or []
        except ValueError as exc:
            raise TranscripcionNoDisponible("respuesta del proveedor con forma inesperada") from exc

        return _a_milisegundos(segmentos)


def _a_milisegundos(segmentos: list[dict]) -> list[tuple[int, int, str]]:
    """Convierte los segundos con decimales de Whisper a milisegundos enteros.

    Se descartan los segmentos sin texto: Whisper a veces emite tramos vacíos en los
    silencios, y en este test los silencios son largos —el paciente dibuja callado— así
    que serían la mayoría de las filas y no aportan nada al registro.

    `end` se fuerza a ser >= `start` porque la tabla lo exige por CHECK, y un redondeo
    de dos valores casi iguales puede invertirlos.
    """
    salida: list[tuple[int, int, str]] = []
    for s in segmentos:
        texto = (s.get("text") or "").strip()
        if not texto:
            continue
        inicio = max(0, int(round(float(s.get("start", 0)) * 1000)))
        fin = max(inicio, int(round(float(s.get("end", 0)) * 1000)))
        salida.append((inicio, fin, texto))
    return salida


def build_transcriber() -> WhisperTranscriber:
    return WhisperTranscriber(api_key=get_settings().openai_api_key)
