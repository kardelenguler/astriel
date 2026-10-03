"""Kayıt, giriş ve token'dan kullanıcıyı bulma iş mantığı.

Commit bu katmanda yapılır (repository commit etmez).
"""

import logging

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate

logger = logging.getLogger(__name__)

# Yanlış kullanıcı adı ile yanlış şifre AYNI mesajı alır;
# aksi halde hangi kullanıcı adlarının kayıtlı olduğu öğrenilebilir.
INVALID_CREDENTIALS = "Kullanıcı adı veya şifre hatalı."

# Kullanıcı bulunamasa bile şifre doğrulaması yapılır. Yoksa "kullanıcı yok" yanıtı
# çok hızlı, "şifre yanlış" yanıtı yavaş döner ve süreden kullanıcı adı tahmin edilir.
_DUMMY_HASH = hash_password("zamanlama-saldirisina-karsi-sahte-sifre")


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.users = UserRepository(db)

    # ------------------------------ Kayıt ------------------------------
    def register(self, data: UserCreate) -> User:
        # Önce kontrol: kullanıcıya hangi alanın sorunlu olduğunu söyleyebilmek için
        if self.users.get_by_username(data.username):
            raise ConflictError("Bu kullanıcı adı zaten alınmış.")
        if data.email and self.users.get_by_email(data.email):
            raise ConflictError("Bu e-posta adresiyle zaten bir hesap var.")

        user = User(
            username=data.username,
            email=data.email,
            display_name=data.display_name,
            hashed_password=hash_password(data.password),
        )
        try:
            self.users.add(user)
            self.db.commit()
        except IntegrityError as exc:
            # İki istek aynı anda gelip yukarıdaki kontrolü birlikte geçtiyse
            # veritabanının benzersizlik kuralı yakalar
            self.db.rollback()
            raise ConflictError(
                "Bu kullanıcı adı veya e-posta zaten kullanılıyor.",
                detail=str(exc.orig),
            ) from exc

        logger.info("Yeni kullanıcı kaydedildi: id=%s", user.id)  # şifre ASLA loglanmaz
        return user

    # ------------------------------ Giriş ------------------------------
    def authenticate(self, username: str, password: str) -> User:
        # Giriş formunda da "Kardelen" ile "kardelen" aynı hesap sayılsın
        user = self.users.get_by_username(username.strip().lower())

        if user is None:
            verify_password(password, _DUMMY_HASH)  # süre eşitlensin diye; sonuç önemsiz
            raise AuthenticationError(INVALID_CREDENTIALS)
        if not verify_password(password, user.hashed_password):
            raise AuthenticationError(INVALID_CREDENTIALS)
        if not user.is_active:
            raise AuthenticationError("Bu hesap devre dışı bırakılmış.")
        return user

    def login(self, username: str, password: str) -> str:
        """Bilgiler doğruysa erişim token'ı döndürür."""
        user = self.authenticate(username, password)
        logger.info("Giriş yapıldı: id=%s", user.id)
        return create_access_token(user.id)

    # ------------------------- Token -> kullanıcı -------------------------
    def get_current_user(self, token: str) -> User:
        user_id = decode_access_token(token)  # geçersizse zaten AuthenticationError
        user = self.users.get_by_id(user_id)
        if user is None or not user.is_active:
            # Token geçerli ama kullanıcı silinmiş ya da devre dışı
            raise AuthenticationError(detail=f"token kullanıcısı yok/pasif: {user_id}")
        return user 