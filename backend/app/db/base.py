"""Tüm SQLAlchemy modellerinin ortak temeli.

Her model Base'den miras alır:

    class User(Base, TimestampMixin):
        __tablename__ = "users"
        ...
"""

from datetime import datetime

from sqlalchemy import DateTime, MetaData, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Kısıtlamalara (primary key, foreign key, unique...) tutarlı isimler verir.
# Alembic ileride bir kısıtlamayı silmek/değiştirmek istediğinde onu
# bu isimle bulur. Olmazsa PostgreSQL rastgele isimler üretir.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class TimestampMixin:
    """created_at ve updated_at sütunlarını ekler. Değerleri veritabanı kendisi doldurur."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )