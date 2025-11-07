-- ============================================
-- SEED DATA: Default Stages and Loss Reasons
-- ============================================

-- This migration should be run after creating a tenant
-- It creates default stages and loss reasons for a tenant

-- Function to seed default data for a tenant
CREATE OR REPLACE FUNCTION seed_tenant_defaults(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert default stages
  INSERT INTO client_stages (tenant_id, name, stage_type, order_index, color) VALUES
    (p_tenant_id, 'Lead', 'lead', 1, '#3B82F6'),
    (p_tenant_id, 'Qualificação', 'qualificacao', 2, '#8B5CF6'),
    (p_tenant_id, 'Análise', 'analise', 3, '#F59E0B'),
    (p_tenant_id, 'Proposta', 'proposta', 4, '#10B981'),
    (p_tenant_id, 'Contratação', 'contratacao', 5, '#059669'),
    (p_tenant_id, 'Ganho', 'ganho', 6, '#10B981'),
    (p_tenant_id, 'Perdido', 'perdido', 7, '#EF4444')
  ON CONFLICT DO NOTHING;

  -- Insert default loss reasons for LEAD → QUALIFICAÇÃO
  INSERT INTO loss_reasons (tenant_id, stage_type, reason, description, order_index) VALUES
    (p_tenant_id, 'lead', 'Dados Incorretos/Incompletos', 'Telefone não existe, email inválido', 1),
    (p_tenant_id, 'lead', 'Não Atende/Incontactável', 'Várias tentativas de contato sem sucesso', 2),
    (p_tenant_id, 'lead', 'Não Tem Interesse Imediato', 'Me liga em 3 meses', 3),
    (p_tenant_id, 'lead', 'Já Contratou com Concorrente', 'Perda por timing', 4),
    (p_tenant_id, 'lead', 'Não se Enquadra no Público-Alvo', 'Ex.: Ainda não é aposentado ou servidor público', 5)
  ON CONFLICT DO NOTHING;

  -- Insert default loss reasons for QUALIFICAÇÃO → ANÁLISE
  INSERT INTO loss_reasons (tenant_id, stage_type, reason, description, order_index) VALUES
    (p_tenant_id, 'qualificacao', 'Margem Consignável Insuficiente', 'Renda baixa ou margem comprometida', 1),
    (p_tenant_id, 'qualificacao', 'Fora da Faixa Etária', 'Muito jovem ou acima do limite', 2),
    (p_tenant_id, 'qualificacao', 'Score/Restrição Cadastral', 'Nome sujo, CPF com restrição', 3),
    (p_tenant_id, 'qualificacao', 'Não Possui Documentação Exigida', 'Não tem contracheque, declaração, etc.', 4),
    (p_tenant_id, 'qualificacao', 'Não Aceita as Condições/Taxas', 'Acha os juros/custos altos', 5),
    (p_tenant_id, 'qualificacao', 'Perda de Interesse', 'Arrependimento após entender as condições', 6)
  ON CONFLICT DO NOTHING;

  -- Insert default loss reasons for ANÁLISE → PROPOSTA
  INSERT INTO loss_reasons (tenant_id, stage_type, reason, description, order_index) VALUES
    (p_tenant_id, 'analise', 'Documentação Inconsistente', 'Renda não confere com declarado', 1),
    (p_tenant_id, 'analise', 'Documentação Expirada', 'Comprovante de residência com mais de 60 dias', 2),
    (p_tenant_id, 'analise', 'Impedimento Legal', 'Penhora, recuperação judicial, etc.', 3),
    (p_tenant_id, 'analise', 'Análise de Crédito Interna Reprovada', 'Risco alto para a instituição', 4),
    (p_tenant_id, 'analise', 'Prazo de Análise Muito Longo', 'Cliente desistiu pela demora', 5)
  ON CONFLICT DO NOTHING;

  -- Insert default loss reasons for PROPOSTA → CONTRATAÇÃO
  INSERT INTO loss_reasons (tenant_id, stage_type, reason, description, order_index) VALUES
    (p_tenant_id, 'proposta', 'Desistência na Reta Final', 'Precisei pensar melhor e vou esperar', 1),
    (p_tenant_id, 'proposta', 'Concorrência (Offer Shocking)', 'Apareceu proposta melhor de outro banco/consignado', 2),
    (p_tenant_id, 'proposta', 'Mudança de Necessidade', 'Situação financeira/saúde do cliente mudou', 3),
    (p_tenant_id, 'proposta', 'Problemas com a Liberação', 'A instituição credora travou a liberação por algum detalhe', 4),
    (p_tenant_id, 'proposta', 'Insatisfação com o Atendimento', 'Demora para tirar dúvidas, mudança de corretor', 5)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

