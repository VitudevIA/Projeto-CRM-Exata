-- ============================================
-- ASSOCIAR USUÁRIO AO TENANT - EXECUTE TUDO
-- ============================================

-- 1. Verificar e obter o ID do tenant existente
DO $$
DECLARE
  tenant_uuid UUID;
BEGIN
  -- Buscar tenant existente
  SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'minha-empresa' LIMIT 1;
  
  -- Se não existir, criar novo
  IF tenant_uuid IS NULL THEN
    INSERT INTO tenants (name, slug) 
    VALUES ('Minha Empresa', 'minha-empresa-' || substr(md5(random()::text), 1, 8))
    RETURNING id INTO tenant_uuid;
  END IF;
  
  -- Associar usuário ao tenant
  INSERT INTO users (id, tenant_id, email, full_name)
  VALUES (
    '730614a5-0063-4d24-8a5d-955d72c11354',
    tenant_uuid,
    'victormatheuss669@gmail.com',
    'Victor Fernandes'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    tenant_id = EXCLUDED.tenant_id,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  
  -- Criar/atualizar role
  INSERT INTO user_roles (tenant_id, user_id, role)
  VALUES (tenant_uuid, '730614a5-0063-4d24-8a5d-955d72c11354', 'admin')
  ON CONFLICT (tenant_id, user_id) DO UPDATE
  SET role = EXCLUDED.role;
  
  -- Executar seed
  PERFORM seed_tenant_defaults(tenant_uuid);
  
  -- Mostrar resultado
  RAISE NOTICE 'Usuário associado ao tenant: %', tenant_uuid;
END $$;

-- 2. Verificar resultado
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.tenant_id,
  ur.role,
  t.name as tenant_name,
  t.slug as tenant_slug
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND u.tenant_id = ur.tenant_id
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.id = '730614a5-0063-4d24-8a5d-955d72c11354';

