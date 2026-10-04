"""Kayıtlı doğum haritası tablosu.

Doğum bilgileri ayrı sütunlarda tutulur; hesaplanmış harita (gezegenler,
evler, açılar) tek bir JSONB sütununda saklanır. Harita her zaman doğum
bilgilerinden yeniden hesaplanabildiği için chart_data bir önbellek gibidir.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime, time
from typing import TYPE_CHECKING, Any

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class BirthChart(Base, TimestampMixin):
    __tablename__ = "birth_charts"
    __table_args__ = (
        # Son savunma hattı: API doğrulamayı atlasa bile veritabanı kabul etmez
        CheckConstraint("latitude BETWEEN -90 AND 90", name="latitude_range"),
        CheckConstraint("longitude BETWEEN -180 AND 180", name="longitude_range"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    # ---------- Doğum bilgileri ----------
    name: Mapped[str] = mapped_column(String(100))  # ör. "Benim haritam"
    birth_date: Mapped[date]
    birth_time: Mapped[time | None]  # None = doğum saati bilinmiyor
    place_name: Mapped[str] = mapped_column(String(200))
    latitude: Mapped[float]
    longitude: Mapped[float]
    timezone: Mapped[str] = mapped_column(String(64))  # IANA, ör. "Europe/Istanbul"
    # Varsayılan yok: gerçekte kullanılan sistem (kutup yedeği sonrası) her zaman açıkça yazılır
    house_system: Mapped[str] = mapped_column(String(1))

    # ---------- Hesaplama sonucu ----------
    chart_data: Mapped[dict[str, Any]] = mapped_column(JSONB)
    engine_version: Mapped[str] = mapped_column(String(50))


    # ---------- Yumuşak silme ----------
    # Dolu ise harita "silinmiş" sayılır ve listelerde görünmez;
    # kullanıcı "Geri al" derse tekrar None yapılır.
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="charts")