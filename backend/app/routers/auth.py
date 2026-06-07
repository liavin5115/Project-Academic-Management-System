import random
import string
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, VerificationToken
from ..config import settings
from ..services.email import send_otp_email, send_reset_link_email
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class VerifyRegistrationRequest(BaseModel):
    username: str
    code: str

class ResendOTPRequest(BaseModel):
    username: str

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AccountUpdate(BaseModel):
    username: str
    email: EmailStr

class AccountUpdateVerify(AccountUpdate):
    code: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class PasswordUpdateVerify(PasswordUpdate):
    code: str

class DeleteVerify(BaseModel):
    code: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    is_verified: bool
    
    class Config:
        from_attributes = True

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def generate_otp():
    return "".join(random.choices(string.digits, k=8))

@router.post("/auth/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == request.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(request.password)
    user = User(username=request.username, email=request.email, password_hash=hashed_password, is_verified=False)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    code = generate_otp()
    expires = datetime.utcnow() + timedelta(minutes=10)
    token_obj = VerificationToken(user_id=user.id, action_type="register_account", token=code, expires_at=expires)
    db.add(token_obj)
    db.commit()
    
    send_otp_email(user.email, code, "verify your registration")
    
    return {"message": "Registration successful. Please verify your email.", "require_verification": True, "username": user.username}

@router.post("/auth/verify-registration")
def verify_registration(request: VerifyRegistrationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    token_obj = db.query(VerificationToken).filter(
        VerificationToken.user_id == user.id,
        VerificationToken.action_type == "register_account",
        VerificationToken.token == request.code
    ).first()
    
    if not token_obj or token_obj.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
    user.is_verified = True
    db.delete(token_obj)
    db.commit()
    return {"message": "Account verified successfully"}

@router.post("/auth/resend-verification")
def resend_verification(request: ResendOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account is already verified")
        
    # Clear old registration tokens
    db.query(VerificationToken).filter(
        VerificationToken.user_id == user.id,
        VerificationToken.action_type == "register_account"
    ).delete()
    
    code = generate_otp()
    expires = datetime.utcnow() + timedelta(minutes=10)
    token_obj = VerificationToken(user_id=user.id, action_type="register_account", token=code, expires_at=expires)
    db.add(token_obj)
    db.commit()
    
    send_otp_email(user.email, code, "verify your registration")
    return {"message": "Verification code sent to your email"}

@router.post("/auth/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="unverified_email")
        
    access_token_expires = timedelta(days=7) # 7 days
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token}

@router.get("/auth/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/admin/users")
def read_all_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "email": u.email, "is_admin": u.is_admin, "is_verified": u.is_verified, "created_at": u.created_at} for u in users]

# --- OTP Protected Account Endpoints ---

@router.post("/auth/me/account/request-otp")
def request_account_update_otp(request: AccountUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if request.username != current_user.username:
        if db.query(User).filter(User.username == request.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")
    if request.email != current_user.email:
        if db.query(User).filter(User.email == request.email).first():
            raise HTTPException(status_code=400, detail="Email already taken")
            
    code = generate_otp()
    expires = datetime.utcnow() + timedelta(minutes=10)
    token_obj = VerificationToken(user_id=current_user.id, action_type="change_account", token=code, expires_at=expires)
    db.add(token_obj)
    db.commit()
    
    send_otp_email(current_user.email, code, "update your profile details")
    return {"message": "OTP sent to email"}

@router.put("/auth/me/account", response_model=UserResponse)
def update_account_verify(request: AccountUpdateVerify, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    token_obj = db.query(VerificationToken).filter(
        VerificationToken.user_id == current_user.id,
        VerificationToken.action_type == "change_account",
        VerificationToken.token == request.code
    ).first()
    
    if not token_obj or token_obj.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
    if request.username != current_user.username:
        if db.query(User).filter(User.username == request.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")
    if request.email != current_user.email:
        if db.query(User).filter(User.email == request.email).first():
            raise HTTPException(status_code=400, detail="Email already taken")
            
    current_user.username = request.username
    current_user.email = request.email
    db.delete(token_obj)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/auth/me/password/request-otp")
def request_password_update_otp(request: PasswordUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    code = generate_otp()
    expires = datetime.utcnow() + timedelta(minutes=10)
    token_obj = VerificationToken(user_id=current_user.id, action_type="change_password", token=code, expires_at=expires)
    db.add(token_obj)
    db.commit()
    
    send_otp_email(current_user.email, code, "change your password")
    return {"message": "OTP sent to email"}

@router.put("/auth/me/password")
def update_password_verify(request: PasswordUpdateVerify, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    token_obj = db.query(VerificationToken).filter(
        VerificationToken.user_id == current_user.id,
        VerificationToken.action_type == "change_password",
        VerificationToken.token == request.code
    ).first()
    
    if not token_obj or token_obj.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
    current_user.password_hash = get_password_hash(request.new_password)
    db.delete(token_obj)
    db.commit()
    return {"message": "Password updated successfully"}

@router.post("/auth/me/delete/request-otp")
def request_delete_account_otp(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    code = generate_otp()
    expires = datetime.utcnow() + timedelta(minutes=10)
    token_obj = VerificationToken(user_id=current_user.id, action_type="delete_account", token=code, expires_at=expires)
    db.add(token_obj)
    db.commit()
    
    send_otp_email(current_user.email, code, "permanently delete your account")
    return {"message": "OTP sent to email"}

@router.delete("/auth/me")
def delete_account_verify(request: DeleteVerify, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    token_obj = db.query(VerificationToken).filter(
        VerificationToken.user_id == current_user.id,
        VerificationToken.action_type == "delete_account",
        VerificationToken.token == request.code
    ).first()
    
    if not token_obj or token_obj.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}

# --- Forgot Password Endpoints ---

@router.post("/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Prevent email enumeration by returning success anyway
        return {"message": "If that email is registered, a reset link has been sent."}
        
    token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(minutes=10)
    token_obj = VerificationToken(user_id=user.id, action_type="reset_password", token=token, expires_at=expires)
    db.add(token_obj)
    db.commit()
    
    send_reset_link_email(user.email, token)
    return {"message": "If that email is registered, a reset link has been sent."}

@router.post("/auth/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_obj = db.query(VerificationToken).filter(
        VerificationToken.action_type == "reset_password",
        VerificationToken.token == request.token
    ).first()
    
    if not token_obj or token_obj.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
        
    user = db.query(User).filter(User.id == token_obj.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.password_hash = get_password_hash(request.new_password)
    db.delete(token_obj)
    db.commit()
    return {"message": "Password reset successfully"}