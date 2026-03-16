import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

# Add project root to sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from database import Base
from config import get_settings
from models.user import User  # noqa
from models.portfolio import Portfolio  # noqa
from models.page_view import PageView  # noqa

settings = get_settings()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Dynamic database URL from settings
config.set_main_option("sqlalchemy.url", settings.database_url)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target_metadata for 'autogenerate' support
target_metadata = Base.metadata

def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table" and reflected and name not in target_metadata.tables:
        return False
    return True

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
        render_as_batch=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection, 
        target_metadata=target_metadata,
        include_object=include_object,
        render_as_batch=True,
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    cmd_config = config.get_section(config.config_ini_section, {})
    
    # Ensure the driver is async-compatible if using postgres
    url = cmd_config.get("sqlalchemy.url")
    if url and "postgresql://" in url and "postgresql+asyncpg://" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://")
        cmd_config["sqlalchemy.url"] = url

    connectable = async_engine_from_config(
        cmd_config,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
