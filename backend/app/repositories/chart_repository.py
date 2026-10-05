"""Kayıtlı doğum haritası sorguları.

İki kural her sorguda geçerlidir:
1. Silinmiş haritalar (deleted_at dolu) varsayılan olarak GÖRÜNMEZ.
2. Her sorgu kullanıcıya göre filtrelenir; bir kullanıcı başkasının haritasına
   repository seviyesinde bile ulaşamaz.

NOT: BaseRepository.get_by_id bu iki kuralı UYGULAMAZ; haritalar için
get_for_user kullanılır.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, NamedTuple

from sqlalchemy import Select, cast, delete, func, select
from sqlalchemy.dialects.postgresql import JSONB, JSONPATH
from sqlalchemy.orm import defer

from app.models.birth_chart import BirthChart
from app.repositories.base_repository import BaseRepository


def _from_chart_data(path: str):
    """chart_data içinden tek bir parçayı VERİTABANINDA çıkarır (PostgreSQL JSONPath).

    Böylece listede tüm harita verisi (gezegenler, evler, açılar) Python'a taşınmaz.
    Yol bulunamazsa (ör. saat bilinmiyorsa yükselen yok) None döner.
    """
    return func.jsonb_path_query_first(BirthChart.chart_data, cast(path, JSONPATH), type_=JSONB)


class ChartSummaryRow(NamedTuple):
    """Listedeki bir satır: harita kaydı (chart_data hariç) + özet burçlar."""

    chart: BirthChart
    sun_sign: dict[str, Any] | None
    moon_sign: dict[str, Any] | None
    ascendant_sign: dict[str, Any] | None


class ChartRepository(BaseRepository[BirthChart]):
    model = BirthChart

    @staticmethod
    def _active_charts_of(user_id: uuid.UUID) -> Select:
        """Kullanıcının silinmemiş haritaları (ortak filtre, tekrar yazılmasın)."""
        return select(BirthChart).where(
            BirthChart.user_id == user_id,
            BirthChart.deleted_at.is_(None),
        )

    def get_for_user(
        self, chart_id: uuid.UUID, user_id: uuid.UUID, *, include_deleted: bool = False
    ) -> BirthChart | None:
        """Harita bu kullanıcıya aitse döndürür; değilse (veya yoksa) None.

        include_deleted=True: "Geri al" için silinmiş haritayı da bulur.
        """
        query = select(BirthChart).where(
            BirthChart.id == chart_id,
            BirthChart.user_id == user_id,
        )
        if not include_deleted:
            query = query.where(BirthChart.deleted_at.is_(None))
        return self.db.scalar(query)

    def list_summaries_for_user(
        self, user_id: uuid.UUID, *, limit: int, offset: int
    ) -> list[ChartSummaryRow]:
        """Liste sayfası için özet. chart_data'nın tamamı okunmaz, sadece 3 burç.

        En yeni harita üstte. Aynı anda oluşturulanlar id'ye göre sıralanır
        (sıralama sabit olmazsa sayfalar arasında kayıt atlanabilir/tekrarlanabilir).
        """
        query = (
            self._active_charts_of(user_id)
            .add_columns(
                _from_chart_data('$.planets[*] ? (@.key == "sun").sign'),
                _from_chart_data('$.planets[*] ? (@.key == "moon").sign'),
                _from_chart_data("$.ascendant.sign"),
            )
            .options(defer(BirthChart.chart_data))  # büyük JSONB sütunu hiç okunmasın
            .order_by(BirthChart.created_at.desc(), BirthChart.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return [ChartSummaryRow(*row) for row in self.db.execute(query)]

    def count_for_user(self, user_id: uuid.UUID) -> int:
        """Toplam kayıt sayısı; frontend'de "3. sayfa / 5" göstermek için."""
        query = select(func.count()).select_from(self._active_charts_of(user_id).subquery())
        return self.db.scalar(query) or 0

    def soft_delete(self, chart: BirthChart) -> None:
        """Haritayı silinmiş olarak işaretler; satır silinmez, "Geri al" mümkün."""
        chart.deleted_at = datetime.now(timezone.utc)
        self.db.flush()  # autoflush kapalı: flush olmadan sonraki sorgular değişikliği görmez

    def restore(self, chart: BirthChart) -> None:
        """Silinmiş haritayı geri getirir."""
        chart.deleted_at = None
        self.db.flush()

    def purge_deleted_before(self, cutoff: datetime) -> int:
        """cutoff'tan önce silinmiş haritaları KALICI olarak siler; silinen sayıyı döndürür.

        Kullanıcıya göre filtrelenmez: bu bir bakım işidir, tüm kullanıcılar için çalışır.
        """
        result = self.db.execute(
            delete(BirthChart).where(
                BirthChart.deleted_at.is_not(None),
                BirthChart.deleted_at < cutoff,
            )
        )
        return result.rowcount or 0