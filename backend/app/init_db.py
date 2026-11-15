import argparse

from sqlalchemy import func, inspect, select

from .database import Base, create_migration_engine
from .models import MandiPrice
from .services.market_data import load_seed_data

NATURAL_KEY_COLUMNS = (
    MandiPrice.crop,
    MandiPrice.state,
    MandiPrice.district,
    MandiPrice.mandi_name,
    MandiPrice.price_date,
)


def _reject_duplicate_market_keys(connection) -> None:
    if not inspect(connection).has_table(MandiPrice.__tablename__):
        return

    duplicate = connection.execute(
        select(*NATURAL_KEY_COLUMNS)
        .select_from(MandiPrice)
        .group_by(*NATURAL_KEY_COLUMNS)
        .having(func.count() > 1)
        .limit(1)
    ).first()
    if duplicate:
        raise RuntimeError(
            "Cannot add the market natural-key uniqueness index: duplicate "
            "mandi_prices records already exist. Resolve them before initialization."
        )


def initialize_database(engine, seed_market_data: bool = False) -> int:
    inserted_count = 0
    with engine.begin() as connection:
        _reject_duplicate_market_keys(connection)
        Base.metadata.create_all(bind=connection)
        for table in Base.metadata.tables.values():
            for index in table.indexes:
                index.create(bind=connection, checkfirst=True)
        if seed_market_data:
            inserted_count = load_seed_data(connection)
    return inserted_count


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create the AgriWise database schema; market data seeding is opt-in."
    )
    parser.add_argument(
        "--seed-market-data",
        action="store_true",
        help="Insert bundled demo market data without overwriting existing records.",
    )
    args = parser.parse_args()

    migration_engine = create_migration_engine()
    try:
        inserted_count = initialize_database(
            migration_engine,
            seed_market_data=args.seed_market_data,
        )
    finally:
        migration_engine.dispose()

    print("Database schema initialized; existing records were preserved.")
    if args.seed_market_data:
        print(f"Inserted {inserted_count} missing demo market records.")
    else:
        print("No market data was seeded.")


if __name__ == "__main__":
    main()
