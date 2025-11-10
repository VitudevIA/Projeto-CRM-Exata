-- ============================================
-- CONFIGURAR LOGIN DO FORTICS PARA O USUÁRIO
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Adicionar coluna fortics_login (se ainda não existir)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fortics_login VARCHAR(100);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_users_fortics_login ON users(fortics_login);

-- 2. CONFIGURAR O LOGIN DO FORTICS
-- ⚠️ IMPORTANTE: Substitua 'SEU_LOGIN_FORTICS_AQUI' pelo login real do agente no Fortics
-- ⚠️ IMPORTANTE: Substitua 'victormatheuss669@gmail.com' pelo seu email

UPDATE users 
SET fortics_login = 'SEU_LOGIN_FORTICS_AQUI'
WHERE email = 'victormatheuss669@gmail.com';

-- 3. VERIFICAR SE FOI CONFIGURADO CORRETAMENTE
SELECT 
  id,
  email,
  full_name,
  fortics_login,
  CASE 
    WHEN fortics_login IS NULL THEN '❌ NÃO CONFIGURADO'
    WHEN fortics_login = '' THEN '❌ VAZIO'
    ELSE '✅ CONFIGURADO: ' || fortics_login
  END as status
FROM users 
WHERE email = 'victormatheuss669@gmail.com';

-- ============================================
-- EXEMPLOS DE LOGIN DO FORTICS:
-- ============================================
-- Pode ser o ramal: '1501'
-- Pode ser o login: 'victor.fernandes'
-- Pode ser o email sem @: 'victormatheuss669'
-- Pode ser qualquer outro formato configurado no Fortics
-- ============================================
-- 
-- COMO DESCOBRIR O LOGIN:
-- 1. Acesse o painel do Fortics PBX
-- 2. Vá em PBX > Cadastro > Usuários ou Agentes
-- 3. Procure pelo seu usuário
-- 4. Anote o LOGIN (não o email)
-- ============================================

