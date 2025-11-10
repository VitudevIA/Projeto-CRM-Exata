# 🔍 Análise: Limitação do Caller ID no Fortics PBX

## 📋 Problema Confirmado

**Situação:**
- ✅ Chamada funciona corretamente
- ❌ 3CXPhone sempre mostra o ramal (1501) ao invés do número de destino
- ❌ Não há opções de Caller ID no painel do Fortics
- ❌ Variáveis de canal não funcionam para alterar o Caller ID

**Conclusão:**
Esta é uma **limitação arquitetural do Fortics PBX** no modo click-to-call.

---

## 🔧 Como Funciona o Click-to-Call no Fortics

**Fluxo da chamada:**
1. **CRM envia requisição** → Fortics API
2. **Fortics chama o ramal** (gsrc) → **AQUI o 3CXPhone recebe a chamada**
3. **Fortics conecta ao destino** (gdst) → Após o ramal atender

**O problema:**
- O 3CXPhone recebe a chamada na **etapa 2**
- Nessa etapa, quem está chamando é o **próprio sistema Fortics**
- O Fortics identifica essa chamada como vinda do ramal (1501)
- Por isso o 3CXPhone mostra "1501"

**Por que não funciona:**
- O Caller ID da chamada que chega no ramal é definido pelo Fortics internamente
- Não pode ser alterado via variáveis de canal ou configurações do painel
- É uma limitação da arquitetura do click-to-call

---

## 💡 Soluções Alternativas

### Opção 1: Aceitar a Limitação (Recomendado)

**Solução:**
- Documentar que o 3CXPhone sempre mostrará o ramal
- O número de destino está disponível no CRM
- O operador sabe para quem está ligando pelo contexto do CRM

**Vantagens:**
- Não requer mudanças complexas
- Funciona imediatamente
- Não depende de configurações externas

**Implementação:**
- Adicionar nota no CRM informando que o 3CXPhone mostrará o ramal
- Mostrar o número de destino claramente no modal de chamada do CRM

---

### Opção 2: Mostrar Informações no CRM Durante a Chamada

**Solução:**
- Criar um painel no CRM que mostra informações da chamada ativa
- Exibir: número de destino, cliente, ramal, status
- Atualizar em tempo real durante a chamada

**Vantagens:**
- Operador sempre vê para quem está ligando
- Melhor experiência do usuário
- Não depende do 3CXPhone

**Implementação:**
- Criar componente `CallPanel` no frontend
- Mostrar quando chamada está ativa
- Atualizar via polling ou WebSocket

---

### Opção 3: Usar Popup do Fortics (Se Disponível)

**Solução:**
- Verificar se o Fortics tem funcionalidade de popup
- O popup pode mostrar informações do cliente durante a chamada
- Integrar com o CRM para mostrar dados do cliente

**Verificação:**
- API Fortics tem endpoint `/forticsApi.php?acao=popup`
- Pode retornar dados da última chamada
- Verificar se funciona em tempo real

---

### Opção 4: Contatar Suporte Fortics

**Solução:**
- Entrar em contato com suporte técnico da Fortics
- Perguntar se há forma de customizar o Caller ID em click-to-call
- Pode ser uma funcionalidade que precisa ser habilitada
- Ou pode ser uma limitação conhecida

**Informações para o suporte:**
- Versão do Fortics PBX
- Problema: Caller ID mostra ramal ao invés de número de destino
- Já tentamos: variáveis de canal, configurações do painel
- Pergunta: há forma de customizar isso?

---

### Opção 5: Modificar Dialplan do Asterisk (Avançado)

**Solução:**
- Se você tiver acesso ao dialplan do Asterisk
- Modificar o dialplan usado pelo Fortics para click-to-call
- Adicionar comando para definir Caller ID Name

**Requisitos:**
- Acesso root/sudo ao servidor Fortics
- Conhecimento de dialplan do Asterisk
- Backup antes de modificar

**Risco:**
- Pode quebrar outras funcionalidades
- Pode ser sobrescrito em atualizações do Fortics

---

## 🎯 Recomendação

**Solução Recomendada: Opção 1 + Opção 2**

1. **Aceitar a limitação** do 3CXPhone
2. **Melhorar a experiência no CRM:**
   - Mostrar claramente o número de destino no modal
   - Criar painel de chamada ativa com informações do cliente
   - Adicionar notificações visuais

**Por quê:**
- É a solução mais prática e rápida
- Não depende de configurações externas
- Melhora a experiência do operador
- Funciona imediatamente

---

## 📝 Próximos Passos

1. ✅ **Documentar a limitação** no código e documentação
2. ✅ **Melhorar o modal de chamada** no CRM para mostrar informações claras
3. ✅ **Criar painel de chamada ativa** (opcional, mas recomendado)
4. ✅ **Adicionar nota** informando que o 3CXPhone mostrará o ramal

---

## 🔍 Verificação Adicional (Opcional)

**Se quiser tentar mais uma coisa:**

1. **Verificar logs do Asterisk:**
   - Acessar servidor Fortics
   - Ver logs do Asterisk durante uma chamada
   - Verificar se as variáveis de canal estão sendo processadas

2. **Testar com outros formatos:**
   - Tentar formatos diferentes de variáveis
   - Verificar documentação do Asterisk para variáveis de canal

3. **Verificar versão do Fortics:**
   - Versões mais recentes podem ter funcionalidades diferentes
   - Atualizar se necessário

---

**💡 RECOMENDAÇÃO: Implementar Opção 1 + Opção 2 para melhorar a experiência do operador!**

