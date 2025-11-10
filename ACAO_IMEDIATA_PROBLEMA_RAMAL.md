# 🚨 AÇÃO IMEDIATA: Problema do Ramal

**Status:** ⚠️ Problema identificado - Ação necessária no Fortics

---

## 📊 Análise Completa

### ✅ O Que Está Funcionando

1. **Código do CRM:** ✅ Funcionando perfeitamente
   - Envia parâmetros corretos
   - Formata número corretamente
   - Recebe resposta de sucesso do Fortics

2. **API Fortics:** ✅ Respondendo corretamente
   - Resposta: `"success": true`
   - Mensagem: `"DISCANDO PARA 85997185855 SIP/1501..."`

### ❌ O Problema

**A chamada está indo para o próprio ramal 1501 ao invés de discar para o celular 85997185855.**

**Causa:** ⚠️ **CONFIGURAÇÃO DO FORTICS PBX**

---

## 🔧 AÇÃO IMEDIATA NECESSÁRIA

### 1. Verificar Configuração do Fortics (CRÍTICO)

**Acesse o painel Fortics:**
```
PBX > Cadastro > Serviços > Discagem Rápida
```

**Verifique:**
- ✅ Grupo de discagem configurado
- ⚠️ **Rota externa habilitada** (CRÍTICO - provavelmente está desabilitada)
- ✅ Tronco externo configurado
- ✅ Permissão para discar externamente

**Se a rota externa não estiver habilitada:**
1. Habilite a rota externa no grupo de discagem
2. Configure o tronco externo
3. Teste novamente

---

### 2. Teste Manual no 3CXPhone

**Teste 1: Discar manualmente**
1. No 3CXPhone, discar: `85997185855`
2. Funciona? → O formato está correto, problema é na configuração
3. Não funciona? → Precisa de prefixo

**Teste 2: Se não funcionar, tente:**
- `085997185855` (com 0)
- `985997185855` (com 9)
- `5585997185855` (com código do país)

**Me informe qual formato funciona manualmente!**

---

### 3. Teste Direto na API Fortics

**Abra o terminal e teste:**

```bash
# Teste 1: Formato atual
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=85997185855&gresponse=json"

# Teste 2: Com 0 inicial
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=085997185855&gresponse=json"

# Teste 3: Com código do país
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=5585997185855&gresponse=json"
```

**Compare os resultados:**
- Qual formato faz a chamada ir para o celular?
- Qual formato faz a chamada ir para o ramal?

---

## 📋 Informações que Preciso

Para resolver definitivamente, preciso saber:

1. **No painel Fortics:**
   - Qual grupo de discagem está configurado?
   - Há rota externa habilitada?
   - Há tronco externo configurado?

2. **Teste manual:**
   - Quando você disca manualmente do 3CXPhone, qual formato usa?
   - Precisa digitar algum prefixo antes do número?
   - Funciona discar manualmente?

3. **Resultado dos testes:**
   - Qual formato funciona na API Fortics?
   - Qual formato não funciona?

---

## ✅ Correções Aplicadas no Código

1. ✅ Validação de ramal interno (não permite números muito curtos)
2. ✅ Validação para evitar chamada para o próprio ramal
3. ✅ Formatação melhorada do número
4. ✅ Logs mais detalhados

**Mas o problema principal está na configuração do Fortics, não no código!**

---

## 🎯 Próximos Passos

1. **AGORA:** Verifique a configuração do grupo de discagem no Fortics
2. **AGORA:** Teste discar manualmente no 3CXPhone
3. **AGORA:** Teste os diferentes formatos na API Fortics
4. **Depois:** Me informe os resultados

---

## 🚨 Conclusão

**O código do CRM está correto.**

O problema está na **CONFIGURAÇÃO DO FORTICS PBX**:
- ⚠️ Grupo de discagem pode não ter rota externa
- ⚠️ Tronco externo pode não estar configurado
- ⚠️ Formato do número pode precisar de prefixo específico

**AÇÃO IMEDIATA:** Verifique a configuração do grupo de discagem no painel Fortics!

---

**📞 Após verificar, me informe:**
1. Qual formato funciona manualmente?
2. Há rota externa configurada?
3. Qual formato funciona na API?

**Com essas informações, posso ajustar o código se necessário!**


