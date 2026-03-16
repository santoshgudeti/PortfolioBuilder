import asyncio
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from database import engine, init_db


def _alembic_config() -> Config:
    root = Path(__file__).resolve().parent
    config = Config(str(root / "alembic.ini"))
    config.set_main_option("script_location", str(root / "alembic"))
    return config


async def _existing_tables() -> set[str]:
    async with engine.begin() as conn:
        return set(await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names()))


async def bootstrap_database() -> None:
    tables = await _existing_tables()
    app_tables = {"users", "portfolios", "page_views", "audit_logs"}
    alembic_config = _alembic_config()

    if not tables or tables.issubset({"alembic_version"}) or not (tables & app_tables):
        await init_db()
        command.stamp(alembic_config, "head")
        return

    command.upgrade(alembic_config, "head")


if __name__ == "__main__":
    asyncio.run(bootstrap_database())
