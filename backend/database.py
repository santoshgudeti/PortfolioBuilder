from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import get_settings

settings = get_settings()

# Handle SSL for PostgreSQL (especially Neon.tech)
db_url = settings.database_url
connect_args = {}

if "postgresql" in db_url:
    # Check if SSL is explicitly disabled (for self-hosted servers)
    if "ssl=disable" in db_url:
        # Remove ssl=disable from URL and set ssl to False
        db_url = db_url.replace("?ssl=disable", "").replace("&ssl=disable", "")
        connect_args = {"ssl": False}
    elif "sslmode=" in db_url:
        # asyncpg doesn't like 'sslmode' in the URL, it wants 'ssl' in connect_args
        import urllib.parse
        url_parts = list(urllib.parse.urlparse(db_url))
        query = urllib.parse.parse_qs(url_parts[4])
        query.pop('sslmode', None)
        url_parts[4] = urllib.parse.urlencode(query, doseq=True)
        db_url = urllib.parse.urlunparse(url_parts)
        connect_args = {"ssl": True}
    else:
        # Default: try without SSL for self-hosted, with SSL for cloud
        connect_args = {}
elif "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    db_url,
    echo=False,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        from models import user, portfolio  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
