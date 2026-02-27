import asyncio
import sys
import asyncpg

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
    
    # Get existing columns in portfolios table
    cols = await conn.fetch(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'portfolios'")
    existing = [c['column_name'] for c in cols]
    print(f"Existing portfolio columns: {existing}")
    
    # Add custom_domain
    if 'custom_domain' not in existing:
        await conn.execute("ALTER TABLE portfolios ADD COLUMN custom_domain VARCHAR NULL")
        print("Success Added: custom_domain")
        # Add index for efficient lookups
        await conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_portfolios_custom_domain ON portfolios (custom_domain)")
        print("Success Added index: ix_portfolios_custom_domain")
    else:
        print("Skip Already exists: custom_domain")
    
    await conn.close()
    print("\nCustom Domain migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate())
