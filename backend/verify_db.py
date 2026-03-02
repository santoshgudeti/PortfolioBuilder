import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from config import get_settings

settings = get_settings()
db_url = settings.database_url
connect_args = {}
if "postgresql" in db_url:
    if "ssl=disable" in db_url:
        db_url = db_url.replace("?ssl=disable", "").replace("&ssl=disable", "")
        connect_args = {"ssl": False}

engine = create_async_engine(db_url, connect_args=connect_args)

async def check_columns():
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT table_schema, column_name 
            FROM information_schema.columns 
            WHERE table_name = 'portfolios';
        """))
        rows = result.all()
        print("Columns in 'portfolios' table:")
        for row in rows:
            print(f"- {row[0]}.{row[1]}")
        
        column_names = [row[1] for row in rows]
        if 'resume_object_key' in column_names:
            print("\n✅ column 'resume_object_key' EXISTS.")
        else:
            print("\n❌ column 'resume_object_key' IS MISSING.")

if __name__ == "__main__":
    asyncio.run(check_columns())
