#!/usr/bin/env python3
"""
Book Ingestion Script for Katalis Book-RAG System
Ingests "Finanzas para Emprendedores" book chapters into Supabase pgvector store.

Usage:
    python scripts/ingest_book.py --path "path/to/book/chapters" [--dry-run]
"""

import os
import sys
import argparse
import glob
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import re
import asyncio
import tiktoken
from dotenv import load_dotenv

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from supabase import create_client, Client
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document
import openai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class DeepSeekEmbeddings:
    """Fallback embeddings using DeepSeek API (OpenAI-compatible)"""
    
    def __init__(self, api_key: str, model: str = "text-embedding-ada-002"):
        self.client = openai.OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com/v1"
        )
        self.model = model
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents"""
        embeddings = []
        for text in texts:
            response = self.client.embeddings.create(
                input=text,
                model=self.model
            )
            embeddings.append(response.data[0].embedding)
        return embeddings
    
    def embed_query(self, text: str) -> List[float]:
        """Embed a single query"""
        response = self.client.embeddings.create(
            input=text,
            model=self.model
        )
        return response.data[0].embedding

class BookIngestor:
    """Main class for ingesting book chapters into vector store"""
    
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        
        # Configuration from environment
        self.table_name = os.getenv("BOOK_EMBEDDINGS_TABLE", "finance_book_embeddings")
        self.chunk_size = int(os.getenv("CHUNK_SIZE", "500"))
        self.chunk_overlap = int(os.getenv("CHUNK_OVERLAP", "50"))
        
        self.supabase: Client = self._init_supabase()
        self.embeddings = self._init_embeddings()
        self.text_splitter = self._init_text_splitter()
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        
        logger.info(f"Initialized BookIngestor (dry_run={dry_run})")
        logger.info(f"Table: {self.table_name}, Chunk size: {self.chunk_size}, Overlap: {self.chunk_overlap}")
    
    def _init_supabase(self) -> Client:
        """Initialize Supabase client"""
        url = os.getenv("SUPABASE_URL")
        service_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not url or not service_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        return create_client(url, service_key)
    
    def _init_embeddings(self):
        """Initialize embedding model with fallback"""
        openai_key = os.getenv("OPENAI_API_KEY")
        deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        
        if openai_key and not openai_key.startswith("sk-test-placeholder"):
            logger.info("Using OpenAI embeddings")
            return OpenAIEmbeddings(
                openai_api_key=openai_key,
                model=os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
            )
        elif deepseek_key:
            logger.info("Using DeepSeek embeddings as fallback")
            return DeepSeekEmbeddings(deepseek_key)
        else:
            raise ValueError("Either OPENAI_API_KEY or DEEPSEEK_API_KEY must be provided")
    
    def _init_text_splitter(self) -> RecursiveCharacterTextSplitter:
        """Initialize text splitter for chunking"""
        return RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""]
        )
    
    def _extract_chapter_from_filename(self, filepath: str) -> str:
        """Extract chapter name from filename"""
        filename = Path(filepath).stem
        # Remove numbers and clean up
        chapter = re.sub(r'^\d+[-_\s]*', '', filename)
        chapter = chapter.replace('_', ' ').replace('-', ' ')
        return chapter.title()
    
    def _extract_chapter_from_content(self, content: str) -> Optional[str]:
        """Extract chapter title from content"""
        lines = content.split('\n')
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if line.startswith('#') and len(line) > 2:
                return line.lstrip('#').strip()
        return None
    
    def _count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        return len(self.tokenizer.encode(text))
    
    def _check_tokens(self, text: str, max_tokens: int = 8000) -> bool:
        """Check if text exceeds token limit"""
        token_count = self._count_tokens(text)
        if token_count > max_tokens:
            logger.warning(f"Text exceeds {max_tokens} tokens ({token_count}), skipping")
            return False
        return True
    
    def load_markdown_files(self, path: str) -> List[Document]:
        """Load and process markdown files from the given path"""
        pattern = os.path.join(path, "*.md")
        files = glob.glob(pattern)
        
        if not files:
            logger.warning(f"No .md files found in {path}")
            return []
        
        logger.info(f"Found {len(files)} markdown files")
        documents = []
        
        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if not content.strip():
                    logger.warning(f"Empty file: {file_path}")
                    continue
                
                # Extract chapter information
                chapter_from_filename = self._extract_chapter_from_filename(file_path)
                chapter_from_content = self._extract_chapter_from_content(content)
                chapter = chapter_from_content or chapter_from_filename
                
                # Create document with metadata
                doc = Document(
                    page_content=content,
                    metadata={
                        "source": file_path,
                        "filename": Path(file_path).name,
                        "chapter": chapter,
                        "file_size": len(content),
                        "token_count": self._count_tokens(content)
                    }
                )
                
                documents.append(doc)
                logger.info(f"Loaded: {Path(file_path).name} -> Chapter: '{chapter}' ({doc.metadata['token_count']} tokens)")
                
            except Exception as e:
                logger.error(f"Error loading {file_path}: {e}")
        
        return documents
    
    def chunk_documents(self, documents: List[Document]) -> List[Document]:
        """Split documents into chunks"""
        logger.info("Chunking documents...")
        chunks = []
        
        for doc in documents:
            if not self._check_tokens(doc.page_content):
                continue
            
            doc_chunks = self.text_splitter.split_documents([doc])
            
            # Add chunk metadata
            for i, chunk in enumerate(doc_chunks):
                chunk.metadata.update({
                    "chunk": i,
                    "total_chunks": len(doc_chunks),
                    "chunk_size": len(chunk.page_content),
                    "chunk_tokens": self._count_tokens(chunk.page_content)
                })
                chunks.append(chunk)
        
        logger.info(f"Created {len(chunks)} chunks from {len(documents)} documents")
        return chunks
    
    async def embed_chunks(self, chunks: List[Document]) -> List[Dict[str, Any]]:
        """Generate embeddings for chunks"""
        logger.info("Generating embeddings...")
        
        if self.dry_run:
            logger.info("DRY RUN: Skipping embedding generation")
            return []
        
        # Extract texts for embedding
        texts = [chunk.page_content for chunk in chunks]
        
        try:
            # Generate embeddings in batches
            batch_size = 100
            all_embeddings = []
            
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                batch_embeddings = self.embeddings.embed_documents(batch_texts)
                all_embeddings.extend(batch_embeddings)
                logger.info(f"Generated embeddings for batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")
        
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
        
        # Prepare data for insertion
        import json
        data_for_insert = []
        for chunk, embedding in zip(chunks, all_embeddings):
            record = {
                "file": chunk.metadata["filename"],
                "chunk": chunk.metadata["chunk"],
                "content": chunk.page_content,
                "embedding": json.dumps(embedding),  # Store as JSON string temporarily
                "chapter": chunk.metadata["chapter"],
                "metadata": {
                    "source": chunk.metadata["source"],
                    "total_chunks": chunk.metadata["total_chunks"],
                    "chunk_size": chunk.metadata["chunk_size"],
                    "chunk_tokens": chunk.metadata["chunk_tokens"],
                    "file_size": chunk.metadata["file_size"],
                    "token_count": chunk.metadata["token_count"]
                }
            }
            data_for_insert.append(record)
        
        logger.info(f"Prepared {len(data_for_insert)} records for insertion")
        return data_for_insert
    
    async def upsert_to_supabase(self, data: List[Dict[str, Any]]) -> None:
        """Insert data into Supabase"""
        if self.dry_run:
            logger.info("DRY RUN: Would insert {} records into {}".format(len(data), self.table_name))
            return
        
        logger.info(f"Inserting {len(data)} records into {self.table_name}...")
        
        try:
            # Clear existing data first
            delete_result = self.supabase.table(self.table_name).delete().neq('id', 0).execute()
            logger.info(f"Cleared existing records: {len(delete_result.data) if delete_result.data else 0}")
            
            # Insert new data in batches
            batch_size = 50
            inserted_count = 0
            
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                result = self.supabase.table(self.table_name).insert(batch).execute()
                
                if result.data:
                    inserted_count += len(result.data)
                    logger.info(f"Inserted batch {i//batch_size + 1}/{(len(data)-1)//batch_size + 1}: {len(result.data)} records")
                else:
                    logger.error(f"Failed to insert batch {i//batch_size + 1}")
            
            logger.info(f"Successfully inserted {inserted_count} records")
            
        except Exception as e:
            logger.error(f"Error inserting into Supabase: {e}")
            raise
    
    async def ingest(self, book_path: str) -> None:
        """Main ingestion pipeline"""
        logger.info(f"Starting book ingestion from: {book_path}")
        
        if not os.path.exists(book_path):
            raise FileNotFoundError(f"Path does not exist: {book_path}")
        
        # Load documents
        documents = self.load_markdown_files(book_path)
        if not documents:
            logger.warning("No documents to process")
            return
        
        # Chunk documents
        chunks = self.chunk_documents(documents)
        if not chunks:
            logger.warning("No chunks created")
            return
        
        # Generate embeddings and prepare data
        data = await self.embed_chunks(chunks)
        
        # Insert into database
        if data:
            await self.upsert_to_supabase(data)
        
        logger.info("Ingestion completed successfully!")

async def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Ingest book chapters into vector store")
    parser.add_argument("--path", required=True, help="Path to directory containing .md files")
    parser.add_argument("--dry-run", action="store_true", help="Run without actually inserting data")
    
    args = parser.parse_args()
    
    ingestor = BookIngestor(dry_run=args.dry_run)
    await ingestor.ingest(args.path)

if __name__ == "__main__":
    asyncio.run(main())