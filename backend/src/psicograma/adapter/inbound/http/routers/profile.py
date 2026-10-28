"""Perfil profesional del examinador (RF-02).

Siempre el propio: no hay `/profile/{id}`, asi que no existe un id ajeno que
probar. La matricula alimenta la firma del informe (`ReportContext.examiner_license`).
"""

from __future__ import annotations

from fastapi import APIRouter

from .....config.container import Profiles
from ..schemas import ProfileOut, ProfilePatch

router = APIRouter(prefix="/profile", tags=["perfil"])


@router.get("", response_model=ProfileOut)
async def mi_perfil(store: Profiles) -> ProfileOut:
    return ProfileOut.model_validate(await store.get())


@router.patch("", response_model=ProfileOut)
async def actualizar_perfil(data: ProfilePatch, store: Profiles) -> ProfileOut:
    return ProfileOut.model_validate(await store.save(data.model_dump(exclude_unset=True)))
