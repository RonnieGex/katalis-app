"""
API de autenticación y gestión de usuarios para KatalisApp
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import jwt
import os
from typing import Optional

from models.user import (
    UserCreate, UserLogin, UserUpdate, UserPreferencesUpdate, 
    UserResponse, UserPreferencesResponse, PasswordReset, 
    PasswordResetConfirm, ChangePassword, hash_password, 
    verify_password, generate_reset_token
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

# Configuración JWT
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "katalis-app-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 días

# Base de datos en memoria para desarrollo
users_db = {}
preferences_db = {}
reset_tokens_db = {}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verificar token JWT"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(user_id: int = Depends(verify_token)) -> dict:
    """Obtener usuario actual"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return users_db[user_id]

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Registrar nuevo usuario"""
    
    # Verificar si el email ya existe
    for user in users_db.values():
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        if user["username"] == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está en uso"
            )
    
    # Crear nuevo usuario
    user_id = len(users_db) + 1
    hashed_pwd = hash_password(user_data.password)
    
    new_user = {
        "id": user_id,
        "email": user_data.email,
        "username": user_data.username,
        "full_name": user_data.full_name,
        "company_name": user_data.company_name,
        "industry": user_data.industry,
        "business_stage": user_data.business_stage,
        "employee_count": user_data.employee_count,
        "monthly_revenue": user_data.monthly_revenue,
        "hashed_password": hashed_pwd,
        "is_active": True,
        "is_verified": False,
        "profile_image": None,
        "phone": user_data.phone,
        "country": user_data.country,
        "timezone": "UTC",
        "language": "es",
        "subscription_plan": "free",
        "api_usage_count": 0,
        "api_usage_limit": 100,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None
    }
    
    users_db[user_id] = new_user
    
    # Crear preferencias por defecto
    default_preferences = {
        "user_id": user_id,
        "theme": "light",
        "currency": "USD",
        "date_format": "DD/MM/YYYY",
        "number_format": "en-US",
        "dashboard_layout": None,
        "notifications_email": True,
        "notifications_push": True,
        "auto_save": True,
        "ai_analysis_frequency": "weekly",
        "default_analysis_depth": "standard",
        "favorite_modules": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    preferences_db[user_id] = default_preferences
    
    # Remover contraseña de la respuesta
    response_user = new_user.copy()
    del response_user["hashed_password"]
    
    return UserResponse(**response_user)

@router.post("/login")
async def login(login_data: UserLogin):
    """Iniciar sesión"""
    
    # Buscar usuario por email
    user = None
    for u in users_db.values():
        if u["email"] == login_data.email:
            user = u
            break
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar contraseña
    if not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Actualizar último login
    user["last_login"] = datetime.utcnow()
    
    # Crear token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    # Preparar respuesta del usuario
    user_response = user.copy()
    del user_response["hashed_password"]
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": UserResponse(**user_response)
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    user_response = current_user.copy()
    del user_response["hashed_password"]
    return UserResponse(**user_response)

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar perfil del usuario"""
    
    user_id = current_user["id"]
    
    # Actualizar campos proporcionados
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        users_db[user_id][field] = value
    
    users_db[user_id]["updated_at"] = datetime.utcnow()
    
    # Respuesta sin contraseña
    user_response = users_db[user_id].copy()
    del user_response["hashed_password"]
    
    return UserResponse(**user_response)

@router.get("/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(current_user: dict = Depends(get_current_user)):
    """Obtener preferencias del usuario"""
    user_id = current_user["id"]
    
    if user_id not in preferences_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preferencias no encontradas"
        )
    
    prefs = preferences_db[user_id]
    return UserPreferencesResponse(**prefs)

@router.put("/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    preferences_update: UserPreferencesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar preferencias del usuario"""
    
    user_id = current_user["id"]
    
    if user_id not in preferences_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preferencias no encontradas"
        )
    
    # Actualizar campos proporcionados
    update_data = preferences_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "favorite_modules" and isinstance(value, list):
            value = ",".join(value)  # Convertir lista a string
        preferences_db[user_id][field] = value
    
    preferences_db[user_id]["updated_at"] = datetime.utcnow()
    
    return UserPreferencesResponse(**preferences_db[user_id])

@router.post("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: dict = Depends(get_current_user)
):
    """Cambiar contraseña del usuario"""
    
    user_id = current_user["id"]
    
    # Verificar contraseña actual
    if not verify_password(password_data.current_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta"
        )
    
    # Actualizar contraseña
    new_hashed_password = hash_password(password_data.new_password)
    users_db[user_id]["hashed_password"] = new_hashed_password
    users_db[user_id]["updated_at"] = datetime.utcnow()
    
    return {"message": "Contraseña actualizada exitosamente"}

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Cerrar sesión"""
    return {"message": "Sesión cerrada exitosamente"}

# Inicializar con usuario demo
def initialize_demo_user():
    """Crear usuario demo para testing"""
    if not users_db:  # Solo si no hay usuarios
        user_id = 1
        hashed_pwd = hash_password("demo123456")
        
        users_db[user_id] = {
            "id": user_id,
            "email": "demo@katalisapp.com",
            "username": "demo",
            "full_name": "Usuario Demo",
            "company_name": "KatalisApp Demo",
            "industry": "technology",
            "business_stage": "growth",
            "employee_count": 10,
            "monthly_revenue": 25000.0,
            "hashed_password": hashed_pwd,
            "is_active": True,
            "is_verified": True,
            "profile_image": None,
            "phone": None,
            "country": "Colombia",
            "timezone": "America/Bogota",
            "language": "es",
            "subscription_plan": "premium",
            "api_usage_count": 15,
            "api_usage_limit": 1000,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": datetime.utcnow()
        }
        
        # Preferencias demo
        preferences_db[user_id] = {
            "user_id": user_id,
            "theme": "light",
            "currency": "COP",
            "date_format": "DD/MM/YYYY",
            "number_format": "es-CO",
            "dashboard_layout": None,
            "notifications_email": True,
            "notifications_push": True,
            "auto_save": True,
            "ai_analysis_frequency": "daily",
            "default_analysis_depth": "deep",
            "favorite_modules": "unit_economics,cash_flow,reports",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

# Inicializar usuario demo al cargar el módulo
initialize_demo_user()