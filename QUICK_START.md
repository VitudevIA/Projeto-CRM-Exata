# Quick Start - Setup Rápido

## ⚡ Setup em 5 Passos

### 1. Instalar Dependências

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Executar Migrações no Supabase

1. Acesse: https://supabase.com/dashboard/project/bmzhvglbfynzlkdziftg/sql/new
2. Execute os 3 arquivos SQL na ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_data.sql`

### 3. Criar Bucket no Storage

1. Vá em **Storage** > **New bucket**
2. Nome: `documents`
3. Privado (não marque público)

### 4. Configurar Variáveis de Ambiente

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
VITE_SUPABASE_ANON_KEY=[obtenha em Settings > API]
VITE_API_URL=http://localhost:3000
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
SUPABASE_ANON_KEY=[obtenha em Settings > API]
SUPABASE_SERVICE_KEY=[obtenha em Settings > API]
JWT_SECRET=[gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
CORS_ORIGIN=http://localhost:5173
```

### 5. Criar Primeiro Usuário

1. **Criar no Auth**: Authentication > Users > Add User
2. **Criar Tenant** (SQL Editor):
```sql
INSERT INTO tenants (name, slug) VALUES ('Minha Empresa', 'minha-empresa') RETURNING id;
```
3. **Associar Usuário** (substitua IDs):
```sql
INSERT INTO users (id, tenant_id, email, full_name)
VALUES ('USER_ID', 'TENANT_ID', 'seu@email.com', 'Seu Nome');

INSERT INTO user_roles (tenant_id, user_id, role)
VALUES ('TENANT_ID', 'USER_ID', 'admin');

SELECT seed_tenant_defaults('TENANT_ID');
```

### 6. Iniciar

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## 📚 Documentação Completa

- **Setup Detalhado**: `setup-instructions.md`
- **Deploy Vercel**: `docs/DEPLOY_VERCEL.md`
- **API**: `docs/API.md`
- **Banco de Dados**: `docs/DATABASE.md`
- **Guia do Usuário**: `docs/USER_GUIDE.md`

