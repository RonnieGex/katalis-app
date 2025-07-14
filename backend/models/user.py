"""
Modelos de usuario y autenticación para KatalisApp
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
import hashlib
import secrets

Base = declarative_base()

class User(Base):
    """Modelo de usuario en la base de datos"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    business_stage = Column(String, nullable=True)  # startup, growth, mature
    employee_count = Column(Integer, nullable=True)
    monthly_revenue = Column(Float, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_image = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    country = Column(String, nullable=True)
    timezone = Column(String, default="UTC")
    language = Column(String, default="es")
    subscription_plan = Column(String, default="free")  # free, basic, premium
    api_usage_count = Column(Integer, default=0)
    api_usage_limit = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

class UserPreferences(Base):
    """Preferencias y configuraciones del usuario"""
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    theme = Column(String, default="light")  # light, dark, auto
    currency = Column(String, default="USD")
    date_format = Column(String, default="DD/MM/YYYY")
    number_format = Column(String, default="en-US")  # formato de números
    dashboard_layout = Column(Text, nullable=True)  # JSON con layout personalizado
    notifications_email = Column(Boolean, default=True)
    notifications_push = Column(Boolean, default=True)
    auto_save = Column(Boolean, default=True)
    ai_analysis_frequency = Column(String, default="weekly")  # daily, weekly, monthly
    default_analysis_depth = Column(String, default="standard")  # quick, standard, deep
    favorite_modules = Column(Text, nullable=True)  # JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Pydantic models para API
class UserCreate(BaseModel):
    """Modelo para crear usuario"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=20)
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)
    company_name: Optional[str] = None
    industry: Optional[str] = None
    business_stage: Optional[str] = None
    employee_count: Optional[int] = None
    monthly_revenue: Optional[float] = None
    phone: Optional[str] = None
    country: Optional[str] = None

class UserLogin(BaseModel):
    """Modelo para login"""
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    """Modelo para actualizar usuario"""
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    business_stage: Optional[str] = None
    employee_count: Optional[int] = None
    monthly_revenue: Optional[float] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None

class UserPreferencesUpdate(BaseModel):
    """Modelo para actualizar preferencias"""
    theme: Optional[str] = None
    currency: Optional[str] = None
    date_format: Optional[str] = None
    number_format: Optional[str] = None
    dashboard_layout: Optional[str] = None
    notifications_email: Optional[bool] = None
    notifications_push: Optional[bool] = None
    auto_save: Optional[bool] = None
    ai_analysis_frequency: Optional[str] = None
    default_analysis_depth: Optional[str] = None
    favorite_modules: Optional[List[str]] = None

class UserResponse(BaseModel):
    """Respuesta de usuario (sin contraseña)"""
    id: int
    email: str
    username: str
    full_name: str
    company_name: Optional[str]
    industry: Optional[str]
    business_stage: Optional[str]
    employee_count: Optional[int]
    monthly_revenue: Optional[float]
    is_active: bool
    is_verified: bool
    profile_image: Optional[str]
    phone: Optional[str]
    country: Optional[str]
    timezone: str
    language: str
    subscription_plan: str
    api_usage_count: int
    api_usage_limit: int
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True

class UserPreferencesResponse(BaseModel):
    """Respuesta de preferencias de usuario"""
    theme: str
    currency: str
    date_format: str
    number_format: str
    dashboard_layout: Optional[str]
    notifications_email: bool
    notifications_push: bool
    auto_save: bool
    ai_analysis_frequency: str
    default_analysis_depth: str
    favorite_modules: Optional[str]

    class Config:
        from_attributes = True

class PasswordReset(BaseModel):
    """Modelo para reset de contraseña"""
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    """Modelo para confirmar reset de contraseña"""
    token: str
    new_password: str = Field(..., min_length=8)

class ChangePassword(BaseModel):
    """Modelo para cambiar contraseña"""
    current_password: str
    new_password: str = Field(..., min_length=8)

def hash_password(password: str) -> str:
    """Hash de contraseña usando SHA-256 con salt"""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{pwd_hash}"

def verify_password(password: str, hashed: str) -> bool:
    """Verificar contraseña"""
    try:
        salt, pwd_hash = hashed.split(":")
        return hashlib.sha256((password + salt).encode()).hexdigest() == pwd_hash
    except ValueError:
        return False

def generate_reset_token() -> str:
    """Generar token para reset de contraseña"""
    return secrets.token_urlsafe(32)