import asyncio, sys, asyncpg

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def check():
    c = await asyncpg.connect("postgresql://hamath:hamathopc2025@91.108.104.46:5445/postgres")
    
    user_count = await c.fetchval("SELECT COUNT(*) FROM users")
    portfolio_count = await c.fetchval("SELECT COUNT(*) FROM portfolios")
    print(f"\nNew DB: {user_count} users, {portfolio_count} portfolios\n")
    
    print("USERS:")
    users = await c.fetch("SELECT email, auth_provider, created_at FROM users ORDER BY created_at")
    for u in users:
        print(f"  {u['email']:40s} | {u['auth_provider']} | {u['created_at']}")
    
    print(f"\nPORTFOLIOS:")
    portfolios = await c.fetch("SELECT slug, created_at FROM portfolios ORDER BY created_at")
    for p in portfolios:
        print(f"  {p['slug']:40s} | {p['created_at']}")
    
    await c.close()

asyncio.run(check())
