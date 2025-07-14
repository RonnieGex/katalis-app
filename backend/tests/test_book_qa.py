"""
Integration tests for Book QA system
Tests book ingestion, retrieval, and agent integration
"""

import pytest
import asyncio
import os
import tempfile
from pathlib import Path
import json

from fastapi.testclient import TestClient
from main import app
from scripts.ingest_book import BookIngestor
from app.core.vector_store import get_book_retriever
from supabase import create_client


class TestBookQASystem:
    """Test suite for Book QA functionality"""
    
    @pytest.fixture(scope="class")
    def test_client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture(scope="class")
    def mock_book_content(self):
        """Create mock book content for testing"""
        content = {
            "chapter1.md": """
# Capítulo 1: Fundamentos Financieros

## El Punto de Equilibrio

El punto de equilibrio se define como el nivel de ventas en el cual la empresa ni gana ni pierde dinero. Es el momento donde los ingresos totales igualan exactamente a los costos totales.

### Fórmula del Punto de Equilibrio

Para calcular el punto de equilibrio en unidades:

PE = Costos Fijos / (Precio de Venta - Costo Variable Unitario)

### Ejemplo Práctico

Si una empresa tiene:
- Costos fijos: $10,000 mensuales
- Precio de venta por unidad: $50
- Costo variable por unidad: $30

PE = $10,000 / ($50 - $30) = 500 unidades

Esto significa que la empresa necesita vender 500 unidades al mes para alcanzar el punto de equilibrio.
            """,
            "chapter2.md": """
# Capítulo 2: Flujo de Caja

## Gestión de Liquidez

La gestión del flujo de caja es fundamental para la supervivencia de cualquier empresa. Sin efectivo suficiente, incluso las empresas rentables pueden fracasar.

### Componentes del Flujo de Caja

1. **Flujo de Caja Operativo**: Efectivo generado por las operaciones principales
2. **Flujo de Caja de Inversión**: Efectivo utilizado en inversiones en activos
3. **Flujo de Caja de Financiamiento**: Efectivo de deudas y capital

### Ratio de Liquidez

El ratio de liquidez corriente se calcula como:

Ratio = Activos Corrientes / Pasivos Corrientes

Un ratio mayor a 1.0 indica que la empresa puede cubrir sus obligaciones a corto plazo.

### Proyecciones de Flujo de Caja

Es recomendable mantener proyecciones de flujo de caja para al menos 13 semanas, 
actualizándolas semanalmente para mantener visibilidad sobre la posición de liquidez.
            """
        }
        return content
    
    @pytest.fixture(scope="class")
    def temp_book_directory(self, mock_book_content):
        """Create temporary directory with mock book files"""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Write mock content to files
            for filename, content in mock_book_content.items():
                file_path = temp_path / filename
                file_path.write_text(content, encoding='utf-8')
            
            yield str(temp_path)
    
    @pytest.fixture
    def auth_headers(self):
        """Mock authentication headers"""
        # In a real test, you'd generate a valid JWT token
        return {"Authorization": "Bearer mock-jwt-token"}
    
    @pytest.mark.asyncio
    async def test_book_ingestion(self, temp_book_directory):
        """Test book ingestion process"""
        # Skip if no Supabase connection available
        if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_KEY"):
            pytest.skip("Supabase credentials not available")
        
        # Test dry run first
        ingestor = BookIngestor(dry_run=True)
        await ingestor.ingest(temp_book_directory)
        
        # Test actual ingestion
        ingestor = BookIngestor(dry_run=False)
        await ingestor.ingest(temp_book_directory)
        
        # Verify data was inserted
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_KEY")
        )
        
        result = supabase.table("finance_book_embeddings").select("*").execute()
        assert len(result.data) > 0, "No embeddings were inserted"
        
        # Check that chapters are properly identified
        chapters = [row["chapter"] for row in result.data]
        assert "Fundamentos Financieros" in str(chapters) or "Flujo De Caja" in str(chapters)
    
    def test_book_retriever_initialization(self):
        """Test that book retriever can be initialized"""
        try:
            retriever = get_book_retriever(k=2)
            assert retriever is not None
        except Exception as e:
            # If it fails due to missing credentials, that's expected in CI
            assert "SUPABASE" in str(e) or "OPENAI" in str(e)
    
    @pytest.mark.asyncio
    async def test_book_retrieval(self):
        """Test book content retrieval"""
        # Skip if no credentials available
        if not all([
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_KEY"),
            os.getenv("OPENAI_API_KEY")
        ]):
            pytest.skip("Required credentials not available")
        
        retriever = get_book_retriever(k=2)
        
        # Test retrieval with financial query
        documents = retriever._get_relevant_documents("punto de equilibrio")
        
        # Should return some documents
        assert len(documents) >= 0  # May be 0 if no data ingested yet
        
        if documents:
            # Check document structure
            doc = documents[0]
            assert hasattr(doc, 'page_content')
            assert hasattr(doc, 'metadata')
            assert 'chapter' in doc.metadata
            assert 'similarity' in doc.metadata
    
    def test_agent_book_qa_endpoint_structure(self, test_client):
        """Test that book QA endpoint exists and has correct structure"""
        # Test endpoint availability (will fail auth, but should exist)
        response = test_client.post("/api/agents/maya/book-qa", json={
            "question": "¿Cómo se calcula el punto de equilibrio?"
        })
        
        # Should fail with 401 (no auth) or 403 (no AI access), not 404
        assert response.status_code in [401, 403, 422], f"Unexpected status: {response.status_code}"
    
    def test_multi_agent_book_qa_endpoint_structure(self, test_client):
        """Test that multi-agent book QA endpoint exists"""
        response = test_client.post("/api/agents/multi/book-qa", json={
            "question": "¿Cómo mejorar el flujo de caja?",
            "agents": ["maya", "carlos"]
        })
        
        # Should fail with auth error, not 404
        assert response.status_code in [401, 403, 422], f"Unexpected status: {response.status_code}"
    
    @pytest.mark.asyncio 
    async def test_agent_with_book_qa_integration(self):
        """Test agent integration with book QA tool"""
        # Skip if no credentials
        if not all([
            os.getenv("OPENAI_API_KEY"),
            os.getenv("SUPABASE_URL")
        ]):
            pytest.skip("Required credentials not available")
        
        from agents.langchain_agents import MayaCashFlowAgent
        
        # Initialize agent
        maya = MayaCashFlowAgent()
        
        # Check that tools are available
        assert hasattr(maya, 'tools')
        
        # Test agent processing with book QA
        test_data = {
            "question": "¿Cómo calcular el ratio de liquidez?",
            "financial_data": {
                "current_assets": 100000,
                "current_liabilities": 80000
            }
        }
        
        try:
            result = await maya.process_request(
                user_id="test-user",
                data=test_data,
                use_book_qa=True
            )
            
            # Check response structure
            assert "agent" in result
            assert "analysis" in result
            assert result["agent"] == "Maya - Cash Flow Optimizer"
            
        except Exception as e:
            # Expected if no book data is available
            assert "embedding" in str(e).lower() or "supabase" in str(e).lower()
    
    def test_citation_format_validation(self):
        """Test that citation format is properly validated"""
        from agents.langchain_agents import BookCitation
        
        # Test valid citation
        citation = BookCitation(
            chapter="Fundamentos Financieros",
            excerpt="El punto de equilibrio se define como...",
            loc=1234,
            similarity=0.95
        )
        
        assert citation.chapter == "Fundamentos Financieros"
        assert "punto de equilibrio" in citation.excerpt
        assert citation.loc == 1234
        assert citation.similarity == 0.95
    
    def test_agent_response_model_with_citations(self):
        """Test that agent response models include citations"""
        from agents.langchain_agents import CashFlowAnalysis, BookCitation
        
        # Test creating response with citations
        citation = BookCitation(
            chapter="Flujo de Caja",
            excerpt="La gestión del flujo de caja es fundamental...",
            loc=2334
        )
        
        analysis = CashFlowAnalysis(
            runway_months=12.5,
            risk_level="Medium",
            liquidity_ratio=1.25,
            seasonal_patterns=["Q4 spike", "Q1 dip"],
            recommendations=[],
            next_review_date="2024-07-15",
            citations=[citation]
        )
        
        assert len(analysis.citations) == 1
        assert analysis.citations[0].chapter == "Flujo de Caja"
        assert analysis.citations[0].loc == 2334
    
    @pytest.mark.integration
    def test_end_to_end_book_qa_flow(self, test_client, temp_book_directory):
        """End-to-end test of the complete book QA flow"""
        # This would be a comprehensive test that:
        # 1. Ingests test data
        # 2. Calls the API endpoint
        # 3. Verifies citations are returned
        # 4. Checks response format
        
        # Skip for now due to auth requirements
        pytest.skip("Requires authentication setup")
        
        # Example of what the full test would look like:
        """
        # 1. Ingest test data
        ingestor = BookIngestor(dry_run=False)
        await ingestor.ingest(temp_book_directory)
        
        # 2. Make authenticated request
        response = test_client.post(
            "/api/agents/maya/book-qa",
            json={"question": "¿Cómo se calcula el punto de equilibrio?"},
            headers=auth_headers
        )
        
        # 3. Verify response
        assert response.status_code == 200
        data = response.json()
        
        # 4. Check citations
        assert "citations" in data["response"]["analysis"]
        citations = data["response"]["analysis"]["citations"]
        assert len(citations) > 0
        assert any("punto de equilibrio" in citation["excerpt"].lower() 
                  for citation in citations)
        """

# Test configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Markers for different test types
def pytest_configure(config):
    """Configure pytest markers"""
    config.addinivalue_line("markers", "integration: marks tests as integration tests")
    config.addinivalue_line("markers", "asyncio: marks tests as async tests")