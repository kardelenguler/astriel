"""Production ayarları: veritabanı adresi çevirisi ve Angular sitesinin sunulması."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings, settings
from app.main import create_app

_REQUIRED = {"secret_key": "x" * 32, "geocoder_user_agent": "Astriel/test (test@example.com)"}


# ------------------------- Veritabanı adresi -------------------------
@pytest.mark.parametrize(
    "given",
    ["postgresql://u:p@host/db?sslmode=require", "postgres://u:p@host/db?sslmode=require"],
    ids=["postgresql", "postgres"],
)
def test_database_url_is_converted_to_psycopg_driver(given):
    s = Settings(_env_file=None, database_url=given, **_REQUIRED)
    assert s.database_url.get_secret_value() == "postgresql+psycopg://u:p@host/db?sslmode=require"


def test_database_url_with_driver_is_left_unchanged():
    url = "postgresql+psycopg://u:p@localhost/astriel"
    s = Settings(_env_file=None, database_url=url, **_REQUIRED)
    assert s.database_url.get_secret_value() == url


# ------------------------- Angular sitesinin sunulması -------------------------
@pytest.fixture
def site_client(tmp_path, monkeypatch):
    """Sahte bir derlenmiş site klasörüyle uygulama oluşturur."""
    dist = tmp_path / "browser"
    dist.mkdir()
    (dist / "index.html").write_text("<app-root>ANGULAR</app-root>", encoding="utf-8")
    (dist / "main.js").write_text("console.log('js')", encoding="utf-8")
    (tmp_path / "gizli.txt").write_text("GIZLI", encoding="utf-8")  # site klasörünün DIŞINDA

    monkeypatch.setattr(settings, "frontend_dist", dist)
    return TestClient(create_app())


def test_root_returns_index_html(site_client):
    response = site_client.get("/")
    assert response.status_code == 200
    assert "ANGULAR" in response.text


def test_angular_routes_return_index_html(site_client):
    # /harita gibi adresleri Angular'ın kendisi açar; sunucu index.html vermeli
    assert "ANGULAR" in site_client.get("/haritalarim").text


def test_existing_file_is_served(site_client):
    assert site_client.get("/main.js").text == "console.log('js')"


def test_cannot_escape_site_folder(site_client):
    response = site_client.get("/..%2Fgizli.txt")
    assert "GIZLI" not in response.text


def test_unknown_api_path_returns_json_404(site_client):
    response = site_client.get("/api/v1/olmayan-adres")
    assert response.status_code == 404
    assert "error" in response.json() 