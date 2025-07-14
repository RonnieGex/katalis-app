"""
API de configuración del sistema para KatalisApp
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
import json
import os

from api.auth import get_current_user

router = APIRouter(prefix="/config", tags=["Configuration"])

# Base de datos en memoria para configuraciones
system_config_db = {}
user_config_db = {}

class SystemConfiguration(BaseModel):
    """Configuración general del sistema"""
    app_name: str = "KatalisApp"
    app_version: str = "1.0.0"
    company_info: Dict[str, Any] = {
        "name": "KatalisApp",
        "website": "https://katalisapp.com",
        "support_email": "soporte@katalisapp.com",
        "phone": "+57 300 123 4567"
    }
    default_currency: str = "USD"
    supported_currencies: List[str] = ["USD", "COP", "EUR", "MXN", "ARS"]
    default_language: str = "es"
    supported_languages: List[str] = ["es", "en", "pt"]
    ai_settings: Dict[str, Any] = {
        "default_analysis_depth": "standard",
        "max_recommendations": 10,
        "confidence_threshold": 0.7,
        "auto_analysis_enabled": True
    }
    security_settings: Dict[str, Any] = {
        "password_min_length": 8,
        "session_timeout_minutes": 1440,  # 24 horas
        "max_login_attempts": 5,
        "require_email_verification": False
    }
    limits: Dict[str, Any] = {
        "free_api_calls_per_month": 100,
        "basic_api_calls_per_month": 1000,
        "premium_api_calls_per_month": 10000,
        "max_projects_per_user": 10,
        "max_file_upload_size_mb": 10
    }

class UserConfiguration(BaseModel):
    """Configuración específica del usuario"""
    notifications: Dict[str, bool] = {
        "email_weekly_reports": True,
        "email_alerts": True,
        "push_notifications": True,
        "sms_alerts": False
    }
    dashboard: Dict[str, Any] = {
        "default_view": "overview",
        "widgets_order": ["health_score", "cash_flow", "recommendations", "kpis"],
        "auto_refresh_minutes": 30,
        "show_animations": True
    }
    analysis: Dict[str, Any] = {
        "auto_analysis_frequency": "weekly",
        "default_period": "last_6_months",
        "include_projections": True,
        "alert_thresholds": {
            "cash_flow_critical": -10000,
            "health_score_warning": 60,
            "ltv_coca_ratio_min": 2.0
        }
    }
    integrations: Dict[str, Any] = {
        "accounting_software": None,
        "banking_connection": None,
        "export_formats": ["pdf", "excel", "csv"],
        "auto_backup": True
    }
    appearance: Dict[str, Any] = {
        "theme": "light",
        "color_scheme": "blue",
        "font_size": "medium",
        "compact_mode": False
    }

class ConfigurationUpdate(BaseModel):
    """Modelo para actualizar configuración"""
    section: str = Field(..., description="Sección a actualizar")
    settings: Dict[str, Any] = Field(..., description="Configuraciones a actualizar")

class NotificationSettings(BaseModel):
    """Configuración específica de notificaciones"""
    email_weekly_reports: Optional[bool] = None
    email_alerts: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_alerts: Optional[bool] = None
    email_address: Optional[str] = None
    phone_number: Optional[str] = None

class DashboardSettings(BaseModel):
    """Configuración específica del dashboard"""
    default_view: Optional[str] = None
    widgets_order: Optional[List[str]] = None
    auto_refresh_minutes: Optional[int] = None
    show_animations: Optional[bool] = None

class AnalysisSettings(BaseModel):
    """Configuración específica de análisis"""
    auto_analysis_frequency: Optional[str] = None
    default_period: Optional[str] = None
    include_projections: Optional[bool] = None
    alert_thresholds: Optional[Dict[str, float]] = None

@router.get("/system")
async def get_system_configuration():
    """Obtener configuración general del sistema"""
    if "system" not in system_config_db:
        # Inicializar configuración por defecto
        system_config_db["system"] = SystemConfiguration().dict()
    
    return system_config_db["system"]

@router.get("/user")
async def get_user_configuration(current_user: dict = Depends(get_current_user)):
    """Obtener configuración del usuario actual"""
    user_id = current_user["id"]
    
    if user_id not in user_config_db:
        # Crear configuración por defecto para el usuario
        user_config_db[user_id] = UserConfiguration().dict()
        user_config_db[user_id]["created_at"] = datetime.utcnow().isoformat()
        user_config_db[user_id]["updated_at"] = datetime.utcnow().isoformat()
    
    return user_config_db[user_id]

@router.put("/user")
async def update_user_configuration(
    config_update: ConfigurationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar configuración del usuario"""
    user_id = current_user["id"]
    
    # Asegurar que existe la configuración
    if user_id not in user_config_db:
        user_config_db[user_id] = UserConfiguration().dict()
        user_config_db[user_id]["created_at"] = datetime.utcnow().isoformat()
    
    # Validar sección
    valid_sections = ["notifications", "dashboard", "analysis", "integrations", "appearance"]
    if config_update.section not in valid_sections:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sección inválida. Debe ser una de: {valid_sections}"
        )
    
    # Actualizar la sección específica
    if config_update.section not in user_config_db[user_id]:
        user_config_db[user_id][config_update.section] = {}
    
    user_config_db[user_id][config_update.section].update(config_update.settings)
    user_config_db[user_id]["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "message": f"Configuración de {config_update.section} actualizada exitosamente",
        "section": config_update.section,
        "updated_settings": config_update.settings
    }

@router.put("/user/notifications")
async def update_notification_settings(
    notification_settings: NotificationSettings,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar configuración específica de notificaciones"""
    user_id = current_user["id"]
    
    # Asegurar que existe la configuración
    if user_id not in user_config_db:
        user_config_db[user_id] = UserConfiguration().dict()
        user_config_db[user_id]["created_at"] = datetime.utcnow().isoformat()
    
    # Actualizar configuraciones de notificaciones
    update_data = notification_settings.dict(exclude_unset=True)
    if "notifications" not in user_config_db[user_id]:
        user_config_db[user_id]["notifications"] = {}
    
    user_config_db[user_id]["notifications"].update(update_data)
    user_config_db[user_id]["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "message": "Configuración de notificaciones actualizada",
        "notifications": user_config_db[user_id]["notifications"]
    }

@router.put("/user/dashboard")
async def update_dashboard_settings(
    dashboard_settings: DashboardSettings,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar configuración específica del dashboard"""
    user_id = current_user["id"]
    
    # Asegurar que existe la configuración
    if user_id not in user_config_db:
        user_config_db[user_id] = UserConfiguration().dict()
        user_config_db[user_id]["created_at"] = datetime.utcnow().isoformat()
    
    # Actualizar configuraciones del dashboard
    update_data = dashboard_settings.dict(exclude_unset=True)
    if "dashboard" not in user_config_db[user_id]:
        user_config_db[user_id]["dashboard"] = {}
    
    user_config_db[user_id]["dashboard"].update(update_data)
    user_config_db[user_id]["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "message": "Configuración del dashboard actualizada",
        "dashboard": user_config_db[user_id]["dashboard"]
    }

@router.put("/user/analysis")
async def update_analysis_settings(
    analysis_settings: AnalysisSettings,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar configuración específica de análisis"""
    user_id = current_user["id"]
    
    # Asegurar que existe la configuración
    if user_id not in user_config_db:
        user_config_db[user_id] = UserConfiguration().dict()
        user_config_db[user_id]["created_at"] = datetime.utcnow().isoformat()
    
    # Actualizar configuraciones de análisis
    update_data = analysis_settings.dict(exclude_unset=True)
    if "analysis" not in user_config_db[user_id]:
        user_config_db[user_id]["analysis"] = {}
    
    user_config_db[user_id]["analysis"].update(update_data)
    user_config_db[user_id]["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "message": "Configuración de análisis actualizada",
        "analysis": user_config_db[user_id]["analysis"]
    }

@router.post("/user/reset")
async def reset_user_configuration(
    section: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Resetear configuración del usuario a valores por defecto"""
    user_id = current_user["id"]
    
    default_config = UserConfiguration().dict()
    
    if section:
        # Resetear solo una sección específica
        valid_sections = ["notifications", "dashboard", "analysis", "integrations", "appearance"]
        if section not in valid_sections:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Sección inválida. Debe ser una de: {valid_sections}"
            )
        
        if user_id not in user_config_db:
            user_config_db[user_id] = default_config
            user_config_db[user_id]["created_at"] = datetime.utcnow().isoformat()
        
        user_config_db[user_id][section] = default_config[section]
        user_config_db[user_id]["updated_at"] = datetime.utcnow().isoformat()
        
        return {
            "message": f"Configuración de {section} restablecida a valores por defecto",
            "section": section,
            "reset_values": default_config[section]
        }
    else:
        # Resetear toda la configuración
        user_config_db[user_id] = default_config
        user_config_db[user_id]["created_at"] = datetime.utcnow().isoformat()
        user_config_db[user_id]["updated_at"] = datetime.utcnow().isoformat()
        
        return {
            "message": "Toda la configuración ha sido restablecida a valores por defecto",
            "configuration": user_config_db[user_id]
        }

@router.get("/user/export")
async def export_user_configuration(current_user: dict = Depends(get_current_user)):
    """Exportar configuración del usuario para backup"""
    user_id = current_user["id"]
    
    if user_id not in user_config_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró configuración para este usuario"
        )
    
    export_data = {
        "user_id": user_id,
        "username": current_user["username"],
        "export_date": datetime.utcnow().isoformat(),
        "configuration": user_config_db[user_id]
    }
    
    return export_data

@router.post("/user/import")
async def import_user_configuration(
    configuration_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Importar configuración del usuario desde backup"""
    user_id = current_user["id"]
    
    try:
        # Validar que el formato sea correcto
        if "configuration" not in configuration_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo de configuración no tiene el formato correcto"
            )
        
        imported_config = configuration_data["configuration"]
        
        # Validar secciones principales
        required_sections = ["notifications", "dashboard", "analysis", "integrations", "appearance"]
        for section in required_sections:
            if section not in imported_config:
                imported_config[section] = UserConfiguration().dict()[section]
        
        # Importar configuración
        user_config_db[user_id] = imported_config
        user_config_db[user_id]["updated_at"] = datetime.utcnow().isoformat()
        user_config_db[user_id]["imported_at"] = datetime.utcnow().isoformat()
        
        return {
            "message": "Configuración importada exitosamente",
            "import_date": datetime.utcnow().isoformat(),
            "sections_imported": list(imported_config.keys())
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al importar configuración: {str(e)}"
        )

@router.get("/currencies")
async def get_supported_currencies():
    """Obtener lista de monedas soportadas"""
    currencies = {
        "USD": {"name": "Dólar Estadounidense", "symbol": "$", "code": "USD"},
        "COP": {"name": "Peso Colombiano", "symbol": "$", "code": "COP"},
        "EUR": {"name": "Euro", "symbol": "€", "code": "EUR"},
        "MXN": {"name": "Peso Mexicano", "symbol": "$", "code": "MXN"},
        "ARS": {"name": "Peso Argentino", "symbol": "$", "code": "ARS"},
        "BRL": {"name": "Real Brasileño", "symbol": "R$", "code": "BRL"},
        "CLP": {"name": "Peso Chileno", "symbol": "$", "code": "CLP"},
        "PEN": {"name": "Sol Peruano", "symbol": "S/", "code": "PEN"}
    }
    
    return {"currencies": currencies}

@router.get("/languages")
async def get_supported_languages():
    """Obtener lista de idiomas soportados"""
    languages = {
        "es": {"name": "Español", "native_name": "Español", "code": "es"},
        "en": {"name": "English", "native_name": "English", "code": "en"},
        "pt": {"name": "Português", "native_name": "Português", "code": "pt"}
    }
    
    return {"languages": languages}

@router.get("/themes")
async def get_available_themes():
    """Obtener temas disponibles"""
    themes = {
        "light": {
            "name": "Claro",
            "description": "Tema claro estándar",
            "primary_color": "#3B82F6",
            "background": "#FFFFFF"
        },
        "dark": {
            "name": "Oscuro",
            "description": "Tema oscuro para trabajar de noche",
            "primary_color": "#60A5FA",
            "background": "#1F2937"
        },
        "auto": {
            "name": "Automático",
            "description": "Cambia automáticamente según la hora del día",
            "primary_color": "#3B82F6",
            "background": "variable"
        }
    }
    
    return {"themes": themes}

@router.get("/health")
async def configuration_health_check():
    """Verificar estado del sistema de configuración"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "total_user_configs": len(user_config_db),
        "system_config_loaded": "system" in system_config_db
    }

# Inicializar configuración del sistema
def initialize_system_config():
    """Inicializar configuración del sistema por defecto"""
    if "system" not in system_config_db:
        system_config_db["system"] = SystemConfiguration().dict()
        system_config_db["system"]["initialized_at"] = datetime.utcnow().isoformat()

# Inicializar al cargar el módulo
initialize_system_config()