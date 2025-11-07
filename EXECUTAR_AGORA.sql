-- ============================================
-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- ============================================

-- 1. Primeiro, descubra o ID do tenant existente
SELECT id, name, slug FROM tenants WHERE slug = 'minha-empresa';

-- 2. Depois, execute este bloco substituindo TENANT_ID pelo ID retornado acima
-- (Ou use o ID que você já tem: 481a70de-bcde-46bf-ac26-6a8080123a38)

-- Associar usuário (use ON CONFLICT para evitar erro se já existir)
INSERT INTO users (id, tenant_id, email, full_name)
VALUES (
  '730614a5-0063-4d24-8a5d-955d72c11354',
  '481a70de-bcde-46bf-ac26-6a8080123a38',  -- ID do tenant existente
  'victormatheuss669@gmail.com',
  'Victor Fernandes'
)
ON CONFLICT (id) DO UPDATE
SET 
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Criar role
INSERT INTO user_roles (tenant_id, user_id, role)
VALUES (
  '481a70de-bcde-46bf-ac26-6a8080123a38',
  '730614a5-0063-4d24-8a5d-955d72c11354',
  'admin'
)
ON CONFLICT (tenant_id, user_id) DO UPDATE
SET role = EXCLUDED.role;

-- Executar seed (pode dar erro se já foi executado, mas não tem problema)
SELECT seed_tenant_defaults('481a70de-bcde-46bf-ac26-6a8080123a38');

-- Verificar se funcionou
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.tenant_id,
  ur.role,
  t.name as tenant_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND u.tenant_id = ur.tenant_id
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.id = '730614a5-0063-4d24-8a5d-955d72c11354';

