"""Veritabanı bağlantısı ve oturum (session) yönetimi.

- engine:       PostgreSQL bağlantı havuzu. Uygulama boyunca tek bir tane olur.
- SessionLocal: Her istek için yeni bir oturum üreten fabrika.
- get_db():     FastAPI'de her isteğe bir oturum verir, iş bitince kapatır.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.database_url.get_secret_value(),
    pool_pre_ping=True,  # kopmuş bağlantıyı kullanmadan önce fark edip yeniler
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,  # commit sonrası nesnelerin verileri kaybolmasın
)


def get_db() -> Generator[Session, None, None]:
    """Bir istek boyunca kullanılacak oturumu verir.

    Hata olursa yarım kalan değişiklikler geri alınır (rollback).
    Her durumda oturum kapatılır; bağlantı havuza geri döner.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close() 