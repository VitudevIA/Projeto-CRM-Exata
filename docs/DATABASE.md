# Documentação do Banco de Dados

## Estrutura Multi-tenant

O sistema utiliza uma arquitetura multi-tenant onde todos os dados são isolados por `tenant_id`. Cada organização possui seu próprio `tenant_id` que é usado em todas as tabelas.

## Tabelas Principais

### tenants
Organizações/empresas do sistema.

- `id` (UUID, PK)
- `name` (VARCHAR)
- `slug` (VARCHAR, UNIQUE)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### users
Usuários do sistema (extensão de auth.users do Supabase).

- `id` (UUID, PK, FK -> auth.users)
- `tenant_id` (UUID, FK -> tenants)
- `email` (VARCHAR)
- `full_name` (VARCHAR)
- `phone` (VARCHAR)
- `avatar_url` (TEXT)
- `is_active` (BOOLEAN)
- `last_login` (TIMESTAMP)

### user_roles
Roles dos usuários por tenant.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `user_id` (UUID, FK -> auth.users)
- `role` (ENUM: 'admin', 'funcionario')

### clients
Clientes/Leads do sistema.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `cpf` (VARCHAR, UNIQUE por tenant)
- `name` (VARCHAR)
- `phone` (VARCHAR)
- `is_whatsapp` (BOOLEAN)
- `email` (VARCHAR)
- `current_stage_id` (UUID, FK -> client_stages)
- `status` (VARCHAR: 'ativo', 'perdido', 'contratado')
- `loss_reason_id` (UUID, FK -> loss_reasons)
- `assigned_to` (UUID, FK -> users)
- Campos opcionais: city, state, address, zip_code, birth_date, etc.

### client_stages
Estágios do funil de vendas.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `name` (VARCHAR)
- `stage_type` (ENUM: 'lead', 'qualificacao', 'analise', 'proposta', 'contratacao', 'perdido', 'ganho')
- `order_index` (INTEGER)
- `color` (VARCHAR - hex color)

### loss_reasons
Motivos de perda por etapa.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `stage_type` (ENUM)
- `reason` (VARCHAR)
- `description` (TEXT)
- `order_index` (INTEGER)

### client_history
Histórico completo de interações.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `client_id` (UUID, FK -> clients)
- `interaction_type` (ENUM)
- `title` (VARCHAR)
- `description` (TEXT)
- `metadata` (JSONB)
- `created_by` (UUID, FK -> users)

### tasks
Tarefas e agendamentos.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `client_id` (UUID, FK -> clients, opcional)
- `title` (VARCHAR)
- `description` (TEXT)
- `status` (ENUM: 'pending', 'in_progress', 'completed', 'cancelled')
- `priority` (ENUM: 'low', 'medium', 'high', 'urgent')
- `due_date` (TIMESTAMP)
- `assigned_to` (UUID, FK -> users)

### proposals
Propostas de crédito.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `client_id` (UUID, FK -> clients)
- `loan_amount` (DECIMAL)
- `interest_rate` (DECIMAL)
- `installments` (INTEGER)
- `installment_value` (DECIMAL)
- `status` (ENUM: 'draft', 'sent', 'accepted', 'rejected', 'expired')

### documents
Documentos digitalizados.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `client_id` (UUID, FK -> clients)
- `document_type` (ENUM)
- `file_name` (VARCHAR)
- `file_path` (TEXT - path no Supabase Storage)
- `file_size` (BIGINT)
- `mime_type` (VARCHAR)

### call_logs
Logs de chamadas do discador.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `client_id` (UUID, FK -> clients, opcional)
- `call_id` (VARCHAR - ID do discador)
- `direction` (ENUM: 'inbound', 'outbound')
- `status` (ENUM)
- `phone_number` (VARCHAR)
- `duration_seconds` (INTEGER)
- `recording_url` (TEXT)
- `tabulation` (VARCHAR)
- `operator_id` (UUID, FK -> users)

### audit_logs
Log de auditoria.

- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `user_id` (UUID, FK -> users)
- `action` (ENUM)
- `entity_type` (VARCHAR)
- `entity_id` (UUID)
- `old_values` (JSONB)
- `new_values` (JSONB)
- `ip_address` (INET)
- `user_agent` (TEXT)

## Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado com políticas que:

1. Isolam dados por `tenant_id`
2. Controlam acesso baseado em roles (admin vê tudo, funcionário vê apenas seus próprios)
3. Permitem operações CRUD conforme permissões

## Funções PostgreSQL

### validate_cpf(cpf_text VARCHAR)
Valida CPF usando algoritmo de verificação de dígitos.

### get_user_tenant_id()
Retorna o `tenant_id` do usuário autenticado.

### get_user_role(p_tenant_id UUID)
Retorna o role do usuário para um tenant específico.

### create_audit_log(...)
Cria log de auditoria.

### seed_tenant_defaults(p_tenant_id UUID)
Cria dados padrão (estágios e motivos de perda) para um tenant.

## Índices

Índices criados para otimização:

- CPF, telefone, email em `clients`
- `tenant_id` em todas as tabelas
- `created_at` em tabelas de histórico
- Full-text search em `clients.name` usando `pg_trgm`

## Migrações

As migrações estão em `supabase/migrations/`:

1. `001_initial_schema.sql` - Schema inicial
2. `002_rls_policies.sql` - Políticas RLS
3. `003_seed_data.sql` - Função de seed

