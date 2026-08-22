# SaaS Odontologia - Constitution & Spec do MVP

## 1. Escopo do MVP (Fronteira Dura)
- **O que faz:** Cadastro de pacientes, agenda básica, envio de confirmação (WhatsApp), remarcação por resposta, follow-up de recall, painel da secretária (status das mensagens).
- **O que NÃO faz (FORA do MVP):** Prontuário eletrônico completo, financeiro avançado / NFs, CRM de vendas/leads, multi-unidade. Se qualquer tarefa sugerir cruzar essa fronteira, **PARE E PERGUNTE**.

## 2. Decisões Arquiteturais
- **WhatsApp API:** Meta Cloud API (Oficial). Foco total em estabilidade e segurança.
- **Stack:** Node.js (Backend) + React (Frontend). Tudo Docker-ready para ambiente de testes e desenvolvimento.
- **Frontend Design:** Tailwind CSS + Shadcn/Radix + 21st.dev components.
- **Banco de Dados:** PostgreSQL (Relacional Gerenciado).
- **Multi-Tenant:** Isolamento por coluna (`clinic_id`) nas tabelas, filtrado em nível de aplicação (middlewares).
- **Agendamento de Mensagens:** Job Scheduler baseado em Banco de Dados (Cron simples em Worker) para MVP, estruturado de forma modular visando facilitar migração futura (Redis/BullMQ) se a Meta API falhar e demandar resiliência pesada.

## 3. Regras de Negócio e Produto
- **Precificação:** Assinatura Mensal Fixa (Flat Rate) com limite de uso justo (fair use).
- **Timing de Confirmação:** Lembretes disparados em 2 momentos: **3 dias antes** e **1 dia antes** da consulta. 
- **Regra de Recall:** Padrão de 6 meses, sendo selecionável (3, 6, 12 meses) pelo usuário no momento da conclusão/alta da consulta anterior.
- **Fallback de Conversa:** Qualquer resposta fora do fluxo ótimo ("sim", "não", "reagendar") não será interpretada por IA no MVP; o status cai como "necessita atenção" no Dashboard da secretária.
- **Usuário Principal:** A secretária da clínica. É assumido um modelo de conta/clínica única para facilitar a Autenticação neste primeiro momento.
- **Go-to-Market:** TBD (a definir).

## 4. Diretrizes de IA (Para o Agente)
- Siga estritamente esta constitution.
- Toda nova funcionalidade complexa deve ter perguntas de design antes da especificação (specify -> clarify -> plan -> tasks -> implement).
- Nenhuma feature extra "de bônus" deve ser adicionada sem aprovação explícita do usuário.
