import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def migrate():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL not found in .env")
        return
        
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    db_url = db_url.replace("?ssl=disable", "")
    
    print(f"Connecting to database...")
    conn = await asyncpg.connect(db_url)
    
    # Get existing columns
    cols = await conn.fetch(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
    existing = [c['column_name'] for c in cols]
    print(f"Existing user columns: {existing}")
    
    # Columns to add
    new_cols = {
        'stripe_customer_id': "VARCHAR UNIQUE NULL",
        'subscription_id': "VARCHAR NULL",
        'subscription_status': "VARCHAR NULL",
        'is_pro': "BOOLEAN DEFAULT false"
    }
    
    for col_name, col_type in new_cols.items():
        if col_name not in existing:
            await conn.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"✅ Added: {col_name}")
        else:
            print(f"⏭️  Already exists: {col_name}")
    
    await conn.close()
    print("\n🎉 Stripe migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate())
