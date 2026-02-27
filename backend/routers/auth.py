from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserLogin, UserOut, Token
from utils.auth import hash_password, verify_password, create_access_token, get_current_user
from loguru import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        is_verified=False,  # Needs email verification
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Send verification email (non-blocking — don't fail registration if email fails)
    try:
        from services.email_service import create_verification_token, send_verification_email
        from config import get_settings
        settings = get_settings()
        if settings.mail_username:  # Only send if email is configured
            token = create_verification_token(user.id)
            await send_verification_email(user.email, user.name, token)
            logger.info(f"Verification email sent to {user.email}")
    except Exception as e:
        logger.warning(f"Failed to send verification email to {user.email}: {e}")

    return {"message": "Registration successful. Please check your email to verify your account."}


import os
from pydantic import BaseModel
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from config import get_settings

import requests

class GoogleAuth(BaseModel):
    credential: str  # Now expecting an access_token, keeping name 'credential' for backward compat

@router.post("/google", response_model=Token)
async def google_auth(data: GoogleAuth, db: AsyncSession = Depends(get_db)):
    try:
        # Instead of verifying an ID token (JWT), we use the access token provided by useGoogleLogin.
        # We call the Google TokenInfo endpoint to validate the token and get user info.
        logger.debug("Attempting to verify Google access token...")
        response = requests.get(f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={data.credential}")
        
        if response.status_code != 200:
            raise ValueError(f"Invalid Token: {response.text}")
            
        idinfo = response.json()
        logger.debug(f"Google token verified successfully for: {idinfo.get('email')}")

        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        avatar_url = idinfo.get('picture', None)

        # Check if user exists
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            # GUARD: Email/password user trying Google Sign-In
            if user.auth_provider == "email" and user.hashed_password:
                raise HTTPException(
                    status_code=400,
                    detail="This account was created with email & password. Please use the standard login."
                )
            # Update avatar if available
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
                await db.commit()
                await db.refresh(user)
        else:
            # Auto-register new Google user
            user = User(
                name=name,
                email=email,
                hashed_password=None,
                auth_provider="google",
                is_verified=True,  # Google users are auto-verified
                avatar_url=avatar_url,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is deactivated")

        # Generate our internal JWT
        token = create_access_token({"sub": user.id})
        return Token(access_token=token, user=UserOut.model_validate(user))

    except ValueError as e:
        logger.error(f"Google Token Verification Failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="Account not found. Please sign up if you don't have an account.")
        
    if user.auth_provider == "google" and not user.hashed_password:
        raise HTTPException(status_code=400, detail="Please use 'Continue with Google' to sign in")
        
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    # We do NOT block login for unverified users here.
    # The PRD requires unverified users to access the dashboard and see a warning banner,
    # and we should restrict generation/publishing instead.
        
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": user.id})
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.patch("/me", response_model=UserOut)
async def update_profile(data: ProfileUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update user profile: name and/or avatar_url."""
    if data.name is not None:
        current_user.name = data.name.strip()
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.patch("/me/password")
async def change_password(data: PasswordChange, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Change password for email-registered users."""
    if current_user.auth_provider == "google" and not current_user.hashed_password:
        raise HTTPException(status_code=400, detail="Google users cannot change password here. Use Google Account settings.")
    if not verify_password(data.current_password, current_user.hashed_password or ""):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    current_user.hashed_password = hash_password(data.new_password)
    await db.commit()
    return {"message": "Password updated successfully!"}


@router.delete("/me", status_code=status.HTTP_200_OK)
async def delete_account(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Permanently delete the current user's account and all associated data."""
    from models.portfolio import Portfolio
    from models.page_view import PageView
    from sqlalchemy import delete

    # 1. Delete page views for user's portfolios
    portfolio_result = await db.execute(select(Portfolio.id).where(Portfolio.user_id == current_user.id))
    portfolio_ids = [row[0] for row in portfolio_result.all()]
    if portfolio_ids:
        await db.execute(delete(PageView).where(PageView.portfolio_id.in_(portfolio_ids)))

    # 2. Delete portfolios
    await db.execute(delete(Portfolio).where(Portfolio.user_id == current_user.id))

    # 3. Delete the user
    await db.delete(current_user)
    await db.commit()

    logger.info(f"Account deleted: {current_user.email} (id={current_user.id})")
    return {"message": "Account and all data deleted successfully."}


# ============================================================
# Email Verification & Password Reset Endpoints
# ============================================================

@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    """Verify user's email via the token from the verification link."""
    from services.email_service import decode_token
    try:
        payload = decode_token(token)
        if payload.get("type") != "verify":
            raise HTTPException(status_code=400, detail="Invalid verification token")
        
        user_id = payload.get("sub")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.is_verified:
            return {"message": "Email already verified", "already_verified": True}
        
        user.is_verified = True
        await db.commit()
        return {"message": "Email verified successfully! You can now generate portfolios.", "already_verified": False}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")


class ResendVerification(BaseModel):
    email: str

@router.post("/resend-verification")
async def resend_verification(data: ResendVerification, db: AsyncSession = Depends(get_db)):
    """Resend verification email."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user:
        return {"message": "If that email exists, a verification link has been sent."}
    if user.is_verified:
        return {"message": "Email is already verified."}
    
    try:
        from services.email_service import create_verification_token, send_verification_email
        token = create_verification_token(user.id)
        await send_verification_email(user.email, user.name, token)
        return {"message": "Verification email sent! Check your inbox."}
    except Exception as e:
        logger.error(f"Failed to resend verification: {e}")
        raise HTTPException(status_code=500, detail="Failed to send verification email")


class ForgotPassword(BaseModel):
    email: str

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: AsyncSession = Depends(get_db)):
    """Send password reset link if the email exists."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    # Always return success (don't reveal if email exists)
    if not user or user.auth_provider == "google":
        return {"message": "If that email exists, a password reset link has been sent."}
    
    try:
        from services.email_service import create_reset_token, send_reset_email
        token = create_reset_token(user.id)
        await send_reset_email(user.email, user.name, token)
        return {"message": "Password reset link sent! Check your inbox."}
    except Exception as e:
        logger.error(f"Failed to send reset email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reset email")


class ResetPassword(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: AsyncSession = Depends(get_db)):
    """Reset password using the token from the email link."""
    from services.email_service import decode_token
    try:
        payload = decode_token(data.token)
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        user_id = payload.get("sub")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.hashed_password = hash_password(data.new_password)
        await db.commit()
        return {"message": "Password reset successfully! You can now log in with your new password."}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
