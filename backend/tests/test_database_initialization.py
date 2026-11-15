import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from sqlalchemy import create_engine, func, inspect, insert, select, update
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.schema import CreateTable

from app.database import create_migration_engine
from app.init_db import initialize_database
from app.models import MandiPrice
from app.services.market_data import build_seed_market_data

SEED_MARKET_DATA = build_seed_market_data()


class DatabaseInitializationTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")

    def tearDown(self):
        self.engine.dispose()

    def test_initialization_creates_schema_without_seeding(self):
        inserted_count = initialize_database(self.engine)

        self.assertEqual(inserted_count, 0)
        self.assertEqual(
            set(inspect(self.engine).get_table_names()),
            {"users", "mandi_prices"},
        )
        with self.engine.connect() as connection:
            count = connection.execute(
                select(func.count()).select_from(MandiPrice)
            ).scalar_one()
        self.assertEqual(count, 0)
        indexes = inspect(self.engine).get_indexes("mandi_prices")
        natural_key_index = next(
            index
            for index in indexes
            if index["name"] == "uq_mandi_prices_natural_key"
        )
        self.assertTrue(natural_key_index["unique"])

    def test_seed_is_idempotent_and_does_not_overwrite_existing_records(self):
        inserted_count = initialize_database(self.engine, seed_market_data=True)
        self.assertEqual(inserted_count, len(SEED_MARKET_DATA))

        existing_record = SEED_MARKET_DATA[0]
        with self.engine.begin() as connection:
            connection.execute(
                update(MandiPrice)
                .where(
                    MandiPrice.crop == existing_record["crop"],
                    MandiPrice.state == existing_record["state"],
                    MandiPrice.district == existing_record["district"],
                    MandiPrice.mandi_name == existing_record["mandi_name"],
                    MandiPrice.price_date == existing_record["price_date"],
                )
                .values(modal_price=12345.0)
            )

        inserted_again = initialize_database(self.engine, seed_market_data=True)
        with self.engine.connect() as connection:
            count = connection.execute(
                select(func.count()).select_from(MandiPrice)
            ).scalar_one()
            saved_price = connection.execute(
                select(MandiPrice.modal_price).where(
                    MandiPrice.crop == existing_record["crop"],
                    MandiPrice.state == existing_record["state"],
                    MandiPrice.district == existing_record["district"],
                    MandiPrice.mandi_name == existing_record["mandi_name"],
                    MandiPrice.price_date == existing_record["price_date"],
                )
            ).scalar_one()

        self.assertEqual(inserted_again, 0)
        self.assertEqual(count, len(SEED_MARKET_DATA))
        self.assertEqual(saved_price, 12345.0)

    def test_database_unique_index_rejects_duplicate_market_record(self):
        initialize_database(self.engine, seed_market_data=True)
        first_record = SEED_MARKET_DATA[0]

        with self.assertRaises(IntegrityError):
            with self.engine.begin() as connection:
                connection.execute(
                    sqlite_insert(MandiPrice).values(first_record)
                )

    def test_initialization_adds_unique_index_to_existing_table(self):
        with self.engine.begin() as connection:
            connection.execute(CreateTable(MandiPrice.__table__))
            connection.execute(insert(MandiPrice).values(SEED_MARKET_DATA[0]))

        initialize_database(self.engine)

        with self.engine.connect() as connection:
            count = connection.execute(
                select(func.count()).select_from(MandiPrice)
            ).scalar_one()
        indexes = inspect(self.engine).get_indexes("mandi_prices")
        self.assertEqual(count, 1)
        self.assertTrue(
            any(
                index["name"] == "uq_mandi_prices_natural_key"
                and index["unique"]
                for index in indexes
            )
        )

    def test_existing_duplicate_records_abort_without_removing_data(self):
        existing_record = SEED_MARKET_DATA[0]
        with self.engine.begin() as connection:
            connection.execute(CreateTable(MandiPrice.__table__))
            connection.execute(insert(MandiPrice).values(existing_record))
            connection.execute(insert(MandiPrice).values(existing_record))

        with self.assertRaisesRegex(RuntimeError, "duplicate"):
            initialize_database(self.engine)

        with self.engine.connect() as connection:
            count = connection.execute(
                select(func.count()).select_from(MandiPrice)
            ).scalar_one()
        self.assertEqual(count, 2)
        self.assertEqual(inspect(self.engine).get_table_names(), ["mandi_prices"])

    def test_importing_fastapi_does_not_create_or_seed_database(self):
        backend_dir = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary_directory:
            database_path = Path(temporary_directory) / "startup.db"
            environment = os.environ.copy()
            environment["DATABASE_URL"] = "sqlite:///" + database_path.as_posix()
            environment["SECRET_KEY"] = "test-secret-key-for-startup-test"
            environment["VERCEL"] = "1"
            environment["VERCEL_ENV"] = "production"

            result = subprocess.run(
                [sys.executable, "-c", "import app.main"],
                cwd=backend_dir,
                env=environment,
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertFalse(database_path.exists())

    def test_migration_engine_rejects_a_pooled_postgresql_url(self):
        environment = os.environ.copy()
        environment.pop("DATABASE_URL_UNPOOLED", None)
        environment["DATABASE_URL"] = (
            "postgresql://unused:unused@ep-example-pooler.region.aws.neon.tech/neondb"
        )
        with patch.dict(os.environ, environment, clear=True):
            with self.assertRaisesRegex(RuntimeError, "DATABASE_URL_UNPOOLED"):
                create_migration_engine()

    def test_migration_engine_prefers_the_direct_url(self):
        environment = os.environ.copy()
        environment["DATABASE_URL"] = (
            "postgresql://unused:unused@ep-example-pooler.region.aws.neon.tech/neondb"
        )
        environment["DATABASE_URL_UNPOOLED"] = (
            "postgresql://unused:unused@ep-example.region.aws.neon.tech/neondb"
        )
        with patch.dict(os.environ, environment, clear=True):
            migration_engine = create_migration_engine()
        try:
            self.assertEqual(migration_engine.url.drivername, "postgresql+psycopg")
            self.assertEqual(migration_engine.url.host, "ep-example.region.aws.neon.tech")
        finally:
            migration_engine.dispose()


if __name__ == "__main__":
    unittest.main()
