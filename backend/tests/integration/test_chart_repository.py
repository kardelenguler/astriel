"""ChartRepository testleri (gerçek test veritabanında)."""

from datetime import date, datetime, timedelta, timezone

import pytest

from app.models.birth_chart import BirthChart
from app.models.user import User
from app.repositories.chart_repository import ChartRepository
from app.repositories.user_repository import UserRepository

pytestmark = pytest.mark.db

BASE_TIME = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)


@pytest.fixture
def repo(db_session) -> ChartRepository:
    return ChartRepository(db_session)


@pytest.fixture
def owner(db_session) -> User:
    return UserRepository(db_session).add(User(username="sahip", hashed_password="x"))


@pytest.fixture
def stranger(db_session) -> User:
    return UserRepository(db_session).add(User(username="yabanci", hashed_password="x"))


def _chart(
    user: User, name: str = "Harita", minutes: int = 0, chart_data: dict | None = None
) -> BirthChart:
    """Test haritası. minutes: oluşturulma zamanını ayarlar (sıralama testleri için).

    created_at elle verilir: veritabanı now() değeri bir transaction içinde hep
    AYNIDIR, testte tüm kayıtlar aynı anda oluşturulmuş görünürdü.
    """
    return BirthChart(
        user_id=user.id,
        name=name,
        birth_date=date(1995, 6, 15),
        birth_time=None,
        place_name="Antalya",
        latitude=36.8969,
        longitude=30.7133,
        timezone="Europe/Istanbul",
        house_system="P",
        chart_data=chart_data or {},
        engine_version="test",
        created_at=BASE_TIME + timedelta(minutes=minutes),
    )


# =============================== TEK HARİTA ===============================
def test_get_own_chart(repo, owner):
    chart = repo.add(_chart(owner))
    assert repo.get_for_user(chart.id, owner.id) is chart


def test_other_users_chart_is_invisible(repo, owner, stranger):
    chart = repo.add(_chart(owner))
    assert repo.get_for_user(chart.id, stranger.id) is None


def test_deleted_chart_hidden_unless_requested(repo, owner):
    chart = repo.add(_chart(owner))
    repo.soft_delete(chart)
    assert repo.get_for_user(chart.id, owner.id) is None
    assert repo.get_for_user(chart.id, owner.id, include_deleted=True) is chart


def test_restore_makes_chart_visible_again(repo, owner):
    chart = repo.add(_chart(owner))
    repo.soft_delete(chart)
    repo.restore(chart)
    assert repo.get_for_user(chart.id, owner.id) is chart


# =============================== LİSTE ===============================
def test_list_newest_first_and_only_active_own_charts(repo, owner, stranger):
    repo.add(_chart(owner, "eski", minutes=0))
    repo.add(_chart(owner, "yeni", minutes=10))
    silinen = repo.add(_chart(owner, "silinen", minutes=20))
    repo.soft_delete(silinen)
    repo.add(_chart(stranger, "baskasinin", minutes=30))

    names = [c.chart.name for c in repo.list_summaries_for_user(owner.id, limit=10, offset=0)]
    assert names == ["yeni", "eski"]


def test_list_pagination(repo, owner):
    for i in range(5):
        repo.add(_chart(owner, f"h{i}", minutes=i))  # h4 en yeni

    first_page = [c.chart.name for c in repo.list_summaries_for_user(owner.id, limit=2, offset=0)]
    second_page = [c.chart.name for c in repo.list_summaries_for_user(owner.id, limit=2, offset=2)]
    assert first_page == ["h4", "h3"]
    assert second_page == ["h2", "h1"]


def test_list_extracts_signs_from_chart_data(repo, owner):
    """Güneş, Ay ve yükselen burç chart_data'nın içinden (veritabanında) bulunmalı."""
    repo.add(
        _chart(
            owner,
            chart_data={
                "planets": [
                    {"key": "moon", "sign": {"key": "leo"}},  # sıra önemli olmamalı
                    {"key": "sun", "sign": {"key": "gemini"}},
                ],
                "ascendant": None,  # doğum saati bilinmiyor
            },
        )
    )

    [row] = repo.list_summaries_for_user(owner.id, limit=10, offset=0)
    assert row.sun_sign == {"key": "gemini"}
    assert row.moon_sign == {"key": "leo"}
    assert row.ascendant_sign is None


def test_count_ignores_deleted_and_others(repo, owner, stranger):
    repo.add(_chart(owner))
    repo.soft_delete(repo.add(_chart(owner)))
    repo.add(_chart(stranger))
    assert repo.count_for_user(owner.id) == 1