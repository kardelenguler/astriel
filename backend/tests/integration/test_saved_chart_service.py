"""SavedChartService testleri (gerçek test veritabanında, gerçek hesaplamayla)."""

import uuid
from datetime import date, datetime, time, timedelta, timezone
import pytest

from app.core.exceptions import NotFoundError
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.chart import ChartCreateRequest
from app.services.chart_service import ENGINE_VERSION, ChartService

from app.repositories.chart_repository import ChartRepository
from app.services.saved_chart_service import (
    DELETED_RETENTION_DAYS,
    SavedChartService,
    purge_old_deleted_charts,
)
pytestmark = pytest.mark.db


@pytest.fixture
def service(db_session) -> SavedChartService:
    return SavedChartService(db_session, ChartService())


@pytest.fixture
def owner(db_session) -> User:
    return UserRepository(db_session).add(User(username="sahip", hashed_password="x"))


@pytest.fixture
def stranger(db_session) -> User:
    return UserRepository(db_session).add(User(username="yabanci", hashed_password="x"))


def _request(**overrides) -> ChartCreateRequest:
    # 15.06.1995 14:30 Antalya: Güneş İkizler, yükselen Terazi (API testlerinde doğrulandı)
    data = {
        "name": "Benim haritam",
        "place_name": "Antalya",
        "birth_date": date(1995, 6, 15),
        "birth_time": time(14, 30),
        "latitude": 36.8969,
        "longitude": 30.7133,
    }
    return ChartCreateRequest(**{**data, **overrides})


# =============================== KAYDET / OKU ===============================
def test_save_returns_full_chart(service, owner):
    saved = service.save(owner, _request())
    assert saved.name == "Benim haritam"
    assert saved.chart.time_known
    assert len(saved.chart.planets) == 12


def test_get_own_chart(service, owner):
    saved = service.save(owner, _request())
    assert service.get(owner, saved.id).chart == saved.chart


def test_other_users_chart_not_found(service, owner, stranger):
    saved = service.save(owner, _request())
    with pytest.raises(NotFoundError):
        service.get(stranger, saved.id)


def test_list_returns_summaries(service, owner):
    service.save(owner, _request())
    service.save(owner, _request(name="Saatsiz", birth_time=None))

    result = service.list(owner, limit=10, offset=0)
    assert result.total == 2
    by_name = {item.name: item for item in result.items}
    assert by_name["Benim haritam"].sun_sign.key == "gemini"
    assert by_name["Benim haritam"].ascendant_sign.key == "libra"
    assert by_name["Saatsiz"].ascendant_sign is None  # saat yoksa yükselen yok


# =============================== DEĞİŞTİR ===============================
def test_rename(service, owner):
    saved = service.save(owner, _request())
    assert service.rename(owner, saved.id, "Yeni ad").name == "Yeni ad"


def test_delete_hides_chart(service, owner):
    saved = service.save(owner, _request())
    service.delete(owner, saved.id)
    with pytest.raises(NotFoundError):
        service.get(owner, saved.id)
    assert service.list(owner, limit=10, offset=0).total == 0


def test_restore_brings_chart_back_and_is_repeatable(service, owner):
    saved = service.save(owner, _request())
    service.delete(owner, saved.id)
    service.restore(owner, saved.id)
    service.restore(owner, saved.id)  # ikinci kez de hata vermemeli
    assert service.get(owner, saved.id).id == saved.id


def test_restore_other_users_chart_not_found(service, owner, stranger):
    saved = service.save(owner, _request())
    service.delete(owner, saved.id)
    with pytest.raises(NotFoundError):
        service.restore(stranger, saved.id)


# =============================== ÖNBELLEK ===============================
def test_outdated_chart_is_recalculated(service, owner, db_session):
    saved = service.save(owner, _request())
    chart = service.charts.get_for_user(saved.id, owner.id)
    chart.engine_version = "astriel-0/eski"  # motor sürümü değişmiş gibi davran
    db_session.flush()

    service.get(owner, saved.id)
    assert chart.engine_version == ENGINE_VERSION  # yeniden hesaplanıp güncellendi 

# =============================== KALICI TEMİZLİK ===============================
def test_purge_removes_only_charts_deleted_long_ago(service, owner, db_session):
    old = service.save(owner, _request(name="Çoktan silinen"))
    recent = service.save(owner, _request(name="Yeni silinen"))
    kept = service.save(owner, _request(name="Silinmemiş"))
    service.delete(owner, old.id)
    service.delete(owner, recent.id)

    # İlk harita saklama süresinden 1 gün önce silinmiş gibi yap
    now = datetime.now(timezone.utc)
    charts = ChartRepository(db_session)
    old_row = charts.get_for_user(old.id, owner.id, include_deleted=True)
    old_row.deleted_at = now - timedelta(days=DELETED_RETENTION_DAYS + 1)
    db_session.flush()

    assert purge_old_deleted_charts(db_session, now=now) == 1

    # Eski olan kalıcı olarak gitti, artık geri alınamaz
    assert charts.get_for_user(old.id, owner.id, include_deleted=True) is None
    with pytest.raises(NotFoundError):
        service.restore(owner, old.id)

    # Yeni silinen hâlâ geri alınabilir, silinmemiş olana dokunulmadı
    assert service.restore(owner, recent.id).name == "Yeni silinen"
    assert service.get(owner, kept.id).name == "Silinmemiş"
    