# Toothfy Web 🦷✨

O **Toothfy** é um SaaS (ERP) voltado para dentistas, projetado para revolucionar o atendimento e a gestão de clínicas através de Inteligência Artificial, automação no WhatsApp e ferramentas financeiras modernas.

Esta é a versão **v0** (MVP) da aplicação Web (Landing Page e Painel do Dentista).

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router) + React + TypeScript
- **Styling & UI:** TailwindCSS, Framer Motion, Radix UI (Shadcn)
- **Database:** PostgreSQL (com extensão `pgvector`)
- **ORM:** Drizzle ORM
- **Autenticação:** Better Auth (com suporte a Organizations para Multi-Tenant)
- **Integrações (Planejadas/Ativas):**
  - **Stripe:** Assinaturas e Checkout
  - **Meta Cloud API:** Automação via WhatsApp (Agente IA)
  - **Anthropic (Claude 3.5 Sonnet):** Motor de Inteligência Artificial
  - **Resend:** Envio de e-mails transacionais

## 🏗 Arquitetura & Multi-Tenant

Este repositório atua como um monólito modular para o ecossistema web:
- **`/(marketing)`:** Landing page pública focada em conversão.
- **`/app`:** O núcleo do ERP (protegido por middleware). O dentista gerencia agenda, pacientes, odontograma e financeiro aqui.
- **`/login` & `/register`:** Fluxo de onboarding.

Para garantir segurança máxima, **cada tabela possui a coluna `tenant_id` e RLS (Row Level Security)** habilitado direto no PostgreSQL. Todo acesso ao banco é forçado a passar pela função `withTenantContext(tenantId, fn)`.

> **Nota:** O app mobile para o dentista (construído com Expo) vive em um repositório separado (`toothfy-mobile`) para manter as fronteiras arquiteturais limpas.

## 🛠 Como Rodar (Desenvolvimento Local)

A forma mais fácil de rodar o ambiente completo (Banco de dados com pgvector + Aplicação Web) é utilizando o Docker Compose.

1. **Configure as Variáveis de Ambiente**
   Copie o arquivo `.env.example` para `.env` (se não existir, use as chaves indicadas na documentação do projeto).
   
2. **Suba os contêineres**
   ```bash
   docker compose up -d --build
   ```

3. **Gere e aplique as Migrations**
   (Caso o banco esteja vazio)
   ```bash
   npx drizzle-kit push
   ```

4. **Acesse a Aplicação**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📋 Regras de Agentes de IA

Este projeto possui regras estritas de desenvolvimento documentadas na pasta `docs/` e no arquivo `AGENTS.md`. Qualquer alteração arquitetural, em banco de dados ou em fluxos de autenticação deve ser estritamente guiada por estes documentos.

---

Feito com 🩵 para o futuro da Odontologia.
