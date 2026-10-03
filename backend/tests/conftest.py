"""Tüm testlerde kullanılabilen ortak fixture'lar.

pytest bu dosyayı otomatik bulur; import etmeye gerek yoktur.
"""

import os

# Uygulama import edilmeden ÖNCE ayarlanmalı: ortam değişkeni .env'deki değeri ezer.
# Böylece testlerde environment="test" olur ve log dosyasına yazılmaz.
os.environ["ENVIRONMENT"] = "test"

from collections.abc import Generator  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import Engine, create_engine  # noqa: E402
from sqlalchemy.engine import make_url  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

import app.models  # noqa: E402, F401  (tüm tablolar Base.metadata'ya kaydolsun)
from app.core.config import settings  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    """Gerçek sunucu açmadan API'ye istek atmayı sağlar (veritabanı gerektirmeyen testler)."""
    return TestClient(app)


# =========================== VERİTABANI TESTLERİ ===========================
@pytest.fixture(scope="session")
def test_engine() -> Generator[Engine, None, None]:
    """Test veritabanına bağlanır ve tabloları sıfırdan kurar (tüm test oturumunda bir kez)."""
    if settings.test_database_url is None:
        pytest.skip("TEST_DATABASE_URL tanımlı değil; veritabanı testleri atlandı.")

    url = settings.test_database_url.get_secret_value()
    # Güvenlik kilidi: yanlışlıkla gerçek veritabanı yazılırsa tablolarını SİLMEYELİM
    if not (make_url(url).database or "").endswith("_test"):
        pytest.exit("TEST_DATABASE_URL'deki veritabanı adı '_test' ile bitmeli!", returncode=1)

    engine = create_engine(url)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def db_session(test_engine: Engine) -> Generator[Session, None, None]:
    """Her test için bir oturum; test bitince yapılan HER ŞEY geri alınır.

    Dışta bir transaction açılır. Kod içinde db.commit() çağrılsa bile
    'create_savepoint' modu sayesinde gerçek commit olmaz, sadece savepoint olur.
    Test bitince dıştaki transaction geri alınır: veritabanı tertemiz kalır.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
        autoflush=False,
        expire_on_commit=False,
    )
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def db_client(db_session: Session) -> Generator[TestClient, None, None]:
    """API'yi test veritabanı oturumuyla çalıştıran istemci."""
    app.dependency_overrides[get_db] = lambda: db_session
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear() 



@pytest.fixture(autouse=True)
def _reset_login_limiter():
    """Her test temiz bir giriş sayacıyla başlasın (testler birbirini kilitlemesin)."""
    from app.core.rate_limit import login_limiter

    login_limiter.clear()
    yield
    login_limiter.clear() 