-- ============================================
-- VERIFICAR SE O USUÁRIO ESTÁ CORRETAMENTE CRIADO
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Verificar se o usuário existe no auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'victormatheuss669@gmail.com';

-- 2. Verificar se o usuário existe na tabela users
SELECT 
  id,
  email,
  full_name,
  tenant_id,
  is_active,
  created_at
FROM users 
WHERE id = '730614a5-0063-4d24-8a5d-955d72c11354';

-- 3. Verificar se o usuário tem role
SELECT 
  ur.id,
  ur.tenant_id,
  ur.user_id,
  ur.role,
  t.name as tenant_name
FROM user_roles ur
LEFT JOIN tenants t ON ur.tenant_id = t.id
WHERE ur.user_id = '730614a5-0063-4d24-8a5d-955d72c11354';

-- 4. Verificar tenant
SELECT id, name, slug, is_active 
FROM tenants 
WHERE id = '481a70de-bcde-46bf-ac26-6a8080123a38';

-- 5. Verificação completa (tudo junto)
SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  u.tenant_id,
  u.is_active as user_active,
  ur.role,
  t.id as tenant_id,
  t.name as tenant_name,
  t.slug as tenant_slug,
  t.is_active as tenant_active
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND u.tenant_id = ur.tenant_id
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.id = '730614a5-0063-4d24-8a5d-955d72c11354';

-- ============================================
-- SE O USUÁRIO NÃO EXISTIR, EXECUTE ISTO:
-- ============================================

-- Associar usuário ao tenant
INSERT INTO users (id, tenant_id, email, full_name, is_active)
VALUES (
  '730614a5-0063-4d24-8a5d-955d72c11354',
  '481a70de-bcde-46bf-ac26-6a8080123a38',
  'victormatheuss669@gmail.com',
  'Victor Fernandes',
  true
)
ON CONFLICT (id) DO UPDATE
SET 
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active;

-- Criar role
INSERT INTO user_roles (tenant_id, user_id, role)
VALUES (
  '481a70de-bcde-46bf-ac26-6a8080123a38',
  '730614a5-0063-4d24-8a5d-955d72c11354',
  'admin'
)
ON CONFLICT (tenant_id, user_id) DO UPDATE
SET role = EXCLUDED.role;

