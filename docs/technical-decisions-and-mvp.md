# Toothfy — Decisões Técnicas, Contrato de Tools do Agente e Backlog de MVP
### Documento-base para SDD (Spec Driven Development)

---

## 1. Decisão de ORM: Drizzle, não Prisma

**Decisão:** Drizzle ORM.

**Motivo:** RLS no Postgres exige que o contexto de tenant (`SET LOCAL app.current_tenant_id`) seja aplicado dentro da mesma transação de cada query. Prisma não tem isso nativo — o próprio fabricante documenta como fazer via client extension, o que introduz uma camada de abstração adicional entre "o dev escreveu uma query" e "o que realmente rodou no banco". Drizzle é essencialmente um query builder SQL-first: o padrão de abrir uma transação, rodar `SET LOCAL`, e então a query, é direto e sem mágica escondida — o que reduz a superfície de erro exatamente no ponto mais sensível do sistema (isolamento de tenant).

**Consequência prática para o SDD:** todo acesso a banco passa por uma função helper única (`withTenantContext(tenantId, callback)`), nunca por uma instância de client "crua". Essa função é testada uma vez, exaustivamente (incluindo teste de bypass/vazamento), e todo o resto do código a usa sem reimplementar o padrão de `SET LOCAL`.

```ts
// Padrão obrigatório de acesso a dado tenant-scoped
async function withTenantContext<T>(tenantId: string, fn: (tx: DrizzleTx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);
    return fn(tx);
  });
}
```

Nenhuma rota de API, nenhuma tool do agente de IA, chama o banco fora dessa função.

---

## 2. Decisão de Autenticação: Better Auth

**Decisão:** Better Auth, self-hosted, dados no mesmo Postgres do restante da aplicação.

**Motivo:** mantém identidade de usuário (dentista, staff, gestor) sob o mesmo guarda-chuva de segurança do resto do dado sensível — coerente com a tese arquitetural do produto. O plugin de `organization` do Better Auth gera o conceito de organização/membro/convite que mapeamos diretamente para `tenants`/`users` do schema já definido. É gratuito por ser biblioteca (não serviço pago por MAU), o que remove uma variável de custo variável que cresceria com a base de clientes.

**Trade-off aceito conscientemente:** Clerk teria setup mais rápido para a demo do MVP. Não vale a troca — migrar de provedor de auth depois que há usuário real cadastrado é um dos retrabalhos mais dolorosos em SaaS, e não há ganho de médio prazo em começar com um fornecedor externo de identidade quando o produto já tem, por natureza, exigência forte de dado sob controle direto (saúde, LGPD).

---

## 3. Contrato das Tools do Agente de IA

### 3.1 Princípios de design do contrato

- **Toda tool é um contrato estreito** (Interface Segregation da conversa anterior): uma responsabilidade, schema de entrada e saída explícito.
- **Toda tool de escrita passa por um Policy Gate antes de executar** — a decisão de "isso pode rodar sozinho ou precisa de aprovação humana" não vive dentro da tool, vive num serviço de política separado e testável sem LLM.
- **Toda tool de escrita exige `idempotency_key`** — o agente pode reprocessar uma mensagem (falha de rede, retry de LLM) e isso não pode duplicar agendamento ou cobrança.
- **Tools de leitura nunca exigem aprovação.** Só tools de escrita entram no fluxo de política.

### 3.2 Catálogo de tools (v1 do MVP)

```ts
// ---- LEITURA ----

type GetAvailabilityInput = {
  professional_id?: string;
  date_range: { from: string; to: string }; // ISO 8601
};
type GetAvailabilitySlot = { professional_id: string; starts_at: string; duration_minutes: number };
// output: GetAvailabilitySlot[]

type GetPatientFinancialStatusInput = { patient_id: string };
type GetPatientFinancialStatusOutput = {
  balance_due: number;
  overdue_items: { transaction_id: string; amount: number; due_date: string }[];
};

type SearchPatientKnowledgeInput = { patient_id: string; query: string };
// busca semântica em ai_embeddings filtrada por tenant + patient_id
// output: { source_type: string; content: string; score: number }[]

// ---- ESCRITA (todas exigem idempotency_key e passam pelo Policy Gate) ----

type ScheduleAppointmentInput = {
  idempotency_key: string;
  patient_id: string;
  professional_id: string;
  starts_at: string;
  procedure_id?: string;
};
// requires_approval: false por padrão (agendamento em horário livre é ação de baixo risco)

type RescheduleAppointmentInput = {
  idempotency_key: string;
  appointment_id: string;
  new_starts_at: string;
};
// requires_approval: false por padrão

type ProposePaymentPlanInput = {
  idempotency_key: string;
  patient_id: string;
  transaction_id: string;
  installments: number;
  discount_percent?: number;
};
// requires_approval: CONDICIONAL — decidido pelo Policy Gate, não pela tool.
// Regra de exemplo: até 3x sem desconto = auto-aprovado; desconto > 0% ou
// parcelamento > 3x = fica pending_approval até um humano confirmar no app mobile.

type EscalateToHumanInput = {
  conversation_id: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
};
// requires_approval: false (escalar para humano nunca precisa de aprovação humana, por definição)
```

### 3.3 O Policy Gate

```ts
async function policyGate(tenantId: string, action: AiAgentAction): Promise<'executed' | 'pending_approval'> {
  const policy = await getTenantPolicy(tenantId); // configurável por clínica no plano Growth+
  if (action.type === 'propose_payment_plan') {
    const withinAutoApprovalLimits =
      action.payload.installments <= policy.maxAutoApprovalInstallments &&
      (action.payload.discount_percent ?? 0) <= policy.maxAutoApprovalDiscount;
    return withinAutoApprovalLimits ? 'executed' : 'pending_approval';
  }
  return 'executed'; // demais ações de escrita do MVP são de baixo risco por design
}
```

Toda chamada de tool de escrita gera uma linha em `ai_agent_actions` (já definida no documento de arquitetura de dados) com o resultado do Policy Gate — isso é o que torna a política auditável e testável via TDD clássico, sem precisar invocar o LLM no teste.

---

## 4. Backlog de MVP — Agora Sim Executável

Com ORM, Auth, hospedagem e canal de WhatsApp decididos, o MVP vira épicos concretos:

### Épico 1 — Fundação (pré-requisito de tudo, sem valor de negócio direto ainda)
- Setup do projeto Next.js + Drizzle + Postgres (Vercel + banco com pgvector — Supabase ou Neon cobrem isso para a fase de demonstração; migração para AWS/RDS fica para depois da validação)
- Better Auth com plugin de organization mapeado para `tenants`
- Middleware de resolução de subdomínio → `tenant_id` → `withTenantContext`
- Migrations completas do schema já definido, com RLS habilitado em toda tabela desde o primeiro commit
- Teste de CI de isolamento de tenant (não é opcional, é item de Definition of Done do Épico 1)

### Épico 2 — ERP Core mínimo
- Cadastro de paciente + anamnese básica
- Agenda com disponibilidade por profissional
- Prontuário simplificado (odontograma + notas)
- Financeiro básico (status de pagamento)

### Épico 3 — Agente de IA no WhatsApp (Meta Cloud API oficial)
- Webhook de recebimento de mensagem (texto + áudio) da API oficial da Meta
- Transcrição de áudio
- Orquestrador do agente com as tools de leitura + `schedule_appointment` / `reschedule_appointment` (as duas de menor risco)
- Policy Gate implementado desde já, mesmo que no MVP quase tudo seja `executed` — a estrutura precisa existir para não virar retrofit depois
- Lembrete automatizado de consulta (job agendado, não depende de conversa ativa)

### Épico 4 — Validação comercial
- Onboarding de clínica (criação de tenant + subdomínio automático)
- Cobrança do próprio Toothfy (assinatura do plano Solo) via gateway de terceiro simples (Stripe ou Pagar.me) — não construir isso próprio

### Fora do MVP (deliberadamente adiado, coerente com o documento de estratégia de produto)
- `propose_payment_plan` com negociação real de desconto — a tool e o Policy Gate existem, mas a política inicial pode ser "sempre pending_approval", sem automação plena, até haver dado suficiente
- App mobile (Expo)
- Multi-unidade / Enterprise
- Migração para AWS (o MVP de demonstração roda em Vercel + Postgres gerenciado; a decisão de infraestrutura AWS é para depois de validar tração, não antes)

**Ordem de execução sugerida:** Épico 1 → Épico 2 → Épico 3 (só a parte de agendamento, sem negociação) → Épico 4. Isso permite ter uma clínica pagante usando o produto de ponta a ponta antes de investir na parte mais arriscada (negociação financeira automatizada), que é exatamente o critério de saída do MVP já definido no documento de estratégia de produto.