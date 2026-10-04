import pytest
from starlette.requests import Request

from app.core.exceptions import TooManyRequestsError
from app.core.rate_limit import LoginAttemptLimiter, attempt_key, client_ip


class FakeClock:
    """Gerçekten beklemeden zamanı ileri sarabilmek için sahte saat."""

    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


@pytest.fixture
def clock() -> FakeClock:
    return FakeClock()


@pytest.fixture
def limiter(clock: FakeClock) -> LoginAttemptLimiter:
    return LoginAttemptLimiter(max_attempts=3, window_seconds=60, clock=clock)


# =============================== GİRİŞ SAYACI ===============================
def test_allows_attempts_below_limit(limiter):
    limiter.record_failure("k")
    limiter.record_failure("k")
    limiter.check("k")  # hata fırlatmamalı


def test_blocks_when_limit_reached(limiter):
    for _ in range(3):
        limiter.record_failure("k")
    with pytest.raises(TooManyRequestsError):
        limiter.check("k")


def test_unblocks_after_window_passes(limiter, clock):
    for _ in range(3):
        limiter.record_failure("k")
    clock.now += 61
    limiter.check("k")


def test_reset_clears_failures(limiter):
    for _ in range(3):
        limiter.record_failure("k")
    limiter.reset("k")
    limiter.check("k")


def test_keys_are_independent(limiter):
    for _ in range(3):
        limiter.record_failure("a")
    limiter.check("b")


def test_attempt_key_normalizes_username_and_includes_ip():
    assert attempt_key("  Kardelen ", "1.2.3.4") == attempt_key("kardelen", "1.2.3.4")
    assert attempt_key("kardelen", "1.2.3.4") != attempt_key("kardelen", "5.6.7.8")


# =============================== HER İSTEĞİ SAYMA (hit) ===============================
def test_hit_allows_up_to_limit_then_blocks_with_message(limiter):
    for _ in range(3):
        limiter.hit("ip")
    with pytest.raises(TooManyRequestsError) as error:
        limiter.hit("ip", "Çok fazla arama.")
    assert error.value.message == "Çok fazla arama."


def test_hit_unblocks_after_window_passes(limiter, clock):
    for _ in range(3):
        limiter.hit("ip")
    clock.now += 61
    limiter.hit("ip")  # hata fırlatmamalı


# =============================== GERÇEK IP ===============================
def _request(forwarded_for: str | None = None, host: str = "10.0.0.1") -> Request:
    headers = [(b"x-forwarded-for", forwarded_for.encode())] if forwarded_for else []
    return Request({"type": "http", "headers": headers, "client": (host, 1234)})


def test_client_ip_ignores_spoofed_first_value():
    # Render'daki gerçek örnek: ilk değer kullanıcının uydurduğu, sondan 3. gerçek IP
    request = _request("9.9.9.9,85.107.124.161, 104.23.180.20, 10.31.50.238")
    assert client_ip(request) == "85.107.124.161"


def test_client_ip_without_spoofing():
    request = _request("85.107.124.161, 104.23.180.20, 10.31.50.238")
    assert client_ip(request) == "85.107.124.161"


def test_client_ip_falls_back_to_connection_without_header():
    # Kendi bilgisayarında çalışırken başlık yoktur
    assert client_ip(_request(host="127.0.0.1")) == "127.0.0.1"


def test_client_ip_falls_back_when_header_too_short():
    # Beklenenden kısa başlık güvenilmez: bağlantının kendi IP'si kullanılır
    assert client_ip(_request("9.9.9.9", host="127.0.0.1")) == "127.0.0.1"
