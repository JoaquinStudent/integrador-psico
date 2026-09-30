"""Adaptador de salida: implementa `LlmDrafter` contra OpenRouter.

Se usa httpx directo y no el SDK de OpenAI ni el de OpenRouter: es un POST con JSON,
y el SDK agregaria superficie y una version que mantener para nada.

El dominio no conoce este modulo. `compose_report` decide **que** hay que redactar y
con que hechos; aqui solo se le pregunta al modelo.
"""

from __future__ import annotations

import asyncio
import logging

import httpx

from ....config.settings import get_settings
from .prompts import SISTEMA, usuario

logger = logging.getLogger("psicograma.llm")

URL = "https://openrouter.ai/api/v1/chat/completions"

TIMEOUT = httpx.Timeout(60.0, connect=10.0)
"""Generar una seccion son unos segundos, pero un proveedor lento no debe colgar la
request del examinador para siempre. 60 s es holgado y acotado."""

MAX_TOKENS = 700
"""Una seccion de informe son uno a tres parrafos. El limite frena una respuesta
desbocada antes de que llegue al documento."""


class LlmNoDisponible(Exception):
    """El proveedor no respondio o no esta configurado.

    Es una excepcion del adaptador, no del dominio: la capa de aplicacion la traduce
    a "esta seccion quedo pendiente" y el informe se entrega igual.
    """


class OpenRouterDrafter:
    """Implementa `domain.ports.LlmDrafter`."""

    def __init__(self, api_key: str, model: str) -> None:
        self._key = api_key
        self._model = model

    @property
    def disponible(self) -> bool:
        return bool(self._key)

    async def draft_section(self, title: str, facts: str) -> str:
        if not self._key:
            raise LlmNoDisponible("OPENROUTER_API_KEY no esta configurada")

        cuerpo = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": SISTEMA},
                {"role": "user", "content": usuario(title, facts)},
            ],
            # Temperatura baja: en un informe clinico interesa que dos generaciones
            # sobre los mismos datos digan lo mismo, no que suenen creativas.
            "temperature": 0.3,
            "max_tokens": MAX_TOKENS,
        }

        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                r = await client.post(
                    URL,
                    headers={
                        "Authorization": f"Bearer {self._key}",
                        "Content-Type": "application/json",
                    },
                    json=cuerpo,
                )
        except httpx.HTTPError as exc:
            raise LlmNoDisponible(f"fallo de red: {type(exc).__name__}") from exc

        if r.status_code >= 400:
            # El cuerpo del proveedor puede traer la clave o detalles de la cuenta:
            # se registra el status, no la respuesta entera.
            logger.warning("OpenRouter respondio %s al redactar %r", r.status_code, title)
            raise LlmNoDisponible(f"el proveedor respondio {r.status_code}")

        try:
            texto = r.json()["choices"][0]["message"]["content"]
        except (KeyError, IndexError, ValueError) as exc:
            raise LlmNoDisponible("respuesta del proveedor con forma inesperada") from exc

        texto = (texto or "").strip()
        if not texto:
            raise LlmNoDisponible("el proveedor devolvio una respuesta vacia")
        return texto


def build_drafter() -> OpenRouterDrafter:
    s = get_settings()
    return OpenRouterDrafter(api_key=s.openrouter_api_key, model=s.llm_model)


async def draft_all(
    drafter: OpenRouterDrafter, pedidos: list[tuple[int, str, str]]
) -> tuple[dict[int, str], list[int]]:
    """Redacta varias secciones a la vez y devuelve `(redactadas, fallidas)`.

    En paralelo porque son llamadas independientes y el examinador esta esperando:
    en serie, tres secciones son tres veces la latencia sin ninguna ventaja.

    Una seccion que falla **no** tumba las demas. El informe se entrega con lo que se
    pudo redactar y las fallidas quedan vacias, para que el profesional las escriba o
    reintente.
    """
    if not pedidos:
        return {}, []

    async def una(numero: int, titulo: str, hechos: str) -> tuple[int, str | None]:
        try:
            return numero, await drafter.draft_section(titulo, hechos)
        except LlmNoDisponible as exc:
            logger.info("seccion %s sin redactar: %s", numero, exc)
            return numero, None

    resultados = await asyncio.gather(*(una(n, t, h) for n, t, h in pedidos))
    redactadas = {n: texto for n, texto in resultados if texto is not None}
    fallidas = [n for n, texto in resultados if texto is None]
    return redactadas, fallidas
