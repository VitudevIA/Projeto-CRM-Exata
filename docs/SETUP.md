# Guia de Setup - CRM Crédito Consignado

## Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Conta no Supabase
- Conta na Vercel (para deploy)

## Passo a Passo

### 1. Clone e Instale Dependências

```bash
# Instalar dependências raiz
npm install

# Instalar dependências do frontend
cd frontend
npm install

# Instalar dependências do backend
cd ../backend
npm install
```

### 2. Configurar Supabase

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard/project/bmzhvglbfynzlkdziftg/
2. Vá em SQL Editor
3. Execute as migrações na ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_data.sql`

4. Crie um bucket no Storage:
   - Vá em Storage
   - Crie um bucket chamado `documents`
   - Configure políticas de acesso (público para leitura, autenticado para escrita)

5. Obtenha as chaves:
   - Vá em Settings > API
   - Copie `Project URL` e `anon public` key

### 3. Configurar Variáveis de Ambiente

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=CRM Crédito Consignado
```

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_KEY=sua_service_key_aqui
JWT_SECRET=seu_jwt_secret_aqui
CORS_ORIGIN=http://localhost:5173
DISCADOR_WEBHOOK_SECRET=seu_webhook_secret_aqui
DISCADOR_API_URL=url_do_discador
DISCADOR_API_KEY=chave_do_discador
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

### 4. Criar Primeiro Tenant e Usuário

Após executar as migrações, você precisa criar manualmente:

1. **Criar Tenant**:
```sql
INSERT INTO tenants (name, slug) 
VALUES ('Sua Empresa', 'sua-empresa');
```

2. **Criar Usuário no Supabase Auth** (via Dashboard ou API)

3. **Associar Usuário ao Tenant**:
```sql
-- Substitua 'user_id' pelo ID do usuário criado no auth.users
INSERT INTO users (id, tenant_id, email, full_name)
VALUES ('user_id', 'tenant_id', 'admin@example.com', 'Admin');

INSERT INTO user_roles (tenant_id, user_id, role)
VALUES ('tenant_id', 'user_id', 'admin');
```

### 5. Executar Seed de Dados Padrão

```sql
-- Substitua 'tenant_id' pelo ID do tenant criado
SELECT seed_tenant_defaults('tenant_id');
```

### 6. Iniciar Desenvolvimento

```bash
# Na raiz do projeto
npm run dev
```

Isso iniciará:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### 7. Acessar a Aplicação

1. Abra http://localhost:5173
2. Faça login com o usuário criado
3. Comece a usar o sistema!

## Troubleshooting

### Erro de CORS
Verifique se `CORS_ORIGIN` no backend está correto.

### Erro de Autenticação
Verifique se as chaves do Supabase estão corretas.

### Erro de RLS
Certifique-se de que as políticas RLS foram aplicadas corretamente.

### Erro ao Fazer Upload de Documentos
Verifique se o bucket `documents` foi criado no Supabase Storage.

## Próximos Passos

- Configure integração com discador (Fortics BPX)
- Personalize estágios do funil conforme necessário
- Configure notificações push (se necessário)
- Adicione mais usuários conforme necessário

