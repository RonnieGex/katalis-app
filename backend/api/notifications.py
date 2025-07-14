"""
Notifications API - Real notification system for business alerts
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str  # alert, info, success, warning
    priority: str = "medium"  # low, medium, high, critical
    action_url: Optional[str] = None

class Notification(BaseModel):
    id: str
    title: str
    message: str
    type: str
    priority: str
    created_at: datetime
    read: bool = False
    action_url: Optional[str] = None

# In-memory storage for demo (would be database in production)
notifications_db: Dict[str, List[Notification]] = {}

def generate_financial_alerts(user_id: str) -> List[Notification]:
    """Generate real financial alerts based on business metrics"""
    alerts = []
    current_time = datetime.now()
    
    # Sample business metrics (would come from user's actual data)
    metrics = {
        "cash_flow": -5000,  # Negative cash flow
        "payment_overdue": 15000,  # Overdue payments
        "expense_spike": 1.3,  # 30% increase in expenses
        "low_inventory": True,
        "tax_deadline": datetime(2024, 12, 31),  # Tax deadline approaching
    }
    
    # Critical: Negative cash flow
    if metrics["cash_flow"] < 0:
        alerts.append(Notification(
            id=f"cashflow_{current_time.timestamp()}",
            title="⚠️ Flujo de Caja Negativo",
            message=f"Tu flujo de caja es de ${metrics['cash_flow']:,}. Revisa tus cobros pendientes y gastos urgentes.",
            type="alert",
            priority="critical",
            created_at=current_time,
            action_url="/app/cash-flow"
        ))
    
    # High: Overdue payments
    if metrics["payment_overdue"] > 0:
        alerts.append(Notification(
            id=f"payments_{current_time.timestamp()}",
            title="💰 Pagos Vencidos",
            message=f"Tienes ${metrics['payment_overdue']:,} en pagos vencidos. Contacta a tus clientes.",
            type="warning",
            priority="high",
            created_at=current_time,
            action_url="/app/cash-flow"
        ))
    
    # Medium: Expense spike
    if metrics["expense_spike"] > 1.2:
        alerts.append(Notification(
            id=f"expenses_{current_time.timestamp()}",
            title="📈 Aumento en Gastos",
            message=f"Tus gastos aumentaron {(metrics['expense_spike']-1)*100:.0f}% este mes. Revisa tu presupuesto.",
            type="warning",
            priority="medium",
            created_at=current_time,
            action_url="/app/costs-pricing"
        ))
    
    # Info: Tax deadline approaching
    days_to_tax = (metrics["tax_deadline"] - current_time).days
    if 0 < days_to_tax <= 30:
        alerts.append(Notification(
            id=f"tax_{current_time.timestamp()}",
            title="📋 Fecha Límite Fiscal",
            message=f"Quedan {days_to_tax} días para la fecha límite fiscal. Prepara tu documentación.",
            type="info",
            priority="medium",
            created_at=current_time,
            action_url="/app/reports"
        ))
    
    # Success: Good metrics
    if metrics["cash_flow"] > 10000:
        alerts.append(Notification(
            id=f"success_{current_time.timestamp()}",
            title="✅ Excelente Flujo de Caja",
            message="Tu flujo de caja está saludable. Considera invertir en crecimiento.",
            type="success",
            priority="low",
            created_at=current_time,
            action_url="/app/planning"
        ))
    
    return alerts

@router.get("/")
async def get_notifications(user_id: str = "demo_user"):
    """Get all notifications for a user"""
    try:
        # Generate fresh alerts if none exist
        if user_id not in notifications_db:
            notifications_db[user_id] = generate_financial_alerts(user_id)
        
        notifications = notifications_db[user_id]
        
        # Sort by priority and date
        priority_order = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        sorted_notifications = sorted(
            notifications,
            key=lambda x: (priority_order.get(x.priority, 0), x.created_at),
            reverse=True
        )
        
        return {
            "success": True,
            "notifications": [n.dict() for n in sorted_notifications],
            "unread_count": sum(1 for n in notifications if not n.read),
            "critical_count": sum(1 for n in notifications if n.priority == "critical"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")

@router.get("/unread-count")
async def get_unread_count(user_id: str = "demo_user"):
    """Get count of unread notifications"""
    try:
        if user_id not in notifications_db:
            notifications_db[user_id] = generate_financial_alerts(user_id)
        
        notifications = notifications_db[user_id]
        unread_count = sum(1 for n in notifications if not n.read)
        critical_count = sum(1 for n in notifications if n.priority == "critical" and not n.read)
        
        return {
            "unread_count": unread_count,
            "critical_count": critical_count,
            "has_alerts": unread_count > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error counting notifications: {str(e)}")

@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, user_id: str = "demo_user"):
    """Mark notification as read"""
    try:
        if user_id not in notifications_db:
            raise HTTPException(status_code=404, detail="User not found")
        
        notifications = notifications_db[user_id]
        for notification in notifications:
            if notification.id == notification_id:
                notification.read = True
                return {"success": True, "message": "Notification marked as read"}
        
        raise HTTPException(status_code=404, detail="Notification not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking notification: {str(e)}")

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, user_id: str = "demo_user"):
    """Delete a notification"""
    try:
        if user_id not in notifications_db:
            raise HTTPException(status_code=404, detail="User not found")
        
        notifications = notifications_db[user_id]
        notifications_db[user_id] = [n for n in notifications if n.id != notification_id]
        
        return {"success": True, "message": "Notification deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting notification: {str(e)}")

@router.post("/refresh")
async def refresh_notifications(user_id: str = "demo_user"):
    """Refresh notifications with latest business data"""
    try:
        # Generate new alerts based on current business state
        fresh_alerts = generate_financial_alerts(user_id)
        notifications_db[user_id] = fresh_alerts
        
        return {
            "success": True,
            "message": "Notifications refreshed",
            "count": len(fresh_alerts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing notifications: {str(e)}")