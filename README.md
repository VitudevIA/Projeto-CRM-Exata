# CRM Crédito Consignado - MVP

Sistema CRM completo para gestão de crédito consignado com integração de discador, funil de vendas, gestão de clientes e relatórios.

## Stack Tecnológico

- **Frontend**: React.js + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deploy**: Vercel
- **Autenticação**: Supabase Auth (com 2FA)

## Estrutura do Projeto

```
.
├── frontend/          # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── contexts/     # Contextos React
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Serviços (API, Supabase)
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilitários
├── backend/          # API Express
│   ├── src/
│   │   ├── routes/      # Rotas da API
│   │   ├── middleware/   # Middlewares
│   │   ├── services/     # Lógica de negócio
│   │   ├── utils/        # Utilitários
│   │   └── config/       # Configurações
├── supabase/         # Migrações e configurações do banco
│   └── migrations/   # SQL migrations
└── docs/             # Documentação
```

## Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Conta no Supabase
- Conta na Vercel (para deploy)

## Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configurar Supabase

1. Crie um projeto no Supabase
2. Execute as migrações em `supabase/migrations/` na ordem:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_seed_data.sql`

### 3. Configurar Variáveis de Ambiente

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
DISCADOR_WEBHOOK_SECRET=your_webhook_secret
DISCADOR_API_URL=your_discador_api_url
DISCADOR_API_KEY=your_discador_api_key
```

### 4. Criar Bucket no Supabase Storage

Crie um bucket chamado `documents` no Supabase Storage com políticas de acesso apropriadas.

### 5. Iniciar Desenvolvimento

```bash
# Na raiz do projeto
npm run dev
```

Isso iniciará:
- Frontend em `http://localhost:5173`
- Backend em `http://localhost:3000`

## Scripts Disponíveis

- `npm run dev` - Inicia frontend e backend em modo desenvolvimento
- `npm run build` - Build de produção
- `npm run lint` - Executa linter em todos os projetos
- `npm run format` - Formata código com Prettier

## Funcionalidades Implementadas

### ✅ Core
- [x] Autenticação e autorização (2FA pronto)
- [x] Sistema multi-tenant
- [x] Gestão de usuários e permissões
- [x] Row Level Security (RLS)

### ✅ Clientes
- [x] CRUD completo de clientes
- [x] Busca e filtros
- [x] Histórico de interações
- [x] Tracking de perdas

### ✅ Funil de Vendas
- [x] Estágios configuráveis
- [x] Movimentação entre estágios
- [x] Motivos de perda por etapa

### ✅ Tarefas
- [x] CRUD de tarefas
- [x] Agendamentos
- [x] Associação com clientes

### ✅ Propostas
- [x] CRUD de propostas
- [x] Cálculo de parcelas
- [x] Múltiplas propostas por cliente

### ✅ Documentos
- [x] Upload de documentos
- [x] Compressão automática (WebP para imagens)
- [x] Armazenamento no Supabase Storage

### ✅ Discador
- [x] Webhook do Fortics BPX
- [x] Click-to-call
- [x] Sincronização de mailing
- [x] Tabulação de chamadas

### ✅ Relatórios
- [x] Relatório de conversão
- [x] Relatório de produtividade
- [x] Relatório de motivos de perda
- [x] Relatório de tabulação

### ✅ Importação
- [x] Importação em massa (CSV/Excel)
- [x] Preview antes de importar
- [x] Validação de dados

### ✅ Simulador
- [x] Calculadora de crédito
- [x] Cálculo de parcelas (Sistema Price)

## Documentação

- [Planejamento MVP](./PLANEJAMENTO_MVP.md) - Requisitos completos
- [Documentação da API](./docs/API.md) - Endpoints da API
- [Documentação do Banco](./docs/DATABASE.md) - Schema e estrutura

## Deploy

### Vercel

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático

O `vercel.json` está configurado para:
- Frontend: Build estático
- Backend: Serverless functions

## Funcionalidades Implementadas - Status Final

### ✅ Todas as Funcionalidades do MVP

- [x] **Dashboard completo** com KPIs e métricas
- [x] **Gestão completa de clientes** (CRUD, busca, filtros, histórico)
- [x] **Funil de vendas** com drag-and-drop (Kanban)
- [x] **Sistema de tarefas** com agendamentos
- [x] **Simulador de crédito** integrado
- [x] **Relatórios completos** (conversão, produtividade, perdas, tabulação)
- [x] **Interface de discador** (tabulação, painel de chamada, click-to-call)
- [x] **Importação em massa** (CSV/Excel com preview)
- [x] **Tracking de perdas** com motivos por etapa
- [x] **Sistema de auditoria** completo (apenas admins)
- [x] **Responsividade completa** (mobile-first)
- [x] **Testes unitários** configurados (Jest)
- [x] **Documentação completa** (API, Banco, Setup, Guia do Usuário)

## Próximos Passos (Opcionais)

Melhorias futuras que podem ser implementadas:
- Exportação de relatórios em PDF/Excel (estrutura pronta)
- Sistema de notificações push mais robusto
- Testes E2E com Playwright
- Calendário visual para tarefas
- Gráficos mais avançados no dashboard

## Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue.

\n# Teste após reconexão - Fri, Nov  7, 2025  3:36:12 PM
