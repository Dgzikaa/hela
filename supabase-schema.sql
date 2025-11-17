-- ============================================
-- Schema SQL para Supabase
-- Copie e cole este arquivo inteiro no SQL Editor do Supabase
-- ============================================

-- Jogadores principais (time fixo)
CREATE TABLE IF NOT EXISTS jogadores (
  id SERIAL PRIMARY KEY,
  nick VARCHAR(255) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Suplentes
CREATE TABLE IF NOT EXISTS suplentes (
  id SERIAL PRIMARY KEY,
  nick VARCHAR(255) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Missões/Rodízio
CREATE TABLE IF NOT EXISTS missoes (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  "jogadorForaId" INTEGER NOT NULL REFERENCES jogadores(id) ON DELETE CASCADE,
  "suplenteId" INTEGER REFERENCES suplentes(id) ON DELETE SET NULL,
  "carryNome" VARCHAR(255),
  "carryValor" DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) NOT NULL,
  observacoes TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_missoes_jogador ON missoes("jogadorForaId");
CREATE INDEX IF NOT EXISTS idx_missoes_suplente ON missoes("suplenteId");
CREATE INDEX IF NOT EXISTS idx_missoes_status ON missoes(status);
CREATE INDEX IF NOT EXISTS idx_missoes_data ON missoes(data DESC);
CREATE INDEX IF NOT EXISTS idx_jogadores_nick ON jogadores(nick);
CREATE INDEX IF NOT EXISTS idx_suplentes_nick ON suplentes(nick);

-- Comentários nas tabelas
COMMENT ON TABLE jogadores IS 'Jogadores principais do time fixo';
COMMENT ON TABLE suplentes IS 'Suplentes disponíveis para substituição';
COMMENT ON TABLE missoes IS 'Histórico de missões e rodízio';

-- Comentários nas colunas
COMMENT ON COLUMN missoes.tipo IS 'Tipos: Normal, Suplente, Carry';
COMMENT ON COLUMN missoes.status IS 'Status: Agendado, Concluído, Cancelado';
COMMENT ON COLUMN missoes."carryValor" IS 'Valor em reais caso seja missão tipo Carry';

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jogadores_updated_at BEFORE UPDATE ON jogadores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suplentes_updated_at BEFORE UPDATE ON suplentes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missoes_updated_at BEFORE UPDATE ON missoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- (Opcional) Dados de exemplo para teste
-- Descomente as linhas abaixo se quiser dados de teste

/*
INSERT INTO jogadores (nick) VALUES 
  ('Jogador1'),
  ('Jogador2'),
  ('Jogador3'),
  ('Jogador4'),
  ('Jogador5');

INSERT INTO suplentes (nick) VALUES 
  ('Suplente1'),
  ('Suplente2');

INSERT INTO missoes (data, tipo, "jogadorForaId", status) VALUES 
  ('2024-01-15 20:00:00', 'Normal', 1, 'Concluído'),
  ('2024-01-22 20:00:00', 'Normal', 2, 'Concluído'),
  ('2024-01-29 20:00:00', 'Suplente', 3, 'Agendado');
*/

-- Verificar se tudo foi criado corretamente
SELECT 
  'Tabelas criadas com sucesso!' as mensagem,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'jogadores') as jogadores_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'suplentes') as suplentes_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'missoes') as missoes_table;

