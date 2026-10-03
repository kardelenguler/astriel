"""Test veritabanı altyapısının kendisini test eder."""

import pytest
from sqlalchemy import func, select

from app.models import User

pytestmark = pytest.mark.db  # bu dosyadaki tüm testler veritabanı ister


def test_commit_inside_test_works(db_session):
    db_session.add(User(username="deneme", hashed_password="x"))  # e-posta artık isteğe bağlı
    db_session.commit()  # servisler commit edecek; testte de çalışmalı
    assert db_session.scalar(select(func.count()).select_from(User)) == 1


def test_previous_test_was_rolled_back(db_session):
    # Bir önceki test kullanıcı ekleyip commit etti; burada tablo yine boş olmalı
    assert db_session.scalar(select(func.count()).select_from(User)) == 0 