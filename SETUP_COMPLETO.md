# ✅ Setup Completo - Guia Definitivo

## 🎯 Objetivo

Configurar completamente o ambiente de desenvolvimento do CRM Crédito Consignado.

---

## 📋 Pré-requisitos

- ✅ Conta no Supabase (já tem: https://supabase.com/dashboard/project/bmzhvglbfynzlkdziftg/)
- ✅ Node.js instalado (v18 ou superior)
- ✅ NPM instalado
- ✅ Git instalado (opcional, para versionamento)

---

## 🚀 Execução Rápida (40 minutos)

### 1. Executar Migrações (15 min)

**Acesse:** https://supabase.com/dashboard/project/bmzhvglbfynzlkdziftg/sql/new

Execute **na ordem**:

1. **Migração 1**: Copie e cole `supabase/migrations/001_initial_schema.sql` → Run
2. **Migração 2**: Copie e cole `supabase/migrations/002_rls_policies.sql` → Run
3. **Migração 3**: Copie e cole `supabase/migrations/003_seed_data.sql` → Run

### 2. Criar Bucket (2 min)

- **Storage** > **New bucket**
- Nome: `documents`
- **NÃO** marque como público
- **Create**

### 3. Criar Usuário e Tenant (10 min)

**A. Criar Usuário:**
- **Authentication** > **Users** > **Add User**
- Email: `admin@example.com`
- Password: `SuaSenhaForte123!`
- ✅ **Auto Confirm User**
- **Create user**
- **📝 Anote o ID do usuário**

**B. Criar Tenant (SQL Editor):**
```sql
INSERT INTO tenants (name, slug) 
VALUES ('Minha Empresa', 'minha-empresa')
RETURNING id, name, slug;
```
**📝 Anote o ID do tenant**

**C. Associar Usuário ao Tenant (SQL Editor):**
```sql
-- Substitua USER_ID e TENANT_ID pelos valores anotados
INSERT INTO users (id, tenant_id, email, full_name)
VALUES (
  'USER_ID_AQUI',
  'TENANT_ID_AQUI',
  'admin@example.com',
  'Admin'
);

INSERT INTO user_roles (tenant_id, user_id, role)
VALUES (
  'TENANT_ID_AQUI',
  'USER_ID_AQUI',
  'admin'
);

SELECT seed_tenant_defaults('TENANT_ID_AQUI');
```

### 4. Obter Chaves (2 min)

- **Settings** > **API**
- **📝 Copie:**
  - Project URL
  - anon public key
  - service_role key

### 5. Configurar .env (5 min)

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
# Edite e substitua SUA_CHAVE_ANON_AQUI
```

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edite e substitua as chaves
# Gere JWT_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Instalar Dependências (3 min)

```bash
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 7. Testar (2 min)

```bash
npm run dev
```

Acesse: http://localhost:5173

Login: `admin@example.com` / `SuaSenhaForte123!`

---

## 📚 Documentação Detalhada

- **Setup Completo**: `EXECUTAR_SETUP.md` (guia passo a passo detalhado)
- **Resumo Rápido**: `RESUMO_SETUP.md`
- **Deploy Vercel**: `docs/DEPLOY_VERCEL.md`
- **API**: `docs/API.md`
- **Banco de Dados**: `docs/DATABASE.md`

---

## ✅ Checklist Final

- [ ] Migrações executadas (3 arquivos)
- [ ] Bucket `documents` criado
- [ ] Usuário criado no Auth
- [ ] Tenant criado
- [ ] Usuário associado ao tenant
- [ ] Seed executado
- [ ] Chaves obtidas
- [ ] `frontend/.env` configurado
- [ ] `backend/.env` configurado
- [ ] Dependências instaladas
- [ ] Aplicação rodando
- [ ] Login funcionando

---

## 🆘 Problemas Comuns

### "relation already exists"
→ Continue, algumas tabelas podem já existir.

### "permission denied"
→ Verifique permissões no Supabase.

### Erro de conexão
→ Verifique `.env` e chaves do Supabase.

### Porta em uso
→ Mude PORT no `backend/.env` ou feche outros processos.

---

**Pronto!** 🎉 Sistema configurado e funcionando localmente.

**Próximo passo:** Deploy na Vercel (quando estiver pronto) → `DEPLOY_STEPS.md`

