"""El log de una violacion de integridad no debe llevar los valores de la fila."""

from sqlalchemy.exc import IntegrityError

from psicograma.adapter.inbound.http.app import _restriccion


class _Asyncpg(Exception):
    constraint_name = "patients_created_by_document_number_key"
    sqlstate = "23505"


def test_solo_nombre_de_restriccion_y_sqlstate():
    causa = _Asyncpg("Key (created_by, document_number)=(x, 12345678) already exists")
    orig = Exception("wrapper")
    orig.__cause__ = causa
    exc = IntegrityError("INSERT", {}, orig)
    assert _restriccion(exc) == ("patients_created_by_document_number_key", "23505")
    assert "12345678" not in "".join(_restriccion(exc))


def test_sin_datos_devuelve_marcadores():
    assert _restriccion(IntegrityError("x", {}, Exception("12345678"))) == ("?", "?")
