"""Yer adından koordinat bulma (Nominatim / OpenStreetMap, yedek: Open-Meteo).

Dış servisle konuşan TEK dosya; projenin geri kalanı hangi servisin kullanıldığını bilmez.
Servis değişirse (ör. ücretli bir sağlayıcıya geçilirse) sadece bu dosya değişir.

Nominatim kullanım kuralları (uyulmazsa IP engellenir):
  - Saniyede en fazla 1 istek
  - Uygulamayı tanıtan User-Agent
  - Sonuçlar önbelleğe alınmalı (aynı arama tekrar gönderilmemeli)
  - Otomatik tamamlama (her tuşta arama) YASAK
  https://operations.osmfoundation.org/policies/nominatim/

Neden yedek servis var?
  Render'ın ücretsiz planında çıkış IP adresi başka sitelerle ORTAKTIR. Nominatim sınırı
  IP başına uyguladığı için, biz kurala uysak bile aynı IP'yi kullanan başka siteler
  yüzünden 429 (çok fazla istek) veya 403 (engellendi) alabiliriz. Bu iki durumda
  arama Open-Meteo Geocoding API'ye yönlendirilir (ücretsiz, anahtar gerektirmez).
  https://open-meteo.com/en/docs/geocoding-api
"""

import logging
import threading
import time
from collections import OrderedDict
from dataclasses import dataclass

import httpx2

from app.core.config import settings
from app.core.exceptions import ExternalServiceError

logger = logging.getLogger(__name__)

MIN_SECONDS_BETWEEN_REQUESTS = 1.0  # Nominatim kuralı
MAX_RESULTS = 5
CACHE_SIZE = 500  # en fazla bu kadar farklı arama hatırlanır

# Aynı anda en fazla bu kadar arama sırada bekleyebilir. Fazlası beklemeden 503 alır.
# Sınır olmasaydı çok sayıda eşzamanlı arama sunucunun tüm iş parçacıklarını
# kilitte bekletir ve SİTENİN TAMAMI (giriş, harita...) donardı.
MAX_WAITING_SEARCHES = 5

BUSY_MESSAGE = "Yer arama şu an çok yoğun. Lütfen birkaç saniye sonra tekrar deneyin."

# Yedek servis: Nominatim bizi reddettiğinde kullanılır
FALLBACK_URL = "https://geocoding-api.open-meteo.com/v1/search"
# Bu durum kodlarında sorun Nominatim'in bizi (ortak IP'yi) reddetmesidir -> yedeğe geç.
# Diğer hatalarda (500, zaman aşımı...) yedeğe geçilmez; hata kullanıcıya iletilir.
FALLBACK_STATUS_CODES = frozenset({403, 429})


@dataclass(frozen=True)
class Place:
    name: str  # kısa ad, ör. "Antalya"
    display_name: str  # tam ad, ör. "Antalya, Akdeniz Bölgesi, Türkiye"
    latitude: float
    longitude: float
    country: str | None


class NominatimGeocoder:
    def __init__(
        self,
        client: httpx2.Client | None = None,
        min_interval: float = MIN_SECONDS_BETWEEN_REQUESTS,
    ) -> None:
        # Testte sahte bir client (MockTransport) verilir; normalde kendimiz oluştururuz
        self._client = client or httpx2.Client(
            headers={"User-Agent": settings.geocoder_user_agent},
            timeout=settings.geocoder_timeout_seconds,
        )
        self._min_interval = min_interval
        self._last_request_at = 0.0
        self._cache: OrderedDict[str, tuple[Place, ...]] = OrderedDict()
        # İki ayrı kilit: Nominatim isteği sürerken önbellek okumaları beklemesin
        self._request_lock = threading.Lock()  # Nominatim'e aynı anda tek istek
        self._cache_lock = threading.Lock()  # önbelleğe aynı anda tek erişim (çok kısa sürer)
        # Sıradaki istek sayısının üst sınırı (yukarıdaki MAX_WAITING_SEARCHES açıklaması)
        self._queue = threading.BoundedSemaphore(MAX_WAITING_SEARCHES)

    def search(self, query: str) -> tuple[Place, ...]:
        """Yer adını arar. Sonuç yoksa boş tuple (hata değil).

        Nominatim 403/429 dönerse arama yedek servisle (Open-Meteo) yapılır.
        Servise ulaşılamazsa, yanıt bozuksa veya sıra doluysa ExternalServiceError (503).
        """
        cleaned = " ".join(query.split())  # "  İzmir   Bornova " -> "İzmir Bornova"
        # Önbellek anahtarı: "ANTALYA" ile "antalya" aynı arama sayılsın.
        # Servise anahtar DEĞİL, temizlenmiş orijinal yazı gönderilir: casefold()
        # Türkçe "İ" harfini "i" + birleşik nokta (U+0307) yapar ve aramayı bozabilir.
        key = cleaned.casefold()

        # Önbellekteki aramalar sıra beklemez: yavaş bir istek onları bekletmesin
        cached = self._cached(key)
        if cached is not None:
            return cached

        if not self._queue.acquire(blocking=False):
            raise ExternalServiceError(BUSY_MESSAGE, detail="geocoder sırası dolu")
        try:
            # Dışarıya aynı anda tek istek gider (Nominatim'in saniyede 1 kuralı)
            with self._request_lock:
                # Biz sırada beklerken başka bir istek aynı yeri aramış olabilir
                cached = self._cached(key)
                if cached is not None:
                    return cached

                self._wait_for_rate_limit()
                places = self._fetch(cleaned)
            self._remember(key, places)  # sadece BAŞARILI sonuçlar önbelleğe girer
            return places
        finally:
            self._queue.release()

    # ------------------------------ Yardımcılar ------------------------------
    def _wait_for_rate_limit(self) -> None:
        elapsed = time.monotonic() - self._last_request_at
        if elapsed < self._min_interval:
            time.sleep(self._min_interval - elapsed)
        self._last_request_at = time.monotonic()

    def _fetch(self, query: str) -> tuple[Place, ...]:
        """Önce Nominatim; Nominatim bizi reddederse (403/429) Open-Meteo."""
        params = {
            "q": query,
            "format": "jsonv2",
            "limit": MAX_RESULTS,
            "addressdetails": 1,  # ülke adı için
            "accept-language": "tr",  # sonuçlar Türkçe gelsin
            "featureType": "settlement",  # sadece yerleşim yerleri (havalimanı, cadde vb. değil)
        }
        try:
            response = self._client.get(settings.geocoder_url, params=params)
            if response.status_code in FALLBACK_STATUS_CODES:
                logger.warning(
                    "Nominatim %s döndü (ortak IP sınırı), yedek servise geçiliyor",
                    response.status_code,
                )
                return self._fetch_fallback(query)
            response.raise_for_status()  # diğer 4xx / 5xx -> hata
            data = response.json()
        except httpx2.HTTPError as exc:  # zaman aşımı, bağlantı hatası, 4xx/5xx
            raise ExternalServiceError(detail=f"Nominatim isteği başarısız: {exc!r}") from exc
        except ValueError as exc:  # yanıt geçerli JSON değil
            raise ExternalServiceError(detail=f"Nominatim bozuk JSON döndü: {exc}") from exc

        return self._parse(data)

    def _fetch_fallback(self, query: str) -> tuple[Place, ...]:
        """Open-Meteo Geocoding ile arama (sadece Nominatim reddettiğinde çağrılır)."""
        params = {
            "name": query,
            "count": MAX_RESULTS,
            "language": "tr",  # sonuçlar Türkçe gelsin
            "format": "json",
        }
        try:
            response = self._client.get(FALLBACK_URL, params=params)
            response.raise_for_status()
            data = response.json()
        except httpx2.HTTPError as exc:
            raise ExternalServiceError(detail=f"Open-Meteo isteği başarısız: {exc!r}") from exc
        except ValueError as exc:
            raise ExternalServiceError(detail=f"Open-Meteo bozuk JSON döndü: {exc}") from exc

        return self._parse_fallback(data)

    @staticmethod
    def _parse(items: object) -> tuple[Place, ...]:
        if not isinstance(items, list):
            raise ExternalServiceError(detail=f"Nominatim liste yerine {type(items).__name__} döndü")

        places: list[Place] = []
        for item in items:
            try:
                address = item.get("address") or {}
                places.append(
                    Place(
                        name=item.get("name") or item["display_name"].split(",")[0],
                        display_name=item["display_name"],
                        latitude=float(item["lat"]),
                        longitude=float(item["lon"]),
                        country=address.get("country"),
                    )
                )
            except (KeyError, TypeError, ValueError, AttributeError):
                # Tek bir bozuk sonuç yüzünden tüm aramayı çöpe atmayız; atlar ve loglarız
                logger.warning("Nominatim sonucu atlandı (eksik/bozuk alan): %r", item)
        return tuple(places)

    @staticmethod
    def _parse_fallback(data: object) -> tuple[Place, ...]:
        """Open-Meteo yanıtı: {"results": [...]}. Sonuç yoksa "results" anahtarı hiç gelmez."""
        if not isinstance(data, dict):
            raise ExternalServiceError(detail=f"Open-Meteo sözlük yerine {type(data).__name__} döndü")
        items = data.get("results") or []
        if not isinstance(items, list):
            raise ExternalServiceError(detail="Open-Meteo 'results' alanı liste değil")

        places: list[Place] = []
        for item in items:
            try:
                name = item["name"]
                country = item.get("country")
                # "Antalya, Antalya, Türkiye" gibi tekrarlar olmasın: aynı parça bir kez yazılır
                parts: list[str] = []
                for part in (name, item.get("admin2"), item.get("admin1"), country):
                    if part and part not in parts:
                        parts.append(part)
                places.append(
                    Place(
                        name=name,
                        display_name=", ".join(parts),
                        latitude=float(item["latitude"]),
                        longitude=float(item["longitude"]),
                        country=country,
                    )
                )
            except (KeyError, TypeError, ValueError, AttributeError):
                logger.warning("Open-Meteo sonucu atlandı (eksik/bozuk alan): %r", item)
        return tuple(places)

    def _cached(self, key: str) -> tuple[Place, ...] | None:
        """Önbellekte varsa sonucu döndürür (boş sonuç da geçerli bir sonuçtur); yoksa None."""
        with self._cache_lock:
            places = self._cache.get(key)
            if places is not None:
                self._cache.move_to_end(key)  # yakın zamanda kullanıldı olarak işaretle
            return places

    def _remember(self, key: str, places: tuple[Place, ...]) -> None:
        with self._cache_lock:
            self._cache[key] = places
            if len(self._cache) > CACHE_SIZE:
                self._cache.popitem(last=False)  # en uzun süredir kullanılmayanı at