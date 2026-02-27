import asyncio
import asyncpg
import sys

async def check_fk():
    from config import get_settings
    settings = get_settings()
    db_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://").replace("?ssl=disable", "")
    conn = await asyncpg.connect(db_url)
    
    # Query to check foreign key rules
    query = """
    SELECT 
        tc.table_name, kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        tc.constraint_name
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
    WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name = 'portfolios';
    """
    rows = await conn.fetch(query)
    for row in rows:
        print(f"Table: {row['table_name']}, Column: {row['column_name']}, Foreign Table: {row['foreign_table_name']}, Foreign Column: {row['foreign_column_name']}, ON DELETE: {row['delete_rule']}, Constraint: {row['constraint_name']}")

    await conn.close()

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(check_fk())
