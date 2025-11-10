# ⚡ Teste Rápido - 3 Comandos

## 🎯 Execute Estes 3 Comandos na Ordem

### 1️⃣ Criar/Editar .env

**Abra o arquivo:** `backend/.env`

**Adicione estas 2 linhas:**
```env
DISCADOR_API_URL=http://192.168.1.10
DISCADOR_API_KEY=lispbx@123
```

---

### 2️⃣ Testar Configuração

```bash
cd backend
node test-fortics-local.js
```

**Deve aparecer:**
```
✓ DISCADOR_API_URL: http://192.168.1.10
✓ DISCADOR_API_KEY: lispbx@123...
✓ Conectividade OK!
```

---

### 3️⃣ Iniciar Backend

```bash
npm run dev
```

**Deve aparecer:**
```
✅ Fortics API configurado
Server running on port 3000
```

---

## ✅ Pronto!

Se apareceu "✅ Fortics API configurado", está tudo certo!

**Próximo passo:** Testar click-to-call via API ou interface.

---

## 🆘 Se Não Funcionou

1. Verifique se o arquivo `.env` está na pasta `backend/`
2. Verifique se as variáveis estão escritas corretamente
3. Verifique se não há espaços extras
4. Reinicie o servidor

---

**🚀 É SÓ ISSO! 3 PASSOS SIMPLES!**


