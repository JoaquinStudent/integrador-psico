"""Adaptador de entrada HTTP. Aqui vive FastAPI; el dominio no lo conoce.

Los errores salen como `application/problem+json` (RFC 9457) en vez del envoltorio
`{data, error}` del contrato v1: el status HTTP ya transporta esa informacion y el
cliente no tiene que desempaquetar dos veces.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

from ....config.settings import get_settings
from ...outbound.postgres.store import Conflict, NotFound
from .routers import catalogs, patients, sessions

PROBLEM_JSON = "application/problem+json"
logger = logging.getLogger("psicograma")


def _problem(request: Request, status: int, title: str, detail: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        media_type=PROBLEM_JSON,
        content={
            "type": "about:blank",
            "title": title,
            "status": status,
            "detail": detail,
            "instance": str(request.url.path),
        },
    )


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Psicograma API",
        version="2.0.0",
        description=(
            "Backend de Psicograma. Unico punto de acceso a la base de datos: "
            "el frontend no consulta Postgres directamente."
        ),
        openapi_url=f"{settings.api_prefix}/openapi.json",
        docs_url="/docs",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(StarletteHTTPException)
    async def http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        titles = {
            401: "No autenticado",
            403: "Prohibido",
            404: "No encontrado",
            409: "Conflicto de estado",
        }
        title = titles.get(exc.status_code, "Error")
        return _problem(request, exc.status_code, title, str(exc.detail))

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        return _problem(request, 422, "Validacion fallida", str(exc.errors()))

    # Los errores del store se traducen aqui, con manejadores registrados, y no
    # con un decorador en cada handler: un decorador rompe la introspeccion de
    # firmas de FastAPI, de la que dependen la inyeccion y el OpenAPI.
    @app.exception_handler(NotFound)
    async def no_encontrado(request: Request, exc: NotFound) -> JSONResponse:
        # Cubre tanto "no existe" como "es de otro examinador". No se distinguen a
        # proposito: decir "existe pero no es tuyo" ya filtra informacion a quien
        # prueba identificadores ajenos.
        return _problem(request, 404, "No encontrado", str(exc) or "El recurso no existe")

    @app.exception_handler(Conflict)
    async def conflicto(request: Request, exc: Conflict) -> JSONResponse:
        return _problem(request, 409, "Conflicto de estado", str(exc))

    @app.exception_handler(IntegrityError)
    async def integridad(request: Request, exc: IntegrityError) -> JSONResponse:
        """Ultima red: ninguna restriccion de la base debe salir como 500.

        El detalle **no** se devuelve. Un mensaje de Postgres trae nombres de
        constraint, de tabla y de columna, y eso le describe el esquema a quien
        esta probando entradas. Se registra del lado del servidor y al cliente se
        le dice lo justo.
        """
        logger.warning("violacion de integridad en %s: %s", request.url.path, exc.orig)
        return _problem(
            request,
            409,
            "Operacion rechazada",
            "La operacion viola una restriccion de integridad de los datos.",
        )

    app.include_router(catalogs.router, prefix=settings.api_prefix)
    app.include_router(patients.router, prefix=settings.api_prefix)
    app.include_router(sessions.router, prefix=settings.api_prefix)

    @app.get("/health", tags=["salud"])
    async def health() -> dict[str, str]:
        # Import diferido: /health tiene que responder aunque la BD este caida.
        from ...outbound.postgres.engine import ping

        try:
            db = "ok" if await ping() else "error"
        except Exception as exc:  # noqa: BLE001 — se reporta, no se propaga
            db = f"error: {type(exc).__name__}"
        return {"status": "ok", "database": db}

    return app


app = create_app()
