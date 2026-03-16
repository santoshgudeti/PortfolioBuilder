import asyncio
from database import AsyncSessionLocal
from sqlalchemy import select
from models.user import User
from models.portfolio import Portfolio
from utils.auth import hash_password

async def make_admin():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == 'admin@example.com'))
        u = res.scalar_one_or_none()
        if not u:
            u = User(
                name='Admin', 
                email='admin@example.com', 
                hashed_password=hash_password('admin123'), 
                is_admin=True, 
                is_verified=True
            )
            db.add(u)
            await db.commit()
            print('Admin account created: admin@example.com / admin123')
        else:
            print('Admin account already exists.')

if __name__ == "__main__":
    asyncio.run(make_admin())
