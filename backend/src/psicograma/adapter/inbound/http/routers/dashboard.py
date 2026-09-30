"""Resumen de trabajo del examinador."""

from __future__ import annotations

import datetime as dt

from fastapi import APIRouter
from sqlalchemy import func, select

from .....adapter.outbound.postgres import models as m
from .....config.container import DbSession

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def summary(db: DbSession) -> dict:
    week_ago = dt.datetime.now(dt.UTC) - dt.timedelta(days=7)
    sessions_week = await db.scalar(
        select(func.count()).select_from(m.Session).where(m.Session.created_at >= week_ago)
    ) or 0
    pending_analysis = await db.scalar(
        select(func.count())
        .select_from(m.Session)
        .outerjoin(m.Report, m.Report.session_id == m.Session.id)
        .where(m.Session.status == "completed")
        .where((m.Report.id.is_(None)) | (m.Report.status != "validated"))
    ) or 0
    active_patients = await db.scalar(
        select(func.count()).select_from(m.Patient).where(m.Patient.is_active.is_(True))
    ) or 0
    rows = (
        await db.execute(
            select(m.Session, m.Patient, m.Test)
            .join(m.Patient, m.Patient.id == m.Session.patient_id)
            .join(m.Test, m.Test.id == m.Session.test_id)
            .order_by(m.Session.created_at.desc())
            .limit(5)
        )
    ).all()
    recent = [
        {
            "id": session.id,
            "patient_id": session.patient_id,
            "patient": {
                "id": patient.id,
                "full_name": patient.full_name,
                "document_number": patient.document_number,
                "birth_date": patient.birth_date,
                "sex": patient.sex,
                "registered_at": patient.registered_at,
                "is_active": patient.is_active,
            },
            "test": {
                "id": test.id,
                "code": test.code,
                "name": test.name,
                "is_available": test.is_available,
            },
            "status": session.status,
            "reason": session.reason,
            "started_at": session.started_at,
            "completed_at": session.completed_at,
            "created_at": session.created_at,
        }
        for session, patient, test in rows
    ]
    return {
        "sessions_this_week": sessions_week,
        "pending_analysis": pending_analysis,
        "active_patients": active_patients,
        "recent_sessions": recent,
    }
