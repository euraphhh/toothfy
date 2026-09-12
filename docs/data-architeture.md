# Toothfy — Arquitetura de Banco de Dados e Modelo de Dados
### Documento-base para SDD (Spec Driven Development)

---

## 1. Filosofia de Isolamento Multi-Tenant

### 1.1 Decisão: Schema único + RLS, não schema-per-tenant

Existem três estratégias clássicas de multi-tenancy em Postgres:

| Estratégia | Isolamento | Custo operacional | Escala de migração |
|---|---|---|---|
| Database por tenant | Máximo | Alto (N conexões, N migrações, backup complexo) | Ruim acima de algumas centenas de tenants |
| Schema por tenant | Alto | Médio-alto (migração precisa rodar N vezes) | Degrada em centenas/milhares de tenants |
| **Schema único + coluna `tenant_id` + RLS** | Depende de disciplina de política, mas forte se bem implementado | Baixo (1 migração, N linhas) | Excelente, é o padrão de SaaS que escala para dezenas de milhares de tenants |

Para o Toothfy, a escolha correta é **schema único com RLS nativo**, pelo motivo que já está na tese do produto: é essa mesma estrutura que permite ao agente de IA e ao ERP compartilharem a mesma camada de segurança sem duplicar lógica. Schema-per-tenant quebraria exatamente a promessa arquitetural que diferencia o produto (uma política de segurança, um lugar só, aplicada a tudo — inclusive aos embeddings).

**Ponto de honestidade:** RLS não é "seguro por padrão" — ele é seguro *se* toda tabela sensível tiver `ENABLE ROW LEVEL SECURITY` e política ativa, *se* a role de aplicação não for superusuário/dono da tabela (que ignora RLS por padrão), e *se* toda transação setar corretamente o contexto de tenant antes de qualquer query. Um único ponto cego nisso é uma vulnerabilidade de vazamento cross-tenant. Isso precisa virar item de checklist de CI, não só de code review — ver seção 6.

---

## 2. Modelo de Dados — Núcleo

### 2.1 Convenção geral

- Toda tabela com dado de tenant tem `tenant_id UUID NOT NULL REFERENCES tenants(id)`.
- Toda tabela de negócio usa `id UUID DEFAULT gen_random_uuid()` como chave primária (evita vazamento de sequência incremental entre tenants e facilita replicação futura).
- Toda tabela tem `created_at`, `updated_at`; tabelas com dado clínico/financeiro têm também soft-delete (`deleted_at`), nunca DELETE físico — auditoria e LGPD exigem rastro.

### 2.2 Tabelas centrais (DDL simplificado)

```sql
-- Tenant (a clínica)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'solo', -- solo | growth | enterprise
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usuários (staff, dentistas, gestores) — vinculados a auth (ex: Supabase Auth / Auth próprio)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    auth_id UUID NOT NULL, -- id do provedor de autenticação
    role TEXT NOT NULL, -- owner | manager | dentist | receptionist
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pacientes
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    cpf TEXT,
    phone TEXT NOT NULL, -- chave de correlação com WhatsApp
    birth_date DATE,
    anamnesis JSONB DEFAULT '{}',
    lgpd_consent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Profissionais (dentistas)
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    cro_number TEXT,
    specialty TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cadeiras/salas (para plano Enterprise e controle de ocupação)
CREATE TABLE chairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    label TEXT NOT NULL,
    unit_id UUID -- referência a unidade física, relevante no plano Enterprise
);

-- Agendamentos
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    professional_id UUID NOT NULL REFERENCES professionals(id),
    chair_id UUID REFERENCES chairs(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled | confirmed | done | no_show | cancelled
    created_by TEXT NOT NULL DEFAULT 'human', -- 'human' | 'ai_agent' — rastreabilidade de quem agendou
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prontuário / evolução clínica
CREATE TABLE dental_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    professional_id UUID NOT NULL REFERENCES professionals(id),
    appointment_id UUID REFERENCES appointments(id),
    odontogram_data JSONB DEFAULT '{}', -- estado do odontograma por dente/face
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Procedimentos (catálogo)
CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    default_price NUMERIC(10,2) NOT NULL,
    category TEXT
);

-- Financeiro
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    patient_id UUID REFERENCES patients(id),
    appointment_id UUID REFERENCES appointments(id),
    amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | overdue | negotiating
    due_date DATE,
    payment_method TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 Camada de conversação e IA

```sql
-- Conversas do WhatsApp
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    patient_id UUID REFERENCES patients(id), -- pode ser nulo até identificação do contato
    channel_identifier TEXT NOT NULL, -- número de WhatsApp
    status TEXT NOT NULL DEFAULT 'open', -- open | escalated | closed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mensagens (histórico bruto)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender TEXT NOT NULL, -- 'patient' | 'ai_agent' | 'human_staff'
    content_text TEXT,
    audio_url TEXT,
    transcribed_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Log de ações do agente de IA — auditoria obrigatória, não opcional
CREATE TABLE ai_agent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    conversation_id UUID REFERENCES conversations(id),
    action_type TEXT NOT NULL, -- 'schedule' | 'reschedule' | 'negotiate_payment' | 'escalate_human'
    payload JSONB NOT NULL,
    required_approval BOOLEAN NOT NULL DEFAULT false,
    approved_by UUID REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'executed', -- executed | pending_approval | rejected
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`ai_agent_actions` não é um "nice to have": é a peça que sustenta a política de auditabilidade mencionada na seção 3.2 do documento de estratégia de produto. Sem essa tabela, não existe forma de provar depois — para o cliente, para um órgão regulador, ou em disputa jurídica — o que o agente decidiu sozinho e o que foi supervisionado.

### 2.4 Embeddings (pgvector) — tabela unificada, não uma por entidade

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE ai_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    source_type TEXT NOT NULL, -- 'message' | 'dental_record' | 'patient_summary'
    source_id UUID NOT NULL,   -- referência polimórfica ao registro de origem
    content TEXT NOT NULL,     -- texto original que gerou o embedding (para debug/RAG)
    embedding VECTOR(1536) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Por que uma tabela unificada e não `dental_record_embeddings`, `message_embeddings`, etc.:** o agente de RAG precisa fazer busca semântica cruzando tipos de fonte (ex: "o que esse paciente já reclamou + o que está escrito no prontuário dele") em uma única query vetorial. Fragmentar em tabelas por entidade obriga a IA a rodar N buscas e mesclar rankings manualmente — pior latência, pior qualidade de recall. O padrão `source_type + source_id` mantém uma única superfície de busca, com RLS aplicado de forma idêntica ao resto do banco.

---

## 3. Estratégia de RLS

### 3.1 Padrão de política

Toda tabela tenant-scoped segue o mesmo padrão:

```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients FORCE ROW LEVEL SECURITY; -- crítico: força RLS mesmo se a app conectar como dono da tabela

CREATE POLICY tenant_isolation ON patients
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
```

Repetir isso para **cada** tabela com `tenant_id` — incluindo `ai_embeddings`, `messages` e `ai_agent_actions`. Não existe exceção "essa tabela é só de leitura interna, não precisa" — é exatamente esse tipo de exceção que vira o incidente de segurança.

### 3.2 Como o contexto de tenant é definido

Fluxo por requisição:

1. Middleware da aplicação resolve o tenant a partir do subdomínio (`clinica.toothfy.com` → `tenant_id`).
2. A aplicação abre uma transação e executa `SET LOCAL app.current_tenant_id = '<uuid>';` como primeiro comando.
3. Todas as queries subsequentes daquela transação ficam automaticamente escopadas pela política RLS — inclusive as chamadas do agente de IA, que devem passar pelo **mesmo** middleware, nunca por uma conexão de banco separada "de admin".

### 3.3 Gotcha real de stack: RLS + ORM + connection pooling

Isso merece destaque porque é o tipo de detalhe que não aparece em tutorial de RLS e quebra em produção:

- `SET LOCAL` só vale dentro de uma transação. Se a aplicação usa um ORM (Prisma é o candidato mais provável no stack Node.js informado) que gerencia pool de conexões de forma transparente, é fácil acabar em uma situação onde a query real roda em uma conexão diferente daquela onde o `SET LOCAL` foi aplicado.
- Prisma, especificamente, não expõe nativamente "rode isso dentro da mesma transação com este SET LOCAL antes" de forma trivial — normalmente resolve-se com `$transaction` + query raw para o `SET LOCAL`, ou usando uma lib de extensão (ex: `prisma-extension-postgres-rls` ou equivalente) que injeta isso automaticamente em cada client scoped por tenant.
- Se o stack usar PgBouncer em modo *transaction pooling* (comum para escalar conexões), `SET LOCAL` continua funcionando porque seu escopo é a transação, não a conexão física — mas isso precisa ser testado explicitamente, porque erro aqui é silencioso: a query roda, retorna dado, só que potencialmente do tenant errado.

**Recomendação para o SDD:** definir logo cedo qual ORM/query builder será usado exatamente por essa razão. Se a equipe optar por algo mais "cru" (ex: Kysely ou Drizzle com controle explícito de transação) em vez de Prisma, a integração com RLS fica mais previsível. Vale registrar isso como decisão técnica explícita, não como detalhe de implementação a ser resolvido depois.

---

## 4. Indexação e Performance

```sql
-- Índices padrão: tenant_id sempre no início de índices compostos
CREATE INDEX idx_appointments_tenant_date ON appointments (tenant_id, scheduled_at);
CREATE INDEX idx_patients_tenant_phone ON patients (tenant_id, phone);
CREATE INDEX idx_financial_tenant_status ON financial_transactions (tenant_id, status);

-- Índice vetorial (HNSW é a escolha padrão em pgvector recente: melhor trade-off
-- de recall/latência que IVFFlat para a maioria das cargas de RAG conversacional)
CREATE INDEX idx_embeddings_hnsw ON ai_embeddings
    USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_embeddings_tenant_source ON ai_embeddings (tenant_id, source_type);
```

**Ponto de atenção real:** com todos os tenants compartilhando o mesmo índice HNSW em `ai_embeddings`, a política RLS filtra por `tenant_id` *depois* (ou combinada com) da busca por similaridade vetorial. Isso funciona corretamente em termos de segurança — RLS nunca é opcional — mas o comportamento de performance precisa ser monitorado à medida que o volume cresce: buscas vetoriais filtradas por um tenant pequeno dentro de um índice com milhões de vetores de outros tenants podem exigir mais varredura do que buscar em um índice pequeno e dedicado. Não é motivo para mudar a arquitetura agora, mas é métrica a acompanhar (latência de query vetorial por tenant, conforme volume total cresce) — e é exatamente o gatilho de migração mencionado no documento de estratégia de produto (seção 1.2).

---

## 5. Migrations e Ciclo de Vida

- Uma única pipeline de migration (schema único) rodando contra o banco compartilhado — sem necessidade de orquestrar migração em N schemas.
- Toda migration que adiciona uma nova tabela com `tenant_id` deve, no mesmo PR, incluir `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY` e a política — isso deveria ser um item de checklist automatizado (ver seção 6), não depender de lembrança do desenvolvedor.
- Retenção de dado de tenant cancelado: como o schema é único, "excluir um tenant" é uma operação de `DELETE`/anonimização em cascata coordenada — vale desenhar isso desde já, porque LGPD exige capacidade de exclusão de dado de paciente sob pedido, e isso é mais simples de implementar corretamente com um modelo bem definido de cascade/anonimização do que de improviso depois.

---

## 6. Riscos e Itens Não Negociáveis para o SDD

Sendo direto sobre onde este modelo pode falhar se a execução for descuidada:

1. **Teste automatizado de isolamento de tenant é obrigatório, não opcional.** Um teste de CI que, para cada tabela com `tenant_id`, tenta ler dado de um tenant B estando autenticado como tenant A e espera zero resultados. Sem isso, RLS é uma promessa não verificada.
2. **Nenhuma conexão de "admin" ou "service role" deve ser usada para servir requisição de usuário final.** Toda rota de aplicação — incluindo as chamadas do agente de IA — passa pelo mesmo caminho de `SET LOCAL app.current_tenant_id`. Uma conexão privilegiada usada "só para essa feature específica" é o erro clássico que reabre o RLS.
3. **Escolha do ORM precisa ser decidida em função do RLS, não ao contrário.** Isso deve ser uma decisão explícita no SDD, com prova de conceito de `SET LOCAL` funcionando corretamente sob o pool de conexão escolhido, antes de escrever a primeira feature de negócio.
4. **A tabela `ai_agent_actions` não pode ser tratada como telemetria opcional.** Ela é o mecanismo de defesa do produto (e da empresa) contra a pergunta "o que a IA prometeu para esse paciente sem supervisão".