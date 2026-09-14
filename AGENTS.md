# AGENTS.md — Toothfy

Regras persistentes para qualquer agente trabalhando neste repositório. Leia isto antes de qualquer tarefa. Em caso de conflito entre esta regra e o pedido do usuário na conversa, pare e pergunte — não assuma que o pedido pontual sobrescreve a regra.

## Stack (não sugerir alternativa sem justificativa explícita pedida)

- Web: Next.js (App Router) + Node.js + TypeScript
- Banco: PostgreSQL com RLS nativo + extensão `pgvector`
- Camada de dados: **Drizzle ORM**. Nunca Prisma. Nunca `pg` cru fora do helper `withTenantContext`.
- Auth: **Better Auth** (plugin `organization`), self-hosted, no mesmo Postgres.
- E-mail transacional: **Resend** — usado pelo Better Auth para verificação de conta, reset de senha e convite de membro para organização. Não introduzir Redis ou reverse proxy explícito no MVP — não há requisito concreto para nenhum dos dois ainda (ver `docs/technical-decisions-and-mvp.md`).
- Mobile (futuro): Expo/React Native — fora de escopo agora. Ignore, a menos que explicitamente pedido.
- WhatsApp: API oficial da Meta (Cloud API). Não usar BSP terceirizado.
- Hospedagem no MVP/demo: Vercel + Postgres gerenciado com pgvector (Supabase ou Neon). Não criar infraestrutura AWS agora — isso é decisão futura, fora do escopo do MVP.

## Estrutura de pastas (toothfy-web)

Este repositório é um monólito Next.js (App Router) — front-end e back-end vivem juntos por design (Server Components, Server Actions, Route Handlers). **Não criar pastas `backend/` e `frontend/` separadas.** A divisão correta é por responsabilidade arquitetural:

```
src/
├── app/          # telas do ERP + API routes (ex: webhook da Meta Cloud API)
├── db/           # schema Drizzle, migrations, withTenantContext
├── domain/       # regra de negócio pura (triagem, pricing, policyGate) — sem framework, sem LLM, sem Drizzle direto
├── agent/
│   ├── tools/       # schedule_appointment, get_patient_balance etc.
│   └── providers/   # interfaces: LLMProvider, ConversationChannel, PaymentGateway
├── auth/         # config do Better Auth
└── components/   # UI
tests/
├── rls/isolation.test.ts
├── domain/
└── agent/
```

O app mobile (Expo) NÃO entra neste repositório — fica em repositório próprio, fora de escopo até o MVP estar validado (ver `docs/product-strategy.md`).

## Regras arquiteturais inegociáveis

1. Toda tabela com dado de tenant tem `tenant_id UUID NOT NULL`, `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY` e uma policy `tenant_isolation`. Sem exceção, mesmo para tabela "só interna".
2. Todo acesso ao banco passa por `withTenantContext(tenantId, fn)`. Nunca instanciar client de banco fora dessa função em código de aplicação.
3. Toda migration que cria tabela tenant-scoped vem, no mesmo PR, com teste automatizado de isolamento (ver skill `postgres-rls-guard`).
4. Toda tool do agente de IA que escreve dado: exige `idempotency_key`, tem schema de entrada/saída explícito, e passa pelo `policyGate()` antes de executar. A tool nunca decide sozinha se precisa de aprovação.
5. Toda ação de escrita do agente de IA é registrada em `ai_agent_actions`.

## Processo de desenvolvimento

- TDD obrigatório para: regra de negócio pura (precificação, política de negociação, triagem), isolamento de tenant, e contrato de cada tool.
- TDD **não** se aplica ao texto literal gerado pelo LLM na conversa — para isso, usar avaliação por cenário (dado um histórico, afirmar qual tool foi chamada, não o texto exato da resposta).
- SOLID aplicado com prioridade clara: Dependency Inversion é o mais importante aqui — provedor de LLM, canal do WhatsApp e gateway de pagamento ficam atrás de interface, nunca chamados direto do código de domínio. Não aplicar princípio sem um motivo concreto amarrado a este projeto.

## Documentos de referência (ler antes de iniciar qualquer épico)

- `docs/product-strategy.md` — estratégia de produto, planos, matriz de features
- `docs/data-architecture.md` — modelo de dados, RLS, indexação
- `docs/technical-decisions-and-mvp.md` — decisão de ORM/Auth, contrato de tools, backlog de MVP

## Não alterar sem aprovação humana explícita

- Qualquer policy de RLS ou migration que mexa em `ENABLE`/`FORCE ROW LEVEL SECURITY`
- A lógica de `policyGate()`
- Qualquer código de sessão/cookie de autenticação

## Skills disponíveis neste projeto

**Skills Locais (Projeto)**:
- `postgres-rls-guard` — usar sempre que criar ou alterar tabela, ou escrever migration.
- `frontend-design` — usar sempre que trabalhar na UI/UX para garantir aderência aos padrões premium e regras do Design System do projeto.
- `nextjs-app-router-patterns` — padrões arquiteturais para Next.js 15+ App Router.
- `shadcn` — melhores práticas na construção e extensão de componentes Shadcn UI.
- `tailwind-design-system` — padrões para variáveis e componentização no TailwindCSS.
- `drizzle-orm-expert` — padrões seguros e eficientes para lidar com o banco.