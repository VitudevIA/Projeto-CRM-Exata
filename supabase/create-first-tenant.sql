-- ============================================
-- SCRIPT PARA CRIAR PRIMEIRO TENANT E USUÁRIO
-- Execute este script APÓS executar as 3 migrações
-- ============================================

-- PASSO 1: Criar Tenant
-- Substitua 'Sua Empresa' e 'sua-empresa' pelos valores desejados
INSERT INTO tenants (name, slug) 
VALUES ('Sua Empresa', 'sua-empresa')
RETURNING id, name, slug;

-- ANOTE O ID DO TENANT retornado acima (você precisará dele)

-- ============================================
-- PASSO 2: Criar Usuário no Supabase Auth
-- ============================================
-- IMPORTANTE: Antes de executar o próximo passo, você PRECISA:
-- 1. Ir em Authentication > Users > Add User
-- 2. Criar um usuário com email e senha
-- 3. ANOTAR O ID DO USUÁRIO criado

-- ============================================
-- PASSO 3: Associar Usuário ao Tenant
-- ============================================
-- Substitua os valores abaixo:
-- - 'USER_ID_AQUI' pelo ID do usuário criado no auth.users
-- - 'TENANT_ID_AQUI' pelo ID do tenant criado no PASSO 1
-- - 'admin@example.com' pelo email do usuário
-- - 'Admin' pelo nome completo

INSERT INTO users (id, tenant_id, email, full_name)
VALUES (
  'USER_ID_AQUI',  -- ID do usuário do auth.users (UUID)
  'TENANT_ID_AQUI',  -- ID do tenant criado acima (UUID)
  'admin@example.com',  -- Email do usuário
  'Admin'  -- Nome completo
);

-- Criar role de admin
INSERT INTO user_roles (tenant_id, user_id, role)
VALUES (
  'TENANT_ID_AQUI',  -- ID do tenant
  'USER_ID_AQUI',  -- ID do usuário
  'admin'
);

-- ============================================
-- PASSO 4: Executar Seed de Dados Padrão
-- ============================================
-- Substitua 'TENANT_ID_AQUI' pelo ID do tenant
SELECT seed_tenant_defaults('TENANT_ID_AQUI');

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se tudo foi criado:

-- Verificar tenant
SELECT * FROM tenants;

-- Verificar usuário e role
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.tenant_id,
  ur.role,
  t.name as tenant_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND u.tenant_id = ur.tenant_id
LEFT JOIN tenants t ON u.tenant_id = t.id;

-- Verificar estágios criados
SELECT * FROM client_stages ORDER BY order_index;

-- Verificar motivos de perda criados
SELECT 
  stage_type,
  COUNT(*) as total_motivos
FROM loss_reasons 
GROUP BY stage_type
ORDER BY stage_type;

