# Explicação do Deploy na Vercel

## Como Funciona o Deploy na Vercel

### 1. Estrutura do Projeto

O projeto tem uma estrutura monorepo:
```
.
├── frontend/     # React app (build estático)
├── backend/      # Express API (serverless functions)
└── vercel.json   # Configuração do deploy
```

### 2. Processo de Deploy

#### Opção A: Via GitHub (Recomendado - Mais Fácil)

**Por que usar GitHub?**
- Deploy automático a cada push
- Preview deployments para cada PR
- Histórico de versões
- Rollback fácil
- CI/CD integrado

**Passo a Passo:**

1. **Criar Repositório no GitHub**
   ```bash
   # No terminal, na raiz do projeto
   git init
   git add .
   git commit -m "Initial commit"
   
   # Criar repositório no GitHub (via site)
   # Depois:
   git remote add origin https://github.com/SEU_USUARIO/crm-credito-consignado.git
   git branch -M main
   git push -u origin main
   ```

2. **Conectar à Vercel**
   - Acesse vercel.com
   - Login com GitHub
   - Clique em "Add New Project"
   - Selecione o repositório
   - A Vercel detecta automaticamente a estrutura

3. **Configurar Build**
   - A Vercel detecta que há um `frontend/` e `backend/`
   - Configure as variáveis de ambiente
   - Clique em "Deploy"

4. **Resultado**
   - Frontend: Servido como site estático (CDN)
   - Backend: Convertido em serverless functions
   - Tudo em uma única URL

#### Opção B: Via Vercel CLI (Sem GitHub)

**Quando usar?**
- Se você não quer usar GitHub ainda
- Para testes rápidos
- Para deploy manual

**Passo a Passo:**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (na raiz do projeto)
vercel

# Seguir instruções interativas
# Configurar variáveis via CLI ou Dashboard
```

### 3. Como a Vercel Processa o Projeto

#### Frontend (React + Vite)

1. **Build**: Executa `cd frontend && npm install && npm run build`
2. **Output**: Gera arquivos estáticos em `frontend/dist`
3. **Serving**: Servidos via CDN global da Vercel
4. **URL**: `https://seu-projeto.vercel.app/`

#### Backend (Express API)

1. **Detecção**: Vercel detecta arquivos em `backend/src/`
2. **Conversão**: Cada rota vira uma serverless function
3. **Runtime**: Node.js 18.x
4. **URL**: `https://seu-projeto.vercel.app/api/*`

**Exemplo:**
- `backend/src/routes/clients.ts` → `https://seu-projeto.vercel.app/api/clients`
- `backend/src/routes/auth.ts` → `https://seu-projeto.vercel.app/api/auth`

### 4. Arquivo vercel.json

O arquivo `vercel.json` configura:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"  // Redireciona /api/* para serverless functions
    }
  ]
}
```

**O que faz:**
- Define comando de build
- Define diretório de saída
- Configura rewrites para APIs

### 5. Variáveis de Ambiente

**Onde configurar:**
- Dashboard da Vercel > Projeto > Settings > Environment Variables

**Tipos:**
- **Production**: Apenas produção
- **Preview**: Branches e PRs
- **Development**: Ambiente local (não usado na Vercel)

**Importante:**
- Frontend: Variáveis começam com `VITE_`
- Backend: Todas as outras
- Atualize `VITE_API_URL` após primeiro deploy com a URL da Vercel

### 6. Fluxo Completo

```
GitHub Push
    ↓
Vercel Detecta Mudanças
    ↓
Instala Dependências (npm install)
    ↓
Build Frontend (npm run build)
    ↓
Converte Backend em Serverless Functions
    ↓
Deploy na CDN Global
    ↓
URL Disponível: https://seu-projeto.vercel.app
```

### 7. Vantagens do Deploy na Vercel

✅ **Gratuito** para projetos pessoais
✅ **CDN Global** (rápido em qualquer lugar)
✅ **SSL Automático** (HTTPS)
✅ **Deploy Automático** (a cada push)
✅ **Preview Deployments** (testar antes de merge)
✅ **Rollback Fácil** (voltar versão anterior)
✅ **Logs Integrados** (debug fácil)
✅ **Escalável** (serverless = escala automática)

### 8. Limitações do Plano Gratuito

- 100GB bandwidth/mês
- 100 horas de função serverless/mês
- Sem analytics avançado
- Sem domínio customizado (pode usar vercel.app)

### 9. Checklist Antes do Deploy

- [ ] Código commitado no Git
- [ ] Migrações executadas no Supabase
- [ ] Bucket `documents` criado
- [ ] Variáveis de ambiente preparadas
- [ ] Build testado localmente (`npm run build`)
- [ ] Testes básicos feitos

### 10. Após o Deploy

1. **Testar a URL**: Acesse `https://seu-projeto.vercel.app`
2. **Verificar Logs**: Dashboard > Deployments > Logs
3. **Atualizar Variáveis**: Se necessário, atualize `VITE_API_URL`
4. **Configurar Webhook**: Apontar discador para `/api/calls/webhook`
5. **Testar Funcionalidades**: Login, CRUD, etc.

## Resumo: Por que GitHub + Vercel?

**Sem GitHub:**
- Deploy manual via CLI
- Sem histórico de versões
- Sem preview deployments
- Mais trabalho manual

**Com GitHub:**
- Deploy automático
- Preview para cada PR
- Histórico completo
- Rollback fácil
- CI/CD integrado
- **Recomendado!**

## Próximos Passos Recomendados

1. **Criar repositório no GitHub** (5 minutos)
2. **Fazer push do código** (2 minutos)
3. **Conectar à Vercel** (5 minutos)
4. **Configurar variáveis** (5 minutos)
5. **Deploy!** (2-5 minutos)

**Total: ~20 minutos para ter o sistema no ar!**

