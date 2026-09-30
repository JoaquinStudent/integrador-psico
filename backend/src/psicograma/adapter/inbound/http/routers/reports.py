"""Generación, edición, validación y exportación de informes."""

from __future__ import annotations

import html
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from .....config.container import Reports
from .....domain.services.compose_report import compose_report
from ..schemas import ReportOut, ReportSectionOut, ReportSectionPatch

router = APIRouter(prefix="/reports", tags=["informes"])
session_router = APIRouter(prefix="/sessions", tags=["informes"])


def _out(report, patient, sections) -> ReportOut:
    return ReportOut(
        id=report.id,
        session_id=report.session_id,
        status=report.status,
        validated_at=report.validated_at,
        created_at=report.created_at,
        updated_at=report.updated_at,
        patient_name=patient.full_name,
        sections=[ReportSectionOut(
            id=s.id,
            section_number=s.section_number,
            title=s.title,
            content=s.content or "",
            is_ai_generated=s.is_ai_generated,
            edited_by_examiner=s.edited_by_examiner,
        ) for s in sections],
    )


@router.get("", response_model=list[ReportOut])
async def list_reports(
    reports: Reports,
    status_filter: str | None = Query(None, alias="status"),
    patient_id: UUID | None = None,
) -> list[ReportOut]:
    return [_out(report, patient, await reports.sections(report.id))
            for report, patient in await reports.list(status_filter, patient_id)]


@session_router.post(
    "/{session_id}/report",
    response_model=ReportOut,
    status_code=status.HTTP_201_CREATED,
)
async def generate_report(session_id: UUID, reports: Reports) -> ReportOut:
    context = await reports.context_for_session(session_id)
    composed = compose_report(context)
    # La IA es opcional. Las secciones deterministas se persisten siempre y las
    # que requieren redacción quedan vacías para revisión del profesional.
    sections = [
        {
            "section_number": section.section_number,
            "title": section.title,
            "content": section.content,
            "is_ai_generated": False,
            "edited_by_examiner": False,
        }
        for section in composed.ready
    ]
    sections.extend({
        "section_number": request.section_number,
        "title": request.title,
        "content": "",
        "is_ai_generated": False,
        "edited_by_examiner": False,
    } for request in composed.to_draft)
    report, rows = await reports.create(session_id, sections)
    _, patient, _ = await reports.get(report.id)
    return _out(report, patient, rows)


@session_router.get("/{session_id}/report", response_model=ReportOut)
async def session_report(session_id: UUID, reports: Reports) -> ReportOut:
    result = await reports.get_for_session(session_id)
    if result is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="la sesión todavía no tiene informe")
    report, patient, sections = result
    return _out(report, patient, sections)


@router.get("/{report_id}", response_model=ReportOut)
async def get_report(report_id: UUID, reports: Reports) -> ReportOut:
    report, patient, sections = await reports.get(report_id)
    return _out(report, patient, sections)


@router.patch("/{report_id}/sections/{section_number}", response_model=ReportOut)
async def update_section(
    report_id: UUID, section_number: int, data: ReportSectionPatch, reports: Reports
) -> ReportOut:
    report, _ = await reports.update_section(report_id, section_number, data.content)
    report, patient, sections = await reports.get(report.id)
    return _out(report, patient, sections)


@router.post("/{report_id}/validate", response_model=ReportOut)
async def validate_report(report_id: UUID, reports: Reports) -> ReportOut:
    report, sections = await reports.validate(report_id)
    _, patient, _ = await reports.get(report.id)
    return _out(report, patient, sections)


def _pdf(report, patient, sections) -> bytes:
    try:
        from weasyprint import HTML
    except ImportError as exc:
        raise RuntimeError("WeasyPrint no está instalado") from exc
    body = "".join(
        f"<section><h2>{s.section_number}. {html.escape(s.title)}</h2>"
        f"<div>{html.escape(s.content).replace(chr(10), '<br>')}</div></section>"
        for s in sections
    )
    document = f"""<!doctype html><html><head><meta charset='utf-8'>
    <style>@page {{ size:A4; margin:20mm; }} body {{ font-family:Arial,sans-serif; color:#243447; }}
    h1 {{ color:#176b87; }} h2 {{ color:#176b87; border-bottom:1px solid #d8e4e8; }}
    section {{ page-break-inside:avoid; margin-bottom:18px; }}
    .meta {{ color:#52636d; margin-bottom:24px; }}</style></head><body>
    <h1>Informe psicológico</h1><div class='meta'>Paciente: {html.escape(patient.full_name)}<br>
    Estado: Validado<br>Informe: {report.id}</div>{body}</body></html>"""
    return HTML(string=document).write_pdf()


@router.get("/{report_id}/pdf")
async def pdf(report_id: UUID, reports: Reports) -> Response:
    report, patient, sections = await reports.get(report_id)
    if report.status != "validated":
        from fastapi import HTTPException
        raise HTTPException(status_code=409, detail="solo se puede descargar un informe validado")
    try:
        data = _pdf(report, patient, sections)
    except RuntimeError as exc:
        from fastapi import HTTPException
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return Response(content=data, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="informe-{report.id}.pdf"'
    })
