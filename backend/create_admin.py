import asyncio
from database import AsyncSessionLocal
from sqlalchemy import select
from models.user import User
from utils.auth import hash_password

from config import get_settings

async def make_admin():
    settings = get_settings()
    admin_email = settings.admin_email.strip().lower()

    if not admin_email:
        return

    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == admin_email))
        u = res.scalar_one_or_none()
        if not u:
            if not settings.admin_bootstrap_password:
                print(f"Admin bootstrap skipped for {admin_email}: no ADMIN_BOOTSTRAP_PASSWORD configured.")
                return

            u = User(
                name='Senior Admin', 
                email=admin_email, 
                hashed_password=hash_password(settings.admin_bootstrap_password),
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
