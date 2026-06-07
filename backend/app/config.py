import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/ams_db")
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    notification_channel: str = os.getenv("NOTIFICATION_CHANNEL", "telegram")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    telegram_chat_id: str = os.getenv("TELEGRAM_CHAT_ID", "")
    discord_webhook_url: str = os.getenv("DISCORD_WEBHOOK_URL", "")
    app_user_password: str = os.getenv("APP_USER_PASSWORD", "yourpassword")
    timezone: str = os.getenv("TIMEZONE", "Asia/Jakarta")
    email_sender_address: str = os.getenv("EMAIL_SENDER_ADDRESS", "")
    email_app_password: str = os.getenv("EMAIL_APP_PASSWORD", "")

    class Config:
        env_file = ".env"


settings = Settings()