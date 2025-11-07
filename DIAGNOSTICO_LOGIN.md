# 🔍 Diagnóstico de Problemas de Login

## Problema: Tela congela ao clicar em "Entrar"

### Possíveis Causas:

1. **Usuário não existe na tabela `users`**
   - O usuário foi criado no Supabase Auth, mas não foi associado à tabela `users`
   - **Solução**: Execute o Passo 3.3 do `EXECUTAR_SETUP.md`

2. **Usuário não tem `tenant_id`**
   - O usuário existe mas não está associado a um tenant
   - **Solução**: Verifique se o INSERT na tabela `users` incluiu o `tenant_id`

3. **Erro de CORS ou conexão**
   - O backend não está respondendo
   - **Solução**: Verifique se o backend está rodando na porta 3000

4. **Erro silencioso no frontend**
   - O erro não está sendo exibido
   - **Solução**: Verifique o console do navegador (F12)

## Como Diagnosticar:

### 1. Verificar Console do Navegador (F12)
- Abra o DevTools (F12)
- Vá na aba "Console"
- Procure por erros em vermelho
- Procure por mensagens de log que começam com "Login" ou "Attempting login"

### 2. Verificar Network Tab
- Abra o DevTools (F12)
- Vá na aba "Network"
- Tente fazer login novamente
- Procure por uma requisição para `/api/auth/login`
- Clique nela e veja:
  - **Status**: Deve ser 200 (sucesso) ou 401/403 (erro)
  - **Response**: Veja a resposta do servidor

### 3. Verificar Logs do Backend
- No terminal onde o backend está rodando
- Procure por mensagens de erro quando tentar fazer login
- Procure por "Login error" ou "User not found"

### 4. Verificar se Usuário Existe no Banco

Execute no SQL Editor do Supabase:

```sql
-- Verificar se o usuário existe na tabela users
SELECT 
  u.id,
  u.email,
  u.tenant_id,
  u.full_name,
  ur.role,
  t.name as tenant_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND u.tenant_id = ur.tenant_id
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = 'victormatheuss669@gmail.com';
```

**Se não retornar nenhum resultado:**
- O usuário não foi criado na tabela `users`
- Execute o Passo 3.3 do `EXECUTAR_SETUP.md`

**Se retornar resultado mas `tenant_id` for NULL:**
- O usuário não está associado a um tenant
- Execute novamente o INSERT na tabela `users` com o `tenant_id` correto

## Correções Aplicadas:

✅ Adicionados logs de debug no frontend
✅ Melhorado tratamento de erros no backend
✅ Validação de usuário e tenant_id no backend
✅ Mensagens de erro mais claras

## Próximos Passos:

1. **Recarregue a página** (Ctrl+Shift+R)
2. **Tente fazer login novamente**
3. **Verifique o console do navegador** para ver os logs
4. **Verifique a aba Network** para ver a resposta do servidor
5. **Verifique os logs do backend** no terminal

Se ainda não funcionar, envie:
- Mensagens do console do navegador
- Resposta da requisição na aba Network
- Logs do backend

