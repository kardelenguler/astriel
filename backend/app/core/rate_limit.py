"""Giriş denemelerini sınırlar (kaba kuvvet saldırılarına karşı).

Aynı kullanıcı adı + IP adresi için kısa sürede çok fazla hatalı deneme
yapılırsa giriş geçici olarak engellenir. IP'nin anahtara katılması,
başkasının kullanıcı adıyla bilerek hatalı deneme yapıp gerçek sahibini
kilitlemesini önler.

Not: Sayaçlar bellekte tutulur. Uygulama tek bir süreçte çalıştığı sürece
yeterlidir; birden fazla sunucuya ölçeklenirse Redis gibi ortak bir depoya
taşınmalıdır.
"""

import threading
import time
from collections import deque
from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, Request

from app.core.exceptions import TooManyRequestsError

MAX_FAILED_ATTEMPTS = 5
WINDOW_SECONDS = 5 * 60  # 5 dakika
_MAX_TRACKED_KEYS = 10_000  # bellek şişmesin diye üst sınır

# Render'da istek şu sırayla gelir: Cloudflare -> Render. Her biri X-Forwarded-For
# başlığının SONUNA bir IP ekler. Kullanıcının gerçek IP'si bu yüzden sondan 3.'dür.
# Baştaki değerleri kullanıcı kendisi yazabilir; onlara asla güvenilmez.
TRUSTED_PROXY_HOPS = 2


def client_ip(request: Request) -> str | None:
    """İsteği gönderen kullanıcının gerçek IP'si (sahte X-Forwarded-For'a karşı güvenli)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        hops = [ip.strip() for ip in forwarded.split(",") if ip.strip()]
        if len(hops) > TRUSTED_PROXY_HOPS:
            return hops[-(TRUSTED_PROXY_HOPS + 1)]
    # Başlık yoksa (kendi bilgisayarında çalışırken) doğrudan bağlantının IP'si
    return request.client.host if request.client else None


def attempt_key(username: str, client_host: str | None) -> str:
    """Sayacın anahtarı: "1.2.3.4|kardelen" (kullanıcı adı küçük harfe çevrilir)."""
    return f"{client_host or 'unknown'}|{username.strip().lower()}"


class LoginAttemptLimiter:
    def __init__(
        self,
        max_attempts: int = MAX_FAILED_ATTEMPTS,
        window_seconds: float = WINDOW_SECONDS,
        clock: Callable[[], float] = time.monotonic,  # testlerde sahte saat verilebilir
    ) -> None:
        self._max_attempts = max_attempts
        self._window = window_seconds
        self._clock = clock
        self._failures: dict[str, deque[float]] = {}
        self._lock = threading.Lock()  # FastAPI istekleri farklı thread'lerde çalışabilir

    def check(self, key: str) -> None:
        """Sınır aşıldıysa TooManyRequestsError fırlatır."""
        with self._lock:
            if len(self._recent_failures(key)) >= self._max_attempts:
                raise TooManyRequestsError()

    def record_failure(self, key: str) -> None:
        with self._lock:
            if len(self._failures) >= _MAX_TRACKED_KEYS:
                self._prune_all()
            self._failures.setdefault(key, deque()).append(self._clock())

    def reset(self, key: str) -> None:
        """Başarılı girişten sonra sayacı sıfırla."""
        with self._lock:
            self._failures.pop(key, None)

    def clear(self) -> None:
        """Tüm sayaçları sil (testler için)."""
        with self._lock:
            self._failures.clear()

    def _recent_failures(self, key: str) -> deque[float]:
        """Süresi dolmuş denemeleri atıp kalanları döndürür."""
        failures = self._failures.get(key)
        if failures is None:
            return deque()
        cutoff = self._clock() - self._window
        while failures and failures[0] <= cutoff:
            failures.popleft()
        if not failures:
            del self._failures[key]
        return failures

    def _prune_all(self) -> None:
        for key in list(self._failures):
            self._recent_failures(key)


# Uygulama boyunca tek bir sayaç kullanılır
login_limiter = LoginAttemptLimiter()


def get_login_limiter() -> LoginAttemptLimiter:
    return login_limiter


LoginLimiterDep = Annotated[LoginAttemptLimiter, Depends(get_login_limiter)]
