# SaaS Odonto (Toothfy)

Uma plataforma completa de gestão e automação para Clínicas Odontológicas focada em zerar faltas com Lembretes pelo WhatsApp e Auto-Recall de pacientes.

## 🚀 Funcionalidades

- **Dashboard Inteligente**: Métricas de consultas, taxa de confirmação e ações necessárias em tempo real.
- **Agenda Otimizada**: Visão Kanban diária, separando as consultas por status de confirmação.
- **Automação de WhatsApp**: Disparo automático de mensagens para confirmação de consultas (3 dias e 1 dia antes).
- **Auto-Recall Programado**: Retorno automático de pacientes (ex: revisão a cada 6 meses) sem esforço da secretária.
- **Gestão de Pacientes**: Prontuário, histórico de agendamentos e status da comunicação.
- **Faturamento / Assinaturas**: Integração completa com Stripe para os planos Basic, Pro e Ultra. Fluxo de downgrade anti-churn inteligente.

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js** com **Express**
- **Prisma ORM** (PostgreSQL)
- **Autenticação**: JWT, bcrypt e Google OAuth 2.0
- **Stripe API**: Controle de assinaturas e Webhooks

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** para estilização utilitária
- **React Router DOM** para roteamento
- **Lucide React** para ícones

### Infraestrutura
- **Docker & Docker Compose**: Orquestração de containers (Backend, Frontend e Banco de Dados)
- **PostgreSQL**: Banco de dados relacional e escalável

## ⚙️ Pré-requisitos

Para rodar o projeto localmente, certifique-se de ter instalado em sua máquina:
- [Docker e Docker Compose](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (opcional, para rodar sem Docker)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (para testar webhooks localmente)

## 📦 Como rodar localmente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/saas-odonto.git
cd saas-odonto
```

2. Configure as variáveis de ambiente:
   - Navegue até a pasta `backend/` e crie um arquivo `.env` baseado no `.env.example` (se houver) ou adicione as chaves necessárias (veja abaixo).

3. Suba os containers com o Docker Compose:
```bash
docker compose up -d --build
```
Isso irá iniciar três containers:
- `saas_odonto_db` (PostgreSQL na porta 5432)
- `saas_odonto_backend` (Node API na porta 3000)
- `saas_odonto_frontend` (React/Vite na porta 5173)

4. Acesse a aplicação:
- Frontend: [http://localhost:5173](http://localhost:5173)
- API Backend: [http://localhost:3000](http://localhost:3000)

## 💳 Testando Pagamentos Localmente (Stripe Webhooks)

Para que o sistema de pagamentos funcione localmente (atualizando as contas após o pagamento), você precisa redirecionar os webhooks da Stripe para a sua API rodando no Docker.

1. Faça o login na Stripe CLI:
```bash
stripe login
```

2. Redirecione os eventos para o webhook do backend:
```bash
stripe listen --forward-to localhost:3000/billing/webhook
```
*A Stripe vai te fornecer uma chave `whsec_...` no terminal. Copie essa chave e cole no seu arquivo `backend/.env` na variável `STRIPE_WEBHOOK_SECRET`, e então reinicie o backend.*

## 🔒 Variáveis de Ambiente Necessárias (Backend)

Crie um arquivo `.env` na pasta `backend/` com as seguintes variáveis:
```env
PORT=3000
DATABASE_URL="postgresql://root:rootpassword@db:5432/saas_odonto"
JWT_SECRET="sua_chave_secreta"
GOOGLE_CLIENT_ID="seu_client_id"
GOOGLE_CLIENT_SECRET="seu_client_secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_PRO_ANNUAL="price_..."
STRIPE_PRICE_ULTRA_MONTHLY="price_..."
STRIPE_PRICE_ULTRA_ANNUAL="price_..."
FRONTEND_URL="http://localhost:5173"
```
