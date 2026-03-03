import asyncio
from services.email_service import FastMail, MessageSchema, MessageType, get_mail_config

async def test_email():
    print("Testing local email configuration...")
    try:
        config = get_mail_config()
        print(f"Using MAIL_USERNAME: {config.MAIL_USERNAME}")
        print(f"Using MAIL_FROM: {config.MAIL_FROM}")
        
        html = """
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hello from Resume2Portfolio!</h2>
            <p>If you are reading this, your local email credentials are working perfectly. 🚀</p>
        </div>
        """

        message = MessageSchema(
            subject="Test Email from Local Backend",
            recipients=["santoshgudeti@gmail.com"],
            body=html,
            subtype=MessageType.html,
        )

        fm = FastMail(config)
        await fm.send_message(message)
        print("✅ SUCCESS! Test email was successfully sent to santoshgudeti@gmail.com.")
        print("Please check your inbox (and spam folder) to confirm.")
    except Exception as e:
        print(f"❌ FAILED to send email. Error: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_email())
