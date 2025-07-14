"""
Servicio de IA Dual: DeepSeek R1 + OpenAI GPT-4o-mini
DeepSeek R1: Razonamiento complejo, análisis financiero profundo
OpenAI GPT-4o-mini: Tareas simples, respuestas rápidas
"""

import os
import openai
import httpx
from typing import Dict, List, Optional, Any
from enum import Enum
from dataclasses import dataclass
import json
import asyncio
from datetime import datetime

class TaskComplexity(Enum):
    """Clasificación de complejidad de tareas para seleccionar el modelo apropiado"""
    SIMPLE = "simple"          # OpenAI GPT-4o-mini
    COMPLEX = "complex"        # DeepSeek R1 
    REASONING = "reasoning"    # DeepSeek R1

@dataclass
class AIResponse:
    """Respuesta unificada de ambos proveedores de IA"""
    content: str
    model_used: str
    provider: str
    reasoning_steps: Optional[List[str]] = None
    confidence: Optional[float] = None
    usage_tokens: Optional[int] = None

class DualAIService:
    """Servicio que maneja ambos proveedores de IA según la complejidad de la tarea"""
    
    def __init__(self):
        # API Keys
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
        
        # Configuración de APIs
        self.openai_client = None
        self.deepseek_base_url = "https://api.deepseek.com/v1"
        
        # Inicializar clientes
        self._initialize_clients()
        
        # Detectar qué servicios están disponibles
        self.openai_available = bool(self.openai_api_key and not self.openai_api_key.startswith("your_"))
        self.deepseek_available = bool(self.deepseek_api_key and not self.deepseek_api_key.startswith("your_"))
        
        print(f"🤖 AI Service Status:")
        print(f"   OpenAI GPT-4o-mini: {'✅ Available' if self.openai_available else '❌ Not configured'}")
        print(f"   DeepSeek R1: {'✅ Available' if self.deepseek_available else '❌ Not configured'}")
        
        if not self.openai_available and not self.deepseek_available:
            print("⚠️  No AI providers configured - using mock responses")
    
    def _initialize_clients(self):
        """Inicializa los clientes de IA"""
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
            self.openai_client = openai
    
    def _classify_task_complexity(self, task_type: str, prompt: str) -> TaskComplexity:
        """Clasifica la complejidad de una tarea para seleccionar el modelo apropiado"""
        
        # Palabras clave que indican razonamiento complejo
        complex_keywords = [
            "analizar", "evaluar", "comparar", "estrategia", "optimizar", 
            "proyección", "escenario", "recomendación", "diagnóstico",
            "business_health", "growth_opportunities", "pricing_strategy",
            "multi-agent", "financial_analysis", "risk_assessment"
        ]
        
        # Palabras clave que indican tareas simples
        simple_keywords = [
            "definición", "qué es", "explicar", "help", "quick",
            "básico", "simple", "rápido", "kpi_definitions"
        ]
        
        prompt_lower = prompt.lower()
        task_lower = task_type.lower()
        
        # Verificar si es una tarea de razonamiento complejo
        if any(keyword in prompt_lower or keyword in task_lower for keyword in complex_keywords):
            return TaskComplexity.REASONING
        
        # Verificar si es una tarea simple
        if any(keyword in prompt_lower or keyword in task_lower for keyword in simple_keywords):
            return TaskComplexity.SIMPLE
        
        # Por defecto, usar razonamiento complejo para análisis financiero
        return TaskComplexity.COMPLEX
    
    async def generate_response(
        self, 
        prompt: str, 
        task_type: str = "general",
        context: Optional[Dict] = None,
        force_provider: Optional[str] = None
    ) -> AIResponse:
        """Genera respuesta usando el proveedor apropiado según la complejidad"""
        
        # Clasificar complejidad de la tarea
        complexity = self._classify_task_complexity(task_type, prompt)
        
        # Determinar proveedor a usar
        if force_provider:
            provider = force_provider
        elif complexity == TaskComplexity.SIMPLE and self.openai_available:
            provider = "openai"
        elif complexity in [TaskComplexity.COMPLEX, TaskComplexity.REASONING] and self.deepseek_available:
            provider = "deepseek"
        elif self.openai_available:
            provider = "openai"  # Fallback
        elif self.deepseek_available:
            provider = "deepseek"  # Fallback
        else:
            # Mock response
            return self._generate_mock_response(prompt, task_type)
        
        print(f"🧠 Task: {task_type} | Complexity: {complexity.value} | Using: {provider}")
        
        try:
            if provider == "deepseek":
                return await self._generate_deepseek_response(prompt, context)
            else:
                return await self._generate_openai_response(prompt, context)
        except Exception as e:
            print(f"❌ Error with {provider}: {e}")
            # Fallback al otro proveedor
            if provider == "deepseek" and self.openai_available:
                return await self._generate_openai_response(prompt, context)
            elif provider == "openai" and self.deepseek_available:
                return await self._generate_deepseek_response(prompt, context)
            else:
                return self._generate_mock_response(prompt, task_type)
    
    async def _generate_deepseek_response(self, prompt: str, context: Optional[Dict] = None) -> AIResponse:
        """Genera respuesta usando DeepSeek R1 para razonamiento complejo"""
        
        # Preparar mensajes para DeepSeek
        messages = [
            {
                "role": "system",
                "content": """Eres un consultor financiero experto especializado en PyMEs y emprendimientos.
                
                Tu especialidad es el análisis profundo y razonamiento complejo basado en el libro 
                "Finanzas para Emprendedores". Usas razonamiento paso a paso para:
                
                - Análisis financiero integral
                - Estrategias de crecimiento complejas  
                - Evaluación de riesgos multidimensional
                - Optimización de unit economics
                - Proyecciones y escenarios financieros
                
                Siempre estructura tu respuesta con:
                1. Análisis del problema
                2. Razonamiento paso a paso
                3. Recomendaciones específicas
                4. Métricas y KPIs relevantes
                """
            }
        ]
        
        if context:
            messages.append({
                "role": "system", 
                "content": f"Contexto adicional: {json.dumps(context, ensure_ascii=False)}"
            })
        
        messages.append({"role": "user", "content": prompt})
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.deepseek_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.deepseek_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-reasoner",  # DeepSeek R1
                    "messages": messages,
                    "max_tokens": 2000,
                    "temperature": 0.7,
                    "stream": False
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                
                # Extraer pasos de razonamiento si están disponibles
                reasoning_steps = []
                if "reasoning_content" in data["choices"][0]["message"]:
                    reasoning_content = data["choices"][0]["message"]["reasoning_content"]
                    # Parsear pasos de razonamiento
                    reasoning_steps = reasoning_content.split("\n") if reasoning_content else []
                
                return AIResponse(
                    content=content,
                    model_used="deepseek-reasoner",
                    provider="deepseek",
                    reasoning_steps=reasoning_steps,
                    confidence=0.9,
                    usage_tokens=data.get("usage", {}).get("total_tokens")
                )
            else:
                raise Exception(f"DeepSeek API error: {response.status_code} - {response.text}")
    
    async def _generate_openai_response(self, prompt: str, context: Optional[Dict] = None) -> AIResponse:
        """Genera respuesta usando OpenAI GPT-4o-mini para tareas simples"""
        
        messages = [
            {
                "role": "system",
                "content": """Eres un asistente financiero rápido y eficiente para emprendedores.
                
                Basado en "Finanzas para Emprendedores", proporcionas respuestas claras y directas para:
                - Definiciones de conceptos financieros
                - Explicaciones rápidas de KPIs
                - Consejos prácticos básicos
                - Respuestas a preguntas frecuentes
                
                Mantén tus respuestas concisas pero útiles."""
            }
        ]
        
        if context:
            messages.append({
                "role": "system",
                "content": f"Contexto: {json.dumps(context, ensure_ascii=False)}"
            })
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await asyncio.to_thread(
                self.openai_client.ChatCompletion.create,
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=1000,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            
            return AIResponse(
                content=content,
                model_used="gpt-4o-mini", 
                provider="openai",
                confidence=0.85,
                usage_tokens=response.usage.total_tokens
            )
            
        except Exception as e:
            raise Exception(f"OpenAI API error: {e}")
    
    def _generate_mock_response(self, prompt: str, task_type: str) -> AIResponse:
        """Genera respuesta mock cuando no hay APIs disponibles"""
        
        mock_responses = {
            "business_health": "📊 Análisis Mock: Tu negocio muestra métricas saludables con oportunidades de optimización en flujo de caja y unit economics. Recomiendo enfocarte en reducir el ciclo de conversión de efectivo.",
            "growth_opportunities": "🚀 Mock: Identifiqué 3 oportunidades clave: 1) Optimizar precios (+8% margen), 2) Reducir CAC vía referidos (-25%), 3) Expandir productos rentables.",
            "pricing_strategy": "💰 Mock: Tu estrategia de precios puede mejorarse. Considera pricing basado en valor, segmentación de clientes y optimización de márgenes de contribución.",
            "default": f"🤖 Mock Response: Basándome en 'Finanzas para Emprendedores', para '{task_type}' te recomiendo analizar tus métricas clave y enfocarte en unit economics saludables."
        }
        
        content = mock_responses.get(task_type, mock_responses["default"])
        
        return AIResponse(
            content=f"{content}\n\n⚠️ Nota: Respuesta simulada. Configura OPENAI_API_KEY y DEEPSEEK_API_KEY para IA real.",
            model_used="mock",
            provider="mock",
            confidence=0.5
        )
    
    def get_service_status(self) -> Dict[str, Any]:
        """Retorna el estado actual de los servicios de IA"""
        return {
            "openai_available": self.openai_available,
            "deepseek_available": self.deepseek_available,
            "strategy": "dual" if self.openai_available and self.deepseek_available else "single",
            "primary_provider": "deepseek" if self.deepseek_available else "openai" if self.openai_available else "mock",
            "models": {
                "simple_tasks": "gpt-4o-mini" if self.openai_available else "mock",
                "complex_reasoning": "deepseek-reasoner" if self.deepseek_available else "mock"
            }
        }

# Instancia global del servicio dual
dual_ai_service = DualAIService()