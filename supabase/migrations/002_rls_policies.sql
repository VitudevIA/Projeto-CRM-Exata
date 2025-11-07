-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Get user's tenant_id
-- ============================================
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
DECLARE
  user_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO user_tenant_id
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Get user's role
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(p_tenant_id UUID)
RETURNS user_role_type AS $$
DECLARE
  user_role user_role_type;
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE tenant_id = p_tenant_id
    AND user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'funcionario'::user_role_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TENANTS POLICIES
-- ============================================
-- Users can view their own tenant
CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- USER ROLES POLICIES
-- ============================================
-- Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (
    user_id = auth.uid() OR
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins can manage roles in their tenant
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role(tenant_id) = 'admin'
  );

-- ============================================
-- USERS POLICIES
-- ============================================
-- Users can view users in their tenant
CREATE POLICY "Users can view tenant users"
  ON users FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Admins can manage all users in their tenant
CREATE POLICY "Admins can manage tenant users"
  ON users FOR ALL
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role(tenant_id) = 'admin'
  );

-- ============================================
-- CLIENT STAGES POLICIES
-- ============================================
-- Users can view stages in their tenant
CREATE POLICY "Users can view tenant stages"
  ON client_stages FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- Admins can manage stages
CREATE POLICY "Admins can manage stages"
  ON client_stages FOR ALL
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role(tenant_id) = 'admin'
  );

-- ============================================
-- LOSS REASONS POLICIES
-- ============================================
-- Users can view loss reasons in their tenant
CREATE POLICY "Users can view tenant loss reasons"
  ON loss_reasons FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- Admins can manage loss reasons
CREATE POLICY "Admins can manage loss reasons"
  ON loss_reasons FOR ALL
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role(tenant_id) = 'admin'
  );

-- ============================================
-- CLIENTS POLICIES
-- ============================================
-- Users can view clients in their tenant
-- Admin: all clients, Funcionario: own clients
CREATE POLICY "Users can view tenant clients"
  ON clients FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() AND
    (
      get_user_role(tenant_id) = 'admin' OR
      assigned_to = auth.uid() OR
      created_by = auth.uid()
    )
  );

-- Users can create clients in their tenant
CREATE POLICY "Users can create clients"
  ON clients FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Users can update clients
-- Admin: all clients, Funcionario: own clients
CREATE POLICY "Users can update clients"
  ON clients FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id() AND
    (
      get_user_role(tenant_id) = 'admin' OR
      assigned_to = auth.uid() OR
      created_by = auth.uid()
    )
  );

-- Admins can delete clients
CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role(tenant_id) = 'admin'
  );

-- ============================================
-- CLIENT HISTORY POLICIES
-- ============================================
-- Users can view history for clients they can access
CREATE POLICY "Users can view client history"
  ON client_history FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() AND
    client_id IN (
      SELECT id FROM clients
      WHERE tenant_id = get_user_tenant_id() AND
        (
          get_user_role(get_user_tenant_id()) = 'admin' OR
          assigned_to = auth.uid() OR
          created_by = auth.uid()
        )
    )
  );

-- Users can create history entries
CREATE POLICY "Users can create client history"
  ON client_history FOR INSERT
  WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    client_id IN (
      SELECT id FROM clients WHERE tenant_id = get_user_tenant_id()
    )
  );

-- ============================================
-- TASKS POLICIES
-- ============================================
-- Users can view tasks in their tenant
-- Admin: all tasks, Funcionario: own tasks
CREATE POLICY "Users can view tenant tasks"
  ON tasks FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() AND
    (
      get_user_role(tenant_id) = 'admin' OR
      assigned_to = auth.uid() OR
      created_by = auth.uid()
    )
  );

-- Users can create tasks
CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

-- Users can update their own tasks or admins can update any
CREATE POLICY "Users can update tasks"
  ON tasks FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id() AND
    (
      get_user_role(tenant_id) = 'admin' OR
      assigned_to = auth.uid() OR
      created_by = auth.uid()
    )
  );

-- Users can delete their own tasks or admins can delete any
CREATE POLICY "Users can delete tasks"
  ON tasks FOR DELETE
  USING (
    tenant_id = get_user_tenant_id() AND
    (
      get_user_role(tenant_id) = 'admin' OR
      created_by = auth.uid()
    )
  );

-- ============================================
-- PROPOSALS POLICIES
-- ============================================
-- Users can view proposals for clients they can access
CREATE POLICY "Users can view proposals"
  ON proposals FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() AND
    client_id IN (
      SELECT id FROM clients
      WHERE tenant_id = get_user_tenant_id() AND
        (
          get_user_role(get_user_tenant_id()) = 'admin' OR
          assigned_to = auth.uid() OR
          created_by = auth.uid()
        )
    )
  );

-- Users can create proposals
CREATE POLICY "Users can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    client_id IN (
      SELECT id FROM clients WHERE tenant_id = get_user_tenant_id()
    )
  );

-- Users can update proposals they created or admins can update any
CREATE POLICY "Users can update proposals"
  ON proposals FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id() AND
    (
      get_user_role(tenant_id) = 'admin' OR
      created_by = auth.uid()
    )
  );

-- ============================================
-- DOCUMENTS POLICIES
-- ============================================
-- Users can view documents for clients they can access
CREATE POLICY "Users can view documents"
  ON documents FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() AND
    client_id IN (
      SELECT id FROM clients
      WHERE tenant_id = get_user_tenant_id() AND
        (
          get_user_role(get_user_tenant_id()) = 'admin' OR
          assigned_to = auth.uid() OR
          created_by = auth.uid()
        )
    )
  );

-- Users can upload documents
CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    tenant_id = get_user_tenant_id() AND
    client_id IN (
      SELECT id FROM clients WHERE tenant_id = get_user_tenant_id()
    )
  );

-- Users can delete documents they uploaded or admins can delete any
CREATE POLICY "Users can delete documents"
  ON documents FOR DELETE
  USING (
    tenant_id = get_user_tenant_id() AND
    (
      get_user_role(tenant_id) = 'admin' OR
      uploaded_by = auth.uid()
    )
  );

-- ============================================
-- CALL LOGS POLICIES
-- ============================================
-- Users can view call logs in their tenant
-- Admin: all logs, Funcionario: own logs
CREATE POLICY "Users can view call logs"
  ON call_logs FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() AND
    (
      get_user_role(tenant_id) = 'admin' OR
      operator_id = auth.uid()
    )
  );

-- Users can create call logs
CREATE POLICY "Users can create call logs"
  ON call_logs FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id());

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() AND
    get_user_role(tenant_id) = 'admin'
  );

-- System can insert audit logs (via service role)
-- Note: This is typically done via service role, not RLS

