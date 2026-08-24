# ToothiFy - SaaS B2B para Clínicas Odontológicas 🦷

Uma plataforma premium de gestão e automação para Clínicas Odontológicas focada em zerar faltas com **Lembretes Automatizados pelo WhatsApp**, **Auto-Recall de pacientes** e **Dashboard Inteligente**.

## Principais Funcionalidades (MVP)
- **Multi-Tenant Nativo**: Cada clínica possui seu próprio subdomínio exclusivo (White-Label) e ambiente isolado.
- **Landing Page SaaS**: Design Premium (Bento Box) focado em conversão.
- **Motor de WhatsApp Automático**: 
  - Lembretes programados (3 dias antes e 1 dia antes).
  - Reconhecimento Inteligente (NLP básico) para respostas como "Sim", "Não", "Confirmar".
- **Sistema de Auto-Recall**: Configuração de retornos periódicos (ex: 6 meses).
- **Dashboard e Agenda**: Visão unificada da clínica.
- **Gestão de Pacientes**: CRUD completo com integração ViaCEP.
- **Autenticação**: Login local seguro e Google OAuth.

## 🚀 RoadMap (Próximos passos)
- **Implementação de Redis**: Cache para otimização de consultas pesadas e gerenciamento de filas de mensagens.
- **White-Label Avançado**: Opções de customização de marca (cores, logo e domínios próprios) para os clientes.
- **Landing Page Dinâmica**: Sistema de CMS para edição rápida de conteúdo.
- **Subdomínios Dinâmicos**: Automação de CNAMEs via Cloudflare API.

## 🛠 Tecnologias Utilizadas

- **Sonner** (Toasts)

### Infraestrutura
- **Docker & Docker Compose**: Orquestração completa.
- **PostgreSQL**: Banco de dados relacional (isolado por volumes Docker).

## ⚙️ Pré-requisitos

Para rodar o projeto localmente, você só precisará de:
- [Docker e Docker Compose](https://www.docker.com/)

## 📦 Como rodar localmente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/saas-odonto.git
cd saas-odonto
```

2. Configure as variáveis de ambiente:
   - Na pasta `backend/`, crie ou edite o `.env` (Use a referência abaixo).
   - Na pasta `frontend/`, crie ou edite o `.env`.

3. Suba a infraestrutura:
```bash
docker compose up -d --build
```
Isso iniciará:
- `saas_odonto_db` (PostgreSQL na porta 5432)
- `saas_odonto_backend` (Node API e Workers na porta 3000)
- `saas_odonto_frontend` (React na porta 5173)

4. Rode o Seed para criar sua conta:
```bash
docker compose exec backend node scripts/seed.js
```
O login será `euraphh@gmail.com` com a senha `123456`.

5. Acesse:
- App: [http://localhost:5173](http://localhost:5173)

## 🔒 Variáveis de Ambiente Necessárias

### `backend/.env`
```env
PORT=3000
DATABASE_URL="postgresql://root:rootpassword@db:5432/saas_odonto?schema=public"

# Segurança
JWT_SECRET="sua_chave_jwt_aqui"
GOOGLE_CLIENT_ID="seu_client_id"
GOOGLE_CLIENT_SECRET="seu_client_secret"

# Motor WhatsApp (Meta Cloud API)
META_PHONE_ID="id_do_telefone_meta"
META_ACCESS_TOKEN="token_do_app_meta"
META_VERIFY_TOKEN="toothify_secret_token" # Usado no Webhook
```

### `frontend/.env`
```env
# URL da sua API Backend
VITE_API_URL=http://localhost:3000
```

## 🎧 Configurando o Webhook (Meta For Developers)
Para que as respostas dos clientes mudem os status na plataforma:
1. No painel do seu app na Meta, vá em **Webhooks**.
2. Configure a URL de callback para `https://seu-dominio.com/api/webhooks/meta`.
3. O Token de verificação deve ser o mesmo de `META_VERIFY_TOKEN` (padrão: `toothify_secret_token`).
4. Se inscreva no evento `messages`.
