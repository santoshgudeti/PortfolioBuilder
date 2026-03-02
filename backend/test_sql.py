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

async def test_sql():
    async with engine.connect() as conn:
        try:
            # Replicate the exact failing SQL
            sql = """
            SELECT portfolios.id, portfolios.user_id, portfolios.slug, portfolios.custom_domain, 
                   portfolios.parsed_data, portfolios.theme, portfolios.template_id, portfolios.mode, 
                   portfolios.primary_color, portfolios.is_published, portfolios.resume_filename, 
                   portfolios.resume_object_key, portfolios.view_count, portfolios.hidden_sections, 
                   portfolios.created_at, portfolios.updated_at
            FROM portfolios
            LIMIT 1;
            """
            result = await conn.execute(text(sql))
            row = result.fetchone()
            print("✅ SQL query EXECUTED SUCCESSFULLY.")
            if row:
                print(f"Sample data: {row}")
        except Exception as e:
            print(f"❌ SQL query FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_sql())
