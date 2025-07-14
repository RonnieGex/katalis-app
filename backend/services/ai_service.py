import openai
import os
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from services.redis_service import redis_service
from services.dual_ai_service import dual_ai_service, TaskComplexity
import json

class AIService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
        
        # Obtener estado de servicios de IA
        self.ai_status = dual_ai_service.get_service_status()
        
        # Configurar cliente OpenAI si está disponible
        self.llm = None
        if self.ai_status['openai_available']:
            openai.api_key = self.openai_api_key
            self.llm = ChatOpenAI(
                openai_api_key=self.openai_api_key,
                model_name="gpt-4o-mini",  # Actualizado a gpt-4o-mini
                temperature=0.7,
                max_tokens=1000
            )
            print("✅ OpenAI GPT-4o-mini configurado para tareas simples")
        
        if self.ai_status['deepseek_available']:
            print("✅ DeepSeek R1 configurado para razonamiento complejo")
        
        if not self.ai_status['openai_available'] and not self.ai_status['deepseek_available']:
            print("⚠️ No hay APIs de IA configuradas - modo mock activo")
        
        # Financial advisor system prompt
        self.system_prompt = """Eres un asistente financiero experto especializado en ayudar a emprendedores.
        Tu conocimiento se basa en el libro "Finanzas para Emprendedores" y tienes experiencia en:
        
        - Análisis de unidades económicas
        - Gestión de flujo de caja
        - Estrategias de costos y precios
        - Planificación financiera
        - Análisis de rentabilidad
        
        Siempre proporciona respuestas prácticas, claras y con ejemplos concretos.
        Si el usuario pregunta sobre algo fuera del ámbito financiero, redirige la conversación hacia temas financieros empresariales."""
    
    def get_user_memory(self, user_id: str) -> ConversationBufferWindowMemory:
        """Get or create conversation memory for user"""
        memory_key = f"ai:memory:{user_id}"
        
        # Try to load existing memory
        memory_data = redis_service.redis_client.get(memory_key)
        
        if memory_data:
            # Restore memory from Redis
            messages = json.loads(memory_data)
            memory = ConversationBufferWindowMemory(
                k=10,  # Keep last 10 exchanges
                return_messages=True
            )
            
            # Restore messages
            for msg in messages:
                if msg["type"] == "human":
                    memory.chat_memory.add_user_message(msg["content"])
                elif msg["type"] == "ai":
                    memory.chat_memory.add_ai_message(msg["content"])
        else:
            # Create new memory
            memory = ConversationBufferWindowMemory(
                k=10,
                return_messages=True
            )
        
        return memory
    
    def save_user_memory(self, user_id: str, memory: ConversationBufferWindowMemory):
        """Save conversation memory to Redis"""
        memory_key = f"ai:memory:{user_id}"
        
        # Convert messages to serializable format
        messages = []
        for message in memory.chat_memory.messages:
            if isinstance(message, HumanMessage):
                messages.append({"type": "human", "content": message.content})
            elif isinstance(message, AIMessage):
                messages.append({"type": "ai", "content": message.content})
        
        # Save to Redis with 7 days expiration
        redis_service.redis_client.setex(
            memory_key,
            7 * 24 * 60 * 60,  # 7 days
            json.dumps(messages)
        )
    
    async def chat_with_user(self, user_id: str, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Chat with user using dual AI strategy"""
        try:
            # Determinar si es una pregunta simple o compleja
            task_type = "financial_chat"
            if any(word in message.lower() for word in ["analizar", "estrategia", "cómo optimizar", "recomendación detallada"]):
                task_type = "complex_financial_analysis"
            
            # Si tenemos servicios de IA disponibles, usar servicio dual
            if self.ai_status['openai_available'] or self.ai_status['deepseek_available']:
                # Preparar prompt con contexto
                context_info = ""
                if context:
                    context_info = f"\nContexto: {json.dumps(context, indent=2, ensure_ascii=False)}\n"
                
                full_prompt = f"{self.system_prompt}\n{context_info}\nUsuario: {message}"
                
                # Usar servicio dual de IA
                ai_response = await dual_ai_service.generate_response(
                    prompt=full_prompt,
                    task_type=task_type,
                    context=context
                )
                
                response = ai_response.content
                
                # Añadir info del modelo usado para transparencia
                if ai_response.provider != "mock":
                    response += f"\n\n🧠 *Generado por {ai_response.model_used}*"
                
            else:
                # Fallback a LangChain si solo tenemos OpenAI
                if self.llm:
                    memory = self.get_user_memory(user_id)
                    conversation = ConversationChain(llm=self.llm, memory=memory, verbose=False)
                    
                    context_info = ""
                    if context:
                        context_info = f"\nContexto adicional: {json.dumps(context, indent=2)}\n"
                    
                    full_prompt = f"{self.system_prompt}\n{context_info}\nUsuario: {message}"
                    response = conversation.predict(input=full_prompt)
                    
                    self.save_user_memory(user_id, memory)
                else:
                    response = "No hay servicios de IA configurados. Configura OPENAI_API_KEY o DEEPSEEK_API_KEY."
            
            # Track usage
            from services.redis_service import redis_service
            redis_service.increment_global_stat("ai_conversations")
            
            return response
            
        except Exception as e:
            print(f"Error in AI chat: {e}")
            return "Lo siento, hubo un error procesando tu consulta. Por favor intenta de nuevo."
    
    async def analyze_financial_data(self, user_id: str, data_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze financial data using appropriate AI model"""
        try:
            # Determinar complejidad del análisis
            complex_analysis_types = ["unit_economics", "cash_flow", "business_health", "growth_strategy"]
            is_complex = data_type in complex_analysis_types
            
            # Preparar prompt según tipo de análisis
            if data_type == "cash_flow":
                prompt = f"""ANALIZA PROFUNDAMENTE este flujo de caja empresarial:
                
                DATOS: {json.dumps(data, indent=2, ensure_ascii=False)}
                
                REQUERIMIENTOS:
                1. Análisis de tendencias y patrones estacionales
                2. Identificación de riesgos críticos de liquidez
                3. Proyecciones y escenarios futuros
                4. Estrategias de optimización específicas
                5. KPIs de monitoreo continuo
                6. Plan de acción priorizado
                """
                task_type = "complex_cash_flow_analysis"
            
            elif data_type == "unit_economics":
                prompt = f"""OPTIMIZA las unit economics de este negocio:
                
                DATOS: {json.dumps(data, indent=2, ensure_ascii=False)}
                
                ANALIZA:
                1. Rentabilidad por unidad y margen de contribución
                2. LTV/CAC ratio y eficiencia de adquisición
                3. Puntos de equilibrio y escalabilidad
                4. Comparación con benchmarks industriales
                5. Oportunidades de mejora y optimización
                6. Estrategias de pricing y reducción de costos
                """
                task_type = "complex_unit_economics_analysis"
                
            elif data_type == "pricing":
                prompt = f"""DESARROLLA estrategia de pricing óptima:
                
                DATOS: {json.dumps(data, indent=2, ensure_ascii=False)}
                
                ESTRATEGIA:
                1. Evaluación integral de estructura actual
                2. Análisis de elasticidad y sensibilidad
                3. Posicionamiento competitivo y valor percibido
                4. Modelos de pricing alternativos
                5. Impacto en márgenes y volume
                6. Plan de implementación gradual
                """
                task_type = "complex_pricing_strategy"
            
            else:
                prompt = f"""Analiza estos datos financieros:
                
                Tipo: {data_type}
                Datos: {json.dumps(data, indent=2, ensure_ascii=False)}
                
                Proporciona insights y recomendaciones relevantes.
                """
                task_type = "general_financial_analysis"
            
            # Usar servicio dual de IA
            if self.ai_status['openai_available'] or self.ai_status['deepseek_available']:
                ai_response = await dual_ai_service.generate_response(
                    prompt=prompt,
                    task_type=task_type,
                    context={"user_id": user_id, "analysis_type": data_type},
                    force_provider="deepseek" if is_complex and self.ai_status['deepseek_available'] else None
                )
                
                analysis_result = ai_response.content
                model_info = {
                    "model_used": ai_response.model_used,
                    "provider": ai_response.provider,
                    "confidence": ai_response.confidence,
                    "reasoning_steps": ai_response.reasoning_steps
                }
            else:
                # Fallback
                analysis_result = await self.chat_with_user(user_id, prompt)
                model_info = {"model_used": "fallback", "provider": "langchain"}
            
            # Track usage
            from services.redis_service import redis_service
            redis_service.increment_global_stat("ai_analysis")
            
            return {
                "analysis": analysis_result,
                "data_type": data_type,
                "model_info": model_info,
                "complexity": "complex" if is_complex else "simple",
                "timestamp": redis_service.get_current_timestamp(),
                "user_id": user_id
            }
            
        except Exception as e:
            print(f"Error in financial analysis: {e}")
            return {
                "error": "Error analyzing financial data",
                "data_type": data_type,
                "timestamp": redis_service.get_current_timestamp()
            }
    
    async def get_educational_content(self, topic: str, user_level: str = "beginner") -> Dict[str, Any]:
        """Generate educational content for specific financial topics"""
        try:
            prompt = f"""Crea contenido educativo sobre {topic} para nivel {user_level}.
            
            Basándote en "Finanzas para Emprendedores", proporciona:
            
            1. Conceptos clave (explicación simple)
            2. Ejemplo práctico con números
            3. Errores comunes a evitar
            4. Pasos de implementación
            5. Herramientas y recursos recomendados
            
            Mantén el contenido práctico y aplicable para emprendedores."""
            
            response = await self.chat_with_user("educational_ai", prompt)
            
            return {
                "topic": topic,
                "level": user_level,
                "content": response,
                "timestamp": redis_service.get_current_timestamp()
            }
            
        except Exception as e:
            print(f"Error generating educational content: {e}")
            return {
                "error": "Error generating educational content",
                "topic": topic
            }

# Global instance
ai_service = AIService()