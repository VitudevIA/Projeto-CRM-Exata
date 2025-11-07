# 🔐 Configurar Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE: Variáveis de Ambiente são OBRIGATÓRIAS

Sem as variáveis de ambiente configuradas, a aplicação **NÃO funcionará** corretamente. É essencial configurá-las antes do deploy.

## 📍 Onde Configurar

1. **Acesse o link direto:**
   ```
   https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/environment-variables
   ```

2. **Ou navegue:**
   - Dashboard Vercel > Seu Projeto > Settings > Environment Variables

## 📋 Lista Completa de Variáveis

### 🎨 Frontend (Variáveis que começam com `VITE_`)

Adicione estas variáveis e **marque para "Production", "Preview" e "Development"**:

| Nome da Variável | Valor | Descrição |
|-----------------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://bmzhvglbfynzlkdziftg.supabase.co` | URL do seu projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtemh2Z2xiZnluemxrZHppZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzE2OTksImV4cCI6MjA3ODA0NzY5OX0.60AYGJXEm_zOnbt2BacPm2ov6blc3L6pnTdq033B6uk` | Chave anônima do Supabase |
| `VITE_API_URL` | `https://projeto-crm-exata.vercel.app` | **⚠️ ATUALIZAR após primeiro deploy** |
| `VITE_APP_NAME` | `CRM Crédito Consignado` | Nome da aplicação |

### 🔧 Backend (Todas as outras)

Adicione estas variáveis e **marque para "Production", "Preview" e "Development"**:

| Nome da Variável | Valor | Descrição |
|-----------------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de execução |
| `PORT` | `3000` | Porta (não usado na Vercel, mas pode ser necessário) |
| `SUPABASE_URL` | `https://bmzhvglbfynzlkdziftg.supabase.co` | URL do Supabase |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtemh2Z2xiZnluemxrZHppZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzE2OTksImV4cCI6MjA3ODA0NzY5OX0.60AYGJXEm_zOnbt2BacPm2ov6blc3L6pnTdq033B6uk` | Chave anônima |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtemh2Z2xiZnluemxrZHppZnRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ3MTY5OSwiZXhwIjoyMDc4MDQ3Njk5fQ.XItjjS6HKhpWvtg9iTaW6Yq8xVvcvjLrdEG9RuDGTwE` | **🔒 CHAVE SECRETA - Não compartilhar** |
| `JWT_SECRET` | `49184e75dd708cafbe3091b56cba89c689c9b864faf258b69281a547c5838081` | Chave secreta para JWT |
| `CORS_ORIGIN` | `https://projeto-crm-exata.vercel.app` | **⚠️ ATUALIZAR após primeiro deploy** |
| `DISCADOR_WEBHOOK_SECRET` | `seu_webhook_secret_aqui` | Secret do webhook (configurar depois) |
| `DISCADOR_API_URL` | `https://api.discador.com` | URL da API do discador (configurar depois) |
| `DISCADOR_API_KEY` | `sua_chave_api_discador` | Chave da API do discador (configurar depois) |
| `MAX_FILE_SIZE` | `10485760` | Tamanho máximo de arquivo (10MB) |
| `ALLOWED_FILE_TYPES` | `image/jpeg,image/png,image/webp,application/pdf` | Tipos de arquivo permitidos |

## 🚀 Passo a Passo para Adicionar

### Para cada variável:

1. **Clique em "Add New"** (ou "Add Environment Variable")
2. **Digite o Nome** (ex: `VITE_SUPABASE_URL`)
3. **Digite o Valor** (cole o valor correspondente)
4. **Marque os ambientes:**
   - ✅ **Production** (obrigatório)
   - ✅ **Preview** (recomendado)
   - ✅ **Development** (opcional, para testes locais)
5. **Clique em "Save"**

### Repita para TODAS as variáveis listadas acima

## ⚠️ IMPORTANTE: Variáveis que Precisam ser Atualizadas Após Deploy

### 1. `VITE_API_URL`
- **Valor inicial:** Pode deixar vazio ou usar `https://projeto-crm-exata.vercel.app`
- **Após primeiro deploy:** Atualize com a URL real do seu projeto Vercel
- **Como descobrir:** Após o deploy, a Vercel fornecerá uma URL como `https://projeto-crm-exata-xxx.vercel.app`

### 2. `CORS_ORIGIN`
- **Valor inicial:** Pode deixar vazio ou usar `https://projeto-crm-exata.vercel.app`
- **Após primeiro deploy:** Atualize com a URL real do frontend
- **Deve ser:** A URL exata do seu frontend (sem barra no final)

## 📝 Ordem Recomendada de Configuração

1. ✅ **Primeiro:** Configure todas as variáveis do Supabase
2. ✅ **Segundo:** Configure `JWT_SECRET`
3. ✅ **Terceiro:** Configure variáveis do frontend (`VITE_*`)
4. ✅ **Quarto:** Configure variáveis do backend
5. ✅ **Quinto:** Faça o primeiro deploy
6. ✅ **Sexto:** Atualize `VITE_API_URL` e `CORS_ORIGIN` com a URL real
7. ✅ **Sétimo:** Faça um novo deploy (ou aguarde auto deploy)

## 🔍 Como Verificar se Está Correto

1. **Após adicionar todas as variáveis:**
   - Você deve ver todas listadas na página
   - Cada uma deve ter os checkboxes marcados (Production/Preview/Development)

2. **Após o deploy:**
   - Verifique os logs do deploy
   - Teste a aplicação
   - Se houver erros de "environment variable not found", verifique se adicionou corretamente

## 🧪 Teste Rápido

Após configurar todas as variáveis:

1. **Faça um novo deploy** (ou aguarde auto deploy)
2. **Acesse a URL do projeto**
3. **Verifique o console do navegador** (F12)
4. **Se houver erros relacionados a variáveis**, verifique:
   - Se o nome está correto (case-sensitive)
   - Se marcou para o ambiente correto (Production)
   - Se o valor está correto (sem espaços extras)

## 🔒 Segurança

- ✅ **NUNCA** commite arquivos `.env` no Git (já está no `.gitignore`)
- ✅ **NUNCA** compartilhe `SUPABASE_SERVICE_KEY` publicamente
- ✅ **NUNCA** compartilhe `JWT_SECRET` publicamente
- ✅ Use valores diferentes para Production e Development (se possível)

## 📋 Checklist Final

- [ ] Todas as variáveis do frontend (`VITE_*`) adicionadas
- [ ] Todas as variáveis do backend adicionadas
- [ ] Todas marcadas para "Production"
- [ ] Todas marcadas para "Preview" (recomendado)
- [ ] Valores verificados (sem espaços extras)
- [ ] Após primeiro deploy, atualizar `VITE_API_URL`
- [ ] Após primeiro deploy, atualizar `CORS_ORIGIN`

## 🆘 Problemas Comuns

### "Environment variable not found"
- **Solução:** Verifique se o nome está exatamente correto (case-sensitive)
- **Solução:** Verifique se marcou para o ambiente correto (Production)

### "Invalid API key"
- **Solução:** Verifique se copiou o valor completo (sem espaços)
- **Solução:** Verifique se está usando a chave correta do Supabase

### CORS errors
- **Solução:** Verifique se `CORS_ORIGIN` está com a URL correta do frontend
- **Solução:** Verifique se não tem barra no final da URL

## 📞 Próximos Passos

1. **Configure todas as variáveis agora**
2. **Faça um novo deploy** (ou aguarde auto deploy)
3. **Teste a aplicação**
4. **Atualize `VITE_API_URL` e `CORS_ORIGIN` após primeiro deploy**

