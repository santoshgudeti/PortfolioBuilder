"""
Email verification & password reset service.
Uses Gmail SMTP via fastapi-mail.
"""
from html import escape as html_escape
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


def build_public_portfolio_url(slug: str, custom_domain: str | None = None) -> str:
    """Build the public URL for a portfolio, preferring a custom domain when set."""
    settings = get_settings()
    if custom_domain:
        return f"https://{custom_domain.strip().lower()}"
    return f"{settings.frontend_url.rstrip('/')}/u/{slug}"


def build_dashboard_url() -> str:
    settings = get_settings()
    return f"{settings.frontend_url.rstrip('/')}/dashboard"


async def send_verification_email(email: str, user_name: str, token: str):
    """Send the email verification link."""
    settings = get_settings()
    verify_url = f"{settings.frontend_url}/verify-email?token={token}"

    safe_name = html_escape(user_name)
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 8px;">Resume2Portfolio AI</h1>
        <p style="font-size: 16px; color: #333;">Hey {safe_name},</p>
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

    safe_name = html_escape(user_name)
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 8px;">Resume2Portfolio AI</h1>
        <p style="font-size: 16px; color: #333;">Hey {safe_name},</p>
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
async def send_publish_notification_email(
    email: str,
    user_name: str,
    slug: str,
    custom_domain: str | None = None,
):
    """Send a notification when a portfolio is published."""
    portfolio_url = build_public_portfolio_url(slug, custom_domain)
    dashboard_url = build_dashboard_url()

    safe_name = html_escape(user_name)
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: white;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 8px;">Portfolio Builder</h1>
        <p style="font-size: 16px; color: #333; font-weight: 600;">Congratulations {safe_name}! 🚀</p>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
            Your professional portfolio is now live! You've taken a huge step in building your digital presence.
        </p>
        <div style="background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; font-weight: bold;">Your Public URL</p>
            <a href="{portfolio_url}" style="font-size: 16px; color: #6366f1; font-weight: 700; text-decoration: none; word-break: break-all;">
                {portfolio_url}
            </a>
        </div>
        <a href="{portfolio_url}" 
           style="display: inline-block; width: 100%; text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); 
                  color: white; padding: 14px 0; border-radius: 10px; text-decoration: none; 
                  font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">
            ✨ View My Portfolio
        </a>
        <p style="font-size: 13px; color: #6b7280; line-height: 1.6; margin-top: 24px;">
            Need to make changes? You can update your content or design anytime from your <a href="{dashboard_url}" style="color: #6366f1; text-decoration: underline;">dashboard</a>.
        </p>
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">Built by HamathOPC Pvt Ltd</p>
        </div>
    </div>
    """

    message = MessageSchema(
        subject="🚀 Your professional portfolio is live!",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )

    fm = FastMail(get_mail_config())
    try:
        await fm.send_message(message)
        logger.info(f"✅ Publication notification email sent to {email}")
    except Exception as e:
        logger.error(f"❌ Failed to send publication notification to {email}: {type(e).__name__}: {e}")
        # We don't raise here to avoid blocking the publish process if email fails


async def send_portfolio_checkout_email(
    email: str,
    user_name: str,
    slug: str,
    custom_domain: str | None = None,
):
    """Send a reminder email to check out an already-published portfolio."""
    portfolio_url = build_public_portfolio_url(slug, custom_domain)
    dashboard_url = build_dashboard_url()

    safe_name = html_escape(user_name)
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: white;">
        <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 8px;">Portfolio Builder</h1>
        <p style="font-size: 16px; color: #333; font-weight: 600;">Hi {safe_name},</p>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
            Your portfolio is live. Take a look, make sure everything looks right, and share it with your network.
        </p>
        <div style="background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; font-weight: bold;">Your Public URL</p>
            <a href="{portfolio_url}" style="font-size: 16px; color: #6366f1; font-weight: 700; text-decoration: none; word-break: break-all;">
                {portfolio_url}
            </a>
        </div>
        <a href="{portfolio_url}"
           style="display: inline-block; width: 100%; text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6);
                  color: white; padding: 14px 0; border-radius: 10px; text-decoration: none;
                  font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">
            Check Out My Portfolio
        </a>
        <p style="font-size: 13px; color: #6b7280; line-height: 1.6; margin-top: 24px;">
            Want to update anything? Open your <a href="{dashboard_url}" style="color: #6366f1; text-decoration: underline;">dashboard</a> and make changes anytime.
        </p>
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0;">Built by HamathOPC Pvt Ltd</p>
        </div>
    </div>
    """

    message = MessageSchema(
        subject="Check out your live portfolio",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )

    fm = FastMail(get_mail_config())
    await fm.send_message(message)
    logger.info(f"Portfolio checkout email sent to {email}")
