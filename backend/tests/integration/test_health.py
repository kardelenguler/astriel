"""Sağlık kontrolü testleri."""

from sqlalchemy.exc import OperationalError

from app.db.session import get_db
from app.main import app


class _BrokenSession:
    """Veritabanı kapalıymış gibi davranan sahte oturum."""

    def execute(self, *args, **kwargs):
        raise OperationalError("SELECT 1", {}, Exception("bağlantı reddedildi"))


def test_health_returns_503_when_database_is_down(client):
    # get_db yerine bozuk oturumu veren sahte bir bağımlılık koyuyoruz;
    # böylece PostgreSQL'i gerçekten kapatmadan "veritabanı çöktü" durumunu test ediyoruz.
    app.dependency_overrides[get_db] = lambda: _BrokenSession()
    try:
        response = client.get("/api/v1/health")
    finally:
        app.dependency_overrides.clear()  # diğer testleri etkilemesin

    assert response.status_code == 503
    assert response.json() == {"status": "degraded", "database": "unavailable"}