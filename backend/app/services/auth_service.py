"""Kayıt, giriş ve token'dan kullanıcıyı bulma iş mantığı.

Commit bu katmanda yapılır (repository commit etmez).
"""

import logging

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, ConflictError, InvalidInputError
from app.core.security import (
    create_access_token,
    hash_password,
    password_fingerprint,
    read_access_token,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate

logger = logging.getLogger(__name__)

# Yanlış kullanıcı adı ile yanlış şifre AYNI mesajı alır;
# aksi halde hangi kullanıcı adlarının kayıtlı olduğu öğrenilebilir.
INVALID_CREDENTIALS = "Kullanıcı adı veya şifre hatalı."

# Hesap ayarlarında şifre yanlışsa 401 DEĞİL 422 döner: frontend 401 görünce
# kullanıcıyı çıkışa atar, oysa burada sadece bir uyarı gösterilmeli.
WRONG_CURRENT_PASSWORD = "Mevcut şifre hatalı."

PASSWORD_CHANGED = "Şifren değiştirildiği için oturumun kapandı. Lütfen yeni şifrenle giriş yap."

# Kullanıcı bulunamasa bile şifre doğrulaması yapılır. Yoksa "kullanıcı yok" yanıtı
# çok hızlı, "şifre yanlış" yanıtı yavaş döner ve süreden kullanıcı adı tahmin edilir.
_DUMMY_HASH = hash_password("zamanlama-saldirisina-karsi-sahte-sifre")


def _token_for(user: User) -> str:
    """Kullanıcının ŞU ANKİ şifresine bağlı token üretir."""
    return create_access_token(user.id, password_fingerprint(user.hashed_password))


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
        return _token_for(user)

    # ------------------------- Token -> kullanıcı -------------------------
    def get_current_user(self, token: str) -> User:
        data = read_access_token(token)  # geçersizse zaten AuthenticationError
        user = self.users.get_by_id(data.user_id)
        if user is None or not user.is_active:
            # Token geçerli ama kullanıcı silinmiş ya da devre dışı
            raise AuthenticationError(detail=f"token kullanıcısı yok/pasif: {data.user_id}")
        if data.fingerprint != password_fingerprint(user.hashed_password):
            # Token eski şifreyle alınmış: şifre değiştirildikten sonra eski oturumlar kapanır
            raise AuthenticationError(PASSWORD_CHANGED, detail="token eski şifreye ait")
        return user

    # --------------------------- Hesap ayarları ---------------------------
    def change_password(self, user: User, current_password: str, new_password: str) -> str:
        """Mevcut şifre doğruysa şifreyi değiştirir ve YENİ şifreye bağlı token döndürür.

        Diğer cihazlardaki (eski şifreyle alınmış) oturumlar geçersiz olur; şifreyi
        değiştiren kişi yeni token'la devam eder.
        """
        if not verify_password(current_password, user.hashed_password):
            raise InvalidInputError(WRONG_CURRENT_PASSWORD)
        if current_password == new_password:
            raise InvalidInputError("Yeni şifre mevcut şifreyle aynı olamaz.")

        user.hashed_password = hash_password(new_password)
        self.db.commit()
        logger.info("Şifre değiştirildi: id=%s", user.id)
        return _token_for(user)

    def delete_account(self, user: User, password: str) -> None:
        """Şifre doğruysa kullanıcıyı ve TÜM haritalarını kalıcı olarak siler."""
        if not verify_password(password, user.hashed_password):
            raise InvalidInputError(WRONG_CURRENT_PASSWORD)

        user_id = user.id
        self.db.delete(user)  # haritalar da silinir (modeldeki cascade)
        self.db.commit()
        logger.info("Hesap silindi: id=%s", user_id) 