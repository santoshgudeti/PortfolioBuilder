import asyncio
from database import AsyncSessionLocal
from sqlalchemy import select
from models.user import User
from models.portfolio import Portfolio
from utils.auth import hash_password

from config import get_settings

async def make_admin():
    settings = get_settings()
    admin_email = "hamathopc@gmail.com"
    
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == admin_email))
        u = res.scalar_one_or_none()
        if not u:
            # Create new admin if doesn't exist
            # Note: We use a random/secure default password if not provided, 
            # but usually for the first admin, we can use a known one or just rely on Google Auth
            u = User(
                name='Senior Admin', 
                email=admin_email, 
                hashed_password=hash_password('Admin@2024!'), # Change on first login
                is_admin=True, 
                is_verified=True,
                auth_provider="email"
            )
            db.add(u)
            await db.commit()
            print(f'Admin account created: {admin_email}')
        else:
            if not u.is_admin:
                u.is_admin = True
                await db.commit()
                print(f'User {admin_email} elevated to admin.')
            else:
                print(f'Admin {admin_email} already exists and is admin.')

if __name__ == "__main__":
    asyncio.run(make_admin())
