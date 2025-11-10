# ✅ Problema do Login Fortics - RESOLVIDO

## 🔴 Problema Identificado

**Erro nos logs:**
```
"Login nao cadastrado - victormatheuss669"
```

**Causa Raiz:**
- O sistema estava usando o email (`victormatheuss669`) como login do agente
- O Fortics PBX precisa do **login do agente cadastrado no sistema Fortics**
- Esse login pode ser diferente do email do CRM

---

## ✅ Solução Implementada

### **1. Campo `fortics_login` Adicionado**

Foi criado um novo campo na tabela `users` para armazenar o login do Fortics.

**Migration:** `supabase/migrations/003_add_fortics_login.sql`

### **2. Código Atualizado**

O backend agora:
- ✅ Busca o campo `fortics_login` do usuário
- ✅ Se não encontrar, usa o email como fallback
- ✅ Mostra no log qual fonte está sendo usada

**Arquivo:** `backend/src/routes/calls.ts` (linhas 185-206)

---

## 📋 Passos para Resolver

### **1. Execute a Migration**

No **Supabase SQL Editor**, execute:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fortics_login VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_fortics_login ON users(fortics_login);
```

### **2. Configure o Login do Fortics**

**Opção A: Via SQL (Rápido)**

```sql
UPDATE users 
SET fortics_login = 'SEU_LOGIN_FORTICS_AQUI'
WHERE email = 'victormatheuss669@gmail.com';
```

**Substitua `SEU_LOGIN_FORTICS_AQUI` pelo login real do agente no Fortics.**

**Exemplos:**
- Se o login for o ramal: `'1501'`
- Se o login for diferente: `'victor.fernandes'`
- Se o login for o email sem @: `'victormatheuss669'`

**Opção B: Usar o Script Pronto**

Execute o arquivo `CONFIGURAR_FORTICS_LOGIN.sql` no Supabase SQL Editor e edite os valores.

### **3. Verifique a Configuração**

```sql
SELECT 
  email,
  fortics_login,
  CASE 
    WHEN fortics_login IS NULL THEN '❌ NÃO CONFIGURADO'
    ELSE '✅ CONFIGURADO: ' || fortics_login
  END as status
FROM users 
WHERE email = 'victormatheuss669@gmail.com';
```

### **4. Teste o Popup**

1. Reinicie o backend (se necessário)
2. Faça login no CRM
3. Inicie uma campanha no Fortics
4. Quando uma chamada for atendida, o popup deve aparecer

---

## 🔍 Como Descobrir o Login do Fortics

### **Método 1: Painel Fortics**

1. Acesse o painel do Fortics PBX
2. Vá em **PBX > Cadastro > Usuários** ou **Agentes**
3. Procure pelo seu usuário
4. Anote o **LOGIN** (não o email, não o ramal)

### **Método 2: 3CXPhone**

1. Abra o 3CXPhone
2. Vá em **Configurações** ou **Perfil**
3. O login pode aparecer lá

### **Método 3: Administrador**

Pergunte ao administrador do Fortics qual é o login do seu agente.

---

## 📊 Como Funciona Agora

### **Antes (❌ Erro):**
```
Email: victormatheuss669@gmail.com
Login usado: victormatheuss669
Resultado: "Login nao cadastrado"
```

### **Depois (✅ Correto):**
```
Email: victormatheuss669@gmail.com
fortics_login: 1501 (ou outro login configurado)
Login usado: 1501
Resultado: Popup funciona!
```

### **Fallback Automático:**
```
Se fortics_login não estiver configurado:
→ Usa email sem @ (victormatheuss669)
→ Funciona se o login do Fortics for igual ao email sem @
```

---

## 🧪 Logs de Debug

Após a correção, você verá nos logs:

```
📋 Buscando popup do agente: 1501
📋 Fonte do login: fortics_login (configurado)
```

Ou (se não configurado):

```
📋 Buscando popup do agente: victormatheuss669
📋 Fonte do login: email (fallback)
```

---

## ⚠️ Importante

1. **O login do Fortics é case-sensitive?**
   - Geralmente não, mas verifique no Fortics

2. **Pode ter espaços?**
   - Não, remova espaços

3. **É o mesmo que o ramal?**
   - Pode ser, mas não necessariamente
   - O ramal é o número (ex: `1501`)
   - O login pode ser diferente (ex: `victor.fernandes`)

4. **Formato do login:**
   - Geralmente: letras, números e underscore
   - Evite caracteres especiais

---

## 📝 Arquivos Modificados

1. ✅ `supabase/migrations/003_add_fortics_login.sql` - Migration
2. ✅ `backend/src/routes/calls.ts` - Código atualizado
3. ✅ `CONFIGURAR_FORTICS_LOGIN.sql` - Script de configuração
4. ✅ `CONFIGURAR_LOGIN_FORTICS.md` - Documentação completa

---

## 🎯 Próximos Passos

1. ✅ Execute a migration
2. ✅ Configure o `fortics_login` no seu usuário
3. ✅ Reinicie o backend
4. ✅ Teste o popup
5. ⏳ Aguarde interface no perfil (futuro)

---

## ✅ Resultado Esperado

Após configurar o `fortics_login`:

1. ✅ Logs não mostram mais "Login nao cadastrado"
2. ✅ Fortics retorna dados da chamada ativa
3. ✅ Popup aparece automaticamente no CRM
4. ✅ Operador pode tabular a chamada

---

**🚀 Após seguir estes passos, o popup deve funcionar corretamente!**

