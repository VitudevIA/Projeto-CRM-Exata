-- ============================================
-- Migration: Adicionar campo fortics_login na tabela users
-- Data: 2024-11-10
-- Descrição: Campo para armazenar o login do agente no Fortics PBX
-- ============================================

-- Adicionar coluna fortics_login na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fortics_login VARCHAR(100);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_users_fortics_login ON users(fortics_login);

-- Comentário na coluna
COMMENT ON COLUMN users.fortics_login IS 'Login do agente no sistema Fortics PBX (usado para popup de chamadas)';

