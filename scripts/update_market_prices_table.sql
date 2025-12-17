-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/mqovddsgksbyuptnketl/sql

-- Adiciona colunas para preço manual e categoria na tabela market_prices
ALTER TABLE market_prices 
ADD COLUMN IF NOT EXISTS preco_manual INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS avg_price INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT 'outros';

-- Atualiza a constraint de upsert para incluir item_key
-- (já deve existir, mas para garantir)

-- Cria índice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_market_prices_categoria ON market_prices(categoria);

-- Cria índice para busca por item_key
CREATE INDEX IF NOT EXISTS idx_market_prices_item_key ON market_prices(item_key);

