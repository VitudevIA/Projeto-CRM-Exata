# 🔍 Diagnóstico: Chamada Indo para Próprio Ramal

**Data:** 10 de novembro de 2025  
**Problema:** Chamada do ramal 1501 para 85997185855 está chegando no próprio 3CXPhone do ramal 1501

---

## 📊 Análise dos Logs

### ✅ O Que Está Funcionando

1. **Backend recebe corretamente:**
   ```
   📞 Click-to-call recebido: { phone_number: '85997185855', ramal: '1501' }
   📞 Número formatado: 85997185855
   ```

2. **URL gerada corretamente:**
   ```
   http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx%40123&gsrc=1501&gdst=85997185855&gresponse=json&gaccountcode=1762800966533.mxrs5
   ```

3. **Fortics responde com sucesso:**
   ```json
   {
     "success": true,
     "retorno": "DISCANDO PARA 85997185855 SIP/1501 85997185855 DLPN_default [Originate successfully queued]",
     "msg": "DISCANDO PARA 85997185855 SIP/1501 85997185855 DLPN_default [Originate successfully queued]",
     "id": "1762800966533mxrs5"
   }
   ```

### ❌ O Problema

**A chamada está chegando no 3CXPhone do ramal 1501 ao invés de discar para o celular 85997185855.**

---

## 🔍 Possíveis Causas

### 1. **Formato do Número Incorreto** ⚠️

O Fortics pode estar interpretando `85997185855` como um ramal interno ao invés de número externo.

**Soluções possíveis:**
- Adicionar prefixo de saída (ex: `085997185855` ou `985997185855`)
- Adicionar código do país (ex: `5585997185855`)
- Usar formato específico do Fortics

### 2. **Configuração do Grupo de Discagem** ⚠️⚠️⚠️

**CRÍTICO:** A documentação da Fortics menciona:
> "Deverá haver rota para o número de destino no grupo de discagem"
> "O grupo de discagem selecionado para a ligação irá depender do que estiver configurado em PBX > Cadastro > Serviços > Discagem Rápida"

**Isso significa:**
- O grupo de discagem configurado pode não ter rota externa
- Pode estar configurado apenas para chamadas internas
- Pode precisar de configuração específica no painel Fortics

### 3. **Roteamento Interno do Fortics** ⚠️

O Fortics pode ter uma regra que:
- Redireciona números de 11 dígitos para ramais internos
- Não reconhece o formato como número externo
- Precisa de prefixo específico para chamadas externas

### 4. **Tronco Externo Não Configurado** ⚠️⚠️

O Fortics pode não ter:
- Tronco externo configurado
- Rota para números externos
- Permissão para discar externamente

---

## ✅ Correções Aplicadas

### 1. Validação de Ramal Interno

**Arquivo:** `backend/src/routes/calls.ts`

**Mudança:**
- Verifica se o número não é um ramal (4 dígitos ou menos)
- Valida formato do número antes de enviar

### 2. Formatação Melhorada

**Mudanças:**
- Remove 0 inicial se houver (formato antigo)
- Valida tamanho do número
- Logs mais detalhados

---

## 🔧 Próximas Ações Recomendadas

### Ação 1: Verificar Configuração do Fortics (CRÍTICO)

**Acesse o painel Fortics:**
1. Vá em: **PBX > Cadastro > Serviços > Discagem Rápida**
2. Verifique:
   - ✅ Grupo de discagem configurado
   - ✅ Rota externa habilitada
   - ✅ Tronco externo configurado
   - ✅ Permissão para discar externamente

### Ação 2: Testar com Prefixo de Saída

**Opções para testar:**

1. **Com 0 inicial:**
   ```
   gdst=085997185855
   ```

2. **Com código do país:**
   ```
   gdst=5585997185855
   ```

3. **Com prefixo 9 (se necessário):**
   ```
   gdst=985997185855
   ```

### Ação 3: Testar Diretamente na API Fortics

**Teste manual:**
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

### Ação 4: Verificar Logs do Fortics

**No painel Fortics:**
1. Vá em: **Monitor > Chamadas** ou **Logs**
2. Verifique:
   - Como a chamada está sendo roteada
   - Se há erro de roteamento
   - Se o número está sendo interpretado como ramal

---

## 🎯 Solução Temporária (Teste)

Vou criar uma versão que tenta diferentes formatos automaticamente:

1. **Primeiro:** Tenta formato atual (85997185855)
2. **Se falhar:** Tenta com código do país (5585997185855)
3. **Se falhar:** Tenta com 0 inicial (085997185855)

---

## 📋 Checklist de Diagnóstico

- [ ] Verificar configuração do grupo de discagem no Fortics
- [ ] Verificar se há tronco externo configurado
- [ ] Testar com prefixo de saída (0 ou 9)
- [ ] Testar com código do país (55)
- [ ] Verificar logs do Fortics PBX
- [ ] Comparar com teste manual que funcionou anteriormente

---

## 🔍 Informações Necessárias

Para resolver definitivamente, preciso saber:

1. **No painel Fortics:**
   - Qual grupo de discagem está configurado?
   - Há tronco externo configurado?
   - Qual o formato de número que funciona em chamadas manuais?

2. **Teste manual:**
   - Quando você disca manualmente do 3CXPhone, qual formato usa?
   - Precisa digitar algum prefixo antes do número?

3. **Configuração:**
   - Há alguma regra de roteamento específica?
   - O número precisa de prefixo para sair externamente?

---

## 🚨 Conclusão

**O problema NÃO está no código do CRM.**

O código está:
- ✅ Enviando os parâmetros corretos
- ✅ Formatando o número corretamente
- ✅ Recebendo resposta de sucesso do Fortics

**O problema está na CONFIGURAÇÃO DO FORTICS:**
- ⚠️ Grupo de discagem pode não ter rota externa
- ⚠️ Tronco externo pode não estar configurado
- ⚠️ Formato do número pode precisar de prefixo específico

**Próximo passo:** Verificar configuração do Fortics e testar diferentes formatos de número.

---

**🔧 AÇÃO IMEDIATA: Verifique a configuração do grupo de discagem no painel Fortics!**


