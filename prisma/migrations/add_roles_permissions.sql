-- Criação de tabelas para sistema RBAC

-- Tabela de Roles (Funções)
CREATE TABLE IF NOT EXISTS "roles" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) UNIQUE NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Tabela de Permissões
CREATE TABLE IF NOT EXISTS "permissions" (
  "id" SERIAL PRIMARY KEY,
  "resource" VARCHAR(50) NOT NULL, -- ex: pedidos, jogadores, clientes
  "action" VARCHAR(20) NOT NULL, -- ex: read, write, delete, manage
  "description" TEXT,
  UNIQUE("resource", "action")
);

-- Tabela de relacionamento Role-Permission (many-to-many)
CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id" INTEGER NOT NULL,
  "permission_id" INTEGER NOT NULL,
  PRIMARY KEY ("role_id", "permission_id"),
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
  FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
);

-- Adicionar coluna role_id em users/jogadores (assumindo tabela jogadores como users)
ALTER TABLE "jogadores" ADD COLUMN IF NOT EXISTS "role_id" INTEGER DEFAULT 1;
ALTER TABLE "jogadores" ADD CONSTRAINT "fk_jogador_role" 
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL;

-- Inserir roles padrão
INSERT INTO "roles" ("name", "description") VALUES
  ('admin', 'Administrador com acesso total'),
  ('moderador', 'Pode gerenciar pedidos e jogadores'),
  ('jogador', 'Jogador regular com acesso limitado'),
  ('visualizador', 'Apenas visualização de dados')
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões padrão
INSERT INTO "permissions" ("resource", "action", "description") VALUES
  ('pedidos', 'read', 'Visualizar pedidos'),
  ('pedidos', 'write', 'Criar e editar pedidos'),
  ('pedidos', 'delete', 'Deletar pedidos'),
  ('pedidos', 'manage', 'Gerenciar todos os pedidos'),
  ('jogadores', 'read', 'Visualizar jogadores'),
  ('jogadores', 'write', 'Criar e editar jogadores'),
  ('jogadores', 'delete', 'Deletar jogadores'),
  ('jogadores', 'manage', 'Gerenciar todos os jogadores'),
  ('clientes', 'read', 'Visualizar clientes'),
  ('clientes', 'write', 'Criar e editar clientes'),
  ('clientes', 'delete', 'Deletar clientes'),
  ('precos', 'read', 'Visualizar preços'),
  ('precos', 'write', 'Atualizar preços'),
  ('backup', 'manage', 'Gerenciar backups'),
  ('auditoria', 'read', 'Visualizar logs de auditoria'),
  ('configuracoes', 'manage', 'Gerenciar configurações do sistema')
ON CONFLICT (resource, action) DO NOTHING;

-- Atribuir permissões aos roles
-- Admin: todas as permissões
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT 1, id FROM "permissions"
ON CONFLICT DO NOTHING;

-- Moderador: pode gerenciar pedidos e jogadores, mas não deletar ou fazer backup
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT 2, id FROM "permissions" 
WHERE action IN ('read', 'write', 'manage') 
  AND resource NOT IN ('backup', 'auditoria', 'configuracoes')
ON CONFLICT DO NOTHING;

-- Jogador: pode ver pedidos, jogadores e seus próprios dados
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT 3, id FROM "permissions" WHERE action = 'read'
ON CONFLICT DO NOTHING;

-- Visualizador: apenas leitura
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT 4, id FROM "permissions" WHERE action = 'read' AND resource IN ('pedidos', 'clientes')
ON CONFLICT DO NOTHING;

