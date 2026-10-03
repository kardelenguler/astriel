"""UserRepository testleri (gerçek test veritabanında)."""

import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.repositories.user_repository import UserRepository

pytestmark = pytest.mark.db  # bu dosyadaki tüm testler veritabanı ister


def _user(username: str, email: str | None = None) -> User:
    return User(username=username, email=email, hashed_password="x")


def test_add_assigns_id_and_created_at(db_session):
    user = UserRepository(db_session).add(_user("kardelen"))
    assert user.id is not None
    assert user.created_at is not None  # veritabanı doldurdu (server_default)


def test_get_by_username(db_session):
    repo = UserRepository(db_session)
    repo.add(_user("kardelen"))
    assert repo.get_by_username("kardelen") is not None
    assert repo.get_by_username("olmayan") is None


def test_get_by_email(db_session):
    repo = UserRepository(db_session)
    repo.add(_user("kardelen", email="k@mail.com"))
    assert repo.get_by_email("k@mail.com").username == "kardelen"
    assert repo.get_by_email("olmayan@mail.com") is None


def test_get_by_id(db_session):
    repo = UserRepository(db_session)
    user = repo.add(_user("kardelen"))
    assert repo.get_by_id(user.id) is user
    assert repo.get_by_id(uuid.uuid4()) is None


def test_delete(db_session):
    repo = UserRepository(db_session)
    user = repo.add(_user("kardelen"))
    repo.delete(user)
    assert repo.get_by_username("kardelen") is None


def test_database_rejects_duplicate_username(db_session):
    # Servis bunu önceden kontrol edecek; ama iki istek aynı anda gelirse
    # son savunma hattı veritabanının benzersizlik kuralıdır
    repo = UserRepository(db_session)
    repo.add(_user("kardelen"))
    with pytest.raises(IntegrityError):
        repo.add(_user("kardelen"))


def test_many_users_without_email_allowed(db_session):
    # E-posta benzersiz ama boş (NULL) değerler bu kurala takılmaz
    repo = UserRepository(db_session)
    repo.add(_user("ali"))
    repo.add(_user("ayse"))
    assert repo.get_by_username("ayse").email is None 