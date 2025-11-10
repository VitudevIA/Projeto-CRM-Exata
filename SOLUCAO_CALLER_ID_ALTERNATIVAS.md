# 🔧 Soluções Alternativas: Caller ID no 3CXPhone

## 📋 Problema Persistente

**Situação:**
- ✅ A chamada funciona corretamente
- ❌ O 3CXPhone ainda mostra o ramal (1501) ao invés do número de destino (85997185855)
- ❌ A primeira tentativa com `CALLERID(name)=numero` não funcionou

---

## ✅ Tentativa 2: Múltiplas Variáveis de Canal

**Mudança implementada:**
Agora estamos enviando múltiplas variáveis de canal em diferentes formatos para garantir compatibilidade:

```typescript
const channelVars = [
  `CALLERID(name)=${numeroDestino}`,      // Formato padrão Asterisk
  `CALLERIDNAME=${numeroDestino}`,        // Formato alternativo
  `CALLERID(num)=${numeroDestino}`,       // Número do chamador
  `CALLERID:name:${numeroDestino}`,      // Formato com dois pontos (como exemplo da doc)
].join("|");
```

**Teste agora:**
1. Reinicie o backend
2. Teste uma chamada
3. Verifique se o 3CXPhone mostra o número correto

---

## 🔍 Se Ainda Não Funcionar: Limitações do Fortics

**Possível causa:**
O Fortics pode estar configurado para sempre usar o ramal como Caller ID Name nas chamadas click-to-call, independente das variáveis de canal.

**Soluções alternativas:**

### Opção 1: Configuração no Painel Fortics

**Acesse o painel do Fortics:**
1. `PBX > Cadastro > Serviços > Discagem Rápida`
2. Procure por opções de:
   - "Caller ID"
   - "Identificação do Chamador"
   - "Variáveis de Canal Padrão"
3. Configure para usar o número de destino como Caller ID Name

### Opção 2: Configuração no Grupo de Discagem

**Acesse:**
1. `PBX > Cadastro > Grupos de Discagem`
2. Selecione o grupo usado na "Discagem Rápida"
3. Procure por configurações de:
   - Caller ID
   - Variáveis de canal
   - Identificação de chamadas

### Opção 3: Dialplan do Asterisk

**Se você tiver acesso ao dialplan do Asterisk:**
- Pode ser necessário modificar o dialplan usado pelo Fortics para click-to-call
- Adicionar comando `Set(CALLERID(name)=${EXTEN})` ou similar

### Opção 4: Contatar Suporte Fortics

**Se nenhuma das opções acima funcionar:**
- Entre em contato com o suporte da Fortics
- Pergunte como configurar o Caller ID Name para mostrar o número de destino em chamadas click-to-call
- Pode ser uma limitação ou configuração específica do sistema

---

## 🧪 Teste Manual Direto na API

**Para verificar se as variáveis estão sendo processadas:**

```bash
# Teste 1: Com variável CALLERID(name)
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=85997185855&gresponse=json&gvariaveis_de_canal=CALLERID(name)=85997185855"

# Teste 2: Com formato alternativo
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=85997185855&gresponse=json&gvariaveis_de_canal=CALLERIDNAME=85997185855"

# Teste 3: Com múltiplas variáveis
curl "http://192.168.1.10/lispbx/lisintegra.php?gacao=discar&gkey=lispbx@123&gsrc=1501&gdst=85997185855&gresponse=json&gvariaveis_de_canal=CALLERID(name)=85997185855|CALLERIDNAME=85997185855"
```

**Verifique:**
- Se a chamada funciona
- Se o 3CXPhone mostra o número correto
- Compare com a chamada feita pelo CRM

---

## 📝 Notas Importantes

**Comportamento do Click-to-Call:**
1. O Fortics primeiro toca o ramal (gsrc)
2. Depois conecta ao destino (gdst)
3. O 3CXPhone pode estar mostrando o número que está chamando o ramal (o próprio sistema Fortics)
4. As variáveis de canal podem não afetar o Caller ID da chamada que chega no ramal

**Possível solução no Fortics:**
- Pode ser necessário configurar no dialplan do Asterisk
- Ou pode ser uma limitação do sistema que não permite alterar isso via API

---

## 🎯 Próximos Passos

1. ✅ Teste a nova implementação (múltiplas variáveis)
2. ✅ Se não funcionar, teste manualmente via curl
3. ✅ Verifique configurações no painel Fortics
4. ✅ Se necessário, contate suporte Fortics

---

**🔍 TESTE AGORA: Reinicie o backend e teste novamente!**

