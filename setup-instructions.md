# Instruções de Setup - Passo a Passo

## 1️⃣ Executar Migrações no Supabase

### Opção A: Via SQL Editor (Recomendado)

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard/project/bmzhvglbfynzlkdziftg/
2. Vá em **SQL Editor** (menu lateral)
3. Execute as migrações na ordem:

#### Migração 1: Schema Inicial
- Clique em **New Query**
- Abra o arquivo `supabase/migrations/001_initial_schema.sql`
- Copie TODO o conteúdo
- Cole no SQL Editor
- Clique em **Run** (ou pressione Ctrl+Enter)
- Aguarde a execução completar

#### Migração 2: Políticas RLS
- Crie uma nova query
- Abra o arquivo `supabase/migrations/002_rls_policies.sql`
- Copie TODO o conteúdo
- Cole no SQL Editor
- Clique em **Run**

#### Migração 3: Função de Seed
- Crie uma nova query
- Abra o arquivo `supabase/migrations/003_seed_data.sql`
- Copie TODO o conteúdo
- Cole no SQL Editor
- Clique em **Run**

### Opção B: Via Arquivo de Setup

1. Abra o arquivo `supabase/setup.sql`
2. Siga as instruções passo a passo
3. Execute cada seção separadamente

## 2️⃣ Criar Bucket no Supabase Storage

1. No Supabase Dashboard, vá em **Storage**
2. Clique em **New bucket**
3. Nome: `documents`
4. **Public bucket**: Desmarque (privado)
5. Clique em **Create bucket**

### Configurar Políticas do Bucket

1. Clique no bucket `documents`
2. Vá em **Policies**
3. Adicione as seguintes políticas:

**Política 1: Permitir upload (autenticados)**
```sql
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');
```

**Política 2: Permitir leitura (autenticados)**
```sql
CREATE POLICY "Users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

**Política 3: Permitir deleção (autenticados)**
```sql
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
```

## 3️⃣ Criar Primeiro Tenant e Usuário

### Passo 1: Criar Usuário no Supabase Auth

1. No Supabase Dashboard, vá em **Authentication** > **Users**
2. Clique em **Add User** > **Create new user**
3. Preencha:
   - **Email**: seu-email@example.com
   - **Password**: uma senha forte
   - **Auto Confirm User**: Marque esta opção
4. Clique em **Create user**
5. **ANOTE O ID DO USUÁRIO** (aparece na lista de usuários)

### Passo 2: Criar Tenant

Execute no SQL Editor:

```sql
INSERT INTO tenants (name, slug) 
VALUES ('Sua Empresa', 'sua-empresa')
RETURNING id, name, slug;
```

**ANOTE O ID DO TENANT** retornado.

### Passo 3: Associar Usuário ao Tenant

Execute no SQL Editor (substitua os valores):

```sql
-- Substitua USER_ID pelo ID do usuário criado no auth
-- Substitua TENANT_ID pelo ID do tenant criado
-- Substitua o email e nome

INSERT INTO users (id, tenant_id, email, full_name)
VALUES (
  'USER_ID_AQUI',
  'TENANT_ID_AQUI',
  'seu-email@example.com',
  'Seu Nome'
);

INSERT INTO user_roles (tenant_id, user_id, role)
VALUES (
  'TENANT_ID_AQUI',
  'USER_ID_AQUI',
  'admin'
);
```

### Passo 4: Executar Seed de Dados Padrão

Execute no SQL Editor (substitua TENANT_ID):

```sql
SELECT seed_tenant_defaults('TENANT_ID_AQUI');
```

## 4️⃣ Configurar Variáveis de Ambiente

### Frontend

Crie o arquivo `frontend/.env`:

```env
VITE_SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=CRM Crédito Consignado
```

**Para obter as chaves:**
1. No Supabase Dashboard, vá em **Settings** > **API**
2. Copie **Project URL** → `VITE_SUPABASE_URL`
3. Copie **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Backend

Crie o arquivo `backend/.env`:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_KEY=sua_service_key_aqui
JWT_SECRET=gere_uma_chave_secreta_aleatoria_aqui
CORS_ORIGIN=http://localhost:5173
DISCADOR_WEBHOOK_SECRET=seu_webhook_secret_aqui
DISCADOR_API_URL=url_do_discador_fortics
DISCADOR_API_KEY=chave_do_discador_fortics
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

**Para obter as chaves:**
1. No Supabase Dashboard, vá em **Settings** > **API**
2. Copie **Project URL** → `SUPABASE_URL`
3. Copie **anon public** key → `SUPABASE_ANON_KEY`
4. Copie **service_role** key → `SUPABASE_SERVICE_KEY` (mantenha segredo!)

**Para gerar JWT_SECRET:**
```bash
# No terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5️⃣ Verificar Instalação

Execute no SQL Editor para verificar:

```sql
-- Verificar tenant
SELECT * FROM tenants;

-- Verificar usuário e role
SELECT u.*, ur.role 
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND u.tenant_id = ur.tenant_id;

-- Verificar estágios
SELECT * FROM client_stages ORDER BY order_index;

-- Verificar motivos de perda
SELECT COUNT(*) as total_motivos FROM loss_reasons;
```

## 6️⃣ Testar Localmente

```bash
# Na raiz do projeto
npm run dev
```

Acesse:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

Faça login com o usuário criado!

