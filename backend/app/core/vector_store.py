"""
Vector Store Helper for Book RAG System
Provides cached retriever for book embeddings with Redis caching
"""

import os
import logging
from typing import Optional, List, Dict, Any
from functools import lru_cache
import json
import hashlib

from langchain_core.retrievers import BaseRetriever
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase import create_client, Client
import redis
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class SupabaseBookRetriever(BaseRetriever):
    """Custom retriever for book embeddings from Supabase"""
    
    def __init__(
        self,
        supabase_client: Client,
        embeddings: OpenAIEmbeddings,
        table_name: str = "finance_book_embeddings",
        k: int = 4,
        similarity_threshold: float = 0.8
    ):
        self.supabase = supabase_client
        self.embeddings = embeddings
        self.table_name = table_name
        self.k = k
        self.similarity_threshold = similarity_threshold
    
    def _get_relevant_documents(self, query: str) -> List[Document]:
        """Retrieve relevant documents for a query"""
        try:
            # Generate query embedding
            query_embedding = self.embeddings.embed_query(query)
            
            # Call the Supabase similarity search function
            result = self.supabase.rpc(
                'search_book_embeddings',
                {
                    'query_embedding': query_embedding,
                    'match_threshold': self.similarity_threshold,
                    'match_count': self.k
                }
            ).execute()
            
            documents = []
            for row in result.data:
                doc = Document(
                    page_content=row['content'],
                    metadata={
                        'id': row['id'],
                        'file': row['file'],
                        'chapter': row['chapter'],
                        'chunk': row['chunk'],
                        'similarity': row['similarity'],
                        'source_location': f"supabase://finance_book_embeddings/{row['id']}",
                        **(row.get('metadata', {}))
                    }
                )
                documents.append(doc)
            
            logger.info(f"Retrieved {len(documents)} documents for query: {query[:50]}...")
            return documents
            
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            return []
    
    async def aget_relevant_documents(self, query: str) -> List[Document]:
        """Async version of get_relevant_documents"""
        return self._get_relevant_documents(query)

class CachedBookRetriever:
    """Wrapper for book retriever with Redis caching"""
    
    def __init__(self, redis_client: redis.Redis, cache_ttl: int = 900):
        self.redis = redis_client
        self.cache_ttl = cache_ttl
        self._retriever = None
    
    def _get_cache_key(self, query: str, user_id: str = "global") -> str:
        """Generate cache key for query"""
        query_hash = hashlib.sha256(query.encode()).hexdigest()[:16]
        return f"financial_data:{user_id}:book_retriever:{query_hash}"
    
    def _get_retriever(self) -> SupabaseBookRetriever:
        """Get or create retriever instance"""
        if self._retriever is None:
            supabase_client = self._init_supabase()
            embeddings = self._init_embeddings()
            
            self._retriever = SupabaseBookRetriever(
                supabase_client=supabase_client,
                embeddings=embeddings,
                k=int(os.getenv("RETRIEVER_K", "4")),
                similarity_threshold=float(os.getenv("SIMILARITY_THRESHOLD", "0.8"))
            )
        
        return self._retriever
    
    def _init_supabase(self) -> Client:
        """Initialize Supabase client"""
        url = os.getenv("SUPABASE_URL")
        service_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not url or not service_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        return create_client(url, service_key)
    
    def _init_embeddings(self) -> OpenAIEmbeddings:
        """Initialize embeddings"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY must be set")
        
        return OpenAIEmbeddings(
            openai_api_key=api_key,
            model=os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
        )
    
    def get_relevant_documents(self, query: str, user_id: str = "global") -> List[Document]:
        """Get relevant documents with caching"""
        cache_key = self._get_cache_key(query, user_id)
        
        try:
            # Try to get from cache
            cached_result = self.redis.get(cache_key)
            if cached_result:
                logger.info(f"Cache hit for query: {query[:50]}...")
                data = json.loads(cached_result)
                return [Document(**doc_data) for doc_data in data]
        
        except Exception as e:
            logger.warning(f"Cache read error: {e}")
        
        # Get from retriever
        retriever = self._get_retriever()
        documents = retriever._get_relevant_documents(query)
        
        # Cache the result
        try:
            cache_data = [
                {
                    "page_content": doc.page_content,
                    "metadata": doc.metadata
                }
                for doc in documents
            ]
            self.redis.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(cache_data, ensure_ascii=False)
            )
            logger.info(f"Cached {len(documents)} documents for query")
        
        except Exception as e:
            logger.warning(f"Cache write error: {e}")
        
        return documents

# Global cached retriever instance
_cached_retriever: Optional[CachedBookRetriever] = None

def get_book_retriever(k: int = 4) -> BaseRetriever:
    """
    Get cached book retriever instance
    
    Args:
        k: Number of documents to retrieve
    
    Returns:
        BaseRetriever: Cached retriever instance
    """
    global _cached_retriever
    
    try:
        # Initialize Redis client if not exists
        if _cached_retriever is None:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            redis_client = redis.from_url(redis_url)
            cache_ttl = int(os.getenv("RETRIEVER_CACHE_TTL", "900"))
            
            _cached_retriever = CachedBookRetriever(
                redis_client=redis_client,
                cache_ttl=cache_ttl
            )
            
            logger.info("Initialized cached book retriever")
        
        # Update k parameter
        retriever = _cached_retriever._get_retriever()
        retriever.k = k
        
        return retriever
    
    except Exception as e:
        logger.error(f"Error initializing book retriever: {e}")
        # Return a mock retriever that returns empty results
        return MockBookRetriever()

class MockBookRetriever(BaseRetriever):
    """Mock retriever for testing/fallback"""
    
    def _get_relevant_documents(self, query: str) -> List[Document]:
        logger.warning("Using mock book retriever - no real data available")
        return [
            Document(
                page_content=f"Mock content for query: {query}",
                metadata={
                    "source": "mock",
                    "chapter": "Mock Chapter",
                    "similarity": 0.5
                }
            )
        ]
    
    async def aget_relevant_documents(self, query: str) -> List[Document]:
        return self._get_relevant_documents(query)

@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Get cached Supabase client"""
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not service_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    
    return create_client(url, service_key)

def check_tokens(text: str, max_tokens: int = 3000) -> bool:
    """
    Check if text exceeds token limit
    
    Args:
        text: Text to check
        max_tokens: Maximum allowed tokens
    
    Returns:
        bool: True if within limit, False otherwise
    """
    try:
        import tiktoken
        tokenizer = tiktoken.get_encoding("cl100k_base")
        token_count = len(tokenizer.encode(text))
        
        if token_count > max_tokens:
            logger.warning(f"Text exceeds {max_tokens} tokens ({token_count})")
            return False
        
        return True
    
    except Exception as e:
        logger.error(f"Error checking tokens: {e}")
        return True  # Allow by default if check fails

def format_citations(documents: List[Document]) -> List[Dict[str, Any]]:
    """
    Format documents as citations for API responses
    
    Args:
        documents: Retrieved documents
    
    Returns:
        List of citation dictionaries
    """
    citations = []
    
    for doc in documents:
        citation = {
            "chapter": doc.metadata.get("chapter", "Unknown Chapter"),
            "excerpt": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
            "similarity": round(doc.metadata.get("similarity", 0.0), 3),
            "source_id": doc.metadata.get("id"),
            "source_location": doc.metadata.get("source_location", ""),
            "file": doc.metadata.get("file", ""),
            "chunk": doc.metadata.get("chunk", 0)
        }
        citations.append(citation)
    
    return citations