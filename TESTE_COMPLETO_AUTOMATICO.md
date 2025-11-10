# 🤖 Teste Completo Automatizado

**Telefone:** 85997185855  
**Ramal:** 1501

---

## 🚀 Executar Tudo de Uma Vez

### Script Completo (Copiar e Colar)

**Crie um arquivo `teste-completo.sh` (Linux/Mac) ou `teste-completo.bat` (Windows):**

#### Para Windows (teste-completo.bat):

```batch
@echo off
echo ========================================
echo TESTE COMPLETO - INTEGRACAO FORTICS
echo ========================================
echo.

echo [1/3] Verificando se backend esta rodando...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Backend nao esta rodando!
    echo Execute primeiro: cd backend ^&^& npm run dev
    pause
    exit /b 1
)
echo OK: Backend esta rodando!
echo.

echo [2/3] Fazendo login...
echo Digite seu email:
set /p EMAIL=
echo Digite sua senha:
set /p PASSWORD=

for /f "tokens=*" %%a in ('curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}"') do set LOGIN_RESPONSE=%%a

echo Resposta do login: %LOGIN_RESPONSE%
echo.
echo Copie o access_token da resposta acima e cole aqui:
set /p TOKEN=

echo.
echo [3/3] Testando click-to-call...
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"

echo.
echo ========================================
echo Teste concluido!
pause
```

---

## 📋 Passo a Passo Manual (Mais Simples)

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

**Aguarde:** `Server running on port 3000`

---

### Terminal 2: Login

**Copie e cole (substitua email e senha):**

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"SEU_EMAIL\",\"password\":\"SUA_SENHA\"}"
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"SuaSenha123\"}"
```

**Copie o `access_token` da resposta!**

---

### Terminal 2: Teste Click-to-Call

**Copie e cole (substitua SEU_TOKEN pelo token copiado):**

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"
```

---

## 🎯 Comando Único (Se Já Tem o Token)

**Substitua SEU_TOKEN e execute:**

```bash
curl -X POST http://localhost:3000/api/calls/click-to-call -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" -d "{\"phone_number\":\"85997185855\",\"ramal\":\"1501\"}"
```

---

## ✅ Resultado Esperado

**Sucesso:**
```json
{
  "success": true,
  "call_id": "4444",
  "account_code": "1699999999999.abc123",
  "message": "DISCANDO PARA 85997185855...",
  "fortics_response": {
    "success": true,
    "id": "4444"
  }
}
```

**Se aparecer isso, está funcionando! 🎉**

---

## 🔍 Verificar no Backend

**No Terminal 1 (backend), você deve ver:**

```
📞 Fortics: Iniciando chamada 1501 → 85997185855
✅ Fortics: Chamada iniciada { success: true, id: '4444', ... }
```

---

**🚀 COMECE: Terminal 1 primeiro!**


