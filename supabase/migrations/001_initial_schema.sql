-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- TENANTS (Multi-tenant support)
-- ============================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_active ON tenants(is_active);

-- ============================================
-- USER ROLES
-- ============================================
CREATE TYPE user_role_type AS ENUM ('admin', 'funcionario');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'funcionario',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_user_roles_tenant_user ON user_roles(tenant_id, user_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);

-- ============================================
-- USERS (Extension of auth.users)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- CLIENT STAGES (Funil de Vendas)
-- ============================================
CREATE TYPE client_stage_type AS ENUM (
  'lead',
  'qualificacao',
  'analise',
  'proposta',
  'contratacao',
  'perdido',
  'ganho'
);

CREATE TABLE client_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  stage_type client_stage_type NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(7), -- Hex color
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, stage_type)
);

CREATE INDEX idx_client_stages_tenant ON client_stages(tenant_id);
CREATE INDEX idx_client_stages_order ON client_stages(tenant_id, order_index);

-- ============================================
-- LOSS REASONS (Motivos de Perda)
-- ============================================
CREATE TABLE loss_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stage_type client_stage_type NOT NULL,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_loss_reasons_tenant_stage ON loss_reasons(tenant_id, stage_type);

-- ============================================
-- CLIENTS (Clientes/Leads)
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cpf VARCHAR(14) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  is_whatsapp BOOLEAN DEFAULT false,
  email VARCHAR(255),
  
  -- Dados opcionais
  city VARCHAR(100),
  state VARCHAR(2),
  address TEXT,
  zip_code VARCHAR(10),
  birth_date DATE,
  registration_number VARCHAR(50), -- Matrícula
  
  -- Campos específicos do nicho
  nis_pis VARCHAR(20),
  organization VARCHAR(255), -- Órgão/Entidade
  available_margin DECIMAL(12, 2), -- Margem Consignável
  
  -- Funil
  current_stage_id UUID REFERENCES client_stages(id),
  status VARCHAR(20) DEFAULT 'ativo', -- ativo, perdido, contratado
  loss_reason_id UUID REFERENCES loss_reasons(id),
  loss_observations TEXT,
  loss_date TIMESTAMP WITH TIME ZONE,
  
  -- Origem
  lead_source VARCHAR(100),
  
  -- Responsável
  assigned_to UUID REFERENCES users(id),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  UNIQUE(tenant_id, cpf)
);

CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_clients_cpf ON clients(cpf);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_stage ON clients(current_stage_id);
CREATE INDEX idx_clients_assigned ON clients(assigned_to);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_name_trgm ON clients USING gin(name gin_trgm_ops); -- Full text search

-- ============================================
-- CLIENT HISTORY (Histórico de Interações)
-- ============================================
CREATE TYPE interaction_type AS ENUM (
  'call',
  'email',
  'meeting',
  'note',
  'stage_change',
  'document_upload',
  'proposal_created',
  'task_created',
  'task_completed'
);

CREATE TABLE client_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  title VARCHAR(255),
  description TEXT,
  metadata JSONB, -- Flexible data storage
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_history_client ON client_history(client_id);
CREATE INDEX idx_client_history_tenant ON client_history(tenant_id);
CREATE INDEX idx_client_history_type ON client_history(interaction_type);
CREATE INDEX idx_client_history_created ON client_history(created_at DESC);

-- ============================================
-- TASKS (Tarefas e Agendamentos)
-- ============================================
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_tasks_client ON tasks(client_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- PROPOSALS (Propostas de Crédito)
-- ============================================
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  loan_amount DECIMAL(12, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  installments INTEGER NOT NULL,
  installment_value DECIMAL(12, 2) NOT NULL,
  status proposal_status DEFAULT 'draft',
  notes TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_proposals_tenant ON proposals(tenant_id);
CREATE INDEX idx_proposals_client ON proposals(client_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- ============================================
-- DOCUMENTS (Documentos Digitalizados)
-- ============================================
CREATE TYPE document_type AS ENUM (
  'rg',
  'cpf',
  'comprovante_renda',
  'comprovante_residencia',
  'declaracao',
  'outro'
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- ============================================
-- CALL LOGS (Logs de Chamadas do Discador)
-- ============================================
CREATE TYPE call_status AS ENUM ('initiated', 'answered', 'no_answer', 'busy', 'failed');
CREATE TYPE call_direction AS ENUM ('inbound', 'outbound');

CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  call_id VARCHAR(100), -- ID from discador
  direction call_direction NOT NULL,
  status call_status NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  duration_seconds INTEGER,
  recording_url TEXT,
  tabulation VARCHAR(100), -- Sem Interesse, Ligação Muda, etc.
  notes TEXT,
  operator_id UUID REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_call_logs_tenant ON call_logs(tenant_id);
CREATE INDEX idx_call_logs_client ON call_logs(client_id);
CREATE INDEX idx_call_logs_operator ON call_logs(operator_id);
CREATE INDEX idx_call_logs_started ON call_logs(started_at DESC);

-- ============================================
-- AUDIT LOGS (Log de Auditoria)
-- ============================================
CREATE TYPE audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'view',
  'export',
  'login',
  'logout',
  'permission_change'
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action audit_action NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'client', 'task', 'proposal', etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_stages_updated_at BEFORE UPDATE ON client_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log(
  p_tenant_id UUID,
  p_user_id UUID,
  p_action audit_action,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    tenant_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    p_tenant_id,
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate CPF
CREATE OR REPLACE FUNCTION validate_cpf(cpf_text VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  cpf_clean VARCHAR;
  i INTEGER;
  digit1 INTEGER;
  digit2 INTEGER;
  sum_val INTEGER;
BEGIN
  -- Remove non-numeric characters
  cpf_clean := regexp_replace(cpf_text, '[^0-9]', '', 'g');
  
  -- Check length
  IF length(cpf_clean) != 11 THEN
    RETURN false;
  END IF;
  
  -- Check if all digits are the same
  IF cpf_clean ~ '^(\d)\1+$' THEN
    RETURN false;
  END IF;
  
  -- Calculate first check digit
  sum_val := 0;
  FOR i IN 1..9 LOOP
    sum_val := sum_val + CAST(substring(cpf_clean, i, 1) AS INTEGER) * (11 - i);
  END LOOP;
  digit1 := 11 - (sum_val % 11);
  IF digit1 >= 10 THEN
    digit1 := 0;
  END IF;
  
  -- Calculate second check digit
  sum_val := 0;
  FOR i IN 1..10 LOOP
    sum_val := sum_val + CAST(substring(cpf_clean, i, 1) AS INTEGER) * (12 - i);
  END LOOP;
  digit2 := 11 - (sum_val % 11);
  IF digit2 >= 10 THEN
    digit2 := 0;
  END IF;
  
  -- Validate check digits
  RETURN (
    CAST(substring(cpf_clean, 10, 1) AS INTEGER) = digit1 AND
    CAST(substring(cpf_clean, 11, 1) AS INTEGER) = digit2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add CPF validation constraint (commented out for now, can be enabled if needed)
-- ALTER TABLE clients ADD CONSTRAINT clients_cpf_valid CHECK (validate_cpf(cpf));

