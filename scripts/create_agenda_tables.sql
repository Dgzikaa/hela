-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/mqovddsgksbyuptnketl/sql

-- Tabela de agenda por dia/usuário
CREATE TABLE IF NOT EXISTS agenda_farm (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'guest',
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, data)
);

-- Tabela de registros de farm
CREATE TABLE IF NOT EXISTS registros_farm (
  id SERIAL PRIMARY KEY,
  agenda_id INTEGER NOT NULL REFERENCES agenda_farm(id) ON DELETE CASCADE,
  conteudo VARCHAR(100) NOT NULL,
  nome_conteudo VARCHAR(255) NOT NULL,
  porcentagem_drop INTEGER DEFAULT 100,
  tempo_minutos INTEGER DEFAULT 60,
  custo_entrada INTEGER DEFAULT 0,
  custo_consumiveis INTEGER DEFAULT 0,
  custo_total INTEGER DEFAULT 0,
  profit_estimado INTEGER DEFAULT 0,
  profit_real INTEGER,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_agenda_farm_user_data ON agenda_farm(user_id, data);
CREATE INDEX IF NOT EXISTS idx_registros_farm_agenda ON registros_farm(agenda_id);

-- Habilitar RLS
ALTER TABLE agenda_farm ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_farm ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público (simplificado)
DROP POLICY IF EXISTS "Allow all access to agenda_farm" ON agenda_farm;
CREATE POLICY "Allow all access to agenda_farm" ON agenda_farm FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to registros_farm" ON registros_farm;
CREATE POLICY "Allow all access to registros_farm" ON registros_farm FOR ALL USING (true);

