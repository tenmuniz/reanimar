-- Configuração das tabelas para o sistema de escalas do 20ª CIPM
-- Este script deve ser executado no Editor SQL do Supabase

-- Criação da tabela de militares
CREATE TABLE militares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  patente TEXT,
  guarnicao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação da tabela de escalas
CREATE TABLE escalas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('pmf', 'escolaSegura')),
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 0 AND mes <= 11),
  dia INTEGER NOT NULL CHECK (dia >= 1 AND dia <= 31),
  posicao INTEGER NOT NULL,
  militar_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance das consultas
CREATE INDEX idx_militares_ativo ON militares(ativo);
CREATE INDEX idx_escalas_tipo_ano_mes ON escalas(tipo, ano, mes);
CREATE INDEX idx_escalas_militar_id ON escalas(militar_id);

-- Criação de uma trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_militares_updated_at
BEFORE UPDATE ON militares
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escalas_updated_at
BEFORE UPDATE ON escalas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (Row Level Security)
-- Habilitar RLS nas tabelas
ALTER TABLE militares ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalas ENABLE ROW LEVEL SECURITY;

-- Criar políticas que permitem acesso público (para simplificar a implementação inicial)
-- Estas políticas podem ser ajustadas posteriormente para limitar o acesso
CREATE POLICY "Allow public access to militares" ON militares
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Allow public access to escalas" ON escalas
  FOR ALL
  TO public
  USING (true);

-- Comentário para o administrador do sistema
COMMENT ON TABLE militares IS 'Tabela de militares da 20ª CIPM';
COMMENT ON TABLE escalas IS 'Tabela de escalas da 20ª CIPM'; 