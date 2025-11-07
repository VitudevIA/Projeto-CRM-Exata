# Guia de Deploy na Vercel

## Pré-requisitos

- Conta na Vercel (gratuita): https://vercel.com
- Projeto no GitHub (ou GitLab/Bitbucket)
- Variáveis de ambiente configuradas

## Processo de Deploy

### Opção 1: Deploy via GitHub (Recomendado)

#### Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com
2. Clique em **New repository**
3. Nome: `crm-credito-consignado` (ou outro nome)
4. Marque como **Private** (recomendado)
5. **NÃO** inicialize com README, .gitignore ou license
6. Clique em **Create repository**

#### Passo 2: Fazer Push do Código

No terminal, na raiz do projeto:

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit - MVP CRM Crédito Consignado"

# Adicionar remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/crm-credito-consignado.git

# Fazer push
git branch -M main
git push -u origin main
```

#### Passo 3: Conectar à Vercel

1. Acesse https://vercel.com
2. Faça login (pode usar GitHub)
3. Clique em **Add New** > **Project**
4. Importe o repositório `crm-credito-consignado`
5. A Vercel detectará automaticamente a estrutura do projeto

#### Passo 4: Configurar Build Settings

A Vercel detectará automaticamente, mas verifique:

**Root Directory**: Deixe vazio (raiz do projeto)

**Build Command**: 
```bash
cd frontend && npm install && npm run build
```

**Output Directory**: 
```
frontend/dist
```

**Install Command**: 
```bash
npm install
```

#### Passo 5: Configurar Variáveis de Ambiente

Na tela de configuração do projeto, vá em **Environment Variables** e adicione:

**Para o Frontend:**
```
VITE_SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_API_URL=https://seu-projeto.vercel.app
VITE_APP_NAME=CRM Crédito Consignado
```

**Para o Backend (API Routes):**
```
NODE_ENV=production
SUPABASE_URL=https://bmzhvglbfynzlkdziftg.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_KEY=sua_service_key
JWT_SECRET=seu_jwt_secret
CORS_ORIGIN=https://seu-projeto.vercel.app
DISCADOR_WEBHOOK_SECRET=seu_webhook_secret
DISCADOR_API_URL=url_do_discador
DISCADOR_API_KEY=chave_do_discador
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

**Importante**: 
- Marque todas como **Production**, **Preview** e **Development**
- A `VITE_API_URL` deve apontar para a URL da Vercel após o primeiro deploy

#### Passo 6: Ajustar vercel.json

O arquivo `vercel.json` já está configurado, mas pode precisar de ajustes:

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

#### Passo 7: Deploy

1. Clique em **Deploy**
2. Aguarde o build completar (pode levar 2-5 minutos)
3. Após o deploy, você receberá uma URL: `https://seu-projeto.vercel.app`

#### Passo 8: Atualizar Variáveis de Ambiente

Após o primeiro deploy, atualize `VITE_API_URL` nas variáveis de ambiente para apontar para a URL da Vercel.

### Opção 2: Deploy via Vercel CLI (Alternativa)

Se preferir não usar GitHub:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Na raiz do projeto
vercel login

# Deploy
vercel

# Seguir as instruções interativas
# Configurar variáveis de ambiente via CLI ou Dashboard
```

## Estrutura de Deploy na Vercel

A Vercel funciona assim:

1. **Frontend (Static)**: 
   - Build do Vite gera arquivos estáticos em `frontend/dist`
   - Servidos diretamente pela CDN da Vercel

2. **Backend (Serverless Functions)**:
   - Arquivos em `backend/src` são convertidos em serverless functions
   - Cada rota vira uma função Lambda
   - Acessíveis via `/api/*`

## Configuração de Rotas

A Vercel usa o arquivo `vercel.json` para configurar:

- **Rewrites**: Redireciona `/api/*` para as funções serverless
- **Functions**: Define runtime Node.js 18.x para APIs

## Variáveis de Ambiente por Ambiente

Você pode ter variáveis diferentes para:

- **Production**: Produção (vercel.app)
- **Preview**: Branches e PRs
- **Development**: Ambiente local

Configure cada uma separadamente no Dashboard da Vercel.

## Domínio Customizado

1. No Dashboard da Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. SSL é automático (Let's Encrypt)

## Monitoramento

- **Logs**: Dashboard > Deployments > Clique no deployment > Logs
- **Analytics**: Dashboard > Analytics (plano Pro)
- **Errors**: Dashboard > Errors

## Troubleshooting

### Erro: "Module not found"
- Verifique se todas as dependências estão em `package.json`
- Execute `npm install` localmente para verificar

### Erro: "Environment variable not found"
- Verifique se todas as variáveis foram adicionadas no Dashboard
- Certifique-se de marcar para Production/Preview/Development

### Erro: "Build failed"
- Veja os logs no Dashboard
- Teste o build localmente: `npm run build`

### API não funciona
- Verifique se as rotas estão em `backend/src/routes/`
- Verifique se `vercel.json` está configurado corretamente
- Veja os logs das funções serverless

## Próximos Passos Após Deploy

1. Teste todas as funcionalidades
2. Configure domínio customizado (opcional)
3. Configure webhook do discador para apontar para `https://seu-projeto.vercel.app/api/calls/webhook`
4. Configure monitoramento e alertas
5. Configure backup automático do banco (Supabase faz isso automaticamente)

## Dicas

- Use **Preview Deployments** para testar antes de fazer merge
- Configure **Branch Protection** no GitHub
- Use **Environment Variables** para diferentes ambientes
- Monitore os **Logs** regularmente
- Configure **Analytics** para entender uso

