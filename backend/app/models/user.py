"""Kullanıcı tablosu."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:  # sadece VS Code'un tip kontrolü için; döngüsel importu önler
    from app.models.birth_chart import BirthChart


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    # İsteğe bağlı: girilmezse şifre sıfırlama yapılamaz
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)

    hashed_password: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(default=True)

    # Kullanıcının kayıtlı haritaları. Kullanıcı silinirse haritaları da silinir.
    charts: Mapped[list[BirthChart]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )