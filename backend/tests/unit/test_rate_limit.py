import pytest

from app.core.exceptions import TooManyRequestsError
from app.core.rate_limit import LoginAttemptLimiter, attempt_key


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