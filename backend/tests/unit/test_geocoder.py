"""geocoder.py birim testleri.

İnternete ÇIKMAZ: Nominatim yanıtları sahtedir (httpx2.MockTransport).
"""

import httpx2
import pytest

import app.clients.geocoder as geocoder_module
from app.clients.geocoder import NominatimGeocoder
from app.core.config import settings
from app.core.exceptions import ExternalServiceError

ANTALYA = {
    "name": "Antalya",
    "display_name": "Antalya, Akdeniz Bölgesi, Türkiye",
    "lat": "36.8865728",
    "lon": "30.7030242",
    "address": {"city": "Antalya", "country": "Türkiye"},
}


def _geocoder(handler, min_interval: float = 0):
    """Sahte Nominatim'e bağlı geocoder + ona gelen isteklerin listesi."""
    requests: list[httpx2.Request] = []

    def recording_handler(request: httpx2.Request) -> httpx2.Response:
        requests.append(request)
        return handler(request)

    client = httpx2.Client(transport=httpx2.MockTransport(recording_handler))
    return NominatimGeocoder(client=client, min_interval=min_interval), requests


def _respond_json(data, status: int = 200):
    return lambda request: httpx2.Response(status, json=data)


# =============================== BAŞARILI ARAMA ===============================
def test_parses_result():
    geocoder, _ = _geocoder(_respond_json([ANTALYA]))
    [place] = geocoder.search("Antalya")
    assert place.name == "Antalya"
    assert place.latitude == pytest.approx(36.8865728)  # metin değil, sayı
    assert place.country == "Türkiye"


def test_sends_expected_parameters():
    geocoder, requests = _geocoder(_respond_json([]))
    geocoder.search("  ANTALYA   Muratpaşa ")
    params = requests[0].url.params
    assert params["q"] == "ANTALYA Muratpaşa"  # boşluklar temizlendi, harfler aynen kaldı
    assert params["featureType"] == "settlement"
    assert params["accept-language"] == "tr"


def test_turkish_dotted_i_is_sent_unchanged():
    # casefold() "İ" harfini "i" + birleşik nokta yapar; Nominatim'e bu GİTMEMELİ
    geocoder, requests = _geocoder(_respond_json([]))
    geocoder.search("İzmir")
    assert requests[0].url.params["q"] == "İzmir"


def test_default_client_identifies_itself():
    # Nominatim kuralı: tanıtıcı User-Agent (internete istek ATILMAZ, sadece ayara bakılır)
    geocoder = NominatimGeocoder()
    assert geocoder._client.headers["User-Agent"] == settings.geocoder_user_agent


def test_no_results_is_not_an_error():
    geocoder, _ = _geocoder(_respond_json([]))
    assert geocoder.search("olmayan-bir-yer") == ()


def test_broken_item_is_skipped_not_fatal():
    broken = {"display_name": "Bozuk yer"}  # lat/lon yok
    geocoder, _ = _geocoder(_respond_json([broken, ANTALYA]))
    assert [p.name for p in geocoder.search("x")] == ["Antalya"]


# =============================== ÖNBELLEK ===============================
def test_same_search_hits_cache():
    geocoder, requests = _geocoder(_respond_json([ANTALYA]))
    geocoder.search("Antalya")
    geocoder.search("  ANTALYA ")  # aynı arama sayılmalı
    assert len(requests) == 1  # Nominatim'e sadece BİR istek gitti


def test_errors_are_not_cached():
    responses = iter([httpx2.Response(500), httpx2.Response(200, json=[ANTALYA])])
    geocoder, requests = _geocoder(lambda request: next(responses))

    with pytest.raises(ExternalServiceError):
        geocoder.search("Antalya")  # servis o an çökük
    assert geocoder.search("Antalya")[0].name == "Antalya"  # düzelince yeniden denenir
    assert len(requests) == 2


# =============================== HATALAR ===============================
def _raise(exc_type):
    def handler(request):
        raise exc_type("sahte hata", request=request)
    return handler


@pytest.mark.parametrize(
    "handler",
    [
        _respond_json({"error": "x"}, status=500),
        lambda request: httpx2.Response(200, content=b"<html>bakim</html>"),
        _respond_json({"beklenmeyen": "sozluk"}),
        _raise(httpx2.ReadTimeout),
        _raise(httpx2.ConnectError),
    ],
    ids=["sunucu-hatasi-500", "bozuk-json", "liste-degil", "zaman-asimi", "baglanti-yok"],
)
def test_service_problems_raise_external_service_error(handler):
    geocoder, _ = _geocoder(handler)
    with pytest.raises(ExternalServiceError):
        geocoder.search("Antalya")


# =============================== YOĞUNLUK ===============================
def test_full_queue_returns_busy_error_without_waiting():
    # Sıra doluysa beklemeden 503 dönmeli; yoksa sitenin tüm iş parçacıkları kilitlenirdi
    geocoder, requests = _geocoder(_respond_json([ANTALYA]))
    for _ in range(geocoder_module.MAX_WAITING_SEARCHES):
        geocoder._queue.acquire()  # sırayı başka isteklerle doldurmuş gibi yap

    with pytest.raises(ExternalServiceError):
        geocoder.search("Antalya")
    assert requests == []  # Nominatim'e hiç istek gitmedi


# =============================== HIZ SINIRI ===============================
def test_rate_limit_waits_between_requests(monkeypatch):
    waits: list[float] = []
    # Gerçekten beklemek yerine kaç saniye bekleneceğini kaydediyoruz (test hızlı kalsın)
    monkeypatch.setattr(geocoder_module.time, "sleep", waits.append)

    geocoder, _ = _geocoder(_respond_json([]), min_interval=1.0)
    geocoder.search("birinci")
    geocoder.search("ikinci")  # hemen ardından: beklemesi gerekir

    assert len(waits) == 1
    assert 0 < waits[0] <= 1.0
