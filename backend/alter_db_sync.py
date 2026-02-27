import os
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

def alter_db():
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        print("DATABASE_URL not found")
        return
        
    # postgresql+asyncpg://user:pass@host:port/db?ssl=disable
    # We want to connect with standard psycopg2
    clean_url = db_url.replace("+asyncpg", "").replace("?ssl=disable", "")
    
    print(f"Connecting to DB...")
    
    try:
        conn = psycopg2.connect(clean_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        try:
            cur.execute("ALTER TABLE portfolios ADD COLUMN template_id VARCHAR DEFAULT 'standard'")
            print("Successfully added template_id column")
        except Exception as e:
            print(f"Error adding template_id (might already exist): {e}")

        try:
            cur.execute("ALTER TABLE portfolios ADD COLUMN mode VARCHAR DEFAULT 'light'")
            print("Successfully added mode column")
        except Exception as e:
            print(f"Error adding mode (might already exist): {e}")
            
        cur.close()
        conn.close()
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    alter_db()
