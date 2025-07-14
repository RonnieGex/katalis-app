-- Book Embeddings Table for RAG System
-- Migration: 20240612_create_book_embeddings.sql

-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Create the finance_book_embeddings table
CREATE TABLE IF NOT EXISTS finance_book_embeddings (
    id BIGSERIAL PRIMARY KEY,
    file TEXT NOT NULL,
    chunk INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    chapter TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_finance_book_embeddings_file ON finance_book_embeddings(file);
CREATE INDEX IF NOT EXISTS idx_finance_book_embeddings_chunk ON finance_book_embeddings(chunk);
CREATE INDEX IF NOT EXISTS idx_finance_book_embeddings_chapter ON finance_book_embeddings(chapter);

-- Create vector similarity search index using HNSW
CREATE INDEX IF NOT EXISTS idx_finance_book_embeddings_embedding 
ON finance_book_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Enable Row Level Security (RLS)
ALTER TABLE finance_book_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service_role full access
CREATE POLICY "Enable all access for service_role" ON finance_book_embeddings
FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow authenticated users to read
CREATE POLICY "Enable read access for authenticated users" ON finance_book_embeddings
FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_finance_book_embeddings_updated_at
    BEFORE UPDATE ON finance_book_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for similarity search
CREATE OR REPLACE FUNCTION search_book_embeddings(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.8,
    match_count INT DEFAULT 4
)
RETURNS TABLE (
    id BIGINT,
    file TEXT,
    chapter TEXT,
    content TEXT,
    chunk INTEGER,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        finance_book_embeddings.id,
        finance_book_embeddings.file,
        finance_book_embeddings.chapter,
        finance_book_embeddings.content,
        finance_book_embeddings.chunk,
        finance_book_embeddings.metadata,
        1 - (finance_book_embeddings.embedding <=> query_embedding) AS similarity
    FROM finance_book_embeddings
    WHERE 1 - (finance_book_embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY finance_book_embeddings.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Grant necessary permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON finance_book_embeddings TO authenticated;
GRANT EXECUTE ON FUNCTION search_book_embeddings TO authenticated;

-- Grant full permissions to service_role
GRANT ALL ON finance_book_embeddings TO service_role;
GRANT USAGE, SELECT ON SEQUENCE finance_book_embeddings_id_seq TO service_role;