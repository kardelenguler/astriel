"""Harita endpoint'leri.

- POST /charts/calculate : HERKESE AÇIK (misafir de hesaplar), kaydetmez.
- Diğerleri              : giriş gerekli; kullanıcının kendi kayıtlı haritaları.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import ChartServiceDep, CurrentUser, SavedChartServiceDep
from app.schemas.chart import (
    ChartCalculateRequest,
    ChartCreateRequest,
    ChartListOut,
    ChartRenameRequest,
    ChartResponse,
    SavedChartOut,
)
from app.schemas.error import ErrorResponse

router = APIRouter(prefix="/charts")

MAX_PAGE_SIZE = 50  # tek istekle en fazla bu kadar kayıt; yoksa binlerce kayıt çekilebilir

_AUTH = {401: {"model": ErrorResponse, "description": "Giriş gerekli"}}
_AUTH_404 = {**_AUTH, 404: {"model": ErrorResponse, "description": "Harita bulunamadı"}}

# {chart_id:uuid}: yol SADECE geçerli bir UUID ise bu route'a eşleşir.
# Olmasaydı "GET /charts/calculate" isteği bu route'a düşer, "calculate" UUID
# olmadığı için 422 dönerdi; oysa doğru yanıt 405'tir (calculate sadece POST).
CHART_PATH = "/{chart_id:uuid}"


# =============================== HERKESE AÇIK ===============================
@router.post(
    "/calculate",
    response_model=ChartResponse,
    summary="Doğum haritası hesapla (kaydetmeden)",
)
def calculate_chart(request: ChartCalculateRequest, service: ChartServiceDep) -> ChartResponse:
    return service.calculate(request)


# =============================== KAYITLI HARİTALAR ===============================
@router.post(
    "",
    response_model=SavedChartOut,
    status_code=status.HTTP_201_CREATED,
    summary="Haritayı hesapla ve kaydet",
    responses=_AUTH,
)
def save_chart(
    data: ChartCreateRequest, user: CurrentUser, service: SavedChartServiceDep
) -> SavedChartOut:
    return service.save(user, data)


@router.get(
    "",
    response_model=ChartListOut,
    summary="Kayıtlı haritalarım (en yeni üstte)",
    responses=_AUTH,
)
def list_charts(
    user: CurrentUser,
    service: SavedChartServiceDep,
    limit: Annotated[int, Query(ge=1, le=MAX_PAGE_SIZE)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> ChartListOut:
    return service.list(user, limit=limit, offset=offset)


@router.get(CHART_PATH, response_model=SavedChartOut, summary="Kayıtlı harita", responses=_AUTH_404)
def get_chart(
    chart_id: uuid.UUID, user: CurrentUser, service: SavedChartServiceDep
) -> SavedChartOut:
    return service.get(user, chart_id)


@router.patch(CHART_PATH, response_model=SavedChartOut, summary="Haritanın adını değiştir", responses=_AUTH_404)
def rename_chart(
    chart_id: uuid.UUID, data: ChartRenameRequest, user: CurrentUser, service: SavedChartServiceDep
) -> SavedChartOut:
    return service.rename(user, chart_id, data.name)


@router.delete(
    CHART_PATH,
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Haritayı sil (geri alınabilir)",
    responses=_AUTH_404,
)
def delete_chart(chart_id: uuid.UUID, user: CurrentUser, service: SavedChartServiceDep) -> None:
    service.delete(user, chart_id)


@router.post(
    CHART_PATH + "/restore",
    response_model=SavedChartOut,
    summary="Silinen haritayı geri al",
    responses=_AUTH_404,
)
def restore_chart(
    chart_id: uuid.UUID, user: CurrentUser, service: SavedChartServiceDep
) -> SavedChartOut:
    return service.restore(user, chart_id)