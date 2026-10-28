"""SPEC-CAL-01: solape de horarios y privacidad del evento. Sin red ni base de datos."""

import datetime as dt

from psicograma.domain.services.appointments import evento_google, iniciales, se_cruzan

T = dt.UTC


def h(hora: int, minuto: int = 0) -> dt.datetime:
    return dt.datetime(2026, 11, 3, hora, minuto, tzinfo=T)


def test_solape_parcial_y_contenido():
    assert se_cruzan(h(10), h(11), h(10, 30), h(11, 30))
    assert se_cruzan(h(10), h(12), h(10, 30), h(11))
    assert se_cruzan(h(10, 30), h(11), h(10), h(12))


def test_el_limite_no_es_cruce():
    assert not se_cruzan(h(10), h(11), h(11), h(12))
    assert not se_cruzan(h(11), h(12), h(10), h(11))


def test_iniciales_ignoran_particulas():
    assert iniciales("Juan Pérez de la Cruz") == "J.P.C."
    assert iniciales("ana") == "A."
    assert iniciales("   ") == "?"


def test_el_evento_no_lleva_nombre_ni_documento():
    ev = evento_google(
        iniciales_paciente=iniciales("Juan Pérez García"),
        test_code="PBLL",
        inicio=h(10),
        fin=h(11),
        enlace="https://app.test/citas",
        zona="America/Lima",
    )
    texto = str(ev)
    assert "J.P.G." in texto
    assert "Juan" not in texto and "Pérez" not in texto
    assert ev["start"]["timeZone"] == "America/Lima"
    assert "attendees" not in ev
