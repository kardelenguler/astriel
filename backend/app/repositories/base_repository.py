"""Tüm repository'lerin ortak temeli.

Repository'nin tek işi veritabanı sorgusudur: iş kuralı bilmez, COMMIT ETMEZ.
Commit servis katmanında yapılır; böylece bir servis birden fazla işlemi
tek transaction'da toplayabilir (ya hepsi kaydedilir ya hiçbiri).

Kullanım:
    class UserRepository(BaseRepository[User]):
        model = User
"""

import uuid
from typing import Generic, TypeVar

from sqlalchemy.orm import Session

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]  # alt sınıf hangi tabloyla çalıştığını burada belirtir

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, id_: uuid.UUID) -> ModelT | None:
        return self.db.get(self.model, id_)

    def add(self, obj: ModelT) -> ModelT:
        self.db.add(obj)
        self.db.flush()  # INSERT'i hemen gönderir (id, created_at dolsun) ama commit ETMEZ
        return obj

    def delete(self, obj: ModelT) -> None:
        self.db.delete(obj)
        self.db.flush()