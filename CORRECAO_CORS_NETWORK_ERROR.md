# ✅ Correção: Erro CORS e Network Error no Login

## 🔍 Análise do Problema

**Erros identificados:**
1. **CORS Error**: `Access to XMLHttpRequest at 'https://projeto-crm-exata.vercel.app/api/auth/login' from origin 'https://projetocrmexata.vercel.app' has been blocked by CORS policy`
2. **Network Error**: `POST https://projeto-crm-exata.vercel.app/api/auth/login net::ERR_FAILED`
3. **404 Error**: Alguns recursos retornando 404

**Causa raiz:**
- O backend estava configurado para aceitar apenas `CORS_ORIGIN` específico
- O frontend estava usando URL absoluta em produção ao invés de relativa
- URLs diferentes entre frontend (`projetocrmexata.vercel.app`) e API (`projeto-crm-exata.vercel.app`)

## ✅ Soluções Aplicadas

### 1. CORS Configurado Dinamicamente

**Arquivo:** `backend/src/index.ts`

```typescript
// Configurar CORS para aceitar múltiplos origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

// Adicionar origins da Vercel automaticamente
if (process.env.VERCEL) {
  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) {
    allowedOrigins.push(`https://${vercelUrl}`);
  }
  // Adicionar também o domínio de produção se existir
  if (process.env.VERCEL_ENV === "production") {
    allowedOrigins.push("https://projetocrmexata.vercel.app");
    allowedOrigins.push("https://projeto-crm-exata.vercel.app");
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);
      
      // Verificar se o origin está na lista de permitidos
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        return callback(null, true);
      }
      
      // Em desenvolvimento, permitir qualquer origin
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

**Benefícios:**
- ✅ Aceita múltiplos origins (desenvolvimento, preview, produção)
- ✅ Detecta automaticamente URLs da Vercel
- ✅ Permite requisições sem origin (útil para testes)
- ✅ Em desenvolvimento, permite qualquer origin

### 2. Frontend Usando Requisições Relativas

**Arquivo:** `frontend/src/services/api.ts`

```typescript
// Sempre usar requisições relativas - o vercel.json faz o rewrite para /api/index
// Isso funciona tanto em desenvolvimento (proxy do Vite) quanto em produção (rewrite da Vercel)
const baseURL = "/api";
```

**Antes:**
```typescript
const baseURL = isDevelopment ? "/api" : `${apiUrl}/api`;
```

**Por que funciona:**
- ✅ Em desenvolvimento: Vite proxy redireciona `/api` para `http://localhost:3000`
- ✅ Em produção: Vercel rewrite redireciona `/api/*` para `/api/index`
- ✅ Não depende de URLs absolutas que podem mudar
- ✅ Funciona com qualquer domínio da Vercel

## 📋 Como Funciona

### Fluxo de Requisição

**Desenvolvimento:**
```
Frontend (localhost:5173) → /api/auth/login
  ↓
Vite Proxy → http://localhost:3000/api/auth/login
  ↓
Backend Express → Responde
```

**Produção (Vercel):**
```
Frontend (projetocrmexata.vercel.app) → /api/auth/login
  ↓
Vercel Rewrite (vercel.json) → /api/index
  ↓
Serverless Function (api/index.ts) → Backend Express → Responde
```

### CORS em Produção

O CORS agora:
1. Detecta automaticamente o domínio da Vercel
2. Aceita requisições do frontend (mesmo domínio ou subdomínios)
3. Permite métodos HTTP necessários
4. Permite headers de autenticação

## 🚀 Próximos Passos

1. **Fazer commit e push:**
   ```bash
   git add backend/src/index.ts frontend/src/services/api.ts
   git commit -m "fix: Corrigir CORS e usar requisições relativas para resolver network error"
   git push origin main
   ```

2. **Aguardar deploy:**
   - O Vercel fará deploy automático
   - O CORS será configurado corretamente
   - As requisições usarão URLs relativas
   - O login deve funcionar

## ✅ Resultado Esperado

Após essa correção:
- ✅ CORS aceita requisições do frontend
- ✅ Requisições usam URLs relativas (`/api`)
- ✅ Funciona em desenvolvimento e produção
- ✅ Login deve funcionar sem erros de rede
- ✅ Todas as rotas da API devem funcionar

## ⚠️ Configuração Opcional na Vercel

Se quiser configurar manualmente o CORS_ORIGIN na Vercel:

1. Acesse: https://vercel.com/vitu-dev-ias-projects/projeto_crm_exata/settings/environment-variables
2. Adicione:
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://projetocrmexata.vercel.app,https://projeto-crm-exata.vercel.app`
   - **Environment**: Production, Preview, Development

**Nota:** Não é necessário, pois o código agora detecta automaticamente os domínios da Vercel.

---

**Status:** ✅ Correções aplicadas
**Próximo passo:** Commit e push



