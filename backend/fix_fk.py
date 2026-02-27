import asyncio
import asyncpg
import sys

async def fix_all_fks():
    from config import get_settings
    settings = get_settings()
    db_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://").replace("?ssl=disable", "")
    print("Connecting to database...")
    conn = await asyncpg.connect(db_url)
    
    # 1. Fix page_views foreign key
    print("Fixing page_views foreign key...")
    try:
        await conn.execute("ALTER TABLE page_views DROP CONSTRAINT IF EXISTS page_views_portfolio_id_fkey;")
        await conn.execute('''
            ALTER TABLE page_views
            ADD CONSTRAINT page_views_portfolio_id_fkey
            FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;
        ''')
        print("Fixed page_views FK.")
    except Exception as e:
        print(f"Error fixing page_views: {e}")

    # 2. Fix portfolios foreign key
    print("Fixing portfolios foreign key...")
    try:
        await conn.execute("ALTER TABLE portfolios DROP CONSTRAINT IF EXISTS portfolios_user_id_fkey;")
        await conn.execute('''
            ALTER TABLE portfolios
            ADD CONSTRAINT portfolios_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        ''')
        print("Fixed portfolios FK.")
    except Exception as e:
        print(f"Error fixing portfolios: {e}")

    # 3. Delete user
    print(f"Attempting to delete user santoshgudeti@gmail.com...")
    try:
        result = await conn.execute("DELETE FROM users WHERE email = 'santoshgudeti@gmail.com'")
        print(f"Delete result: {result}")
    except Exception as e:
        print(f"Delete failed: {e}")
    
    await conn.close()

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(fix_all_fks())
