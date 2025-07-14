import openai
import os
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from services.redis_service import redis_service
import json

class AIService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        openai.api_key = self.openai_api_key
        
        # Initialize LangChain ChatOpenAI
        self.llm = ChatOpenAI(
            openai_api_key=self.openai_api_key,
            model_name="gpt-3.5-turbo",
            temperature=0.7,
            max_tokens=1000
        )
        
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
        """Chat with user using financial AI assistant"""
        try:
            # Get user's conversation memory
            memory = self.get_user_memory(user_id)
            
            # Create conversation chain
            conversation = ConversationChain(
                llm=self.llm,
                memory=memory,
                verbose=False
            )
            
            # Add context if provided
            context_info = ""
            if context:
                context_info = f"\nContexto adicional: {json.dumps(context, indent=2)}\n"
            
            # Prepare the full prompt with system context
            full_prompt = f"{self.system_prompt}\n{context_info}\nUsuario: {message}"
            
            # Get AI response
            response = conversation.predict(input=full_prompt)
            
            # Save updated memory
            self.save_user_memory(user_id, memory)
            
            # Track usage
            from services.redis_service import redis_service
            redis_service.increment_global_stat("ai_conversations")
            
            return response
            
        except Exception as e:
            print(f"Error in AI chat: {e}")
            return "Lo siento, hubo un error procesando tu consulta. Por favor intenta de nuevo."
    
    async def analyze_financial_data(self, user_id: str, data_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze financial data and provide insights"""
        try:
            # Prepare analysis prompt based on data type
            if data_type == "cash_flow":
                prompt = f"""Analiza este flujo de caja y proporciona insights clave:
                
                Datos: {json.dumps(data, indent=2)}
                
                Proporciona:
                1. Análisis de tendencias
                2. Identificación de problemas potenciales
                3. Recomendaciones específicas
                4. Métricas clave a monitorear
                """
            
            elif data_type == "unit_economics":
                prompt = f"""Analiza estas métricas de unidad económica:
                
                Datos: {json.dumps(data, indent=2)}
                
                Proporciona:
                1. Análisis de rentabilidad por unidad
                2. Identificación de métricas críticas
                3. Oportunidades de optimización
                4. Comparación con benchmarks del sector
                """
                
            elif data_type == "pricing":
                prompt = f"""Analiza esta estrategia de precios:
                
                Datos: {json.dumps(data, indent=2)}
                
                Proporciona:
                1. Evaluación de la estructura de precios
                2. Análisis de márgenes
                3. Recomendaciones de optimización
                4. Estrategias de pricing alternativas
                """
            
            else:
                prompt = f"""Analiza estos datos financieros:
                
                Tipo: {data_type}
                Datos: {json.dumps(data, indent=2)}
                
                Proporciona insights y recomendaciones relevantes.
                """
            
            # Get AI analysis
            response = await self.chat_with_user(user_id, prompt)
            
            # Track usage
            from services.redis_service import redis_service
            redis_service.increment_global_stat("ai_analysis")
            
            return {
                "analysis": response,
                "data_type": data_type,
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