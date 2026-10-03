"""Yer arama API'si testleri.

Gerçek Nominatim yerine sahte geocoder kullanılır (dependency_overrides);
geocoder'ın kendisi tests/unit/test_geocoder.py'de test edildi.
"""

import pytest

from app.api.deps import get_geocoder
from app.clients.geocoder import Place
from app.core.exceptions import ExternalServiceError
from app.main import app

URL = "/api/v1/places/search"

ANTALYA = Place(
    name="Antalya",
    display_name="Antalya, Akdeniz Bölgesi, Türkiye",
    latitude=36.8865728,
    longitude=30.7030242,
    country="Türkiye",
)


class FakeGeocoder:
    """Gerçeğiyle aynı search() metoduna sahip sahte geocoder; gelen aramaları kaydeder."""

    def __init__(self, places=(), error: Exception | None = None) -> None:
        self.places = places
        self.error = error
        self.queries: list[str] = []

    def search(self, query: str):
        self.queries.append(query)
        if self.error:
            raise self.error
        return self.places


@pytest.fixture
def fake_geocoder():
    fake = FakeGeocoder(places=(ANTALYA,))
    app.dependency_overrides[get_geocoder] = lambda: fake
    yield fake
    app.dependency_overrides.clear()


def test_search_returns_places_without_login(client, fake_geocoder):
    response = client.get(URL, params={"q": "  Antalya  "})  # token YOK: misafir de arayabilir
    assert response.status_code == 200
    [place] = response.json()
    assert place["latitude"] == pytest.approx(36.8865728)
    assert fake_geocoder.queries == ["Antalya"]  # boşluklar temizlenip gönderildi


def test_too_short_query_never_reaches_geocoder(client, fake_geocoder):
    response = client.get(URL, params={"q": "  a  "})
    assert response.status_code == 422
    assert response.json()["error"]["message"] == "Aramak için en az 2 harf yazın."
    assert fake_geocoder.queries == []  # Nominatim'e boş yere istek gitmedi


def test_missing_query(client, fake_geocoder):
    response = client.get(URL)
    assert response.status_code == 422
    assert response.json()["error"]["fields"][0]["field"] == "q"


def test_too_long_query(client, fake_geocoder):
    response = client.get(URL, params={"q": "a" * 101})
    assert response.status_code == 422


def test_service_down_returns_503(client, fake_geocoder):
    fake_geocoder.error = ExternalServiceError(detail="sahte: Nominatim kapalı")
    response = client.get(URL, params={"q": "Antalya"})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "service_unavailable" 