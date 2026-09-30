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
