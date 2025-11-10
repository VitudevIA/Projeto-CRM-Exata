# 🔐 Autenticação e Dados Necessários - CRM + Fortics

## 📋 Situação Atual

### **Login no Fortics:**
- ✅ Usuário (login do agente)
- ✅ Senha
- ✅ Ramal
- ✅ Fila

### **Login no CRM:**
- ✅ Email
- ✅ Senha (própria do CRM)

### **Dados Necessários no CRM:**
- ✅ `fortics_login` - Login do agente no Fortics (para popup)

---

## ✅ O Que Já Está Implementado

### **1. Campo `fortics_login`**
- ✅ Armazena o login do agente no Fortics
- ✅ Usado para buscar popup de chamadas ativas
- ✅ Fallback para email se não configurado

**Uso:**
- Popup de chamadas (`/calls/popup`)
- Identificação do agente no Fortics

---

## 🎯 Dados Necessários vs Opcionais

### **✅ OBRIGATÓRIO (já implementado):**

#### **1. `fortics_login`**
- **O que é:** Login do agente no Fortics
- **Onde usar:** Buscar popup de chamadas ativas
- **Exemplo:** `victor.fernandes` ou `1501`
- **Status:** ✅ Implementado

**Como configurar:**
```sql
UPDATE users 
SET fortics_login = 'SEU_LOGIN_FORTICS'
WHERE email = 'seu_email@exemplo.com';
```

---

### **💡 RECOMENDADO (pode melhorar UX):**

#### **2. `fortics_ramal` (Ramal Padrão)**
- **O que é:** Ramal padrão do operador
- **Onde usar:** Click-to-call (não precisa digitar sempre)
- **Exemplo:** `1501`
- **Status:** ⏳ Não implementado (mas pode ser útil)

**Vantagem:**
- Operador não precisa digitar ramal toda vez
- Pode ser usado como padrão no click-to-call

**Como seria usado:**
```typescript
// Se fortics_ramal estiver configurado, usar como padrão
const ramal = userData.fortics_ramal || ramalDigitado;
```

---

#### **3. `fortics_fila` (Fila Padrão)**
- **O que é:** Fila padrão do operador
- **Onde usar:** Login automático no Fortics (futuro)
- **Exemplo:** `60` ou `60,61`
- **Status:** ⏳ Não implementado (opcional)

**Vantagem:**
- Login automático no Fortics ao entrar no CRM
- Logout automático ao sair do CRM

**Como seria usado:**
```typescript
// Ao fazer login no CRM, logar automaticamente no Fortics
await forticsService.loginAgent(
  userData.fortics_ramal,
  userData.fortics_login,
  userData.fortics_fila
);
```

---

## 🔄 Fluxo Atual vs Ideal

### **Fluxo Atual (Mínimo Necessário):**

```
1. Operador faz login no Fortics
   └─ Usuário, senha, ramal, fila

2. Operador faz login no CRM
   └─ Email, senha

3. CRM busca popup usando fortics_login
   └─ ✅ Funciona!
```

**Dados necessários:**
- ✅ `fortics_login` (já implementado)

---

### **Fluxo Ideal (Com Melhorias):**

```
1. Operador faz login no CRM
   └─ Email, senha

2. CRM loga automaticamente no Fortics
   └─ Usa fortics_login, fortics_ramal, fortics_fila
   └─ ⏳ Implementação futura

3. Click-to-call usa ramal padrão
   └─ Usa fortics_ramal se configurado
   └─ ⏳ Implementação futura

4. CRM busca popup usando fortics_login
   └─ ✅ Funciona!
```

**Dados necessários:**
- ✅ `fortics_login` (obrigatório)
- 💡 `fortics_ramal` (recomendado)
- 💡 `fortics_fila` (opcional)

---

## 📊 Resumo: O Que Precisa Agora

### **Para o Popup Funcionar:**
- ✅ **Apenas `fortics_login`** (já implementado)

### **Para Melhorar a Experiência:**
- 💡 `fortics_ramal` - Ramal padrão (não precisa digitar sempre)
- 💡 `fortics_fila` - Fila padrão (login automático futuro)

---

## 🎯 Resposta Direta à Sua Pergunta

### **"Precisa de mais algum dado?"**

**Resposta:** **NÃO, apenas o `fortics_login` é necessário!**

**O que você precisa fazer:**
1. ✅ Configurar o `fortics_login` no banco de dados
2. ✅ Fazer login no Fortics (normal, como sempre faz)
3. ✅ Fazer login no CRM (normal, com email e senha)
4. ✅ O popup funcionará automaticamente

**Dados opcionais (melhorias futuras):**
- 💡 Ramal padrão (para não digitar sempre)
- 💡 Fila padrão (para login automático)

---

## 🔧 Como Configurar Agora

### **1. Execute a Migration (se ainda não fez):**

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fortics_login VARCHAR(100);
```

### **2. Configure o Login do Fortics:**

```sql
UPDATE users 
SET fortics_login = 'SEU_LOGIN_FORTICS'
WHERE email = 'seu_email@exemplo.com';
```

**Como descobrir o login:**
- Acesse o painel Fortics
- Vá em **PBX > Cadastro > Usuários** ou **Agentes**
- Anote o **LOGIN** (não o email, não o ramal)

### **3. Teste:**

1. Faça login no Fortics (normal)
2. Faça login no CRM (normal)
3. Inicie uma campanha no Fortics
4. Quando uma chamada for atendida, o popup deve aparecer

---

## 💡 Melhorias Futuras (Opcional)

Se quiser melhorar a experiência, podemos adicionar:

### **1. Ramal Padrão:**
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fortics_ramal VARCHAR(20);
```

**Vantagem:** Não precisa digitar o ramal toda vez no click-to-call.

### **2. Fila Padrão:**
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fortics_fila VARCHAR(100);
```

**Vantagem:** Login automático no Fortics ao entrar no CRM.

---

## ✅ Conclusão

**Para o popup funcionar AGORA:**
- ✅ Apenas `fortics_login` é necessário
- ✅ Não precisa de mais nenhum dado
- ✅ Login no Fortics e CRM continuam separados

**Para melhorar no futuro:**
- 💡 Ramal padrão (opcional)
- 💡 Fila padrão (opcional)

**🚀 Configure o `fortics_login` e teste!**

