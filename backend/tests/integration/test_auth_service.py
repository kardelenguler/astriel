"""AuthService testleri (gerçek test veritabanında)."""

import pytest

from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import decode_access_token
from app.schemas.user import UserCreate
from app.services.auth_service import INVALID_CREDENTIALS, AuthService

pytestmark = pytest.mark.db

PASSWORD = "gizli-sifre-123"


@pytest.fixture
def service(db_session) -> AuthService:
    return AuthService(db_session)


def _register(service: AuthService, username: str = "kardelen", email: str | None = None):
    return service.register(UserCreate(username=username, password=PASSWORD, email=email))


# =============================== KAYIT ===============================
def test_register_stores_hashed_password(service):
    user = _register(service)
    assert user.id is not None
    assert user.hashed_password != PASSWORD  # düz metin saklanmamalı


def test_register_duplicate_username(service):
    _register(service)
    with pytest.raises(ConflictError) as exc_info:
        _register(service, email="baska@mail.com")
    assert "kullanıcı adı" in exc_info.value.message


def test_register_duplicate_email(service):
    _register(service, email="k@mail.com")
    with pytest.raises(ConflictError) as exc_info:
        _register(service, username="baska", email="k@mail.com")
    assert "e-posta" in exc_info.value.message


def test_register_race_condition_returns_conflict(service, monkeypatch):
    # İki istek aynı anda gelip ön kontrolü birlikte geçmiş gibi davran:
    # ön kontrol "kimse yok" desin, veritabanı yine de reddetsin
    _register(service)
    monkeypatch.setattr(service.users, "get_by_username", lambda username: None)
    with pytest.raises(ConflictError):
        _register(service)


# =============================== GİRİŞ ===============================
def test_login_returns_token_for_user(service):
    user = _register(service)
    token = service.login("kardelen", PASSWORD)
    assert decode_access_token(token) == user.id


def test_login_username_is_case_insensitive(service):
    _register(service)
    assert service.login("  KarDeLen ", PASSWORD)


def test_login_wrong_password(service):
    _register(service)
    with pytest.raises(AuthenticationError) as exc_info:
        service.login("kardelen", "yanlis-sifre")
    assert exc_info.value.message == INVALID_CREDENTIALS


def test_login_unknown_user_gets_same_message(service):
    # Yanlış şifreyle AYNI mesaj: kullanıcı adının kayıtlı olup olmadığı anlaşılmamalı
    with pytest.raises(AuthenticationError) as exc_info:
        service.login("olmayan", PASSWORD)
    assert exc_info.value.message == INVALID_CREDENTIALS


def test_login_inactive_user(service, db_session):
    user = _register(service)
    user.is_active = False
    db_session.commit()
    with pytest.raises(AuthenticationError):
        service.login("kardelen", PASSWORD)


# ========================= TOKEN -> KULLANICI =========================
def test_get_current_user(service):
    user = _register(service)
    token = service.login("kardelen", PASSWORD)
    assert service.get_current_user(token).id == user.id


def test_token_of_deleted_user_rejected(service, db_session):
    # Token hâlâ geçerli (süresi dolmadı) ama kullanıcı artık yok
    user = _register(service)
    token = service.login("kardelen", PASSWORD)
    service.users.delete(user)
    db_session.commit()
    with pytest.raises(AuthenticationError):
        service.get_current_user(token)