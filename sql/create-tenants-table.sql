-- Tabela para gerenciar tenants no schema público
-- Execute este script para criar a estrutura necessária

CREATE TABLE IF NOT EXISTS public.tenants (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) UNIQUE NOT NULL,
    schema_name VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tenants_client_id ON public.tenants(client_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON public.tenants(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON public.tenants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.tenants IS 'Tabela central para gerenciar tenants multi-schema';
COMMENT ON COLUMN public.tenants.client_id IS 'ID único do cliente (usado para criar schema)';
COMMENT ON COLUMN public.tenants.schema_name IS 'Nome do schema no PostgreSQL';
COMMENT ON COLUMN public.tenants.status IS 'Status do tenant: pending, active, suspended, deleted';