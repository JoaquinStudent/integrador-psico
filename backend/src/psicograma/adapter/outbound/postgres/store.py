"""Acceso a datos que no pasa por el dominio.

A diferencia de `repositories.py`, nada de aqui implementa un puerto: **ningun
servicio de dominio consume estos datos.** Crear un paciente o listar sesiones es
CRUD sin reglas de negocio, y hacerlo atravesar el nucleo del hexagono solo
agregaria una capa de traduccion que no decide nada.

La frontera que importa sigue intacta: el dominio no conoce este modulo, y este
modulo no le impone nada al dominio.
"""

from __future__ import annotations

import datetime as dt
from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from ....domain.model import ConsentSummary, DrawingMetrics, ReportContext
from . import models as m
from .repositories import PostgresSessionIndicatorRepository


class NotFound(Exception):
    """El recurso no existe, o es de otro examinador y RLS lo esconde.

    No se distinguen los dos casos a proposito: decirle "existe pero no es tuyo"
    a quien prueba ids ajenos ya filtra informacion.
    """


class Conflict(Exception):
    """Transicion de estado invalida o unicidad violada."""


# =============================================================================
# Pacientes
# =============================================================================


class PatientStore:
    def __init__(self, session: AsyncSession, user_id: UUID) -> None:
        self._s = session
        self._uid = user_id

    async def create(self, data: dict) -> m.Patient:
        row = m.Patient(**data, created_by=self._uid)
        self._s.add(row)
        try:
            await self._s.flush()
        except Exception as exc:  # UNIQUE (created_by, document_number)
            if "patients_created_by_document_number_key" in str(exc):
                raise Conflict("ya tienes un paciente con ese documento") from exc
            raise
        return row

    async def get(self, patient_id: UUID) -> m.Patient:
        row = (
            await self._s.execute(select(m.Patient).where(m.Patient.id == patient_id))
        ).scalar_one_or_none()
        if row is None:
            raise NotFound
        return row

    async def update(self, patient_id: UUID, data: dict) -> m.Patient:
        row = await self.get(patient_id)
        for k, v in data.items():
            setattr(row, k, v)
        await self._s.flush()
        return row

    async def set_active(self, patient_id: UUID, is_active: bool) -> m.Patient:
        row = await self.get(patient_id)
        row.is_active = is_active
        await self._s.flush()
        return row

    async def anonymize(self, patient_id: UUID) -> m.Patient:
        row = await self.get(patient_id)
        now = dt.datetime.now(dt.UTC)
        row.full_name = "Paciente anonimizado"
        row.document_number = f"ANON-{row.id.hex[:12].upper()}"
        row.birth_date = dt.date(1900, 1, 1)
        row.sex = "U"
        row.is_active = False
        row.anonymized_at = now
        await self._s.flush()
        return row

    async def list(
        self,
        *,
        q: str | None = None,
        only_active: bool | None = True,
        pending_only: bool = False,
        page: int = 1,
        page_size: int = 25,
    ) -> tuple[list[m.Patient], int]:
        stmt = select(m.Patient)
        if q:
            like = f"%{q}%"
            stmt = stmt.where(
                m.Patient.full_name.ilike(like) | m.Patient.document_number.ilike(like)
            )
        if only_active is not None:
            stmt = stmt.where(m.Patient.is_active.is_(only_active))
        if pending_only:
            stmt = stmt.where(m.Patient.id.in_(select(_pendientes_subq().c.patient_id)))

        total = await self._s.scalar(
            select(func.count()).select_from(stmt.subquery())
        ) or 0
        rows = (
            (
                await self._s.execute(
                    stmt.order_by(m.Patient.full_name)
                    .limit(page_size)
                    .offset((page - 1) * page_size)
                )
            )
            .scalars()
            .all()
        )
        return list(rows), total

    async def counts_for(self, patient_ids: list[UUID]) -> dict[UUID, tuple[int, bool]]:
        """Evaluaciones y estado pendiente por paciente, en una sola consulta.

        Se resuelve aca y no en el cliente para que la definicion de "evaluacion
        pendiente" viva en un solo lugar: sesion `completed` sin informe
        `validated`. Es la misma regla que usa el filtro y el panel.
        """
        if not patient_ids:
            return {}

        pend = (
            select(m.Report.session_id)
            .where(m.Report.status == "validated")
            .scalar_subquery()
        )
        rows = (
            await self._s.execute(
                select(
                    m.Session.patient_id,
                    func.count().label("total"),
                    func.count()
                    .filter(
                        (m.Session.status == "completed")
                        & m.Session.id.not_in(pend)
                    )
                    .label("pendientes"),
                )
                .where(m.Session.patient_id.in_(patient_ids))
                .group_by(m.Session.patient_id)
            )
        ).all()
        return {r.patient_id: (r.total, r.pendientes > 0) for r in rows}


def _pendientes_subq():
    validados = (
        select(m.Report.session_id).where(m.Report.status == "validated").scalar_subquery()
    )
    return (
        select(m.Session.patient_id.label("patient_id"))
        .where(m.Session.status == "completed")
        .where(m.Session.id.not_in(validados))
        .subquery()
    )


# =============================================================================
# Sesiones
# =============================================================================

TRANSICIONES: dict[str, set[str]] = {
    "setup": {"consent", "cancelled"},
    "consent": {"active", "cancelled"},
    "active": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


class SessionStore:
    def __init__(self, session: AsyncSession, user_id: UUID) -> None:
        self._s = session
        self._uid = user_id

    async def create(self, patient_id: UUID, test_code: str, reason: str | None) -> m.Session:
        """Crea sesion, consentimiento y dibujo en una sola transaccion.

        En el esquema v1 el cliente hacia cuatro INSERT secuenciales sin
        atomicidad: si el tercero fallaba, quedaba una sesion a medio armar.
        """
        test = (
            await self._s.execute(select(m.Test).where(m.Test.code == test_code))
        ).scalar_one_or_none()
        if test is None or not test.is_available:
            raise Conflict(f"el test {test_code} no esta disponible")

        # El paciente tiene que ser visible para este examinador: si no lo es, RLS
        # devuelve None y no se crea nada.
        paciente = await PatientStore(self._s, self._uid).get(patient_id)
        if not paciente.is_active:
            raise Conflict("el paciente esta inactivo; hay que reactivarlo primero")

        row = m.Session(
            patient_id=patient_id,
            test_id=test.id,
            status="setup",
            reason=reason,
            created_by=self._uid,
        )
        self._s.add(row)
        await self._s.flush()

        self._s.add(m.ConsentRecord(session_id=row.id))
        self._s.add(m.SessionObservation(session_id=row.id))
        await self._s.flush()
        return row

    async def get(self, session_id: UUID) -> m.Session:
        row = (
            await self._s.execute(select(m.Session).where(m.Session.id == session_id))
        ).scalar_one_or_none()
        if row is None:
            raise NotFound
        return row

    async def test_of(self, session: m.Session) -> m.Test:
        return (
            await self._s.execute(select(m.Test).where(m.Test.id == session.test_id))
        ).scalar_one()

    async def list_for_patient(self, patient_id: UUID) -> list[m.Session]:
        rows = (
            (
                await self._s.execute(
                    select(m.Session)
                    .where(m.Session.patient_id == patient_id)
                    .order_by(m.Session.created_at.desc())
                )
            )
            .scalars()
            .all()
        )
        return list(rows)

    async def list_all(
        self,
        *,
        status: str | None = None,
        page: int = 1,
        page_size: int = 25,
    ) -> tuple[list[m.Session], int]:
        # Filtro explicito por examinador. RLS tambien lo haria, pero apoyarse solo
        # en RLS deja una unica linea de defensa: si un camino futuro no pasa por
        # `session_for()`, este listado devolveria las sesiones de todos.
        stmt = select(m.Session).where(m.Session.created_by == self._uid)
        if status:
            stmt = stmt.where(m.Session.status == status)
        total = await self._s.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        rows = (
            await self._s.execute(
                stmt.order_by(m.Session.created_at.desc())
                .limit(page_size)
                .offset((page - 1) * page_size)
            )
        ).scalars().all()
        return list(rows), total

    async def set_status(self, session_id: UUID, nuevo: str) -> m.Session:
        row = await self.get(session_id)
        if nuevo == row.status:
            return row
        if nuevo not in TRANSICIONES[row.status]:
            raise Conflict(f"no se puede pasar de {row.status} a {nuevo}")

        row.status = nuevo
        if nuevo == "active" and row.started_at is None:
            row.started_at = dt.datetime.now(dt.UTC)
        if nuevo == "completed":
            row.completed_at = dt.datetime.now(dt.UTC)
        await self._s.flush()
        return row

    async def summary(self) -> dict:
        """Los tres KPI del panel y las ultimas sesiones, **solo de este examinador**.

        Vive en el store y no en el router por dos razones. Una, para que el filtro
        por `created_by` este junto al resto del acceso a datos y no se olvide al
        agregar un contador. Dos, porque un conteo que suma filas ajenas filtra
        informacion aunque no muestre nombres: revela cuantos pacientes y sesiones
        atiende el otro profesional.
        """
        mias = m.Session.created_by == self._uid
        hace_una_semana = dt.datetime.now(dt.UTC) - dt.timedelta(days=7)

        sesiones_semana = await self._s.scalar(
            select(func.count())
            .select_from(m.Session)
            .where(mias, m.Session.created_at >= hace_una_semana)
        ) or 0

        # "Evaluacion pendiente": sesion completada sin informe validado. Misma
        # definicion que el filtro de pacientes, para que no se desincronicen.
        pendientes = await self._s.scalar(
            select(func.count())
            .select_from(m.Session)
            .outerjoin(m.Report, m.Report.session_id == m.Session.id)
            .where(mias, m.Session.status == "completed")
            .where((m.Report.id.is_(None)) | (m.Report.status != "validated"))
        ) or 0

        pacientes_activos = await self._s.scalar(
            select(func.count())
            .select_from(m.Patient)
            .where(m.Patient.created_by == self._uid, m.Patient.is_active.is_(True))
        ) or 0

        recientes = (
            await self._s.execute(
                select(m.Session, m.Patient, m.Test)
                .join(m.Patient, m.Patient.id == m.Session.patient_id)
                .join(m.Test, m.Test.id == m.Session.test_id)
                .where(mias)
                .order_by(m.Session.created_at.desc())
                .limit(5)
            )
        ).all()

        return {
            "sessions_this_week": sesiones_semana,
            "pending_analysis": pendientes,
            "active_patients": pacientes_activos,
            "recent_sessions": recientes,
        }

    async def save_consent(self, session_id: UUID, data: dict) -> m.ConsentRecord:
        await self.get(session_id)  # valida pertenencia
        values = {"session_id": session_id, **data}
        stmt = pg_insert(m.ConsentRecord).values(**values)
        await self._s.execute(
            stmt.on_conflict_do_update(
                index_elements=[m.ConsentRecord.session_id],
                set_={k: v for k, v in values.items() if k != "session_id"},
            )
        )
        return await self.consent_of(session_id)

    async def consent_of(self, session_id: UUID) -> m.ConsentRecord:
        row = (
            await self._s.execute(
                select(m.ConsentRecord).where(m.ConsentRecord.session_id == session_id)
            )
        ).scalar_one_or_none()
        if row is None:
            raise NotFound
        return row


# =============================================================================
# Dibujo
# =============================================================================


class DrawingStore:
    """Escritura del dibujo. La lectura para el dominio esta en
    `PostgresDrawingRepository`, que devuelve dataclasses."""

    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def save(self, session_id: UUID, data: dict) -> None:
        """Guarda el dibujo completo: la fila de `drawings` y N filas de `strokes`.

        Reemplaza, no acumula: si el paciente rehace el dibujo, los trazos viejos
        se van. Los trazos entran en un solo INSERT multiple — una sesion larga
        son mas de 200, y un bucle de inserts contra una base remota es la
        diferencia entre medio segundo y medio minuto.
        """
        values = {
            "session_id": session_id,
            "canvas_width": data["canvas_width"],
            "canvas_height": data["canvas_height"],
            "orientation": data["orientation"],
        }
        stmt = pg_insert(m.Drawing).values(**values)
        drawing_id = await self._s.scalar(
            stmt.on_conflict_do_update(
                index_elements=[m.Drawing.session_id],
                set_={k: v for k, v in values.items() if k != "session_id"},
            ).returning(m.Drawing.id)
        )

        await self._s.execute(delete(m.Stroke).where(m.Stroke.drawing_id == drawing_id))

        strokes = data["strokes"]
        if not strokes:
            return

        await self._s.execute(
            m.Stroke.__table__.insert(),
            [_stroke_row(drawing_id, s) for s in strokes],
        )

    async def set_image(self, session_id: UUID, storage_path: str) -> None:
        """Guarda la **ruta** en Storage, no una URL.

        Una URL firmada caduca; guardarla seria guardar algo que deja de servir.
        Se firma al leer, con `FileStore.signed_url()`.
        """
        row = (
            await self._s.execute(
                select(m.Drawing).where(m.Drawing.session_id == session_id)
            )
        ).scalar_one_or_none()
        if row is None:
            raise NotFound
        row.final_image_url = storage_path
        await self._s.flush()


def _stroke_row(drawing_id: UUID, s: dict) -> dict:
    """Deriva las columnas consultables desde los puntos.

    bbox y presion promedio se materializan porque los indicadores del manual los
    usan y recorrer el JSONB en cada consulta seria caro. Los puntos crudos siguen
    siendo la fuente de verdad.
    """
    pts = s["points"]
    presiones = [p["p"] for p in pts if p.get("p") is not None]
    xs = [p["x"] for p in pts]
    ys = [p["y"] for p in pts]
    return {
        "drawing_id": drawing_id,
        "stroke_index": s["stroke_index"],
        "tool": s["tool"],
        "started_at_ms": s["started_at_ms"],
        "ended_at_ms": s["ended_at_ms"],
        "point_count": len(pts),
        "avg_pressure": sum(presiones) / len(presiones) if presiones else None,
        "bbox_x": min(xs),
        "bbox_y": min(ys),
        "bbox_width": max(xs) - min(xs),
        "bbox_height": max(ys) - min(ys),
        "points": pts,
    }


# =============================================================================
# Observaciones
# =============================================================================


class ObservationStore:
    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def get(self, session_id: UUID) -> dict:
        notas = await self._s.scalar(
            select(m.SessionObservation.additional_notes).where(
                m.SessionObservation.session_id == session_id
            )
        )
        if notas is None:
            raise NotFound

        marcas = (
            await self._s.execute(
                select(m.SessionQuickMark.mark_code, m.SessionQuickMark.marked_at_ms)
                .where(m.SessionQuickMark.session_id == session_id)
                .order_by(m.SessionQuickMark.marked_at_ms)
            )
        ).all()
        actitudes = (
            (
                await self._s.execute(
                    select(m.SessionAttitude.attitude_code).where(
                        m.SessionAttitude.session_id == session_id
                    )
                )
            )
            .scalars()
            .all()
        )
        return {
            "additional_notes": notas,
            "quick_marks": [
                {"mark_code": c, "marked_at_ms": t} for c, t in marcas
            ],
            "attitudes": list(actitudes),
        }

    async def save(self, session_id: UUID, notas: str, actitudes: list[str]) -> None:
        values = {"session_id": session_id, "additional_notes": notas}
        stmt = pg_insert(m.SessionObservation).values(**values)
        await self._s.execute(
            stmt.on_conflict_do_update(
                index_elements=[m.SessionObservation.session_id],
                set_={"additional_notes": notas},
            )
        )
        # Las actitudes son un conjunto: se reemplaza entero en vez de calcular
        # el delta, que para un pufado de filas no se paga.
        await self._s.execute(
            delete(m.SessionAttitude).where(m.SessionAttitude.session_id == session_id)
        )
        if actitudes:
            await self._s.execute(
                m.SessionAttitude.__table__.insert(),
                [{"session_id": session_id, "attitude_code": c} for c in actitudes],
            )

    async def add_quick_mark(self, session_id: UUID, code: str, at_ms: int) -> None:
        # Se valida contra el catalogo antes de insertar. La FK igual lo impediria,
        # pero entonces el examinador recibiria un mensaje generico en vez de saber
        # que el codigo de marca no existe. La restriccion queda como respaldo.
        existe = await self._s.scalar(
            select(m.QuickMarkCatalog.code).where(m.QuickMarkCatalog.code == code)
        )
        if existe is None:
            raise Conflict(f"la marca '{code}' no esta en el catalogo")

        self._s.add(
            m.SessionQuickMark(session_id=session_id, mark_code=code, marked_at_ms=at_ms)
        )
        await self._s.flush()


class AudioStore:
    def __init__(self, session: AsyncSession) -> None:
        self._s = session

    async def create(
        self, session_id: UUID, path: str, duration_seconds: int | None
    ) -> m.AudioRecording:
        row = m.AudioRecording(
            session_id=session_id,
            storage_path=path,
            duration_seconds=duration_seconds,
        )
        self._s.add(row)
        await self._s.flush()
        return row

    async def get(self, recording_id: UUID) -> m.AudioRecording:
        row = await self._s.get(m.AudioRecording, recording_id)
        if row is None:
            raise NotFound
        return row

    async def transcript(self, recording_id: UUID) -> list[m.TranscriptSegment]:
        return list(
            (
                await self._s.execute(
                    select(m.TranscriptSegment)
                    .where(m.TranscriptSegment.recording_id == recording_id)
                    .order_by(m.TranscriptSegment.segment_index)
                )
            ).scalars().all()
        )


# =============================================================================
# Informes
# =============================================================================


class ReportStore:
    def __init__(self, session: AsyncSession, user_id: UUID) -> None:
        self._s = session
        self._uid = user_id

    async def _session_row(
        self, session_id: UUID
    ) -> tuple[m.Session, m.Patient, m.Test, m.Profile]:
        row = (await self._s.execute(
            select(m.Session, m.Patient, m.Test, m.Profile)
            .join(m.Patient, m.Patient.id == m.Session.patient_id)
            .join(m.Test, m.Test.id == m.Session.test_id)
            .join(m.Profile, m.Profile.id == m.Session.created_by)
            .where(m.Session.id == session_id)
            .where(m.Session.created_by == self._uid)
        )).one_or_none()
        if row is None:
            raise NotFound
        return row

    async def _load(self, report_id: UUID) -> tuple[m.Report, m.Patient]:
        row = (await self._s.execute(
            select(m.Report, m.Patient)
            .join(m.Session, m.Session.id == m.Report.session_id)
            .join(m.Patient, m.Patient.id == m.Session.patient_id)
            .where(m.Report.id == report_id)
            .where(m.Session.created_by == self._uid)
        )).one_or_none()
        if row is None:
            raise NotFound
        return row

    async def sections(self, report_id: UUID) -> list[m.ReportSection]:
        return list((await self._s.execute(
            select(m.ReportSection)
            .where(m.ReportSection.report_id == report_id)
            .order_by(m.ReportSection.section_number)
        )).scalars().all())

    async def get(self, report_id: UUID) -> tuple[m.Report, m.Patient, list[m.ReportSection]]:
        report, patient = await self._load(report_id)
        return report, patient, await self.sections(report.id)

    async def get_for_session(
        self, session_id: UUID
    ) -> tuple[m.Report, m.Patient, list[m.ReportSection]] | None:
        await self._session_row(session_id)
        report = (await self._s.execute(
            select(m.Report).where(m.Report.session_id == session_id)
        )).scalar_one_or_none()
        if report is None:
            return None
        return await self.get(report.id)

    async def context_for_session(self, session_id: UUID) -> ReportContext:
        session, patient, test, profile = await self._session_row(session_id)
        consent = (await self._s.execute(select(m.ConsentRecord).where(
            m.ConsentRecord.session_id == session_id
        ))).scalar_one_or_none()
        obs = (await self._s.execute(select(m.SessionObservation).where(
            m.SessionObservation.session_id == session_id
        ))).scalar_one_or_none()
        metrics = (await self._s.execute(select(m.StrokeMetrics).where(
            m.StrokeMetrics.session_id == session_id
        ))).scalar_one_or_none()
        marks = (await self._s.execute(
            select(m.QuickMarkCatalog.label, m.SessionQuickMark.marked_at_ms)
            .join(m.SessionQuickMark, m.SessionQuickMark.mark_code == m.QuickMarkCatalog.code)
            .where(m.SessionQuickMark.session_id == session_id)
            .order_by(m.SessionQuickMark.marked_at_ms)
        )).all()
        attitudes = list((await self._s.execute(
            select(m.AttitudeCatalog.label)
            .join(m.SessionAttitude, m.SessionAttitude.attitude_code == m.AttitudeCatalog.code)
            .where(m.SessionAttitude.session_id == session_id)
            .order_by(m.AttitudeCatalog.display_order)
        )).scalars().all())
        verbalizations = list((await self._s.execute(
            select(m.Verbalization.text).where(m.Verbalization.session_id == session_id)
            .order_by(m.Verbalization.created_at)
        )).scalars().all())
        validated = tuple(
            await PostgresSessionIndicatorRepository(self._s).list_validated(session_id)
        )
        drawing_metrics = None
        if metrics:
            drawing_metrics = DrawingMetrics(
                total_time_ms=metrics.total_time_ms or 0,
                latency_ms=metrics.latency_ms or 0,
                stroke_count=metrics.stroke_count,
                pressure_avg=metrics.pressure_avg or 0.0,
                pause_count=metrics.pause_count,
                erase_count=metrics.erase_count,
                area_pct=metrics.area_pct or 0.0,
                sequence_start=metrics.sequence_start,
            )
        started = session.started_at or session.created_at
        ended = session.completed_at
        duration = int((ended - started).total_seconds() // 60) if ended else None
        return ReportContext(
            patient_name=patient.full_name,
            patient_birth_date=patient.birth_date,
            patient_document=patient.document_number,
            examiner_name=profile.full_name,
            examiner_license=profile.license_number,
            test_name=test.name,
            test_code=test.code,
            session_date=(session.created_at or dt.datetime.now(dt.UTC)).date(),
            session_duration_min=duration,
            reason=session.reason,
            consent=ConsentSummary(
                audio_authorized=consent.audio_authorized,
                digital_authorized=consent.digital_authorized,
                confidential_ack=consent.confidential_ack,
                signed_at=consent.signed_at.date() if consent and consent.signed_at else None,
            ) if consent else None,
            attitudes=tuple(attitudes),
            metrics=drawing_metrics,
            observations=obs.additional_notes if obs else "",
            quick_marks=tuple((label, at) for label, at in marks),
            verbalizations=tuple(verbalizations),
            validated=validated,
        )

    async def list(
        self, status: str | None = None, patient_id: UUID | None = None
    ) -> list[tuple[m.Report, m.Patient]]:
        stmt = (select(m.Report, m.Patient)
            .join(m.Session, m.Session.id == m.Report.session_id)
            .join(m.Patient, m.Patient.id == m.Session.patient_id)
            .where(m.Session.created_by == self._uid))
        if status:
            stmt = stmt.where(m.Report.status == status)
        if patient_id:
            stmt = stmt.where(m.Session.patient_id == patient_id)
        return list((await self._s.execute(stmt.order_by(m.Report.updated_at.desc()))).all())

    async def create(
        self, session_id: UUID, sections: list[dict]
    ) -> tuple[m.Report, list[m.ReportSection]]:
        session, patient, test, profile = await self._session_row(session_id)
        if session.status != "completed":
            raise Conflict("la sesión debe estar completada para generar el informe")
        existing = (
            await self._s.execute(select(m.Report).where(m.Report.session_id == session_id))
        ).scalar_one_or_none()
        if existing is not None:
            if existing.status == "validated":
                raise Conflict("el informe ya está validado")
            rows = await self.sections(existing.id)
            edited = {r.section_number: r for r in rows if r.edited_by_examiner}
            await self._s.execute(
                delete(m.ReportSection).where(m.ReportSection.report_id == existing.id)
            )
            for item in sections:
                old = edited.get(item["section_number"])
                if old:
                    item = {**item, "content": old.content, "edited_by_examiner": True}
                self._s.add(m.ReportSection(report_id=existing.id, **item))
            existing.updated_at = dt.datetime.now(dt.UTC)
            await self._s.flush()
            return existing, await self.sections(existing.id)
        report = m.Report(session_id=session_id, status="draft")
        self._s.add(report)
        await self._s.flush()
        for item in sections:
            self._s.add(m.ReportSection(report_id=report.id, **item))
        await self._s.flush()
        return report, await self.sections(report.id)

    async def update_section(
        self, report_id: UUID, number: int, content: str
    ) -> tuple[m.Report, m.ReportSection]:
        report, _ = await self._load(report_id)
        if report.status != "draft":
            raise Conflict("el informe validado es de solo lectura")
        section = (await self._s.execute(select(m.ReportSection).where(
            m.ReportSection.report_id == report_id, m.ReportSection.section_number == number
        ))).scalar_one_or_none()
        if section is None:
            raise NotFound
        section.content = content
        section.edited_by_examiner = True
        report.updated_at = dt.datetime.now(dt.UTC)
        await self._s.flush()
        return report, section

    async def validate(self, report_id: UUID) -> tuple[m.Report, list[m.ReportSection]]:
        report, patient, sections = await self.get(report_id)
        if report.status != "draft":
            raise Conflict("el informe ya está validado")
        if len(sections) != 9 or any(not s.content.strip() for s in sections):
            raise Conflict("todas las secciones del informe deben estar completas")
        has_indicator = await self._s.scalar(
            select(func.count())
            .select_from(m.SessionIndicator)
            .join(m.Report, m.Report.session_id == m.SessionIndicator.session_id)
            .where(m.Report.id == report_id)
            .where(m.SessionIndicator.status == "validated")
        )
        if not has_indicator:
            raise Conflict("debe existir al menos un indicador validado")
        report.status = "validated"
        report.validated_at = dt.datetime.now(dt.UTC)
        report.validated_by = self._uid
        await self._s.flush()
        return report, sections
