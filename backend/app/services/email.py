import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings

def get_email_credentials():
    sender = settings.email_sender_address
    password = settings.email_app_password
    return sender, password

def send_email(to_email: str, subject: str, body: str):
    sender, password = get_email_credentials()
    if not password:
        print(f"WARNING: EMAIL_APP_PASSWORD not set. Cannot send email to {to_email}")
        # In a real app we'd raise or log properly. We'll return False so the router knows it failed.
        return False
        
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to_email
    
    part = MIMEText(body, "html")
    msg.attach(part)
    
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_otp_email(to_email: str, code: str, action_desc: str):
    subject = "Your AMS Verification Code"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">Verification Required</h2>
            <p style="color: #475569;">You have requested to <strong>{action_desc}</strong>.</p>
            <p style="color: #475569;">Please use the following 8-digit verification code to complete this action. This code is valid for 10 minutes.</p>
            
            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4f46e5;">{code}</span>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">If you did not request this, please secure your account immediately.</p>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, body)

def send_reset_link_email(to_email: str, token: str):
    subject = "AMS Password Reset Request"
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">Password Reset</h2>
            <p style="color: #475569;">We received a request to reset your password for your Academic Management System account.</p>
            <p style="color: #475569;">Click the button below to set a new password. This link is valid for 10 minutes.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">If you did not request this, please ignore this email.</p>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, body)
