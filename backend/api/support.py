"""
API de soporte técnico y tickets para KatalisApp
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, List, Any
from datetime import datetime
import json
import uuid

from api.auth import get_current_user

router = APIRouter(prefix="/support", tags=["Support"])

# Base de datos en memoria para tickets y soporte
tickets_db = {}
support_categories_db = {}
canned_responses_db = {}
feedback_db = {}

class SupportTicket(BaseModel):
    """Ticket de soporte"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    category: str
    priority: str = "medium"  # low, medium, high, urgent
    attachments: List[str] = []
    user_email: Optional[EmailStr] = None
    user_phone: Optional[str] = None

class TicketResponse(BaseModel):
    """Respuesta a un ticket"""
    ticket_id: str
    message: str = Field(..., min_length=10)
    is_internal: bool = False  # Para notas internas del equipo

class TicketUpdate(BaseModel):
    """Actualización de ticket"""
    status: Optional[str] = None  # open, in_progress, waiting_response, resolved, closed
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    internal_notes: Optional[str] = None

class ContactForm(BaseModel):
    """Formulario de contacto general"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=20)
    type: str = "general"  # general, sales, technical, billing
    company: Optional[str] = None
    phone: Optional[str] = None

class FeatureFeedback(BaseModel):
    """Feedback y sugerencias de características"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    category: str = "enhancement"  # enhancement, bug_report, new_feature
    impact: str = "medium"  # low, medium, high
    use_case: Optional[str] = None
    expected_behavior: Optional[str] = None
    current_behavior: Optional[str] = None

@router.post("/tickets", response_model=dict)
async def create_support_ticket(
    ticket: SupportTicket,
    current_user: dict = Depends(get_current_user)
):
    """Crear nuevo ticket de soporte"""
    
    # Validar categoría
    valid_categories = ["technical", "billing", "account", "feature_request", "bug_report", "other"]
    if ticket.category not in valid_categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Categoría inválida. Debe ser una de: {valid_categories}"
        )
    
    # Generar ID único para el ticket
    ticket_id = f"TKT-{uuid.uuid4().hex[:8].upper()}"
    
    # Crear ticket
    new_ticket = {
        "id": ticket_id,
        "user_id": current_user["id"],
        "user_name": current_user["full_name"],
        "user_email": current_user["email"],
        "title": ticket.title,
        "description": ticket.description,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": "open",
        "attachments": ticket.attachments,
        "contact_email": ticket.user_email or current_user["email"],
        "contact_phone": ticket.user_phone,
        "assigned_to": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "last_response_at": None,
        "responses": [],
        "internal_notes": [],
        "tags": [],
        "resolution": None,
        "satisfaction_rating": None
    }
    
    tickets_db[ticket_id] = new_ticket
    
    # Auto-asignar basado en categoría
    auto_assign_ticket(ticket_id, ticket.category)
    
    return {
        "message": "Ticket creado exitosamente",
        "ticket_id": ticket_id,
        "status": "open",
        "estimated_response_time": get_estimated_response_time(ticket.priority),
        "next_steps": get_next_steps(ticket.category)
    }

@router.get("/tickets")
async def get_user_tickets(
    status: Optional[str] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtener tickets del usuario actual"""
    
    user_tickets = []
    for ticket in tickets_db.values():
        if ticket["user_id"] == current_user["id"]:
            # Filtrar por status si se especifica
            if status and ticket["status"] != status:
                continue
            
            # Filtrar por categoría si se especifica
            if category and ticket["category"] != category:
                continue
            
            # Preparar respuesta del ticket (sin información interna)
            ticket_response = {
                "id": ticket["id"],
                "title": ticket["title"],
                "description": ticket["description"],
                "category": ticket["category"],
                "priority": ticket["priority"],
                "status": ticket["status"],
                "created_at": ticket["created_at"],
                "updated_at": ticket["updated_at"],
                "response_count": len([r for r in ticket["responses"] if not r.get("is_internal", False)]),
                "last_response_at": ticket["last_response_at"]
            }
            user_tickets.append(ticket_response)
    
    # Ordenar por fecha de creación (más recientes primero)
    user_tickets.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "tickets": user_tickets,
        "total": len(user_tickets),
        "filters": {"status": status, "category": category}
    }

@router.get("/tickets/{ticket_id}")
async def get_ticket_details(
    ticket_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtener detalles de un ticket específico"""
    
    if ticket_id not in tickets_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket no encontrado"
        )
    
    ticket = tickets_db[ticket_id]
    
    # Verificar que el usuario sea el propietario del ticket
    if ticket["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este ticket"
        )
    
    # Preparar respuesta (excluir información interna)
    public_responses = [
        r for r in ticket["responses"] 
        if not r.get("is_internal", False)
    ]
    
    ticket_details = {
        "id": ticket["id"],
        "title": ticket["title"],
        "description": ticket["description"],
        "category": ticket["category"],
        "priority": ticket["priority"],
        "status": ticket["status"],
        "created_at": ticket["created_at"],
        "updated_at": ticket["updated_at"],
        "responses": public_responses,
        "attachments": ticket["attachments"],
        "satisfaction_rating": ticket["satisfaction_rating"]
    }
    
    return ticket_details

@router.post("/tickets/{ticket_id}/responses")
async def add_ticket_response(
    ticket_id: str,
    response: TicketResponse,
    current_user: dict = Depends(get_current_user)
):
    """Agregar respuesta a un ticket"""
    
    if ticket_id not in tickets_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket no encontrado"
        )
    
    ticket = tickets_db[ticket_id]
    
    # Verificar que el usuario sea el propietario del ticket
    if ticket["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para responder este ticket"
        )
    
    # Verificar que el ticket esté abierto
    if ticket["status"] in ["resolved", "closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes responder a un ticket cerrado o resuelto"
        )
    
    # Agregar respuesta
    new_response = {
        "id": f"RSP-{uuid.uuid4().hex[:6].upper()}",
        "user_id": current_user["id"],
        "user_name": current_user["full_name"],
        "user_type": "customer",
        "message": response.message,
        "is_internal": False,
        "created_at": datetime.utcnow().isoformat(),
        "attachments": []
    }
    
    ticket["responses"].append(new_response)
    ticket["last_response_at"] = datetime.utcnow().isoformat()
    ticket["updated_at"] = datetime.utcnow().isoformat()
    
    # Cambiar status si estaba esperando respuesta
    if ticket["status"] == "waiting_response":
        ticket["status"] = "in_progress"
    
    return {
        "message": "Respuesta agregada exitosamente",
        "response_id": new_response["id"],
        "ticket_status": ticket["status"]
    }

@router.post("/tickets/{ticket_id}/rate")
async def rate_ticket_satisfaction(
    ticket_id: str,
    current_user: dict = Depends(get_current_user),
    rating: int = Query(..., ge=1, le=5),
    comment: Optional[str] = Query(None)
):
    """Calificar satisfacción con la resolución del ticket"""
    
    if ticket_id not in tickets_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket no encontrado"
        )
    
    ticket = tickets_db[ticket_id]
    
    # Verificar propietario
    if ticket["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para calificar este ticket"
        )
    
    # Verificar que el ticket esté resuelto
    if ticket["status"] not in ["resolved", "closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes calificar tickets resueltos"
        )
    
    # Agregar calificación
    ticket["satisfaction_rating"] = {
        "rating": rating,
        "comment": comment,
        "rated_at": datetime.utcnow().isoformat()
    }
    
    ticket["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "message": "Calificación registrada exitosamente",
        "rating": rating,
        "thank_you_message": get_thank_you_message(rating)
    }

@router.post("/contact")
async def submit_contact_form(contact: ContactForm):
    """Enviar formulario de contacto general"""
    
    # Generar ID para el contacto
    contact_id = f"CNT-{uuid.uuid4().hex[:8].upper()}"
    
    contact_data = {
        "id": contact_id,
        "name": contact.name,
        "email": contact.email,
        "company": contact.company,
        "phone": contact.phone,
        "subject": contact.subject,
        "message": contact.message,
        "type": contact.type,
        "status": "new",
        "created_at": datetime.utcnow().isoformat(),
        "followup_required": True,
        "priority": get_contact_priority(contact.type)
    }
    
    # En una implementación real, esto se guardaría en la base de datos
    # y se enviaría un email al equipo de soporte
    
    return {
        "message": "Mensaje enviado exitosamente",
        "contact_id": contact_id,
        "estimated_response_time": get_contact_response_time(contact.type),
        "next_steps": "Recibirás una respuesta por email en las próximas horas"
    }

@router.post("/feedback")
async def submit_feature_feedback(
    feedback: FeatureFeedback,
    current_user: dict = Depends(get_current_user)
):
    """Enviar feedback sobre características o sugerencias"""
    
    feedback_id = f"FBK-{uuid.uuid4().hex[:8].upper()}"
    
    feedback_data = {
        "id": feedback_id,
        "user_id": current_user["id"],
        "user_name": current_user["full_name"],
        "user_email": current_user["email"],
        "title": feedback.title,
        "description": feedback.description,
        "category": feedback.category,
        "impact": feedback.impact,
        "use_case": feedback.use_case,
        "expected_behavior": feedback.expected_behavior,
        "current_behavior": feedback.current_behavior,
        "status": "new",
        "votes": 1,  # El usuario que lo crea automáticamente vota por él
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "comments": [],
        "priority_score": calculate_feedback_priority(feedback.impact, feedback.category)
    }
    
    feedback_db[feedback_id] = feedback_data
    
    return {
        "message": "Feedback enviado exitosamente",
        "feedback_id": feedback_id,
        "status": "new",
        "thank_you": "Gracias por ayudarnos a mejorar KatalisApp. Revisaremos tu sugerencia y te mantendremos informado."
    }

@router.get("/categories")
async def get_support_categories():
    """Obtener categorías disponibles de soporte"""
    
    categories = {
        "technical": {
            "name": "Soporte Técnico",
            "description": "Problemas con la aplicación, errores, o dificultades técnicas",
            "estimated_response": "2-4 horas",
            "examples": ["Error al cargar datos", "Problema con análisis IA", "Aplicación lenta"]
        },
        "billing": {
            "name": "Facturación",
            "description": "Preguntas sobre planes, pagos, facturas",
            "estimated_response": "4-8 horas",
            "examples": ["Cambiar plan", "Problema con pago", "Solicitar factura"]
        },
        "account": {
            "name": "Cuenta",
            "description": "Problemas con login, perfil, configuración",
            "estimated_response": "1-2 horas",
            "examples": ["No puedo acceder", "Cambiar email", "Eliminar cuenta"]
        },
        "feature_request": {
            "name": "Solicitud de Características",
            "description": "Sugerencias para nuevas funcionalidades",
            "estimated_response": "1-2 días",
            "examples": ["Nueva integración", "Mejorar dashboard", "Exportar datos"]
        },
        "bug_report": {
            "name": "Reporte de Error",
            "description": "Comportamiento inesperado o errores en la aplicación",
            "estimated_response": "2-6 horas",
            "examples": ["Cálculo incorrecto", "Botón no funciona", "Datos no se guardan"]
        },
        "other": {
            "name": "Otro",
            "description": "Cualquier otra consulta o problema",
            "estimated_response": "4-12 horas",
            "examples": ["Pregunta general", "Consulta sobre uso", "Otro tema"]
        }
    }
    
    return {"categories": categories}

@router.get("/status")
async def get_support_status():
    """Obtener estado del sistema de soporte"""
    
    # Calcular estadísticas
    total_tickets = len(tickets_db)
    open_tickets = len([t for t in tickets_db.values() if t["status"] in ["open", "in_progress"]])
    avg_response_time = "2-4 horas"  # En una implementación real se calcularía
    
    return {
        "status": "operational",
        "current_load": "normal",
        "average_response_time": avg_response_time,
        "total_open_tickets": open_tickets,
        "total_tickets": total_tickets,
        "last_updated": datetime.utcnow().isoformat()
    }

def auto_assign_ticket(ticket_id: str, category: str):
    """Auto-asignar ticket basado en categoría"""
    assignment_map = {
        "technical": "tech_support",
        "billing": "billing_team",
        "account": "customer_success",
        "feature_request": "product_team",
        "bug_report": "engineering",
        "other": "general_support"
    }
    
    tickets_db[ticket_id]["assigned_to"] = assignment_map.get(category, "general_support")

def get_estimated_response_time(priority: str) -> str:
    """Obtener tiempo estimado de respuesta"""
    times = {
        "urgent": "30 minutos - 1 hora",
        "high": "1-2 horas",
        "medium": "2-4 horas",
        "low": "4-8 horas"
    }
    return times.get(priority, "2-4 horas")

def get_next_steps(category: str) -> str:
    """Obtener próximos pasos basados en categoría"""
    steps = {
        "technical": "Nuestro equipo técnico revisará tu reporte y puede solicitar información adicional.",
        "billing": "El equipo de facturación revisará tu consulta y te contactará por email.",
        "account": "Verificaremos tu cuenta y te ayudaremos a resolver el problema de acceso.",
        "feature_request": "Tu sugerencia será evaluada por nuestro equipo de producto.",
        "bug_report": "Reproduciremos el error y trabajaremos en una solución.",
        "other": "Revisaremos tu consulta y te dirigiremos al especialista apropiado."
    }
    return steps.get(category, "Revisaremos tu consulta y te contactaremos pronto.")

def get_contact_priority(contact_type: str) -> str:
    """Determinar prioridad del contacto"""
    priority_map = {
        "sales": "high",
        "technical": "medium",
        "billing": "medium",
        "general": "low"
    }
    return priority_map.get(contact_type, "medium")

def get_contact_response_time(contact_type: str) -> str:
    """Tiempo de respuesta para contactos"""
    times = {
        "sales": "1-2 horas",
        "technical": "2-4 horas",
        "billing": "4-8 horas",
        "general": "8-12 horas"
    }
    return times.get(contact_type, "4-8 horas")

def get_thank_you_message(rating: int) -> str:
    """Mensaje de agradecimiento basado en calificación"""
    if rating >= 4:
        return "¡Excelente! Nos alegra saber que pudimos ayudarte."
    elif rating >= 3:
        return "Gracias por tu feedback. Seguiremos mejorando nuestro servicio."
    else:
        return "Lamentamos que tu experiencia no haya sido la mejor. Un supervisor revisará tu caso."

def calculate_feedback_priority(impact: str, category: str) -> int:
    """Calcular score de prioridad para feedback"""
    impact_scores = {"high": 3, "medium": 2, "low": 1}
    category_scores = {"bug_report": 3, "new_feature": 2, "enhancement": 1}
    
    return impact_scores.get(impact, 1) + category_scores.get(category, 1)