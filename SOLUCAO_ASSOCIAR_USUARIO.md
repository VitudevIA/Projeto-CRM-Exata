# 🔧 Solução: Associar Usuário ao Tenant Existente

## Problema
O tenant com slug `minha-empresa` já existe, então não podemos criar outro com o mesmo slug.

## Solução

Execute este SQL no Supabase SQL Editor **passo a passo**:

### Passo 1: Verificar o tenant existente

```sql
SELECT id, name, slug FROM tenants WHERE slug = 'minha-empresa';
```

**📝 Anote o ID do tenant** retornado (pode ser diferente de `481a70de-bcde-46bf-ac26-6a8080123a38`).

### Passo 2: Verificar se o usuário já está associado

```sql
SELECT * FROM users WHERE id = '730614a5-0063-4d24-8a5d-955d72c11354';
```

Se retornar resultado, o usuário já está associado. Pule para o Passo 4.

### Passo 3: Associar usuário ao tenant (use o ID do tenant do Passo 1)

```sql
-- Substitua TENANT_ID_AQUI pelo ID retornado no Passo 1
INSERT INTO users (id, tenant_id, email, full_name)
VALUES (
  '730614a5-0063-4d24-8a5d-955d72c11354',
  'TENANT_ID_AQUI',  -- Use o ID do tenant do Passo 1
  'victormatheuss669@gmail.com',
  'Victor Fernandes'
)
ON CONFLICT (id) DO UPDATE
SET 
  tenant_id = EXCLUDED.tenant_id,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;
```

### Passo 4: Criar/atualizar role (use o ID do tenant do Passo 1)

```sql
-- Substitua TENANT_ID_AQUI pelo ID retornado no Passo 1
INSERT INTO user_roles (tenant_id, user_id, role)
VALUES (
  'TENANT_ID_AQUI',  -- Use o ID do tenant do Passo 1
  '730614a5-0063-4d24-8a5d-955d72c11354',
  'admin'
)
ON CONFLICT (tenant_id, user_id) DO UPDATE
SET role = EXCLUDED.role;
```

### Passo 5: Executar seed de dados padrão (use o ID do tenant do Passo 1)

```sql
-- Substitua TENANT_ID_AQUI pelo ID retornado no Passo 1
SELECT seed_tenant_defaults('TENANT_ID_AQUI');
```

### Passo 6: Verificar se tudo está correto

```sql
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
```

Deve retornar:
- Email: `victormatheuss669@gmail.com`
- Full Name: `Victor Fernandes`
- Tenant ID: (o ID do tenant)
- Role: `admin`
- Tenant Name: `Minha Empresa`

---

## ⚡ Versão Rápida (Tudo em Um)

Se você já sabe o ID do tenant, execute tudo de uma vez (substitua `TENANT_ID_AQUI`):

```sql
-- Associar usuário
INSERT INTO users (id, tenant_id, email, full_name)
VALUES (
  '730614a5-0063-4d24-8a5d-955d72c11354',
  'TENANT_ID_AQUI',
  'victormatheuss669@gmail.com',
  'Victor Fernandes'
)
ON CONFLICT (id) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id, email = EXCLUDED.email, full_name = EXCLUDED.full_name;

-- Criar role
INSERT INTO user_roles (tenant_id, user_id, role)
VALUES ('TENANT_ID_AQUI', '730614a5-0063-4d24-8a5d-955d72c11354', 'admin')
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- Seed dados
SELECT seed_tenant_defaults('TENANT_ID_AQUI');
```

---

## ✅ Após Executar

1. Recarregue a página de login (Ctrl+Shift+R)
2. Tente fazer login novamente
3. Deve funcionar! 🎉

