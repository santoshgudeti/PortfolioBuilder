"""
PostgreSQL migration for Analytics: Create page_views table.
Run: python migrate_analytics.py
"""
import asyncio
import sys
import asyncpg
from datetime import datetime

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


async def migrate():
    from config import get_settings
    settings = get_settings()
    
    # Convert asyncpg URL
    db_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    db_url = db_url.replace("?ssl=disable", "")
    
    print(f"Connecting to database...")
    conn = await asyncpg.connect(db_url)
    
    # Create page_views table
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS page_views (
        id VARCHAR PRIMARY KEY,
        portfolio_id VARCHAR NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
        referrer VARCHAR,
        user_agent TEXT
    );
    """
    await conn.execute(create_table_sql)
    print("✅ Created: page_views table")
    
    # Create index on portfolio_id for faster queries
    create_index_sql = """
    CREATE INDEX IF NOT EXISTS ix_page_views_portfolio_id ON page_views(portfolio_id);
    """
    await conn.execute(create_index_sql)
    print("✅ Created: index on portfolio_id")
    
    await conn.close()
    print("\n🎉 Analytics migration complete!")


if __name__ == "__main__":
    asyncio.run(migrate())
