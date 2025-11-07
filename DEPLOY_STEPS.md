# Passos para Deploy - Resumo Executivo

## 🚀 Deploy na Vercel (Sem GitHub ainda)

### Opção 1: Via Vercel CLI (Mais Rápido)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Na raiz do projeto, fazer deploy
vercel

# 4. Seguir instruções:
# - Link to existing project? No
# - Project name? crm-credito-consignado
# - Directory? ./
# - Override settings? No

# 5. Após deploy, configurar variáveis:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# ... (repetir para todas as variáveis)
```

### Opção 2: Via Dashboard (Mais Visual)

1. Acesse https://vercel.com
2. Login (pode criar conta com email)
3. Clique em **Add New** > **Project**
4. Selecione **Import Git Repository** OU **Deploy without Git**
5. Se escolher "Deploy without Git":
   - Instale Vercel CLI
   - Execute `vercel` no terminal
   - Siga instruções

## 📋 Checklist de Variáveis de Ambiente

Configure estas variáveis no Dashboard da Vercel (Settings > Environment Variables):

### Frontend (VITE_*)
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_API_URL` (atualizar após primeiro deploy)
- [ ] `VITE_APP_NAME`

### Backend
- [ ] `NODE_ENV=production`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_KEY`
- [ ] `JWT_SECRET`
- [ ] `CORS_ORIGIN` (URL da Vercel após deploy)
- [ ] `DISCADOR_WEBHOOK_SECRET`
- [ ] `DISCADOR_API_URL`
- [ ] `DISCADOR_API_KEY`
- [ ] `MAX_FILE_SIZE`
- [ ] `ALLOWED_FILE_TYPES`

## ⚠️ Importante

1. **Primeiro Deploy**: A `VITE_API_URL` deve ser atualizada após o primeiro deploy com a URL real da Vercel
2. **CORS**: Configure `CORS_ORIGIN` com a URL da Vercel
3. **Service Key**: Mantenha `SUPABASE_SERVICE_KEY` segredo (não commite no Git!)

## 🔄 Deploy Automático (Com GitHub)

Após criar repositório no GitHub:

1. Push do código
2. Conectar repositório à Vercel
3. Deploy automático a cada push
4. Preview deployments para cada PR

---

**Tempo estimado**: 15-30 minutos para primeiro deploy

