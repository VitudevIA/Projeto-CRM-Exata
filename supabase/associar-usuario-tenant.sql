-- ============================================
-- ASSOCIAR USUÁRIO AO TENANT EXISTENTE
-- ============================================

-- 1. Verificar tenant existente
SELECT id, name, slug FROM tenants WHERE slug = 'minha-empresa';

-- 2. Se o tenant existir, use o ID retornado acima
-- Se não existir, crie um novo com slug diferente:
-- INSERT INTO tenants (name, slug) 
-- VALUES ('Minha Empresa', 'minha-empresa-2')
-- RETURNING id, name, slug;

-- 3. Associar usuário ao tenant (substitua TENANT_ID pelo ID do tenant existente)
-- Verifique se o usuário já não está associado:
SELECT * FROM users WHERE id = '730614a5-0063-4d24-8a5d-955d72c11354';

-- 4. Se não existir, insira:
INSERT INTO users (id, tenant_id, email, full_name)
VALUES (
  '730614a5-0063-4d24-8a5d-955d72c11354',  -- ID do usuário do auth.users
  '481a70de-bcde-46bf-ac26-6a8080123a38',  -- ID do tenant (use o ID do tenant existente)
  'victormatheuss669@gmail.com',
  'Victor Fernandes'
)
ON CONFLICT (id) DO UPDATE
SET 
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- 5. Criar/atualizar role
INSERT INTO user_roles (tenant_id, user_id, role)
VALUES (
  '481a70de-bcde-46bf-ac26-6a8080123a38',  -- ID do tenant
  '730614a5-0063-4d24-8a5d-955d72c11354',  -- ID do usuário
  'admin'
)
ON CONFLICT (tenant_id, user_id) DO UPDATE
SET role = EXCLUDED.role;

-- 6. Executar seed de dados padrão (se ainda não foi executado)
SELECT seed_tenant_defaults('481a70de-bcde-46bf-ac26-6a8080123a38');

-- 7. Verificar se tudo foi criado corretamente
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

