# Katalis Book-RAG System Makefile

.PHONY: help install test lint format ingest-book clean docker-build docker-run

# Default target
help:
	@echo "Katalis Book-RAG System"
	@echo "======================="
	@echo ""
	@echo "Available targets:"
	@echo "  install      - Install Python dependencies"
	@echo "  test         - Run all tests"
	@echo "  test-book    - Run book QA specific tests"
	@echo "  lint         - Run code linting"
	@echo "  format       - Format code with black"
	@echo "  ingest-book  - Ingest book chapters into vector store"
	@echo "  clean        - Clean up temporary files"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run with Docker Compose"
	@echo "  migrate      - Run database migrations"

# Install dependencies
install:
	pip install --upgrade pip
	pip install -r requirements.txt

# Run all tests
test:
	pytest tests/ -v --tb=short

# Run book QA specific tests
test-book:
	pytest tests/test_book_qa.py -v

# Run integration tests
test-integration:
	pytest tests/test_book_qa.py -m integration -v

# Linting
lint:
	flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

# Format code
format:
	black --line-length 100 .
	isort .

# Ingest book chapters
ingest-book:
	@echo "Ingesting book chapters..."
	@if [ -z "$(BOOK_PATH)" ]; then \
		echo "Error: BOOK_PATH environment variable not set"; \
		echo "Usage: make ingest-book BOOK_PATH=/path/to/chapters"; \
		exit 1; \
	fi
	python scripts/ingest_book.py --path "$(BOOK_PATH)"

# Dry run ingestion
ingest-book-dry:
	@echo "Dry run book ingestion..."
	@if [ -z "$(BOOK_PATH)" ]; then \
		echo "Error: BOOK_PATH environment variable not set"; \
		echo "Usage: make ingest-book-dry BOOK_PATH=/path/to/chapters"; \
		exit 1; \
	fi
	python scripts/ingest_book.py --path "$(BOOK_PATH)" --dry-run

# Database migrations
migrate:
	@echo "Running database migrations..."
	@if [ -z "$(SUPABASE_URL)" ] || [ -z "$(SUPABASE_SERVICE_KEY)" ]; then \
		echo "Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"; \
		exit 1; \
	fi
	psql "$(SUPABASE_URL)" -f sql/20240612_create_book_embeddings.sql

# Clean up
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name ".coverage" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +

# Docker operations
docker-build:
	docker build -t katalis-backend .

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down

docker-logs:
	docker-compose logs -f backend

# Development server
dev:
	uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production server
prod:
	uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Health check
health:
	@echo "Checking service health..."
	curl -f http://localhost:8000/health || echo "Service not healthy"

# Check book embeddings
check-embeddings:
	@echo "Checking book embeddings count..."
	@python -c "
import os
from supabase import create_client
client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))
result = client.table('finance_book_embeddings').select('id', count='exact').execute()
print(f'Total embeddings: {result.count}')
"

# Test book retrieval
test-retrieval:
	@echo "Testing book retrieval..."
	@python -c "
import asyncio
from app.core.vector_store import get_book_retriever
async def test():
    retriever = get_book_retriever(k=2)
    docs = retriever._get_relevant_documents('punto de equilibrio')
    print(f'Retrieved {len(docs)} documents')
    for doc in docs:
        print(f'- Chapter: {doc.metadata.get(\"chapter\", \"Unknown\")}')
        print(f'  Similarity: {doc.metadata.get(\"similarity\", 0):.3f}')
asyncio.run(test())
"

# CI/CD helpers
ci-install:
	pip install --upgrade pip
	pip install -r requirements.txt
	pip install pytest pytest-asyncio flake8 black isort

ci-test: lint test-book

ci-deploy:
	@echo "Deploying to production..."
	# Add deployment commands here

# Development setup
setup-dev: install
	@echo "Setting up development environment..."
	@echo "1. Copy .env.example to .env"
	@echo "2. Fill in your API keys and database URLs"
	@echo "3. Run 'make migrate' to set up the database"
	@echo "4. Run 'make ingest-book BOOK_PATH=/path/to/chapters'"
	@echo "5. Run 'make dev' to start the development server"

# Production setup
setup-prod: install migrate
	@echo "Production setup complete"
	@echo "Remember to:"
	@echo "1. Set all environment variables"
	@echo "2. Run book ingestion if needed"
	@echo "3. Start with 'make prod'"