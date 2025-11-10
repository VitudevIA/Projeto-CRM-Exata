# 🔧 Como Configurar o Login do Fortics

## ❌ Problema Identificado

**Erro no log:**
```
"Login nao cadastrado - victormatheuss669"
```

**Causa:**
- O sistema está usando o email (`victormatheuss669`) como login do agente
- Mas o Fortics precisa do **login do agente cadastrado no PBX**
- Esse login pode ser diferente do email

---

## ✅ Solução Implementada

### **1. Campo `fortics_login` Adicionado**

Foi criado um campo `fortics_login` na tabela `users` do Supabase para armazenar o login do agente no Fortics.

### **2. Migration Criada**

**Arquivo:** `supabase/migrations/003_add_fortics_login.sql`

Execute esta migration no Supabase SQL Editor.

---

## 📋 Como Configurar

### **Opção 1: Via SQL (Recomendado para teste rápido)**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute:

```sql
-- Atualizar seu usuário com o login do Fortics
UPDATE users 
SET fortics_login = 'SEU_LOGIN_FORTICS_AQUI'
WHERE email = 'victormatheuss669@gmail.com';
```

**Substitua `SEU_LOGIN_FORTICS_AQUI` pelo login real do agente no Fortics.**

**Exemplo:**
```sql
UPDATE users 
SET fortics_login = '1501'
WHERE email = 'victormatheuss669@gmail.com';
```

---

### **Opção 2: Via Interface do CRM (Futuro)**

Uma interface será criada no perfil do usuário para configurar o `fortics_login`.

---

## 🔍 Como Descobrir o Login do Fortics

### **1. Verificar no Painel Fortics**

1. Acesse o painel do Fortics PBX
2. Vá em **PBX > Cadastro > Usuários** ou **Agentes**
3. Procure pelo seu usuário
4. Anote o **login** (não o email)

### **2. Verificar no 3CXPhone**

1. Abra o 3CXPhone
2. Vá em **Configurações** ou **Perfil**
3. O login geralmente aparece lá

### **3. Verificar com o Administrador**

Pergunte ao administrador do Fortics qual é o login do seu agente.

---

## 🧪 Como Testar

### **1. Execute a Migration**

```sql
-- No Supabase SQL Editor
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fortics_login VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_fortics_login ON users(fortics_login);
```

### **2. Configure o Login**

```sql
UPDATE users 
SET fortics_login = 'SEU_LOGIN_FORTICS'
WHERE email = 'seu_email@exemplo.com';
```

### **3. Verifique**

```sql
SELECT id, email, fortics_login 
FROM users 
WHERE email = 'seu_email@exemplo.com';
```

### **4. Teste o Popup**

1. Faça login no CRM
2. Inicie uma campanha no Fortics
3. Quando uma chamada for atendida, o popup deve aparecer

---

## 📊 Estrutura da Tabela

**Antes:**
```sql
users (
  id UUID,
  email VARCHAR,
  full_name VARCHAR,
  phone VARCHAR,
  ...
)
```

**Depois:**
```sql
users (
  id UUID,
  email VARCHAR,
  full_name VARCHAR,
  phone VARCHAR,
  fortics_login VARCHAR(100),  -- NOVO CAMPO
  ...
)
```

---

## 🔄 Fallback Automático

Se o campo `fortics_login` não estiver configurado, o sistema usa automaticamente:
- Email sem o `@` (ex: `victormatheuss669@gmail.com` → `victormatheuss669`)

**Mas isso só funciona se o login do Fortics for igual ao email sem @.**

---

## ⚠️ Importante

1. **O login do Fortics é case-sensitive?**
   - Geralmente não, mas verifique no Fortics

2. **Pode ter espaços?**
   - Não, remova espaços

3. **Pode ter caracteres especiais?**
   - Geralmente apenas letras, números e underscore

4. **É o mesmo que o ramal?**
   - Pode ser, mas não necessariamente
   - O ramal é o número (ex: `1501`)
   - O login pode ser diferente (ex: `victor.fernandes`)

---

## 🎯 Exemplo Completo

**Cenário:**
- Email no CRM: `victormatheuss669@gmail.com`
- Login no Fortics: `victor.fernandes`
- Ramal: `1501`

**Configuração:**
```sql
UPDATE users 
SET fortics_login = 'victor.fernandes'
WHERE email = 'victormatheuss669@gmail.com';
```

**Resultado:**
- Sistema usa `victor.fernandes` para buscar popup no Fortics
- Popup aparece quando há chamada ativa

---

## 📝 Próximos Passos

1. ✅ Execute a migration
2. ✅ Configure o `fortics_login` no seu usuário
3. ✅ Teste o popup
4. ⏳ Aguarde interface no perfil (futuro)

---

**✅ Após configurar o `fortics_login`, o popup deve funcionar corretamente!**

