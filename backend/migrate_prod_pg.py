from sqlalchemy import text
import asyncio
import logging
from database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def migrate():
    logger.info("Starting database migration...")
    
    # List of SQL commands to run
    # We use a try-except block for each column to handle 'already exists' gracefully
    commands = [
        # Users table updates
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT",
        
        # Portfolios table updates
        "ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending'",
        "ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS moderation_score INTEGER DEFAULT 0",
        "ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS moderation_reason TEXT"
    ]
    
    async with engine.begin() as conn:
        for cmd in commands:
            try:
                logger.info(f"Executing: {cmd}")
                await conn.execute(text(cmd))
                logger.info("Success.")
            except Exception as e:
                # IF NOT EXISTS handles PostgreSQL, but SQLite might need a different check
                # However, for production we know it's PostgreSQL.
                logger.warning(f"Could not execute '{cmd}': {e}")
                
    logger.info("Migration finished.")

if __name__ == "__main__":
    asyncio.run(migrate())
