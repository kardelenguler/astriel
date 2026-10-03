"""Kayıtlı haritalar: kaydet, listele, getir, adını değiştir, sil, geri al.

Hesaplamayı kendisi YAPMAZ; ChartService'e bırakır (tek sorumluluk).

Her işlem giriş yapmış kullanıcı adına yapılır. Başka birinin haritası
"bulunamadı" (404) sayılır, "yetkin yok" (403) denmez: 403, o id'de bir
harita olduğunu ele verirdi.
"""

import logging
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.birth_chart import BirthChart
from app.models.user import User
from app.repositories.chart_repository import ChartRepository
from app.schemas.chart import (
    ChartCalculateRequest,
    ChartCreateRequest,
    ChartListOut,
    ChartResponse,
    ChartSummaryOut,
    SavedChartOut,
)
from app.services.chart_service import ENGINE_VERSION, ChartService

logger = logging.getLogger(__name__)

CHART_NOT_FOUND = "Harita bulunamadı."


class SavedChartService:
    def __init__(self, db: Session, calculator: ChartService) -> None:
        self.db = db
        self.charts = ChartRepository(db)
        self.calculator = calculator

    # ------------------------------ Kaydet ------------------------------
    def save(self, user: User, data: ChartCreateRequest) -> SavedChartOut:
        result = self.calculator.calculate(data)
        chart = BirthChart(
            user_id=user.id,
            name=data.name,
            place_name=data.place_name,
            birth_date=data.birth_date,
            birth_time=data.birth_time,
            latitude=data.latitude,
            longitude=data.longitude,
            timezone=result.timezone,
            # Gerçekte kullanılan sistem (kutup yedeği sonrası); saat bilinmiyorsa istenen
            house_system=result.house_system.code if result.house_system else data.house_system,
            chart_data=result.model_dump(mode="json"),
            engine_version=result.engine_version,
        )
        self.charts.add(chart)
        self.db.commit()
        logger.info("Harita kaydedildi: id=%s, kullanıcı=%s", chart.id, user.id)
        return self._to_out(chart, result)

    # ------------------------------ Oku ------------------------------
    def get(self, user: User, chart_id: uuid.UUID) -> SavedChartOut:
        chart = self._get_or_404(user, chart_id)
        return self._to_out(chart, self._current_result(chart))

    def list(self, user: User, *, limit: int, offset: int) -> ChartListOut:
        charts = self.charts.list_for_user(user.id, limit=limit, offset=offset)
        return ChartListOut(
            items=[self._to_summary(chart) for chart in charts],
            total=self.charts.count_for_user(user.id),
            limit=limit,
            offset=offset,
        )

    # ------------------------------ Değiştir ------------------------------
    def rename(self, user: User, chart_id: uuid.UUID, name: str) -> SavedChartOut:
        chart = self._get_or_404(user, chart_id)
        chart.name = name
        self.db.commit()
        return self._to_out(chart, self._current_result(chart))

    def delete(self, user: User, chart_id: uuid.UUID) -> None:
        chart = self._get_or_404(user, chart_id)
        self.charts.soft_delete(chart)
        self.db.commit()
        logger.info("Harita silindi (geri alınabilir): id=%s", chart.id)

    def restore(self, user: User, chart_id: uuid.UUID) -> SavedChartOut:
        chart = self.charts.get_for_user(chart_id, user.id, include_deleted=True)
        if chart is None:
            raise NotFoundError(CHART_NOT_FOUND)
        if chart.deleted_at is not None:  # zaten silinmemişse hata değil, aynen döner
            self.charts.restore(chart)
            self.db.commit()
            logger.info("Harita geri alındı: id=%s", chart.id)
        return self._to_out(chart, self._current_result(chart))

    # ------------------------------ Yardımcılar ------------------------------
    def _get_or_404(self, user: User, chart_id: uuid.UUID) -> BirthChart:
        chart = self.charts.get_for_user(chart_id, user.id)
        if chart is None:
            raise NotFoundError(CHART_NOT_FOUND)
        return chart

    def _current_result(self, chart: BirthChart) -> ChartResponse:
        """Kayıtlı sonucu döndürür. Motor sürümü değiştiyse doğum bilgilerinden
        yeniden hesaplar ve kaydı günceller (chart_data bir önbellektir)."""
        if chart.engine_version == ENGINE_VERSION:
            return ChartResponse.model_validate(chart.chart_data)

        result = self.calculator.calculate(
            ChartCalculateRequest(
                birth_date=chart.birth_date,
                birth_time=chart.birth_time,
                latitude=chart.latitude,
                longitude=chart.longitude,
                house_system=chart.house_system,
            )
        )
        logger.info(
            "Harita yeniden hesaplandı: id=%s, %s -> %s",
            chart.id, chart.engine_version, ENGINE_VERSION,
        )
        chart.chart_data = result.model_dump(mode="json")
        chart.engine_version = result.engine_version
        self.db.commit()
        return result

    @staticmethod
    def _to_out(chart: BirthChart, result: ChartResponse) -> SavedChartOut:
        return SavedChartOut(
            id=chart.id,
            name=chart.name,
            place_name=chart.place_name,
            birth_date=chart.birth_date,
            birth_time=chart.birth_time,
            latitude=chart.latitude,
            longitude=chart.longitude,
            created_at=chart.created_at,
            chart=result,
        )

    @staticmethod
    def _to_summary(chart: BirthChart) -> ChartSummaryOut:
        data = ChartResponse.model_validate(chart.chart_data)
        planets = {planet.key: planet for planet in data.planets}
        return ChartSummaryOut(
            id=chart.id,
            name=chart.name,
            birth_date=chart.birth_date,
            birth_time=chart.birth_time,
            place_name=chart.place_name,
            sun_sign=planets["sun"].sign,
            moon_sign=planets["moon"].sign,
            ascendant_sign=data.ascendant.sign if data.ascendant else None,
            created_at=chart.created_at,
        ) 