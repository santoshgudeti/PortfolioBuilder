import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from config import get_settings

settings = get_settings()

# Use same SSL handling logic as database.py
db_url = settings.database_url
connect_args = {}
if "postgresql" in db_url:
    if "ssl=disable" in db_url:
        db_url = db_url.replace("?ssl=disable", "").replace("&ssl=disable", "")
        connect_args = {"ssl": False}

engine = create_async_engine(db_url, connect_args=connect_args)

async def migrate():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE portfolios ADD COLUMN resume_object_key VARCHAR;"))
            print("Successfully added 'resume_object_key' to portfolios table.")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column name" in str(e).lower():
                print("Column 'resume_object_key' already exists.")
            else:
                print(f"Error during migration: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
