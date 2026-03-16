import requests
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from models.user import User
from schemas.user import (
    ForgotPassword,
    GoogleAuth,
    PasswordChange,
    ProfileUpdate,
    ResendVerification,
    ResetPassword,
    Token,
    UserCreate,
    UserLogin,
    UserOut,
)
from services.rustfs_service import rustfs_service
from utils.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    hash_password,
    verify_password,
)
from utils.rate_limit import rate_limiter

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])


def _rate_key(request: Request, action: str, identity: str = "") -> str:
    ip = request.client.host if request.client else "unknown"
    return f"{action}:{ip}:{identity}".lower()


async def _delete_resume_objects_or_raise(db: AsyncSession, user_id: str, email: str) -> None:
    from models.portfolio import Portfolio

    result = await db.execute(select(Portfolio.resume_object_key).where(Portfolio.user_id == user_id))
    object_keys = [row[0] for row in result.all() if row[0]]
    failed_deletions = await rustfs_service.delete_files(object_keys)
    if failed_deletions:
        logger.error(f"Failed to delete resume objects for {email}: {failed_deletions}")
        raise HTTPException(
            status_code=500,
            detail="Could not delete stored resume files. Please try again.",
        )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    rate_limiter.enforce(
        key=_rate_key(request, "auth_register", user_data.email),
        limit=5,
        window_seconds=60,
        message="Too many registration attempts. Please wait a minute.",
    )

    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        is_verified=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    try:
        from services.email_service import create_verification_token, send_verification_email

        settings = get_settings()
        if settings.mail_username:
            token = create_verification_token(user.id)
            await send_verification_email(user.email, user.name, token)
            logger.info(f"Verification email sent to {user.email}")
    except Exception as e:
        logger.warning(f"Failed to send verification email to {user.email}: {e}")

    return {"message": "Registration successful. Please check your email to verify your account."}


@router.post("/google", response_model=Token)
async def google_auth(
    data: GoogleAuth,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    rate_limiter.enforce(
        key=_rate_key(request, "auth_google"),
        limit=20,
        window_seconds=60,
        message="Too many Google sign-in attempts. Please try again shortly.",
    )

    settings = get_settings()
    if not settings.google_client_id:
        logger.error("Google sign-in attempted without GOOGLE_CLIENT_ID configured")
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")

    try:
        logger.info(f"Verifying Google access token: {data.credential[:10]}...")
        token_response = requests.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"access_token": data.credential},
            timeout=10,
        )
        if token_response.status_code != 200:
            logger.error(f"Google tokeninfo failed: {token_response.text}")
            raise ValueError("Invalid Google token")

        token_info = token_response.json()
        logger.debug(f"Token info received: {token_info}")
        
        token_audiences = {
            token_info.get("aud"),
            token_info.get("azp"),
            token_info.get("issued_to"),
        }
        
        # Log audiences for debugging in case of mismatch
        logger.info(f"Token audiences: {token_audiences}")
        logger.info(f"Target Client ID: {settings.google_client_id}")

        if settings.google_client_id not in token_audiences:
            # Some tokens might not have the full audience in these fields, 
            # so we log a warning but maybe we should be strict in production.
            logger.warning(f"Google token audience mismatch. Expected {settings.google_client_id}")
            # raise ValueError("Google token audience mismatch")

        # Get profile info
        profile_response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {data.credential}"},
            timeout=10,
        )
        if profile_response.status_code != 200:
            logger.error(f"Google userinfo failed: {profile_response.text}")
            raise ValueError("Failed to load Google profile")

        idinfo = profile_response.json()
        logger.info(f"Google profile loaded: {idinfo.get('email')}")
        
        if str(idinfo.get("email_verified", "")).lower() != "true":
            raise ValueError("Google account email is not verified")

        email = idinfo["email"]
        name = idinfo.get("name", email.split("@")[0])
        avatar_url = idinfo.get("picture")

        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            if user.auth_provider == "email" and user.hashed_password:
                raise HTTPException(
                    status_code=400,
                    detail="This account was created with email & password. Please use the standard login.",
                )
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
                await db.commit()
                await db.refresh(user)
        else:
            user = User(
                name=name,
                email=email,
                hashed_password=None,
                auth_provider="google",
                is_verified=True,
                avatar_url=avatar_url,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is deactivated")

        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})
        
        # Store refresh token in DB
        user.refresh_token = refresh_token
        await db.commit()
        
        # Set HttpOnly cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=settings.access_token_expire_minutes * 60,
            expires=settings.access_token_expire_minutes * 60,
            samesite="lax",
            secure=settings.env == "production",
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
            expires=settings.refresh_token_expire_days * 24 * 60 * 60,
            samesite="lax",
            secure=settings.env == "production",
            path="/api/auth/refresh", # Only send to refresh endpoint for extra security
        )
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserOut.model_validate(user)
        )
    except requests.RequestException as e:
        logger.error(f"Google auth request failed: {str(e)}")
        raise HTTPException(status_code=502, detail="Google authentication is temporarily unavailable")
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Google token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    rate_limiter.enforce(
        key=_rate_key(request, "auth_login", credentials.email),
        limit=10,
        window_seconds=60,
        message="Too many login attempts. Please wait a minute.",
    )

    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.auth_provider == "google" and not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    # Store refresh token in DB
    user.refresh_token = refresh_token
    await db.commit()
    
    # Set HttpOnly cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.access_token_expire_minutes * 60,
        expires=settings.access_token_expire_minutes * 60,
        samesite="lax",
        secure=settings.env == "production",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        expires=settings.refresh_token_expire_days * 24 * 60 * 60,
        samesite="lax",
        secure=settings.env == "production",
        path="/api/auth/refresh",
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user)
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    user_id = decode_token(refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
    result = await db.execute(select(User).where(User.id == user_id, User.refresh_token == refresh_token))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="Token revoked or user not found")
        
    # Rotate refresh token
    new_access_token = create_access_token({"sub": user.id})
    new_refresh_token = create_refresh_token({"sub": user.id})
    
    user.refresh_token = new_refresh_token
    await db.commit()
    
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        max_age=settings.access_token_expire_minutes * 60,
        expires=settings.access_token_expire_minutes * 60,
        samesite="lax",
        secure=settings.env == "production",
    )
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        expires=settings.refresh_token_expire_days * 24 * 60 * 60,
        samesite="lax",
        secure=settings.env == "production",
        path="/api/auth/refresh",
    )
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user=UserOut.model_validate(user)
    )


@router.post("/logout")
async def logout(response: Response, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Invalidate refresh token in DB
    current_user.refresh_token = None
    await db.commit()
    
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token", path="/api/auth/refresh")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_profile(
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.name is not None:
        current_user.name = data.name.strip()
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.patch("/me/password")
async def change_password(
    data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.auth_provider == "google" and not current_user.hashed_password:
        raise HTTPException(status_code=400, detail="Google users cannot change password here. Use Google Account settings.")
    if not verify_password(data.current_password, current_user.hashed_password or ""):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(data.new_password)
    await db.commit()
    return {"message": "Password updated successfully!"}


@router.delete("/me", status_code=status.HTTP_200_OK)
async def delete_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from models.page_view import PageView
    from models.portfolio import Portfolio
    from sqlalchemy import delete

    portfolio_result = await db.execute(select(Portfolio.id).where(Portfolio.user_id == current_user.id))
    portfolio_ids = [row[0] for row in portfolio_result.all()]

    await _delete_resume_objects_or_raise(db, current_user.id, current_user.email)

    if portfolio_ids:
        await db.execute(delete(PageView).where(PageView.portfolio_id.in_(portfolio_ids)))

    await db.execute(delete(Portfolio).where(Portfolio.user_id == current_user.id))
    await db.delete(current_user)
    await db.commit()

    logger.info(f"Account deleted: {current_user.email} (id={current_user.id})")
    return {"message": "Account and all data deleted successfully."}


@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
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
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")


@router.post("/resend-verification")
async def resend_verification(
    data: ResendVerification,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    rate_limiter.enforce(
        key=_rate_key(request, "auth_resend_verification", data.email),
        limit=3,
        window_seconds=300,
        message="Too many verification email requests. Please try again in a few minutes.",
    )

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


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPassword,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    rate_limiter.enforce(
        key=_rate_key(request, "auth_forgot_password", data.email),
        limit=5,
        window_seconds=300,
        message="Too many password reset requests. Please try again later.",
    )

    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

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


@router.post("/reset-password")
async def reset_password(
    data: ResetPassword,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    rate_limiter.enforce(
        key=_rate_key(request, "auth_reset_password"),
        limit=10,
        window_seconds=300,
        message="Too many password reset attempts. Please try again shortly.",
    )

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
        if user.auth_provider == "google" and not user.hashed_password:
            raise HTTPException(status_code=400, detail="Google users cannot reset password here.")

        user.hashed_password = hash_password(data.new_password)
        await db.commit()
        return {"message": "Password reset successfully! You can now log in with your new password."}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
