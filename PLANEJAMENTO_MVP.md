# 📋 Planejamento do MVP - CRM para Crédito Consignado

> **Documento de Referência**: Este arquivo contém todas as especificações, requisitos e decisões de negócio para o desenvolvimento do MVP do CRM. Consulte este documento sempre que necessário durante o desenvolvimento.

---

## 1️⃣ CONTEXTO E OBJETIVOS DO NEGÓCIO

### 1.1 Tamanho das Empresas-Alvo
- **Resposta**: Pequenas e Médias empresas
- **Futuro**: Expandir para grandes empresas

### 1.2 Usuários Simultâneos no MVP
- **Resposta**: 30 usuários (operadores ou administradores)
- **Futuro**: Expansão planejada

### 1.3 Principal Problema Resolvido
- Não ter um CRM onde consiga atender o cliente, tabular o atendimento e analisar essas marcações quando necessário
- Ter o cliente cadastrado em um só local e acompanhar o histórico completo (empréstimos anteriores, produtos, valores)

### 1.4 Meta de ROI/Métrica de Sucesso
- **Resposta**: Não definida no momento
- **Futuro**: Implementação planejada

### 1.5 Prazo de Lançamento
- **Resposta**: Sem prazo definido, mas o mais rápido possível
- **Abordagem**: Protótipo funcional com aprimoramentos futuros

---

## 2️⃣ FUNIL DE VENDAS E PROCESSO COMERCIAL

### 2.1 Etapas do Funil de Vendas
1. **Lead** (CPF, Nome, Telefone, Origem)
2. **Qualificação** (Renda, Margem disponível, Idade)
3. **Análise** (Documentação recebida, Score interno)
4. **Proposta** (Valor do crédito, Taxas, Parcelas)
5. **Contratação** (Data contrato, Número contrato)

### 2.2 Sub-etapas ou Status
- **Resposta**: Não existem no primeiro momento
- **Futuro**: Implementação planejada

### 2.3 Motivos de Perda por Etapa

#### ETAPA 1: LEAD → QUALIFICAÇÃO
**Motivos de Perda:**
- Dados Incorretos/Incompletos (Telefone não existe, email inválido)
- Não Atende/Incontactável (Várias tentativas sem sucesso)
- Não Tem Interesse Imediato ("Me liga em 3 meses")
- Já Contratou com Concorrente (Perda por timing)
- Não se Enquadra no Público-Alvo (Ex.: Ainda não é aposentado ou servidor público)

**Ação do Sistema**: Botão "Desqualificar Lead" com dropdown dessas opções

#### ETAPA 2: QUALIFICAÇÃO → ANÁLISE
**Motivos de Perda:**
- Margem Consignável Insuficiente (Renda baixa ou margem comprometida)
- Fora da Faixa Etária (Muito jovem ou acima do limite)
- Score/Restrição Cadastral (Nome sujo, CPF com restrição)
- Não Possui Documentação Exigida (Não tem contracheque, declaração, etc.)
- Não Aceita as Condições/Taxas (Acha os juros/custos altos)
- Perda de Interesse (Arrependimento após entender as condições)

**Ação do Sistema**: Campo obrigatório de motivo ao regredir o estágio

#### ETAPA 3: ANÁLISE → PROPOSTA
**Motivos de Perda:**
- Documentação Inconsistente (Renda não confere com declarado)
- Documentação Expirada (Comprovante de residência com mais de 60 dias)
- Impedimento Legal (Penhora, recuperação judicial, etc.)
- Análise de Crédito Interna Reprovada (Risco alto para a instituição)
- Prazo de Análise Muito Longo (Cliente desistiu pela demora)

**Ação do Sistema**: Marcar o motivo e automaticamente notificar o cliente (se aplicável)

#### ETAPA 4: PROPOSTA → CONTRATAÇÃO
**Motivos de Perda:**
- Desistência na Reta Final ("Precisei pensar melhor e vou esperar")
- Concorrência (Offer Shocking) - Apareceu proposta melhor de outro banco/consignado
- Mudança de Necessidade (Situação financeira/saúde do cliente mudou)
- Problemas com a Liberação (A instituição credora travou a liberação por algum detalhe)
- Insatisfação com o Atendimento (Demora para tirar dúvidas, mudança de corretor)

**Ação do Sistema**: Tracking obrigatório com categoria detalhada

### 2.4 Implementação do Tracking de Perdas

#### Campos Obrigatórios no Sistema:
- **Status do Cliente**: (Ativo, Perdido, Contratado)
- **Motivo da Perda**: (Dropdown com a lista acima)
- **Data da Perda**: (Preenchimento automático)
- **Observações**: (Campo livre para detalhes, ex.: "Concorrente X ofereceu taxa 0.5% menor")

#### Fluxo de Marcar uma Perda:
1. Usuário clica "Marcar como Perdido"
2. Sistema exibe dropdown "Motivo da Perda" (OBRIGATÓRIO)
3. Sistema pergunta "Observações adicionais?" (OPCIONAL)
4. Sistema move o cliente para a lista "Perdidos" e registra data/usuário

#### Relatórios Críticos:
- Taxa de Conversão por Etapa: Onde estamos perdendo mais clientes?
- Motivo de Perda Mais Comum: É a margem? É a documentação?
- Performance por Corretor: Quem tem a maior taxa de conversão e por quê?
- Análise de Concorrência: Quantos clientes estamos perdendo para concorrentes específicos?

### 2.5 Automações entre Etapas
- **Resposta**: Não no momento
- **Futuro**: Implementação planejada

### 2.6 Retorno para Etapas Anteriores
- **Resposta**: Sim, contanto que fique um log de registros detalhado

### 2.7 SLA por Etapa
- **Resposta**: Não no momento
- **Futuro**: Implementação planejada

---

## 3️⃣ CADASTRO E GESTÃO DE CLIENTES

### 3.1 Dados Obrigatórios
- CPF
- Nome
- Telefone
- Marcar se telefone é WhatsApp ou não

### 3.2 Dados Opcionais (mas importantes)
- Cidade
- UF
- Endereço Completo
- CEP
- Data de Nascimento
- Matrícula

### 3.3 Validação de CPF
- **Resposta**: Sim, se for uma implementação gratuita e automatizada

### 3.4 Armazenamento de Documentos Digitalizados
- **Resposta**: Sim, com otimização de armazenamento para evitar altos custos

#### Estratégias de Otimização:

**1. Compressão Inteligente de Arquivos**

**Para imagens (RG, selfies):**
- WebP (reduz 25-35% vs JPEG sem perda de qualidade)
- AVIF (ainda mais eficiente, mas suporte menor)
- Ferramentas: Squoosh, ImageOptim, Sharp (Node.js)

**Para PDFs:**
- Ghostscript para otimizar PDFs
- pdf-lib com compressão
- SmallPDF (API disponível)

**Documentos escaneados:**
- Reduzir DPI (150-200 DPI é suficiente)
- Converter para escala de cinza quando possível
- Compactação JPEG com qualidade 70-80%

**PDFs:**
- Remover metadados desnecessários
- Compactar imagens internas
- Usar ferramentas como qpdf ou pdftocairo

### 3.5 Histórico de Interações
- **Resposta**: Sim, histórico completo necessário

### 3.6 Múltiplas Propostas Simultâneas
- **Resposta**: Sim, um mesmo cliente pode ter múltiplas propostas simultâneas

### 3.7 Importação em Massa de Leads
- **Resposta**: Sim
- **Formato**: CSV ou Excel
- **Modelo**: Padrão a ser definido

---

## 4️⃣ DISCADOR - INTEGRAÇÃO E FUNCIONALIDADES

### 4.1 Provedor de Discador
- **Resposta**: Fortics BPX (Mailling e Discador) e 3CXPhone (recebe a ligação)
- **Status**: Permanecer com eles

### 4.2 Fluxo Integrado - Passo a Passo

1. **Discagem (Fortics)**: O Fortics disca a partir do mailing e direciona a chamada atendida para o 3CXPhone de um operador disponível

2. **Atendimento (3CXPhone)**: O operador atende a ligação no seu 3CXPhone

3. **Tabulação Inteligente (CRM)**: Imediatamente ao atender, uma tela de tabulação do CRM é aberta automaticamente na tela do computador do operador, pré-preenchida com os dados do cliente que vieram do mailing do Fortics (nome, telefone, etc.)

4. **Registro no Funil (CRM)**: O operador faz a tabulação (classifica o interesse, anota observações) diretamente no CRM. Ao clicar em "Salvar":
   - Um novo lead é criado no estágio inicial do funil, OU
   - Um cliente existente é atualizado com o novo contato e avançado no funil

### 4.3 Tipo de Discador
- **Resposta**: O discador da Fortics já possui os 3 tipos (preditivo, power dialer e click to call)

### 4.4 Gravação Automática
- **Resposta**: Não necessário - O discador já realiza essas gravações

### 4.5 Transcrição Automática
- **Resposta**: Não necessário

### 4.6 Distribuição Automática de Leads
- **Resposta**: Sim, mas acredita que o discador da Fortics já realiza esse procedimento

### 4.7 Fila de Espera e Callbacks
- **Resposta**: O discador da Fortics já realiza esse procedimento

### 4.8 Integração com WhatsApp
- **Resposta**: Não no momento
- **Futuro**: Necessário no futuro

### 4.9 Respeitar Horários Permitidos por Lei
- **Resposta**: Sim

---

## 5️⃣ PERMISSÕES E CONTROLES DE ACESSO

### 5.1 Perfis de Usuário
- **Resposta**: Apenas Admin e Funcionário no primeiro momento
- **Futuro**: Perfis intermediários (Supervisor, Gerente)

### 5.2 Visibilidade entre Funcionários
- **Resposta**: Sim, funcionários podem ver leads/clientes de outros funcionários
- **Futuro**: Pode mudar

### 5.3 Distribuição de Leads
- **Resposta**: Automática

### 5.4 Reatribuição de Leads
- **Resposta**: Sim, administradores podem reatribuir leads entre funcionários

### 5.5 Auditoria/Log de Ações
- **Resposta**: Sim, há necessidade de auditoria/log de todas as ações dos usuários

### 5.6 Permissões de Edição
- **Resposta**: Funcionários podem editar informações de clientes

---

## 6️⃣ RELATÓRIOS E DASHBOARDS

### 6.1 KPIs Mais Importantes (Top 5)

#### 1. Taxa de Conversão da Campanha (%)
- **O que mede**: A eficácia real do seu mailing e da sua operação
- **Fórmula**: (Clientes no Funil / Total de Ligações Atendidas) * 100
- **Por que é crítico**: Mostra se você está discando para as pessoas certas, no horário certo e se a abordagem dos operadores está funcionando

#### 2. Tempo Médio do Ciclo de Vendas (Dias)
- **O que mede**: A velocidade do seu funil, do primeiro contato à contratação
- **Fórmula**: Data Média de Contratação - Data Média do Primeiro Contato
- **Por que é crítico**: No crédito consignado, velocidade é dinheiro. Um ciclo longo significa maior risco do cliente desistir ou ser capturado pela concorrência

#### 3. Valor da Carteira de Oportunidades (R$)
- **O que mede**: O potencial de faturamento em negociação
- **Fórmula**: Soma do Valor de Todas as Propostas em Aberto no Funil
- **Por que é crítico**: É um indicador de saúde financeira futura. Permite prever receita e alocar recursos

#### 4. Taxa de Abandono no Funil por Estágio (%)
- **O que mede**: Onde você está perdendo mais clientes
- **Fórmula**: (Clientes que Sairam em um Estágio / Clientes que Entraram no Estágio) * 100
- **Por que é crítico**: Identifica gargalos específicos. Ex.: Se há um pico de abandono na "Análise", o problema pode ser a documentação

#### 5. Produtividade por Operador (Ligações/Hr + Conversão)
- **O que mede**: A eficiência individual da equipe
- **Fórmula**: Nº de Ligações por Hora por Operador + Taxa de Conversão Individual (%)
- **Por que é crítico**: Permite identificar os melhores (para replicar práticas), quem precisa de treinamento e folga na equipe

### 6.2 Frequência de Relatórios
- **Resposta**: Relatórios diários

### 6.3 Tipos de Relatórios Essenciais
- Relatórios de conversão
- Relatórios de produtividade
- Relatórios de tabulação
- Relatórios de motivos de perda

### 6.4 Exportação de Relatórios
- **Resposta**: Sim, em PDF e Excel

### 6.5 Comparativos Temporais
- **Resposta**: Não no primeiro momento
- **Futuro**: Implementação planejada (mês atual vs anterior)

### 6.6 API para Integração
- **Resposta**: Sim, precisa de API para futura integração com outros sistemas

---

## 7️⃣ REQUISITOS TÉCNICOS E INFRAESTRUTURA

### 7.1 Cloud e Stack Tecnológico
- **Cloud**: Supabase e Vercel
- **Frontend**: React.js + TypeScript
- **Backend**: Node.js + Express

### 7.2 Transações Simultâneas
- **Resposta**: Não possui essa informação

### 7.3 Localização dos Dados (LGPD)
- **Resposta**: SIM, os dados dos clientes precisam ficar em servidores no Brasil

---

## 8️⃣ SEGURANÇA E COMPLIANCE

### 8.1 Medidas de Segurança
- **Resposta**: 2FA, criptografia e todas as que forem necessárias

### 8.2 Certificações
- **Resposta**: Não no primeiro momento

### 8.3 Consentimento LGPD
- **Resposta**: Não vai ter no primeiro momento

### 8.4 Termo de Uso e Política de Privacidade
- **Resposta**: Não no momento

---

## 9️⃣ EXPERIÊNCIA DO USUÁRIO (UX/UI)

### 9.1 Responsividade
- **Resposta**: Sim, com toda certeza

### 9.2 App Mobile
- **Resposta**: Web app é suficiente (não precisa de app nativo)

### 9.3 Nível de Familiaridade Tecnológica
- **Resposta**: Intermediário

### 9.4 Referências de UI
- **Resposta**: RD CRM e Pipedrive

### 9.5 Modo Escuro
- **Resposta**: Sim, é essencial

---

## 🔟 NOTIFICAÇÕES E COMUNICAÇÕES

### 10.1 Eventos que Geram Notificações
- Novo lead
- Follow-up pendente

### 10.2 Canais de Notificação
- **Resposta**: Push

### 10.3 Configuração de Preferências
- **Resposta**: Sim, usuários podem configurar suas preferências de notificação

### 10.4 Lembretes Automáticos
- **Resposta**: Não no momento

---

## 1️⃣1️⃣ GESTÃO DE TAREFAS E FOLLOW-UP

### 11.1 Gestão de Tarefas
- **Resposta**: Sim, o sistema deve incluir gestão de tarefas (to-do list) por cliente

### 11.2 Calendário Integrado
- **Resposta**: Sim, é necessário calendário integrado para agendamentos

### 11.3 Agendamento de Follow-ups
- **Resposta**: Manualmente (não sugeridos automaticamente)

### 11.4 Templates de E-mail/Mensagens
- **Resposta**: Não necessário

---

## 1️⃣2️⃣ ESCALABILIDADE E ROADMAP FUTURO

### 12.1 Multi-tenant
- **Resposta**: Sim, sistema deve ser multi-tenant
- **Implementação**: Banco Único com Tenant ID

### 12.2 Internacionalização
- **Resposta**: Quem sabe futuramente

---

## 🎯 PRIORIZAÇÃO FINAL - FUNCIONALIDADES INDISPENSÁVEIS DO MVP

### Núcleo Indispensável do MVP (Must-Have)

Estas são as funcionalidades sem as quais o produto não entrega seu valor central prometido.

#### 1. Cadastro e Gestão de Clientes/Leads (Básico, porém robusto)

**Cadastro:**
- Campos obrigatórios fundamentais (Nome, CPF, Telefone, E-mail, Fonte do Lead)
- Campos específicos do nicho: NIS/PIS, Órgão/Entidade, Margem Consignável (campo manual)

**Busca e Filtro:**
- Busca rápida por Nome e CPF
- Filtros básicos por status (ex: "Não Contatado", "Retornar Ligação") e órgão

**Detalhe do Cliente:**
- Uma tela para visualizar todas as informações do cliente e seu histórico de interações

#### 2. Pipeline (Funil) de Vendas Gerenciável

**Estágios Básicos:**
- Novo Lead → Contatado → Proposta Apresentada → Ganho/Perdido

**"Arrastar e Soltar":**
- Capacidade de mover um cliente entre os estágios do funil visualmente

**Metadados do Estágio:**
- Cada estágio deve mostrar quantos clientes estão nele

#### 3. Integração com Discador (O Coração do MVP)

**Click-to-Call:**
- Funcionário clica no telefone no registro do cliente e o discador disca

**Log Automático de Chamadas:**
- O sistema deve registrar automaticamente toda chamada (iniciada, atendida, não atendida) no histórico do cliente, com data, hora e duração

**Interface Contextual Durante a Ligação:**
- Ao realizar/receber uma chamada, abrir um painel lateral/pop-up com:
  - Nome do cliente
  - Últimas interações
  - Campo para anotações rápidas pós-ligação
  - Campo de tabulação (ex: Sem Interesse, Ligação Muda, Ligação Caiu, Prospecção, Agendar Cliente, Sem Possibilidade)

#### 4. Sistema de Tarefas e Agendamentos

**Criação de Tarefas:**
- Capacidade de criar uma tarefa para um cliente (ex: "Retornar ligação em 05/11")

**Lista de Tarefas do Dia:**
- O dashboard do funcionário deve mostrar suas tarefas pendentes e agendadas para o dia

#### 5. Módulo de Simulação de Crédito (Interno)

**Calculadora Integrada:**
- Uma tela/tela modal onde o funcionário insere Valor do Empréstimo, Número de Parcelas e Taxa de Juros, e o sistema calcula o valor da parcela
- Não precisa ser complexa ou enviável por link no MVP
- É uma ferramenta de apoio à venda durante a ligação

#### 6. Gestão de Usuários e Permissões Básicas

**Dois Papéis Fixos:**

**Administrador:**
- Acesso a tudo: cadastrar/desativar usuários, ver todos os clientes e relatórios

**Funcionário:**
- Acesso restrito. Só pode ver e editar seus próprios clientes/leads
- Não pode acessar configurações do sistema ou dados de outros funcionários

#### 7. Dashboard Contextual

**Para o Funcionário:**
- Suas metas do dia/semana
- Sua lista de tarefas
- Seus clientes nos estágios iniciais do funil

**Para o Administrador:**
- Visão geral do funil da equipe
- Total de leads
- Taxas de conversão básicas (ex: de "Contatado" para "Proposta")

---

## 📝 NOTAS IMPORTANTES

- Este documento deve ser consultado sempre que houver dúvidas sobre requisitos ou decisões de negócio
- Funcionalidades marcadas como "Futuro" não devem ser implementadas no MVP inicial
- Priorizar sempre as funcionalidades do "Núcleo Indispensável do MVP"
- Manter este documento atualizado conforme novas decisões forem tomadas

---

**Última Atualização**: Data de criação do documento
**Versão**: 1.0

