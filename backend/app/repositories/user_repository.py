"""Kullanıcı tablosu sorguları."""

from sqlalchemy import select

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """Kullanıcı adı ve e-posta zaten şemada küçük harfe çevrilmiş gelir;
    burada tekrar normalleştirilmez (tek sorumluluk)."""

    model = User

    def get_by_username(self, username: str) -> User | None:
        return self.db.scalar(select(User).where(User.username == username))

    def get_by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(User.email == email)) 