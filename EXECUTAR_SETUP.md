# 🚀 Executar Setup - Passo a Passo

## ⚠️ IMPORTANTE: Execute na Ordem!

---

## 1️⃣ Executar Migrações no Supabase (15 min)

### Passo 1.1: Acessar SQL Editor

1. Acesse: https://supabase.com/dashboard/project/bmzhvglbfynzlkdziftg/sql/new
2. Clique em **New Query**

### Passo 1.2: Executar Migração 1 - Schema Inicial

1. Abra o arquivo: `supabase/migrations/001_initial_schema.sql`
2. **Copie TODO o conteúdo** (453 linhas)
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou Ctrl+Enter)
5. ✅ Aguarde a execução completar (pode levar 10-30 segundos)

**O que esta migração cria:**
- Extensões (uuid-ossp, pg_trgm)
- Todas as tabelas do sistema
- Índices e constraints
- Funções (update_updated_at, create_audit_log, validate_cpf)
- Triggers automáticos

### Passo 1.3: Executar Migração 2 - RLS Policies

1. Crie uma **nova query** no SQL Editor
2. Abra o arquivo: `supabase/migrations/002_rls_policies.sql`
3. **Copie TODO o conteúdo** (369 linhas)
4. Cole no SQL Editor
5. Clique em **Run**
6. ✅ Aguarde a execução completar

**O que esta migração cria:**
- Habilita RLS em todas as tabelas
- Funções helper (get_user_tenant_id, get_user_role)
- Políticas de segurança para cada tabela

### Passo 1.4: Executar Migração 3 - Seed Data

1. Crie uma **nova query** no SQL Editor
2. Abra o arquivo: `supabase/migrations/003_seed_data.sql`
3. **Copie TODO o conteúdo** (62 linhas)
4. Cole no SQL Editor
5. Clique em **Run**
6. ✅ Aguarde a execução completar

**O que esta migração cria:**
- Função `seed_tenant_defaults()` para criar dados padrão por tenant

---

## 2️⃣ Criar Bucket no Storage (2 min)

### Passo 2.1: Criar Bucket

1. No Supabase Dashboard, vá em **Storage** (menu lateral)
2. Clique em **New bucket**
3. Preencha:
   - **Name**: `documents`
   - **Public bucket**: ❌ **DESMARQUE** (deixe privado)
4. Clique em **Create bucket**

### Passo 2.2: Configurar Políticas do Bucket (Opcional - pode fazer depois)

1. Clique no bucket `documents`
2. Vá em **Policies**
3. Adicione as políticas (via SQL Editor):

```sql
-- Política 1: Upload (autenticados)
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Política 2: Leitura (autenticados)
CREATE POLICY "Users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Política 3: Deleção (autenticados)
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
```

---

## 3️⃣ Criar Primeiro Tenant e Usuário (10 min)

### Passo 3.1: Criar Usuário no Supabase Auth

1. No Dashboard, vá em **Authentication** > **Users**
2. Clique em **Add User** > **Create new user**
3. Preencha:
   - **Email**: `admin@example.com` (ou seu email)
   - **Password**: `SuaSenhaForte123!` (use uma senha forte)
   - ✅ **Auto Confirm User**: **MARQUE** esta opção
4. Clique em **Create user**
5. **📝 ANOTE O ID DO USUÁRIO** (aparece na lista, formato UUID como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Passo 3.2: Criar Tenant

No SQL Editor, execute (substitua os valores):

```sql
INSERT INTO tenants (name, slug) 
VALUES ('Minha Empresa', 'minha-empresa')
RETURNING id, name, slug;
```

**📝 ANOTE O ID DO TENANT** retornado (formato UUID).

### Passo 3.3: Associar Usuário ao Tenant

No SQL Editor, execute (substitua `USER_ID_AQUI` e `TENANT_ID_AQUI`):

```sql
-- Substitua USER_ID_AQUI pelo ID do usuário criado no auth
-- Substitua TENANT_ID_AQUI pelo ID do tenant criado
-- Substitua email e nome

INSERT INTO users (id, tenant_id, email, full_name)
VALUES (
  'USER_ID_AQUI',  -- ID do usuário (UUID)
  'TENANT_ID_AQUI',  -- ID do tenant (UUID)
  'admin@example.com',  -- Email do usuário
  'Admin'  -- Nome completo
);

INSERT INTO user_roles (tenant_id, user_id, role)
VALUES (
  'TENANT_ID_AQUI',  -- ID do tenant
  'USER_ID_AQUI',  -- ID do usuário
  'admin'
);

-- Executar seed de dados padrão
SELECT seed_tenant_defaults('TENANT_ID_AQUI');
```

### Passo 3.4: Verificar Criação

Execute para verificar:

```sql
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

-- Verificar motivos de perda
SELECT 
  stage_type,
  COUNT(*) as total_motivos
FROM loss_reasons 
GROUP BY stage_type
ORDER BY stage_type;
```

---

## 4️⃣ Obter Chaves do Supabase (2 min)

1. No Dashboard, vá em **Settings** > **API**
2. **📝 Copie os seguintes valores:**

   - **Project URL**: `https://bmzhvglbfynzlkdziftg.supabase.co`
   - **anon public** key: `eyJhbGc...` (chave longa)
   - **service_role** key: `eyJhbGc...` (chave longa) ⚠️ **MANTENHA SEGREDO!**

---

## 5️⃣ Configurar Variáveis de Ambiente (5 min)

### Passo 5.1: Criar arquivo `frontend/.env`

Crie o arquivo `frontend/.env` com:

```env
VITE_SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=CRM Crédito Consignado
```

**Substitua `SUA_CHAVE_ANON_AQUI`** pela chave anon public obtida no passo 4.

### Passo 5.2: Gerar JWT_SECRET

No terminal, execute:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**📝 Copie o resultado** (será uma string longa de caracteres hexadecimais).

### Passo 5.3: Criar arquivo `backend/.env`

Crie o arquivo `backend/.env` com:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
SUPABASE_SERVICE_KEY=SUA_SERVICE_KEY_AQUI
JWT_SECRET=JWT_SECRET_GERADO_ACIMA
CORS_ORIGIN=http://localhost:5173
DISCADOR_WEBHOOK_SECRET=seu_webhook_secret_aqui
DISCADOR_API_URL=https://api.discador.com
DISCADOR_API_KEY=sua_chave_api_discador
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

**Substitua:**
- `SUA_CHAVE_ANON_AQUI` pela chave anon public
- `SUA_SERVICE_KEY_AQUI` pela service_role key
- `JWT_SECRET_GERADO_ACIMA` pelo JWT_SECRET gerado
- Os valores do discador (pode deixar como está por enquanto)

---

## 6️⃣ Instalar Dependências (3 min)

No terminal, na raiz do projeto:

```bash
# Instalar dependências da raiz
npm install

# Instalar dependências do frontend
cd frontend
npm install
cd ..

# Instalar dependências do backend
cd backend
npm install
cd ..
```

---

## 7️⃣ Testar Localmente (2 min)

Na raiz do projeto:

```bash
npm run dev
```

Isso iniciará:
- Frontend em: http://localhost:5173
- Backend em: http://localhost:3000

### Testar Login

1. Acesse: http://localhost:5173
2. Faça login com:
   - Email: `admin@example.com` (ou o email que você criou)
   - Senha: `SuaSenhaForte123!` (ou a senha que você definiu)

---

## ✅ Checklist Final

- [ ] Migração 1 executada com sucesso
- [ ] Migração 2 executada com sucesso
- [ ] Migração 3 executada com sucesso
- [ ] Bucket `documents` criado
- [ ] Usuário criado no Auth
- [ ] Tenant criado
- [ ] Usuário associado ao tenant
- [ ] Seed de dados executado
- [ ] Chaves do Supabase obtidas
- [ ] `frontend/.env` criado e configurado
- [ ] `backend/.env` criado e configurado
- [ ] Dependências instaladas
- [ ] Aplicação rodando localmente
- [ ] Login funcionando

---

## 🆘 Troubleshooting

### Erro: "relation already exists"
- Algumas tabelas já existem. Isso é normal se você executou antes.
- Continue com as próximas migrações.

### Erro: "permission denied"
- Verifique se está usando a conta correta do Supabase.
- Certifique-se de ter permissões de admin no projeto.

### Erro: "function does not exist"
- Execute as migrações na ordem correta (1, 2, 3).

### Erro de conexão no frontend
- Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretos.
- Verifique se o arquivo `.env` está na pasta `frontend/`.

### Erro de conexão no backend
- Verifique se todas as variáveis em `backend/.env` estão corretas.
- Verifique se `SUPABASE_SERVICE_KEY` está correto.

---

**Tempo total estimado:** ~40 minutos

**Próximo passo:** Após tudo funcionar localmente, você pode fazer o deploy na Vercel seguindo `DEPLOY_STEPS.md`

