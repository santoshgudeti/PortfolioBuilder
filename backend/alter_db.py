import asyncio
import asyncpg
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

async def alter_db():
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        print("DATABASE_URL not found")
        return
        
    print(f"Connecting to DB...")
    
    # Parse URL: postgresql+asyncpg://user:pass@host:port/db?ssl=disable
    parsed = urlparse(db_url)
    
    # Create clean DSN connection string without the query params
    clean_url = f"postgresql://{parsed.username}:{parsed.password}@{parsed.hostname}:{parsed.port}{parsed.path}"
    
    try:
        # Use ssl=False instead of passing it in the URL
        conn = await asyncpg.connect(clean_url, ssl=False)
        
        try:
            await conn.execute("ALTER TABLE portfolios ADD COLUMN template_id VARCHAR DEFAULT 'standard'")
            print("Successfully added template_id column")
        except Exception as e:
            print(f"Template ID column: {e}")
            
        try:
            await conn.execute("ALTER TABLE portfolios ADD COLUMN mode VARCHAR DEFAULT 'light'")
            print("Successfully added mode column")
        except Exception as e:
            print(f"Mode column: {e}")
            
        await conn.close()
        print("Done")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(alter_db())
