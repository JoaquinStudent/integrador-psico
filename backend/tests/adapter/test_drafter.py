"""El redactor no debe poder tumbar un informe.

Sin red: lo que se prueba es el contrato de `draft_all` con el caso de aplicacion,
no que OpenRouter conteste. Que un proveedor caido deje la seccion pendiente en vez
de romper la generacion es la garantia que sostiene "el informe se entrega igual".
"""

import pytest

from psicograma.adapter.outbound.llm.drafter import LlmNoDisponible, draft_all


class Falso:
    """Redacta la seccion 7 y falla en las demas."""

    def __init__(self) -> None:
        self.llamadas = 0

    async def draft_section(self, title: str, facts: str) -> str:
        self.llamadas += 1
        if "recursos" in title:
            return "texto redactado"
        raise LlmNoDisponible("proveedor caido")


PEDIDOS = [
    (5, "Descripcion del dibujo", "142 trazos"),
    (7, "Indicadores de recursos expresivos", "trazo entrecortado (seccion A-1)"),
    (8, "Indicadores de contenido", "paraguas ausente (seccion B-2)"),
]


@pytest.mark.asyncio
async def test_una_seccion_que_falla_no_tumba_las_demas():
    falso = Falso()
    redactadas, fallidas = await draft_all(falso, PEDIDOS)

    assert redactadas == {7: "texto redactado"}
    assert fallidas == [5, 8]
    assert falso.llamadas == 3


@pytest.mark.asyncio
async def test_sin_pedidos_no_llama_al_proveedor():
    falso = Falso()
    assert await draft_all(falso, []) == ({}, [])
    assert falso.llamadas == 0


# =============================================================================
# Recomendaciones (seccion 9): sugerencia, no conclusion
# =============================================================================


def test_el_prompt_de_recomendaciones_mantiene_los_limites_clinicos():
    from psicograma.adapter.outbound.llm.prompts import SISTEMA_RECOMENDACIONES as p

    t = p.lower()
    assert "no emitas diagnósticos" in t
    assert "medicación" in t
    assert "sugerencia" in t
    assert "profesional" in t


@pytest.mark.asyncio
async def test_draft_recommendations_usa_su_propio_prompt(monkeypatch):
    import httpx

    from psicograma.adapter.outbound.llm import drafter as mod
    from psicograma.adapter.outbound.llm.prompts import SISTEMA, SISTEMA_RECOMENDACIONES

    vistos = []

    def handler(request: httpx.Request) -> httpx.Response:
        import json

        vistos.append(json.loads(request.content)["messages"][0]["content"])
        cuerpo = {"choices": [{"message": {"content": " Se sugiere seguimiento. "}}]}
        return httpx.Response(200, json=cuerpo)

    real = httpx.AsyncClient
    monkeypatch.setattr(
        mod.httpx, "AsyncClient", lambda **kw: real(transport=httpx.MockTransport(handler), **kw)
    )
    d = mod.OpenRouterDrafter("clave", "modelo")
    assert await d.draft_recommendations("hechos") == "Se sugiere seguimiento."
    await d.draft_section("Titulo", "hechos")
    assert vistos == [SISTEMA_RECOMENDACIONES, SISTEMA]
