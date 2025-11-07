-- ============================================
-- SCRIPT DE SETUP COMPLETO
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Executar a migração inicial (001_initial_schema.sql)
-- Copie e cole o conteúdo completo do arquivo supabase/migrations/001_initial_schema.sql aqui

-- PASSO 2: Executar as políticas RLS (002_rls_policies.sql)
-- Copie e cole o conteúdo completo do arquivo supabase/migrations/002_rls_policies.sql aqui

-- PASSO 3: Criar função de seed (003_seed_data.sql)
-- Copie e cole o conteúdo completo do arquivo supabase/migrations/003_seed_data.sql aqui

-- ============================================
-- PASSO 4: CRIAR PRIMEIRO TENANT
-- ============================================
-- Substitua 'Sua Empresa' pelo nome da sua empresa
-- Substitua 'sua-empresa' por um slug único (sem espaços, apenas letras, números e hífens)
INSERT INTO tenants (name, slug) 
VALUES ('Sua Empresa', 'sua-empresa')
RETURNING id, name, slug;

-- ANOTE O ID DO TENANT RETORNADO ACIMA (você precisará dele)

-- ============================================
-- PASSO 5: CRIAR USUÁRIO ADMIN
-- ============================================
-- IMPORTANTE: Primeiro você precisa criar o usuário no Supabase Auth
-- Vá em Authentication > Users > Add User
-- Crie um usuário com email e senha
-- ANOTE O ID DO USUÁRIO CRIADO

-- Depois, execute este SQL substituindo:
-- - 'USER_ID_AQUI' pelo ID do usuário criado no auth.users
-- - 'TENANT_ID_AQUI' pelo ID do tenant criado acima
-- - 'admin@example.com' pelo email do usuário
-- - 'Admin' pelo nome completo

INSERT INTO users (id, tenant_id, email, full_name)
VALUES (
  'USER_ID_AQUI',  -- ID do usuário do auth.users
  'TENANT_ID_AQUI',  -- ID do tenant criado acima
  'admin@example.com',
  'Admin'
);

-- Criar role de admin
INSERT INTO user_roles (tenant_id, user_id, role)
VALUES (
  'TENANT_ID_AQUI',  -- ID do tenant
  'USER_ID_AQUI',  -- ID do usuário
  'admin'
);

-- ============================================
-- PASSO 6: EXECUTAR SEED DE DADOS PADRÃO
-- ============================================
-- Substitua 'TENANT_ID_AQUI' pelo ID do tenant criado
SELECT seed_tenant_defaults('TENANT_ID_AQUI');

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se tudo foi criado corretamente:

-- Verificar tenant
SELECT * FROM tenants;

-- Verificar usuário
SELECT u.*, ur.role 
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND u.tenant_id = ur.tenant_id;

-- Verificar estágios criados
SELECT * FROM client_stages ORDER BY order_index;

-- Verificar motivos de perda criados
SELECT * FROM loss_reasons ORDER BY stage_type, order_index;

