"""
PostgreSQL migration for Phase 3: Add is_verified and avatar_url columns.
Run: python migrate_phase3.py
"""
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
    
    # Get existing columns
    cols = await conn.fetch(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
    existing = [c['column_name'] for c in cols]
    print(f"Existing user columns: {existing}")
    
    # Add is_verified
    if 'is_verified' not in existing:
        await conn.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false")
        print("✅ Added: is_verified")
    else:
        print("⏭️  Already exists: is_verified")
    
    # Add avatar_url
    if 'avatar_url' not in existing:
        await conn.execute("ALTER TABLE users ADD COLUMN avatar_url VARCHAR NULL")
        print("✅ Added: avatar_url")
    else:
        print("⏭️  Already exists: avatar_url")
    
    # Set existing Google users as verified
    updated = await conn.execute(
        "UPDATE users SET is_verified = true WHERE auth_provider = 'google' AND is_verified = false")
    print(f"✅ Auto-verified Google users")
    
    await conn.close()
    print("\n🎉 Phase 3 migration complete!")


if __name__ == "__main__":
    asyncio.run(migrate())
