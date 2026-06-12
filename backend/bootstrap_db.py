import asyncio
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text as sa_text

from database import engine, init_db


def _alembic_config() -> Config:
    root = Path(__file__).resolve().parent
    config = Config(str(root / "alembic.ini"))
    config.set_main_option("script_location", str(root / "alembic"))
    return config


async def _existing_tables() -> set[str]:
    async with engine.begin() as conn:
        return set(await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names()))


async def _ensure_model_columns():
    """Ensure all model columns exist in the database (belt-and-suspenders)."""
    # Expected columns per table: column_name -> (type_sql, nullable, default)
    expected: dict[str, dict[str, tuple[str, bool, str | None]]] = {
        "portfolios": {
            "version_history": ("TEXT", False, "'[]'"),
            "career_graph": ("TEXT", True, None),
            "role_versions": ("TEXT", True, None),
            "active_role": ("VARCHAR", True, None),
            "visible_to_recruiters": ("BOOLEAN", False, "true"),
            "connected_sources": ("TEXT", True, None),
            "video_scripts": ("TEXT", True, None),
        },
        "page_views": {
            "ip_address": ("VARCHAR", True, None),
            "visitor_type": ("VARCHAR", True, None),
            "intent_score": ("INTEGER", True, None),
        },
    }

    async with engine.begin() as conn:
        def get_existing(sync_conn):
            inspector = inspect(sync_conn)
            result = {}
            for table in expected:
                cols = {c["name"] for c in inspector.get_columns(table)}
                result[table] = cols
            return result

        existing = await conn.run_sync(get_existing)

        for table, columns in expected.items():
            for col_name, (col_type, nullable, default) in columns.items():
                if col_name not in existing.get(table, set()):
                    nullable_sql = "NULL" if nullable else "NOT NULL"
                    default_sql = f"DEFAULT {default}" if default is not None else ""
                    sql = f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type} {nullable_sql} {default_sql}"
                    await conn.execute(sa_text(sql.strip()))


async def _bootstrap() -> None:
    tables = await _existing_tables()
    app_tables = {"users", "portfolios", "page_views", "audit_logs"}
    alembic_config = _alembic_config()

    if not tables or tables.issubset({"alembic_version"}) or not (tables & app_tables):
        await init_db()
        command.stamp(alembic_config, "head")
        return

    command.upgrade(alembic_config, "head")
    await _ensure_model_columns()


def bootstrap_database() -> None:
    asyncio.run(_bootstrap())


if __name__ == "__main__":
    bootstrap_database()
