"""
Email verification & password reset service.
Uses Gmail SMTP via fastapi-mail.
"""
from fastapi_mail import FastMail, MessageSchema, MessageType, ConnectionConfig
from config import get_settings
from utils.auth import create_access_token
from jose import jwt, JWTError
from datetime import timedelta
from loguru import logger


def get_mail_config():
    settings = get_settings()
    return ConnectionConfig(
        MAIL_USERNAME=settings.mail_username,
        MAIL_PASSWORD=settings.mail_password,
        MAIL_FROM=settings.mail_from or settings.mail_username,
        MAIL_PORT=587,
        MAIL_SERVER="smtp.gmail.com",
        MAIL_FROM_NAME="Resume2Portfolio AI",
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )


def create_verification_token(user_id: str) -> str:
    """Create a short-lived JWT for email verification (24 hours)."""
    return create_access_token(
        data={"sub": user_id, "type": "verify"},
        expires_delta=timedelta(hours=24),
    )


def create_reset_token(user_id: str) -> str:
    """Create a short-lived JWT for password reset (30 minutes)."""
    return create_access_token(
        data={"sub": user_id, "type": "reset"},
        expires_delta=timedelta(minutes=30),
    )


def decode_token(token: str) -> dict:
    """Decode and verify a token. Returns payload or raises."""
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])


async def send_verification_email(email: str, user_name: str, token: str):
    """Send the email verification link."""
    settings = get_settings()
    verify_url = f"{settings.frontend_url}/verify-email?token={token}"

    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 8px;">Resume2Portfolio AI</h1>
        <p style="font-size: 16px; color: #333;">Hey {user_name},</p>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
            Welcome! Please verify your email address to start generating your portfolio.
        </p>
        <a href="{verify_url}" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); 
                  color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; 
                  font-weight: 600; font-size: 14px; margin: 20px 0;">
            ✅ Verify My Email
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 24px;">
            This link expires in 24 hours. If you didn't create this account, just ignore this email.
        </p>
    </div>
    """

    message = MessageSchema(
        subject="Verify your email — Resume2Portfolio AI",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )

    fm = FastMail(get_mail_config())
    try:
        await fm.send_message(message)
        logger.info(f"✅ Verification email sent to {email}")
    except Exception as e:
        logger.error(f"❌ Failed to send verification email to {email}: {type(e).__name__}: {e}")
        raise


async def send_reset_email(email: str, user_name: str, token: str):
    """Send the password reset link."""
    settings = get_settings()
    reset_url = f"{settings.frontend_url}/reset-password?token={token}"

    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 8px;">Resume2Portfolio AI</h1>
        <p style="font-size: 16px; color: #333;">Hey {user_name},</p>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
            You requested a password reset. Click the button below to set a new password.
        </p>
        <a href="{reset_url}" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); 
                  color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; 
                  font-weight: 600; font-size: 14px; margin: 20px 0;">
            🔑 Reset Password
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 24px;">
            This link expires in 30 minutes. If you didn't request this, just ignore this email.
        </p>
    </div>
    """

    message = MessageSchema(
        subject="Reset your password — Resume2Portfolio AI",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )

    fm = FastMail(get_mail_config())
    try:
        await fm.send_message(message)
        logger.info(f"✅ Password reset email sent to {email}")
    except Exception as e:
        logger.error(f"❌ Failed to send password reset email to {email}: {type(e).__name__}: {e}")
        raise
