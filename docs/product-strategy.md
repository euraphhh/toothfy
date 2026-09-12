# Toothfy — Estratégia de Produto e Matriz de Funcionalidades
### Documento-base para SDD (Spec Driven Development)

---

## 1. Visão Geral do Produto e Diferencial Competitivo

### 1.1 O problema real do mercado

O mercado de software para clínicas odontológicas hoje se divide em dois grupos, e nenhum resolve o problema por completo:

- **ERPs odontológicos tradicionais** (agenda, prontuário, financeiro) — maduros em gestão, mas com "IA" tratada como funcionalidade acessória: geralmente um chatbot de fluxo fechado (árvore de decisão "digite 1 para agendar") plugado via webhook externo.
- **Plataformas de automação de WhatsApp** (Typebot, n8n + LLM, SaaS de bot genérico) — flexíveis em conversa, mas **cegas ao dado real da clínica**. Elas não enxergam o prontuário, não sabem se o paciente tem pendência financeira, não sabem a agenda real do dentista em tempo real. Cada ação depende de uma integração de terceiros (API, webhook, ETL) que introduz latência, ponto de falha e, principalmente, **fuga de dado sensível (saúde) para fora do perímetro de segurança do tenant**.

O resultado prático dessas arquiteturas fragmentadas: a IA "conversa bem" mas age mal, porque toda decisão relevante (agendar, negociar, orientar clinicamente) depende de uma consulta a um sistema terceiro que pode estar desatualizado, fora do ar, ou simplesmente não ter aquele dado modelado.

### 1.2 A aposta arquitetural do Toothfy

A tese central do Toothfy é: **o diferencial competitivo não é o modelo de IA usado, é a arquitetura de dados que dá contexto a ele.**

Ao colocar o pgvector dentro do mesmo cluster PostgreSQL que já guarda prontuário, agenda e financeiro — e usar RLS nativo como camada de isolamento única para dado transacional e dado vetorial — o Toothfy elimina três problemas estruturais das soluções concorrentes:

| Problema nas soluções isoladas | Solução nativa do Toothfy |
|---|---|
| Dado clínico/financeiro replicado ou "vazado" para uma ferramenta de automação externa | Nunca sai do banco. O agente de IA roda queries (inclusive semânticas via embeddings) **dentro** do mesmo contexto transacional protegido por RLS |
| Latência e inconsistência entre "o que o bot sabe" e "o que está na agenda agora" | Leitura em tempo real, sem ETL/sincronização — o agente lê o estado atual do banco, não uma cópia |
| Segurança multi-tenant depende de disciplina de código em cada integração | Segurança é garantida no nível do banco (RLS), não no nível da aplicação — um bug de código não implica em vazamento cross-tenant |
| IA genérica sem memória de negócio (não sabe o histórico do paciente, não sabe o padrão de inadimplência) | RAG nativo: o embedding de cada interação, prontuário e nota fica no mesmo tenant, permitindo contexto real na triagem e na negociação |

**Ponto de honestidade arquitetural:** essa é uma decisão de trade-off, não uma bala de prata. Colocar carga vetorial (pgvector) no mesmo OLTP que sustenta o ERP transacional é ótimo para *velocidade de desenvolvimento, consistência e segurança* na fase inicial — mas cria acoplamento de performance. Em algum ponto de escala (a definir com métricas reais: tamanho de índice HNSW, volume de embeddings por tenant, concorrência de queries vetoriais vs. transacionais), pode ser necessário migrar a carga vetorial para um read-replica dedicado ou um vector store separado. Isso deve ser tratado como um **ponto de revisão arquitetural planejado**, não como um risco a ser ignorado — vale registrar isso explicitamente no SDD como "decisão reversível com gatilho de migração definido" (ex: acima de N clínicas ativas ou M milhões de vetores, reavaliar).

### 1.3 A proposta de valor em uma frase

> "O Toothfy não é uma agenda com um chatbot anexado. É um ERP odontológico onde o atendimento por IA tem os mesmos olhos que o dentista tem sobre a clínica — e a mesma segurança de dado que a LGPD exige."

---

## 2. Engenharia de Planos e Monetização (Pricing & Packaging)

Premissa de precificação: o eixo de valor percebido não é "número de usuários" (modelo SaaS genérico), e sim **volume de atendimento por IA + número de cadeiras/profissionais**, porque é isso que correlaciona com o ganho real do cliente (tempo de recepção economizado, redução de no-show, recuperação de inadimplência).

### 2.1 Plano Solo — Entrada

**Público-alvo:** dentista autônomo, consultório de 1 cadeira, geralmente migrando de agenda de papel, Google Agenda ou planilha.

| Item | Especificação |
|---|---|
| Preço sugerido (2026) | R$ 197–247/mês |
| Cadeiras/profissionais | 1 |
| Mensagens de IA no WhatsApp | Até ~500 interações/mês incluídas |
| Triagem e agendamento por IA | Sim (fluxo padrão) |
| Contorno de objeção financeira por IA | Não incluído (feature de plano superior — depende de dado histórico maduro) |
| Prontuário e odontograma | Completo |
| Financeiro | Básico (contas a receber, status de pagamento) |
| Número de WhatsApp | 1, compartilhado com o número pessoal via API oficial |
| App mobile | Não incluso nesta fase de lançamento (ver seção 4) |
| Suporte | Self-service + e-mail |

**Racional:** este plano precisa ser lucrativo mesmo com margem apertada de IA, porque sua função estratégica não é gerar receita relevante — é *reduzir a fricção de entrada* e gerar prova social/dados de uso para maturar os agentes.

### 2.2 Plano Growth — Carro-chefe

**Público-alvo:** clínicas com 2 a 6 profissionais, em fase de crescimento, dor real com recepção sobrecarregada e inadimplência.

| Item | Especificação |
|---|---|
| Preço sugerido (2026) | R$ 597–897/mês (faixa por número de profissionais) |
| Cadeiras/profissionais | 2 a 6 |
| Mensagens de IA no WhatsApp | Pool compartilhado (~3.000–5.000 interações/mês) |
| Triagem e agendamento por IA | Sim, com priorização de urgência (dor vs. estético vs. retorno) |
| Contorno de objeção financeira por IA | **Sim** — diferencial do plano: a IA acessa o financeiro do paciente para negociar parcelamento/2ª via com contexto real |
| Prontuário e odontograma | Completo, multi-profissional |
| Financeiro | Avançado: comissionamento por dentista, fluxo de caixa, inadimplência |
| Número de WhatsApp | Até 2 números / linhas |
| Cobrança integrada (Pix/cartão) | Sim, com taxa de transação (ver 2.4) |
| App mobile | Incluso quando disponível (ver roadmap) |
| Suporte | Chat prioritário + onboarding assistido |

Este é o plano onde a tese do produto ("IA que age, não só conversa") precisa estar mais evidente — é o gancho comercial principal.

### 2.3 Plano Enterprise/Premium

**Público-alvo:** clínicas com múltiplas unidades, múltiplas cadeiras, redes odontológicas, franquias.

| Item | Especificação |
|---|---|
| Preço sugerido (2026) | A partir de R$ 1.500–2.000/mês por unidade, ou contrato negociado por volume |
| Cadeiras/profissionais | Ilimitado (licenciamento por unidade/cadeira) |
| Mensagens de IA no WhatsApp | Volume alto ou ilimitado com fair use, com SLA de latência |
| Multi-unidade | Gestão consolidada entre filiais com RLS por unidade dentro do mesmo tenant corporativo |
| Automação massiva | Campanhas de reativação de base, follow-up pós-operatório automatizado, integração com convênios/planos odontológicos |
| Financeiro | BI consolidado multi-unidade, exportação contábil |
| Customização de agente | Prompts/tom de voz e políticas de negociação configuráveis por unidade |
| SLA e suporte | Dedicado, com gestor de conta |
| App mobile | Completo, com permissões hierárquicas (dono da rede vs. gestor de unidade) |

**Nota honesta:** este plano só deve ser vendido de fato depois que o produto tiver casos de sucesso comprovados nos planos Solo/Growth. Vender "automação massiva multi-unidade" antes de validar a robustez do agente em um único consultório é o tipo de promessa que gera *churn* e dano reputacional cedo demais.

### 2.4 Monetização complementar (além da assinatura)

1. **Consumo de tokens/IA acima da franquia:** cobrança por pacote adicional de interações (ex: R$ 0,15–0,35 por interação de IA excedente, ou pacotes de 1.000 interações). Isso alinha custo variável de LLM com receita variável — essencial porque custo de IA não é fixo como infraestrutura tradicional.
2. **Taxa de transação financeira embutida:** ao processar pagamentos (Pix/cartão) diretamente na plataforma, cobrar um percentual (ex: 1,5%–2,5% + valor fixo por transação), similar ao modelo de gateways como Stripe/Pagar.me, mas capturado como receita do Toothfy via split de pagamento.
3. **Números de WhatsApp adicionais / linhas dedicadas:** cobrança por linha extra além do incluso no plano.
4. **Add-ons verticais futuros:** emissão de nota fiscal de serviço integrada, assinatura digital de contratos/termos, relatório de BI avançado — vendidos como módulos, não forçados no core.

---

## 3. Matriz Detalhada de Funcionalidades

### 3.1 ERP Core (Web) — "o feijão com arroz"

Função: fazer o dentista abandonar o sistema legado. Sem isso maduro, a IA não tem o que ler.

- Cadastro completo de pacientes e anamnese digital (com trilha de consentimento LGPD)
- Prontuário eletrônico odontológico com odontograma interativo
- Agenda multi-profissional com bloqueios, encaixes e regras de disponibilidade por cadeira
- Gestão financeira: contas a receber/pagar, comissionamento por dentista/procedimento, fluxo de caixa
- Controle de estoque de materiais e insumos
- Emissão de documentos: orçamentos, atestados, contratos de tratamento
- Gestão de convênios e planos odontológicos (tabela de procedimentos por convênio)
- Relatórios gerenciais (ocupação de agenda, ticket médio, taxa de retorno)
- Configuração multi-unidade e hierarquia de permissões (dono, gestor, recepção, dentista)
- Subdomínio dinâmico por tenant (provisionamento automático em `<clinica>.toothfy.com`)

### 3.2 Agente de Atendimento por IA (WhatsApp) — "os superpoderes"

Função: ser o motivo pelo qual o cliente escolhe Toothfy em vez de um concorrente com preço menor.

- Recepção de **áudio e texto** com transcrição e interpretação de intenção (não fluxo travado de menu)
- Triagem clínica inicial: classifica urgência (dor aguda vs. check-up de rotina vs. estético) e prioriza encaixe
- Agendamento e reagendamento autônomo, consultando disponibilidade real da agenda via query com RLS aplicado (o agente nunca vê dado de outro tenant, por construção)
- Confirmação e lembrete automatizado de consulta, com lógica de redução de no-show
- **Negociação financeira contextual**: acessa pendências e histórico de pagamento do paciente para oferecer parcelamento, 2ª via de boleto/Pix, ou justificar valor com base no plano de tratamento — sem inventar condições fora da política definida pela clínica
- RAG sobre o histórico clínico (via pgvector) para responder dúvidas pós-procedimento (ex: "posso comer o quê depois da extração?") com base no que foi registrado pelo dentista, não em resposta genérica
- Detecção de sentimento/insatisfação com escalonamento automático para atendimento humano
- Geração de resumo de atendimento para o dentista revisar antes da consulta

**Ponto de atenção para o SDD:** o agente deve ter uma **política de ação explícita e auditável** (o que ele pode prometer, negociar ou confirmar sozinho vs. o que precisa de aprovação humana). Isso não é só UX — é mitigação de risco jurídico/financeiro, especialmente na função de negociação de cobrança.

### 3.3 App Mobile (Expo/React Native) — escopo restrito ao dentista/gestor

Função: **não é** uma réplica da recepção. É uma ferramenta de supervisão e gestão executiva.

- Dashboard executivo: faturamento do dia/semana, taxa de ocupação, no-show
- Monitoria de conversas da IA em andamento, com opção de intervenção humana em tempo real
- Notificações push para eventos críticos (cancelamento de última hora, reclamação, paciente com urgência classificada como alta)
- Visualização rápida de agenda e prontuário resumido (não edição completa)
- Aprovação de exceções que o agente de IA escalou (ex: desconto fora de política)

**Fora de escopo deliberado no mobile:** cadastro completo de paciente, edição de odontograma detalhado, gestão financeira completa — isso permanece na web por design, para não duplicar complexidade de UI em duas plataformas.

---

## 4. Estratégia de MVP

Objetivo do MVP: **provar a tese "IA nativa lê o dado real e age sobre ele"** com o menor escopo possível que ainda gere disposição de pagamento, sem tentar entregar tudo da matriz acima de uma vez.

### 4.1 O que entra no Dia 1

| Componente | Escopo no MVP |
|---|---|
| Multi-tenancy + RLS | **Completo desde o dia 1** — não é feature, é fundação. Retrofitting de RLS depois que há dado de produção é caro e arriscado; isso não pode ser adiado |
| Agenda + cadastro de paciente + prontuário básico | Completo o suficiente para o dentista abandonar o sistema/planilha anterior |
| Financeiro | Básico: status de pagamento e contas a receber. Sem emissão fiscal integrada ainda (pode ser feita fora da plataforma no MVP) |
| Agente de IA no WhatsApp | Escopo restrito a **triagem + agendamento/reagendamento + lembretes automatizados**. |
| Pagamento | Integração com gateway de terceiro (Pix/cartão) já existente no mercado — não construir processador de pagamento próprio no MVP |
| App mobile | **Fora do MVP.** Web responsiva cobre a necessidade inicial do dentista/gestor |
| pgvector | Escopo reduzido: embeddings de conversas do WhatsApp e resumos de prontuário — não o histórico clínico completo desde o início |

### 4.2 O que deliberadamente NÃO entra no Dia 1 (e por quê)

- **Contorno de objeção financeira por IA:** essa é a feature mais vistosa do pitch, mas também a mais arriscada de lançar imatura. Ela depende de volume real de conversas para calibrar o agente (tom, limites de negociação, política de risco). Lançar isso mal ajustado no MVP gera dano de marca maior do que o benefício de tê-lo cedo. Recomendação honesta: construir a infraestrutura (acesso do agente ao financeiro) no MVP, mas manter a política de negociação em modo conservador/supervisionado até haver dado suficiente para confiar na automação total.
- **Automação multi-unidade e BI consolidado (Enterprise):** não faz sentido de negócio antes de haver clínica pagante validada no plano de entrada.
- **App mobile:** cada plataforma adicional (Expo) multiplica superfície de manutenção; validar a proposta de valor central na web primeiro é mais barato e mais rápido de iterar.

### 4.3 Critério de saída do MVP

O MVP deve ser considerado validado quando houver evidência mensurável de que:
1. Clínicas pagantes mantêm o produto ativo (baixo *churn* nos primeiros 90 dias) usando o ERP Core como sistema principal (não em paralelo com o sistema antigo).
2. O agente de IA reduz mensuravelmente tempo de recepção humana ou taxa de no-show — não apenas "gera conversas", mas gera *ação* (agendamentos concluídos sem intervenção humana).
3. A arquitetura RLS + pgvector se comporta de forma estável sob carga real, sem sinais de gargalo que já indiquem necessidade de segregar a carga vetorial.

Somente com esses três sinais validados faz sentido avançar para as features mais arriscadas (negociação financeira automatizada plena, multi-unidade, mobile).