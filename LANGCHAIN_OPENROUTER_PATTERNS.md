# LangChain + OpenRouter Integration Patterns

## Overview
This document provides comprehensive patterns for integrating LangChain with OpenRouter API, including real-world examples, agent implementations, and production-ready patterns for AI-powered applications.

## OpenRouter API Integration

### 1. Basic OpenRouter Setup with LangChain
```python
import os
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.callbacks.base import BaseCallbackHandler
import json

class OpenRouterClient:
    def __init__(self, api_key: str, model: str = "anthropic/claude-3-sonnet"):
        self.client = ChatOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            model=model,
            temperature=0.7,
            max_tokens=4000,
            timeout=60,
            max_retries=3
        )
        
    def get_available_models(self):
        """Get list of available models from OpenRouter"""
        models = {
            "fast": "anthropic/claude-3-haiku",
            "balanced": "anthropic/claude-3-sonnet", 
            "powerful": "anthropic/claude-3-opus",
            "gpt4": "openai/gpt-4-turbo",
            "gpt3": "openai/gpt-3.5-turbo",
            "llama": "meta-llama/llama-2-70b-chat",
            "mistral": "mistralai/mistral-7b-instruct",
            "gemini": "google/gemini-pro"
        }
        return models
    
    def switch_model(self, model_name: str):
        """Switch to different model"""
        models = self.get_available_models()
        if model_name in models:
            self.client.model = models[model_name]
        else:
            self.client.model = model_name
```

### 2. Advanced Message Handling
```python
from langchain.schema import BaseMessage
from typing import List, Dict, Any
import asyncio

class MessageProcessor:
    def __init__(self, openrouter_client: OpenRouterClient):
        self.client = openrouter_client
        
    async def process_conversation(self, messages: List[BaseMessage]) -> str:
        """Process a conversation with context awareness"""
        try:
            # Add system context
            if not any(isinstance(msg, SystemMessage) for msg in messages):
                system_msg = SystemMessage(content=self.get_system_prompt())
                messages = [system_msg] + messages
            
            # Process with OpenRouter
            response = await self.client.client.agenerate([messages])
            return response.generations[0][0].text
            
        except Exception as e:
            return f"Error processing conversation: {str(e)}"
    
    def get_system_prompt(self) -> str:
        """Get dynamic system prompt based on context"""
        return """You are a helpful AI assistant with access to various tools and capabilities. 
        You should be accurate, helpful, and provide clear explanations for your actions.
        Always cite sources when providing factual information."""

    async def stream_response(self, messages: List[BaseMessage]):
        """Stream response for real-time chat"""
        async for chunk in self.client.client.astream(messages):
            if chunk.content:
                yield chunk.content
```

## LangChain Agent Patterns

### 1. Multi-Tool Agent Implementation
```python
from langchain.agents import initialize_agent, AgentType, Tool
from langchain.memory import ConversationBufferWindowMemory
from langchain.utilities import GoogleSearchAPIWrapper, WikipediaAPIWrapper
from langchain.tools import DuckDuckGoSearchRun
import requests
import json

class AdvancedAIAgent:
    def __init__(self, openrouter_client: OpenRouterClient):
        self.llm = openrouter_client.client
        self.memory = ConversationBufferWindowMemory(
            memory_key="chat_history",
            return_messages=True,
            k=10  # Remember last 10 exchanges
        )
        self.tools = self._initialize_tools()
        
    def _initialize_tools(self) -> List[Tool]:
        """Initialize available tools for the agent"""
        return [
            Tool(
                name="web_search",
                description="Search the web for current information",
                func=self._web_search
            ),
            Tool(
                name="wikipedia",
                description="Search Wikipedia for factual information",
                func=self._wikipedia_search
            ),
            Tool(
                name="calculator",
                description="Perform mathematical calculations",
                func=self._calculator
            ),
            Tool(
                name="weather",
                description="Get current weather for a location",
                func=self._get_weather
            ),
            Tool(
                name="code_analyzer",
                description="Analyze and explain code snippets",
                func=self._analyze_code
            ),
            Tool(
                name="task_planner",
                description="Break down complex tasks into steps",
                func=self._plan_task
            )
        ]
    
    def _web_search(self, query: str) -> str:
        """Web search tool"""
        try:
            search = DuckDuckGoSearchRun()
            results = search.run(query)
            return f"Search results for '{query}':\n{results}"
        except Exception as e:
            return f"Search failed: {str(e)}"
    
    def _wikipedia_search(self, query: str) -> str:
        """Wikipedia search tool"""
        try:
            wikipedia = WikipediaAPIWrapper()
            results = wikipedia.run(query)
            return results
        except Exception as e:
            return f"Wikipedia search failed: {str(e)}"
    
    def _calculator(self, expression: str) -> str:
        """Safe calculator tool"""
        try:
            # Simple and safe evaluation
            allowed_chars = set('0123456789+-*/.() ')
            if not all(c in allowed_chars for c in expression):
                return "Invalid characters in expression"
            
            result = eval(expression)
            return f"Result: {result}"
        except Exception as e:
            return f"Calculation error: {str(e)}"
    
    def _get_weather(self, location: str) -> str:
        """Weather information tool"""
        try:
            # Using a weather API (replace with actual API key)
            api_key = os.getenv("WEATHER_API_KEY")
            if not api_key:
                return "Weather API key not configured"
            
            url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
            response = requests.get(url)
            data = response.json()
            
            if response.status_code == 200:
                temp = data['main']['temp']
                desc = data['weather'][0]['description']
                return f"Current weather in {location}: {temp}°C, {desc}"
            else:
                return f"Weather data not available for {location}"
        except Exception as e:
            return f"Weather lookup failed: {str(e)}"
    
    def _analyze_code(self, code: str) -> str:
        """Code analysis tool"""
        try:
            # Basic code analysis
            lines = code.split('\n')
            analysis = {
                "line_count": len(lines),
                "has_imports": any(line.strip().startswith(('import ', 'from ')) for line in lines),
                "has_functions": any('def ' in line for line in lines),
                "has_classes": any('class ' in line for line in lines),
                "has_comments": any(line.strip().startswith('#') for line in lines)
            }
            
            return f"Code analysis:\n{json.dumps(analysis, indent=2)}"
        except Exception as e:
            return f"Code analysis failed: {str(e)}"
    
    def _plan_task(self, task: str) -> str:
        """Task planning tool"""
        try:
            # Use the LLM to break down tasks
            prompt = f"""Break down this task into specific, actionable steps:
            
Task: {task}

Provide a numbered list of clear, specific steps to complete this task."""
            
            response = self.llm.predict(prompt)
            return f"Task breakdown for '{task}':\n{response}"
        except Exception as e:
            return f"Task planning failed: {str(e)}"
    
    def create_agent(self) -> any:
        """Create the agent with tools and memory"""
        return initialize_agent(
            tools=self.tools,
            llm=self.llm,
            agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
            memory=self.memory,
            verbose=True,
            max_iterations=5,
            early_stopping_method="generate",
            handle_parsing_errors=True
        )
    
    async def chat(self, message: str, user_id: str) -> str:
        """Main chat interface"""
        try:
            agent = self.create_agent()
            
            # Add user context to the message
            contextualized_message = f"User {user_id}: {message}"
            
            # Process with agent
            response = agent.run(contextualized_message)
            
            return response
        except Exception as e:
            return f"Agent error: {str(e)}"
```

### 2. Specialized Agent Types

#### Document Analysis Agent
```python
from langchain.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA

class DocumentAnalysisAgent:
    def __init__(self, openrouter_client: OpenRouterClient):
        self.llm = openrouter_client.client
        self.embeddings = OpenAIEmbeddings(
            openai_api_base="https://openrouter.ai/api/v1",
            openai_api_key=os.getenv("OPENROUTER_API_KEY")
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
    async def analyze_document(self, file_path: str, question: str) -> str:
        """Analyze document and answer questions"""
        try:
            # Load document
            if file_path.endswith('.pdf'):
                loader = PyPDFLoader(file_path)
            else:
                loader = TextLoader(file_path)
            
            documents = loader.load()
            
            # Split into chunks
            texts = self.text_splitter.split_documents(documents)
            
            # Create vector store
            vectorstore = FAISS.from_documents(texts, self.embeddings)
            
            # Create QA chain
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
            )
            
            # Get answer
            response = qa_chain.run(question)
            return response
            
        except Exception as e:
            return f"Document analysis failed: {str(e)}"
    
    def summarize_document(self, file_path: str) -> str:
        """Create document summary"""
        return self.analyze_document(
            file_path, 
            "Provide a comprehensive summary of this document, highlighting key points and main themes."
        )
```

#### Data Analysis Agent
```python
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64

class DataAnalysisAgent:
    def __init__(self, openrouter_client: OpenRouterClient):
        self.llm = openrouter_client.client
        
    def analyze_csv(self, file_path: str, analysis_request: str) -> dict:
        """Analyze CSV data"""
        try:
            # Load data
            df = pd.read_csv(file_path)
            
            # Basic statistics
            stats = {
                "shape": df.shape,
                "columns": df.columns.tolist(),
                "dtypes": df.dtypes.to_dict(),
                "missing_values": df.isnull().sum().to_dict(),
                "numeric_summary": df.describe().to_dict() if len(df.select_dtypes(include='number').columns) > 0 else None
            }
            
            # Generate analysis using LLM
            prompt = f"""Analyze this dataset based on the following request:
            
Dataset Info:
- Shape: {stats['shape']}
- Columns: {stats['columns']}
- Data types: {stats['dtypes']}
- Missing values: {stats['missing_values']}

Analysis Request: {analysis_request}

Provide insights, patterns, and recommendations based on the data structure and the specific request."""

            analysis = self.llm.predict(prompt)
            
            return {
                "statistics": stats,
                "analysis": analysis,
                "sample_data": df.head().to_dict()
            }
            
        except Exception as e:
            return {"error": f"Data analysis failed: {str(e)}"}
    
    def create_visualization(self, df: pd.DataFrame, chart_type: str, x_col: str, y_col: str = None) -> str:
        """Create data visualization"""
        try:
            plt.figure(figsize=(10, 6))
            
            if chart_type == "histogram":
                plt.hist(df[x_col])
                plt.title(f"Distribution of {x_col}")
            elif chart_type == "scatter" and y_col:
                plt.scatter(df[x_col], df[y_col])
                plt.xlabel(x_col)
                plt.ylabel(y_col)
                plt.title(f"{x_col} vs {y_col}")
            elif chart_type == "line" and y_col:
                plt.plot(df[x_col], df[y_col])
                plt.xlabel(x_col)
                plt.ylabel(y_col)
                plt.title(f"{x_col} vs {y_col}")
            
            # Save to base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return image_base64
            
        except Exception as e:
            return f"Visualization failed: {str(e)}"
```

## Production FastAPI Integration

### 1. FastAPI Service Implementation
```python
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime

app = FastAPI(title="AI Agent API")
security = HTTPBearer()

class ChatRequest(BaseModel):
    message: str
    agent_type: Optional[str] = "general"
    model: Optional[str] = "anthropic/claude-3-sonnet"
    context: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    response: str
    agent_type: str
    model_used: str
    timestamp: datetime
    tokens_used: Optional[int] = None

class AIAgentService:
    def __init__(self):
        self.agents = {}
        self.openrouter_client = None
        
    async def initialize(self):
        """Initialize AI agents"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        self.openrouter_client = OpenRouterClient(api_key)
        
        # Initialize different agent types
        self.agents = {
            "general": AdvancedAIAgent(self.openrouter_client),
            "document": DocumentAnalysisAgent(self.openrouter_client),
            "data": DataAnalysisAgent(self.openrouter_client)
        }
    
    async def chat(self, request: ChatRequest, user_id: str) -> ChatResponse:
        """Process chat request"""
        try:
            # Switch model if requested
            if request.model:
                self.openrouter_client.switch_model(request.model)
            
            # Get appropriate agent
            agent = self.agents.get(request.agent_type, self.agents["general"])
            
            # Process message
            response = await agent.chat(request.message, user_id)
            
            return ChatResponse(
                response=response,
                agent_type=request.agent_type,
                model_used=request.model or "anthropic/claude-3-sonnet",
                timestamp=datetime.utcnow()
            )
            
        except Exception as e:
            raise HTTPException(500, f"Chat processing failed: {str(e)}")

# Global service instance
ai_service = AIAgentService()

@app.on_event("startup")
async def startup_event():
    await ai_service.initialize()

@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> ChatResponse:
    """Main chat endpoint"""
    # Validate user (implement your auth logic)
    user_id = validate_user_token(credentials.credentials)
    
    # Process chat
    response = await ai_service.chat(request, user_id)
    
    # Log usage (implement your logging)
    log_chat_usage(user_id, request.agent_type, request.model)
    
    return response

@app.post("/api/ai/stream-chat")
async def stream_chat_endpoint(
    request: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Streaming chat endpoint"""
    user_id = validate_user_token(credentials.credentials)
    
    async def generate():
        agent = ai_service.agents.get(request.agent_type, ai_service.agents["general"])
        
        async for chunk in agent.stream_response(request.message, user_id):
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/plain")

@app.get("/api/ai/models")
async def get_available_models():
    """Get available OpenRouter models"""
    return ai_service.openrouter_client.get_available_models()

@app.post("/api/ai/agents/{agent_type}/tools")
async def get_agent_tools(agent_type: str):
    """Get available tools for agent type"""
    agent = ai_service.agents.get(agent_type)
    if not agent:
        raise HTTPException(404, "Agent type not found")
    
    return {
        "agent_type": agent_type,
        "tools": [tool.name for tool in agent.tools]
    }
```

### 2. Error Handling and Retries
```python
import asyncio
import backoff
from typing import Callable, Any

class RobustOpenRouterClient:
    def __init__(self, api_key: str):
        self.client = OpenRouterClient(api_key)
        self.retry_config = {
            "max_tries": 3,
            "backoff": backoff.expo,
            "exception": (Exception,),
            "max_time": 60
        }
    
    @backoff.on_exception(
        backoff.expo,
        (Exception,),
        max_tries=3,
        max_time=60
    )
    async def robust_chat(self, messages: List[BaseMessage]) -> str:
        """Chat with retry logic"""
        try:
            return await self.client.client.agenerate([messages])
        except Exception as e:
            # Log error
            logger.error(f"OpenRouter API error: {str(e)}")
            
            # Check if it's a rate limit error
            if "rate limit" in str(e).lower():
                # Wait longer for rate limits
                await asyncio.sleep(60)
                
            # Re-raise for backoff to handle
            raise e
    
    async def chat_with_fallback(self, messages: List[BaseMessage], fallback_model: str = None) -> str:
        """Chat with model fallback"""
        try:
            return await self.robust_chat(messages)
        except Exception as e:
            if fallback_model:
                # Try with fallback model
                original_model = self.client.client.model
                self.client.switch_model(fallback_model)
                
                try:
                    result = await self.robust_chat(messages)
                    return f"[Using fallback model {fallback_model}] {result}"
                finally:
                    # Restore original model
                    self.client.client.model = original_model
            else:
                # Return error message
                return f"AI service temporarily unavailable: {str(e)}"
```

### 3. Usage Tracking and Analytics
```python
import redis
from datetime import datetime, timedelta
import json

class UsageTracker:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    async def track_usage(self, user_id: str, agent_type: str, model: str, tokens: int = 0):
        """Track usage statistics"""
        timestamp = datetime.utcnow()
        date_key = timestamp.strftime("%Y-%m-%d")
        hour_key = timestamp.strftime("%Y-%m-%d-%H")
        
        # Daily usage
        self.redis.hincrby(f"usage:daily:{date_key}", f"user:{user_id}", 1)
        self.redis.hincrby(f"usage:daily:{date_key}", f"model:{model}", 1)
        self.redis.hincrby(f"usage:daily:{date_key}", f"agent:{agent_type}", 1)
        
        # Hourly usage
        self.redis.hincrby(f"usage:hourly:{hour_key}", f"user:{user_id}", 1)
        
        # Token usage
        if tokens:
            self.redis.hincrby(f"tokens:daily:{date_key}", f"user:{user_id}", tokens)
        
        # Set expiry (30 days for daily, 7 days for hourly)
        self.redis.expire(f"usage:daily:{date_key}", 30 * 24 * 3600)
        self.redis.expire(f"usage:hourly:{hour_key}", 7 * 24 * 3600)
        self.redis.expire(f"tokens:daily:{date_key}", 30 * 24 * 3600)
    
    async def get_user_usage(self, user_id: str, days: int = 7) -> dict:
        """Get usage statistics for user"""
        usage_data = {"daily": {}, "total_tokens": 0}
        
        for i in range(days):
            date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
            daily_count = self.redis.hget(f"usage:daily:{date}", f"user:{user_id}")
            token_count = self.redis.hget(f"tokens:daily:{date}", f"user:{user_id}")
            
            usage_data["daily"][date] = {
                "requests": int(daily_count) if daily_count else 0,
                "tokens": int(token_count) if token_count else 0
            }
            
            usage_data["total_tokens"] += usage_data["daily"][date]["tokens"]
        
        return usage_data

# Usage in FastAPI
@app.get("/api/ai/usage/{user_id}")
async def get_usage_stats(user_id: str):
    """Get usage statistics"""
    tracker = UsageTracker(redis_client)
    return await tracker.get_user_usage(user_id)
```

## Advanced Features

### 1. Agent Memory and Context Management
```python
from langchain.memory import ConversationSummaryBufferMemory
from langchain.schema import BaseMessage

class AdvancedMemoryManager:
    def __init__(self, llm, max_token_limit: int = 2000):
        self.llm = llm
        self.memories = {}
        self.max_token_limit = max_token_limit
    
    def get_memory(self, user_id: str, conversation_id: str = "default"):
        """Get or create memory for user conversation"""
        key = f"{user_id}:{conversation_id}"
        
        if key not in self.memories:
            self.memories[key] = ConversationSummaryBufferMemory(
                llm=self.llm,
                max_token_limit=self.max_token_limit,
                return_messages=True
            )
        
        return self.memories[key]
    
    def save_conversation(self, user_id: str, conversation_id: str, messages: List[BaseMessage]):
        """Save conversation to persistent storage"""
        memory = self.get_memory(user_id, conversation_id)
        
        for message in messages:
            if isinstance(message, HumanMessage):
                memory.chat_memory.add_user_message(message.content)
            elif isinstance(message, AIMessage):
                memory.chat_memory.add_ai_message(message.content)
    
    def clear_memory(self, user_id: str, conversation_id: str = "default"):
        """Clear conversation memory"""
        key = f"{user_id}:{conversation_id}"
        if key in self.memories:
            self.memories[key].clear()
```

### 2. Custom Tool Creation
```python
from langchain.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field

class DatabaseQueryInput(BaseModel):
    query: str = Field(description="SQL query to execute")
    database: str = Field(description="Database name")

class DatabaseQueryTool(BaseTool):
    name = "database_query"
    description = "Execute SQL queries on authorized databases"
    args_schema: Type[BaseModel] = DatabaseQueryInput
    
    def _run(self, query: str, database: str) -> str:
        """Execute database query safely"""
        try:
            # Validate query (whitelist SELECT statements only)
            if not query.strip().upper().startswith('SELECT'):
                return "Only SELECT queries are allowed"
            
            # Execute query with proper sanitization
            # (implement your database connection logic)
            results = execute_safe_query(database, query)
            
            return f"Query results:\n{results}"
        except Exception as e:
            return f"Database query failed: {str(e)}"
    
    async def _arun(self, query: str, database: str) -> str:
        """Async version of the tool"""
        return self._run(query, database)

# Integration with agent
def create_custom_agent_with_db_access(openrouter_client, allowed_databases: List[str]):
    """Create agent with database access"""
    tools = [
        DatabaseQueryTool(),
        # Add other tools...
    ]
    
    agent = AdvancedAIAgent(openrouter_client)
    agent.tools.extend(tools)
    
    return agent
```

This comprehensive guide provides production-ready patterns for integrating LangChain with OpenRouter, including error handling, usage tracking, memory management, and custom tool creation for building sophisticated AI-powered applications.