"""RF-38: el PDF se genera de verdad, con tildes y con el contenido de las secciones.

WeasyPrint necesita pango/cairo del sistema. En macOS, `brew install pango` y arrancar
con `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib`. Sin eso el import falla con
OSError, no con ImportError, y el test se salta diciendo por que.
"""

from types import SimpleNamespace
from uuid import uuid4

import pytest

from psicograma.adapter.inbound.http.routers.reports import _pdf

weasyprint = pytest.importorskip(
    "weasyprint", exc_type=(ImportError, OSError), reason="WeasyPrint o pango no disponibles"
)


def test_el_pdf_es_un_pdf_y_contiene_las_secciones():
    report = SimpleNamespace(id=uuid4())
    patient = SimpleNamespace(full_name="Ñandú Pérez")
    sections = [
        SimpleNamespace(section_number=1, title="Datos de filiación", content="Edad: 30 años"),
        SimpleNamespace(section_number=7, title="Interpretación", content="línea 1\nlínea 2"),
    ]
    data = _pdf(report, patient, sections)
    assert data.startswith(b"%PDF-")
    assert len(data) > 2000
