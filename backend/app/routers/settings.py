import os
import re
from fastapi import APIRouter
from pydantic import BaseModel
from ..config import settings

router = APIRouter()

class SettingsUpdate(BaseModel):
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    discord_webhook_url: str | None = None
    notification_channel: str | None = None

def update_env(key: str, value: str):
    env_path = ".env"
    if not os.path.exists(env_path):
        with open(env_path, "w") as f:
            f.write(f"{key}={value}\n")
        return
    
    with open(env_path, "r") as f:
        lines = f.readlines()
    
    updated = False
    for i, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[i] = f"{key}={value}\n"
            updated = True
            break
            
    if not updated:
        if lines and not lines[-1].endswith("\n"):
            lines[-1] += "\n"
        lines.append(f"{key}={value}\n")
        
    with open(env_path, "w") as f:
        f.writelines(lines)

@router.get("/settings")
def get_settings():
    return {
        "telegram_bot_token": settings.telegram_bot_token,
        "telegram_chat_id": settings.telegram_chat_id,
        "discord_webhook_url": settings.discord_webhook_url,
        "notification_channel": settings.notification_channel,
    }

@router.post("/settings")
def update_settings(payload: SettingsUpdate):
    if payload.telegram_bot_token is not None:
        update_env("TELEGRAM_BOT_TOKEN", payload.telegram_bot_token)
        settings.telegram_bot_token = payload.telegram_bot_token
    if payload.telegram_chat_id is not None:
        update_env("TELEGRAM_CHAT_ID", payload.telegram_chat_id)
        settings.telegram_chat_id = payload.telegram_chat_id
    if payload.discord_webhook_url is not None:
        update_env("DISCORD_WEBHOOK_URL", payload.discord_webhook_url)
        settings.discord_webhook_url = payload.discord_webhook_url
    if payload.notification_channel is not None:
        update_env("NOTIFICATION_CHANNEL", payload.notification_channel)
        settings.notification_channel = payload.notification_channel
        
    return {"success": True}
