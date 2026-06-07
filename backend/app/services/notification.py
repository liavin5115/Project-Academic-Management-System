import os
import requests
from datetime import datetime
from ..models.notification_log import NotificationLog
from ..config import settings
from ..database import SessionLocal


async def send_telegram_message(message: str) -> bool:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return False
    try:
        url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
        payload = {"chat_id": settings.telegram_chat_id, "text": message, "parse_mode": "HTML"}
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception:
        return False


async def send_discord_webhook(message: str) -> bool:
    if not settings.discord_webhook_url:
        return False
    try:
        payload = {"content": message}
        response = requests.post(settings.discord_webhook_url, json=payload, timeout=10)
        return response.status_code == 204
    except Exception:
        return False


async def send_notification(message: str, task_id: int = None) -> bool:
    success = False
    channel = settings.notification_channel

    if channel == "telegram":
        success = await send_telegram_message(message)
    elif channel == "discord":
        success = await send_discord_webhook(message)

    db = SessionLocal()
    try:
        log = NotificationLog(
            task_id=task_id,
            sent_at=datetime.now(),
            channel=channel,
            message=message,
            success=success,
        )
        db.add(log)
        db.commit()
    finally:
        db.close()

    return success