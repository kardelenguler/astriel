"""Alembic migration testleri.

Diğer testler tabloları create_all ile (doğrudan modellerden) kurar. Bu yüzden
bir migration eksik ya da hatalı olsa fark edilmez. Bu testler migration'ları
boş, ayrı bir şemada gerçekten çalıştırır. Test bitince her şey geri alınır.
"""

from collections.abc import Generator
from pathlib import Path

import pytest
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import Connection, Engine, inspect, text

import app.models  # noqa: F401  (tüm tablolar Base.metadata'ya kaydolsun)
from app.db.base import Base

pytestmark = pytest.mark.db  # bu dosyadaki tüm testler veritabanı ister

BACKEND_DIR = Path(__file__).resolve().parents[2]
SCHEMA = "migration_test"  # diğer testlerin tablolarına dokunmamak için ayrı şema


def _alembic_config(connection: Connection | None = None) -> Config:
    # alembic.ini'yi okumuyoruz: o dosya logging ayarlarını değiştirip diğer testleri bozabilir
    config = Config()
    config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    config.attributes["connection"] = connection
    return config


@pytest.fixture
def migration_connection(test_engine: Engine) -> Generator[Connection, None, None]:
    """Boş bir şemada çalışan bağlantı. Test bitince şema dahil her şey geri alınır."""
    connection = test_engine.connect()
    transaction = connection.begin()
    connection.execute(text(f"CREATE SCHEMA {SCHEMA}"))
    connection.execute(text(f"SET LOCAL search_path TO {SCHEMA}"))
    try:
        yield connection
    finally:
        transaction.rollback()  # PostgreSQL'de tablo oluşturma da geri alınabilir
        connection.close()


def _table_names(connection: Connection) -> set[str]:
    return set(inspect(connection).get_table_names()) - {"alembic_version"}


def test_migrations_have_single_head():
    """İki migration aynı yerden dallanmamalı (aksi halde 'alembic upgrade head' hata verir)."""
    heads = ScriptDirectory.from_config(_alembic_config()).get_heads()
    assert len(heads) == 1, f"Birden fazla son migration var: {heads}"


def test_migrations_match_models(migration_connection):
    """Tüm migration'lar çalışınca veritabanı modellerle birebir aynı olmalı."""
    command.upgrade(_alembic_config(migration_connection), "head")

    diff = compare_metadata(MigrationContext.configure(migration_connection), Base.metadata)

    assert diff == [], f"Modeller ile migration'lar uyuşmuyor (migration eksik olabilir): {diff}"


def test_downgrade_to_base_and_upgrade_again(migration_connection):
    """Migration'lar geri alınabilmeli ve tekrar uygulanabilmeli."""
    config = _alembic_config(migration_connection)

    command.upgrade(config, "head")
    command.downgrade(config, "base")
    assert _table_names(migration_connection) == set()

    command.upgrade(config, "head")
    assert _table_names(migration_connection) == {"users", "birth_charts"}