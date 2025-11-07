# 📋 Resumo do Setup - Passo a Passo

## ✅ O que já está pronto

- ✅ Código completo do frontend e backend
- ✅ Migrações SQL criadas
- ✅ Configuração da Vercel preparada
- ✅ Documentação completa

## 🚀 Próximos Passos

### 1️⃣ Executar Migrações no Supabase (15 min)

1. Acesse: https://supabase.com/dashboard/project/bmzhvglbfynzlkdziftg/sql/new

2. Execute os 3 arquivos SQL **na ordem**:
   - `supabase/migrations/001_initial_schema.sql` → Copie e cole → Run
   - `supabase/migrations/002_rls_policies.sql` → Copie e cole → Run  
   - `supabase/migrations/003_seed_data.sql` → Copie e cole → Run

3. **Criar Bucket no Storage**:
   - Vá em **Storage** > **New bucket**
   - Nome: `documents`
   - **NÃO** marque como público
   - Clique em **Create**

### 2️⃣ Criar Primeiro Tenant e Usuário (10 min)

#### Passo A: Criar Usuário no Auth

1. Vá em **Authentication** > **Users**
2. Clique em **Add User** > **Create new user**
3. Preencha:
   - Email: `seu-email@example.com`
   - Password: `sua-senha-forte`
   - ✅ Marque **Auto Confirm User**
4. Clique em **Create user**
5. **ANOTE O ID DO USUÁRIO** (aparece na lista, formato UUID)

#### Passo B: Criar Tenant

No SQL Editor, execute (substitua os valores):

```sql
INSERT INTO tenants (name, slug) 
VALUES ('Minha Empresa', 'minha-empresa')
RETURNING id, name, slug;
```

**ANOTE O ID DO TENANT** retornado.

#### Passo C: Associar Usuário ao Tenant

No SQL Editor, execute (substitua USER_ID e TENANT_ID):

```sql
-- Substitua USER_ID pelo ID do usuário criado no auth
-- Substitua TENANT_ID pelo ID do tenant criado
-- Substitua email e nome

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

-- Executar seed de dados padrão
SELECT seed_tenant_defaults('TENANT_ID_AQUI');
```

### 3️⃣ Configurar Variáveis de Ambiente (5 min)

#### Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
VITE_SUPABASE_ANON_KEY=[obtenha em Settings > API > anon public]
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=CRM Crédito Consignado
```

#### Backend (`backend/.env`)

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
SUPABASE_ANON_KEY=[obtenha em Settings > API > anon public]
SUPABASE_SERVICE_KEY=[obtenha em Settings > API > service_role - MANTENHA SEGREDO!]
JWT_SECRET=[gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
CORS_ORIGIN=http://localhost:5173
DISCADOR_WEBHOOK_SECRET=seu_webhook_secret_aqui
DISCADOR_API_URL=https://api.discador.com
DISCADOR_API_KEY=sua_chave_api_discador
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

**Onde obter as chaves:**
- Supabase Dashboard > **Settings** > **API**
- **Project URL** → `SUPABASE_URL`
- **anon public** → `SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_KEY` ⚠️ **MANTENHA SEGREDO!**

### 4️⃣ Testar Localmente (2 min)

```bash
# Na raiz do projeto
npm run dev
```

Acesse: http://localhost:5173

Faça login com o usuário criado!

---

## 📦 Deploy na Vercel

### Como Funciona o Deploy

A Vercel funciona de duas formas:

#### **Opção 1: Com GitHub (Recomendado)**

**Vantagens:**
- ✅ Deploy automático a cada push
- ✅ Preview deployments para cada PR
- ✅ Histórico de versões
- ✅ Rollback fácil

**Processo:**
1. Criar repositório no GitHub
2. Fazer push do código
3. Conectar repositório à Vercel
4. Deploy automático!

**Tempo:** ~20 minutos

#### **Opção 2: Sem GitHub (Vercel CLI)**

**Quando usar:**
- Testes rápidos
- Não quer usar GitHub ainda

**Processo:**
```bash
npm i -g vercel
vercel login
vercel
```

**Tempo:** ~10 minutos

### Estrutura do Deploy

```
Frontend (React) → Build estático → CDN Global
Backend (Express) → Serverless Functions → /api/*
```

**Resultado:** Uma única URL para tudo!

### Variáveis de Ambiente na Vercel

Configure no Dashboard da Vercel (Settings > Environment Variables):

- Todas as variáveis do `.env` do frontend e backend
- Marque para **Production**, **Preview** e **Development**
- Após primeiro deploy, atualize `VITE_API_URL` com a URL da Vercel

### Documentação Completa

- **Setup Detalhado**: `setup-instructions.md`
- **Deploy Vercel**: `docs/DEPLOY_VERCEL.md`
- **Explicação Deploy**: `DEPLOY_EXPLANATION.md`
- **Passos Rápidos**: `DEPLOY_STEPS.md`

---

## ⚠️ Importante

1. **Service Key**: Nunca commite `SUPABASE_SERVICE_KEY` no Git
2. **JWT Secret**: Gere uma chave aleatória forte
3. **Primeiro Deploy**: Atualize `VITE_API_URL` após deploy com URL da Vercel
4. **CORS**: Configure `CORS_ORIGIN` com URL da Vercel

---

## 🎯 Checklist Final

- [ ] Migrações executadas no Supabase
- [ ] Bucket `documents` criado
- [ ] Primeiro tenant criado
- [ ] Primeiro usuário criado e associado
- [ ] Variáveis de ambiente configuradas
- [ ] Teste local funcionando
- [ ] (Opcional) Deploy na Vercel

---

**Tempo total estimado:** ~30-40 minutos para setup completo

