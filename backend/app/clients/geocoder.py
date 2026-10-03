"""Yer adından koordinat bulma (Nominatim / OpenStreetMap).

Dış servisle konuşan TEK dosya; projenin geri kalanı Nominatim'i bilmez.
Servis değişirse (ör. ücretli bir sağlayıcıya geçilirse) sadece bu dosya değişir.

Nominatim kullanım kuralları (uyulmazsa IP engellenir):
  - Saniyede en fazla 1 istek
  - Uygulamayı tanıtan User-Agent
  - Sonuçları önbelleğe alma
  - Otomatik tamamlama (her tuşta arama) YASAK
  https://operations.osmfoundation.org/policies/nominatim/
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
        # Aynı anda gelen istekler sıraya girer: hem hız sınırı hem önbellek güvende kalır
        self._lock = threading.Lock()

    def search(self, query: str) -> tuple[Place, ...]:
        """Yer adını arar. Sonuç yoksa boş tuple (hata değil).

        Servise ulaşılamazsa veya yanıt bozuksa ExternalServiceError (503).
        """
        key = " ".join(query.split()).casefold()  # "  ANTALYA " ile "antalya" aynı arama

        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)  # yakın zamanda kullanıldı olarak işaretle
                return self._cache[key]

            self._wait_for_rate_limit()
            places = self._fetch(key)
            self._remember(key, places)  # sadece BAŞARILI sonuçlar önbelleğe girer
            return places

    # ------------------------------ Yardımcılar ------------------------------
    def _wait_for_rate_limit(self) -> None:
        elapsed = time.monotonic() - self._last_request_at
        if elapsed < self._min_interval:
            time.sleep(self._min_interval - elapsed)
        self._last_request_at = time.monotonic()

    def _fetch(self, query: str) -> tuple[Place, ...]:
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
            response.raise_for_status()  # 4xx / 5xx -> hata
            data = response.json()
        except httpx2.HTTPError as exc:  # zaman aşımı, bağlantı hatası, 4xx/5xx
            raise ExternalServiceError(detail=f"Nominatim isteği başarısız: {exc!r}") from exc
        except ValueError as exc:  # yanıt geçerli JSON değil
            raise ExternalServiceError(detail=f"Nominatim bozuk JSON döndü: {exc}") from exc

        return self._parse(data)

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

    def _remember(self, key: str, places: tuple[Place, ...]) -> None:
        self._cache[key] = places
        if len(self._cache) > CACHE_SIZE:
            self._cache.popitem(last=False)  # en uzun süredir kullanılmayanı at 