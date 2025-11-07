# 🔍 Análise de Variáveis de Ambiente - Vercel

## 📋 Como Verificar Manualmente

Infelizmente, não consigo acessar diretamente suas variáveis de ambiente na Vercel (elas são protegidas por autenticação). Mas posso te ajudar a verificar se todas estão configuradas corretamente!

### Passo 1: Acessar a Página de Variáveis

1. **Acesse diretamente:**
   ```
   https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/environment-variables
   ```

2. **Ou navegue:**
   - Dashboard Vercel > **vitu-dev-ias-projects** > **projeto_crm_exata** > **Settings** > **Environment Variables**

---

## ✅ Checklist Completo de Variáveis

### 🎨 Frontend (Variáveis VITE_*)

Essas variáveis são usadas durante o **build** do frontend e devem estar marcadas para **Production**, **Preview** e **Development**:

| Variável | Obrigatória | Valor Esperado | Status |
|----------|-------------|----------------|--------|
| `VITE_SUPABASE_URL` | ✅ Sim | `https://bmzhvglbfynzlkdziftg.supabase.co` | ⬜ Verificar |
| `VITE_SUPABASE_ANON_KEY` | ✅ Sim | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave longa) | ⬜ Verificar |
| `VITE_API_URL` | ✅ Sim | URL do seu projeto Vercel (ex: `https://projeto-crm-exata.vercel.app`) | ⬜ Verificar |
| `VITE_APP_NAME` | ⚠️ Opcional | `CRM Crédito Consignado` | ⬜ Verificar |

**⚠️ IMPORTANTE:** 
- `VITE_API_URL` deve ser a URL real do seu projeto na Vercel
- Para descobrir a URL: vá em **Settings** > **Domains** ou veja a URL do último deploy

---

### 🔧 Backend (Variáveis da API)

Essas variáveis são usadas pelas **serverless functions** e devem estar marcadas para **Production**, **Preview** e **Development**:

| Variável | Obrigatória | Valor Esperado | Status |
|----------|-------------|----------------|--------|
| `NODE_ENV` | ⚠️ Opcional | `production` | ⬜ Verificar |
| `PORT` | ⚠️ Opcional | `3000` (não usado na Vercel) | ⬜ Verificar |
| `SUPABASE_URL` | ✅ Sim | `https://bmzhvglbfynzlkdziftg.supabase.co` | ⬜ Verificar |
| `SUPABASE_ANON_KEY` | ✅ Sim | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave longa) | ⬜ Verificar |
| `SUPABASE_SERVICE_KEY` | ✅ Sim | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave longa) ⚠️ **SECRETA** | ⬜ Verificar |
| `JWT_SECRET` | ✅ Sim | String hexadecimal longa (64 caracteres) | ⬜ Verificar |
| `CORS_ORIGIN` | ✅ Sim | URL do frontend na Vercel (ex: `https://projeto-crm-exata.vercel.app`) | ⬜ Verificar |
| `DISCADOR_WEBHOOK_SECRET` | ⚠️ Opcional | `seu_webhook_secret_aqui` (pode ser placeholder) | ⬜ Verificar |
| `DISCADOR_API_URL` | ⚠️ Opcional | `https://api.discador.com` (pode ser placeholder) | ⬜ Verificar |
| `DISCADOR_API_KEY` | ⚠️ Opcional | `sua_chave_api_discador` (pode ser placeholder) | ⬜ Verificar |
| `MAX_FILE_SIZE` | ⚠️ Opcional | `10485760` (10MB) | ⬜ Verificar |
| `ALLOWED_FILE_TYPES` | ⚠️ Opcional | `image/jpeg,image/png,image/webp,application/pdf` | ⬜ Verificar |

**⚠️ IMPORTANTE:**
- `SUPABASE_SERVICE_KEY` é **MUITO SENSÍVEL** - nunca compartilhe!
- `CORS_ORIGIN` deve ser a URL do frontend (mesma do `VITE_API_URL`)
- Variáveis do discador podem ficar com valores placeholder por enquanto

---

## 🔍 Como Descobrir a URL do Seu Projeto

### Método 1: Pela Página do Projeto

1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata
2. Veja a URL no topo ou no card do último deploy
3. Formato: `https://projeto-crm-exata-xxxxx.vercel.app` ou domínio customizado

### Método 2: Pela Página de Domains

1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/domains
2. Veja os domínios configurados

### Método 3: Pelo Último Deploy

1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata
2. Clique no último deploy
3. Veja a URL no topo da página

---

## 📝 Valores Esperados (Baseado no seu Setup Local)

### Frontend

```env
VITE_SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtemh2Z2xiZnluemxrZHppZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzE2OTksImV4cCI6MjA3ODA0NzY5OX0.60AYGJXEm_zOnbt2BacPm2ov6blc3L6pnTdq033B6uk
VITE_API_URL=https://[SUA-URL-VERCEL].vercel.app
VITE_APP_NAME=CRM Crédito Consignado
```

### Backend

```env
NODE_ENV=production
SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtemh2Z2xiZnluemxrZHppZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzE2OTksImV4cCI6MjA3ODA0NzY5OX0.60AYGJXEm_zOnbt2BacPm2ov6blc3L6pnTdq033B6uk
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtemh2Z2xiZnluemxrZHppZnRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ3MTY5OSwiZXhwIjoyMDc4MDQ3Njk5fQ.XItjjS6HKhpWvtg9iTaW6Yq8xVvcvjLrdEG9RuDGTwE
JWT_SECRET=49184e75dd708cafbe3091b56cba89c689c9b864faf258b69281a547c5838081
CORS_ORIGIN=https://[SUA-URL-VERCEL].vercel.app
DISCADOR_WEBHOOK_SECRET=seu_webhook_secret_aqui
DISCADOR_API_URL=https://api.discador.com
DISCADOR_API_KEY=sua_chave_api_discador
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

**Substitua `[SUA-URL-VERCEL]` pela URL real do seu projeto na Vercel**

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: "Variável não encontrada" no build

**Causa:** Variável não configurada ou nome incorreto

**Solução:**
- Verifique se o nome está exatamente igual (case-sensitive)
- Verifique se está marcada para o ambiente correto (Production/Preview/Development)
- Variáveis `VITE_*` só funcionam se estiverem configuradas ANTES do build

### Problema 2: "CORS error" na aplicação

**Causa:** `CORS_ORIGIN` está incorreta ou não configurada

**Solução:**
- Verifique se `CORS_ORIGIN` aponta para a URL correta do frontend
- Deve ser a URL completa: `https://projeto-crm-exata.vercel.app` (sem barra no final)
- Deve ser a mesma URL usada em `VITE_API_URL`

### Problema 3: "API não funciona" ou "404"

**Causa:** `VITE_API_URL` está incorreta

**Solução:**
- Em produção, `VITE_API_URL` deve ser a URL do projeto Vercel
- Ou pode ser `/api` se estiver usando o mesmo domínio
- Verifique se a URL está correta (sem typos)

### Problema 4: "Erro de autenticação Supabase"

**Causa:** Chaves do Supabase incorretas

**Solução:**
- Verifique se `SUPABASE_URL` está correto
- Verifique se `SUPABASE_ANON_KEY` está correto (frontend e backend)
- Verifique se `SUPABASE_SERVICE_KEY` está correto (backend apenas)
- As chaves devem ser exatamente iguais às do Supabase Dashboard

### Problema 5: "JWT Secret inválido"

**Causa:** `JWT_SECRET` não configurado ou muito curto

**Solução:**
- `JWT_SECRET` deve ser uma string longa (recomendado: 64 caracteres hexadecimais)
- Gere uma nova com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Use a mesma chave em todos os ambientes (Production, Preview, Development)

---

## 📊 Resumo: Variáveis Obrigatórias vs Opcionais

### ✅ Obrigatórias (Sem elas, a aplicação NÃO funciona)

**Frontend:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `CORS_ORIGIN`

### ⚠️ Opcionais (Podem ter valores placeholder)

- `VITE_APP_NAME`
- `NODE_ENV`
- `PORT`
- `DISCADOR_WEBHOOK_SECRET`
- `DISCADOR_API_URL`
- `DISCADOR_API_KEY`
- `MAX_FILE_SIZE`
- `ALLOWED_FILE_TYPES`

---

## 🔄 Como Adicionar/Editar Variáveis

### Adicionar Nova Variável

1. Na página de Environment Variables, clique em **Add New**
2. Preencha:
   - **Key**: Nome da variável (ex: `VITE_SUPABASE_URL`)
   - **Value**: Valor da variável
   - **Environments**: Selecione onde aplicar:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development**
3. Clique em **Save**

### Editar Variável Existente

1. Encontre a variável na lista
2. Clique no ícone de **edição** (lápis)
3. Altere o valor
4. Verifique os ambientes
5. Clique em **Save**

### Deletar Variável

1. Encontre a variável na lista
2. Clique no ícone de **deletar** (lixeira)
3. Confirme a exclusão

---

## ✅ Checklist Final

Use este checklist para verificar se tudo está configurado:

### Frontend
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada
- [ ] `VITE_API_URL` configurada com URL correta do Vercel
- [ ] `VITE_APP_NAME` configurada (opcional)
- [ ] Todas marcadas para Production, Preview e Development

### Backend
- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_KEY` configurada (VERIFICAR se está correta!)
- [ ] `JWT_SECRET` configurada
- [ ] `CORS_ORIGIN` configurada com URL do frontend
- [ ] `NODE_ENV=production` configurada
- [ ] Variáveis do discador configuradas (ou placeholder)
- [ ] Todas marcadas para Production, Preview e Development

### Verificações Finais
- [ ] `VITE_API_URL` e `CORS_ORIGIN` apontam para a mesma URL
- [ ] URLs não têm barras no final (`/`)
- [ ] Todas as chaves do Supabase estão corretas
- [ ] `JWT_SECRET` é uma string longa (64 caracteres)

---

## 📞 Próximos Passos

1. **Verifique manualmente** todas as variáveis usando este guia
2. **Anote quais estão faltando** ou incorretas
3. **Me informe** quais variáveis precisam ser corrigidas
4. **Faça um novo deploy** após corrigir as variáveis

---

## 💡 Dica

Se você quiser, pode me informar:
- Quais variáveis estão configuradas
- Quais estão faltando
- Quais têm valores incorretos

E eu te ajudo a corrigir cada uma delas!

---

**URL para verificar:** https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/environment-variables

