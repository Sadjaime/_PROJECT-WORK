import asyncio
import sys
from pathlib import Path

from sqlalchemy import inspect

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.database import Base, engine
import src.accounts.models  # noqa: F401
import src.positions.models  # noqa: F401
import src.stocks.models  # noqa: F401
import src.trades.models  # noqa: F401
import src.users.models  # noqa: F401


def compare_schema(connection) -> list[str]:
    inspector = inspect(connection)
    issues: list[str] = []

    for table in Base.metadata.sorted_tables:
        if not inspector.has_table(table.name):
            issues.append(f"Missing table: {table.name}")
            continue

        db_columns = {column["name"] for column in inspector.get_columns(table.name)}
        for column in table.columns:
            if column.name not in db_columns:
                issues.append(f"Missing column: {table.name}.{column.name}")

    return issues


async def main() -> None:
    async with engine.connect() as connection:
        issues = await connection.run_sync(compare_schema)

    if not issues:
        print("Database schema matches the current SQLAlchemy models.")
        return

    print("Database schema is missing expected objects:")
    for issue in issues:
        print(f"- {issue}")
    raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
