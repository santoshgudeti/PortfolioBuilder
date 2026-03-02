import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import AsyncSessionLocal
from models.user import User

async def make_admin(email: str):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"❌ User with email '{email}' not found.")
            return

        if user.is_admin:
            print(f"⚠️ User '{email}' is already an admin.")
            return

        user.is_admin = True
        await session.commit()
        print(f"✅ Successfully promoted '{email}' to Admin!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <user_email>")
        sys.exit(1)
        
    email_arg = sys.argv[1]
    asyncio.run(make_admin(email_arg))
