# Fluxo de Cadastro de Pacientes (Patient Registration Flow)

Este documento descreve a arquitetura e as decisões técnicas tomadas na implementação do fluxo híbrido de cadastro de pacientes (Recepção + Auto-cadastro do Paciente).

## 1. Visão Geral

Para otimizar o tempo na recepção e garantir a precisão dos dados, o Toothfy utiliza um modelo de **Cadastro Híbrido**:
1. A recepcionista inicia o cadastro com o mínimo de dados (Nome e Telefone).
2. O sistema gera um **link único e seguro (Token)** e um QR Code.
3. Esse link é enviado via WhatsApp ao paciente.
4. O paciente abre o link em seu próprio celular e completa o restante dos dados (Endereço, Convênio, Contato de Emergência) de forma assíncrona.

## 2. Estrutura no Banco de Dados

A tabela `patients` (em `src/db/schema.ts`) foi expandida com os seguintes campos-chave para viabilizar este fluxo:
- `self_registration_token` (UUID, nullable, unique): O token seguro para a rota pública.
- `self_registration_completed` (boolean): Flag que trava o formulário público após a conclusão para evitar edições indevidas no futuro.

**Segurança e Isolamento (RLS)**:
A tabela de pacientes obedece rigidamente à política de *Row Level Security (RLS)* por `tenant_id`. 
Qualquer gravação via UI da clínica usa o middleware de auth padrão (`activeOrganizationId`).

## 3. Rota Pública e RLS Bypass Controlado

A rota pública de auto-cadastro (`/p/[token]`) é acessada pelo paciente **sem estar autenticado** (sem sessão no ERP).

Para permitir que o paciente grave seus dados na tabela correta sem vazar dados de outras clínicas:
1. Em `src/domain/patients/actions.ts`, a função `getPatientByToken` usa uma conexão Drizzle com privilégios de leitura **filtrando restritamente pelo Token Exato**, extraindo assim o `tenant_id` do paciente.
2. Com o `tenant_id` em mãos, a action `completeSelfRegistration` entra no contexto restrito utilizando o `withTenantContext(tenantId, fn)`.
3. A partir desse ponto, o RLS está **forçado e garantido** para apenas aquele `tenant_id`.
4. Os dados são atualizados e a flag `selfRegistrationCompleted` é setada como `true`.

## 4. Componentes Chave

- **`NewPatientWizard.tsx`**: (Caminho: `src/app/(erp)/app/patients/NewPatientWizard.tsx`)
  Componente Client-side usado pela recepção. É um modal multi-etapas que permite criar o cadastro simplificado, gera o link para o WhatsApp (`https://wa.me/...`) e exibe o QR Code dinâmico (via `qrcode.react`). Pode alternativamente cadastrar o paciente completo na hora, se desejado.

- **`PatientSelfRegistrationForm.tsx`**: (Caminho: `src/app/p/[token]/PatientSelfRegistrationForm.tsx`)
  Formulário mobile-first focado no paciente final. Possui integração automática com o **ViaCEP** (busca Rua, Bairro, Cidade e Estado instantaneamente ao preencher o CEP) e máscaras automáticas (CPF, RG, Celular).
  Após o envio com sucesso, a interface é bloqueada para não sofrer double-submit.

## 5. Práticas de UX (Experiência do Usuário)

- **Máscaras de Input**: Funções centralizadas em `src/lib/formatters.ts` que aplicam formatação de `RG`, `CPF`, `CEP` e `Telefone` enquanto o usuário digita.
- **Animações (Micro-interações)**: Utilizados utilitários como `animate-in fade-in` e validações otimistas para dar fluidez.
- **Next.js 15+ Async Params**: Na rota `/p/[token]/page.tsx`, o objeto `params` é estritamente tratado como uma *Promise* (`const { token } = await params;`) para suportar a arquitetura moderna de Server Components e evitar falhas de Type Checking e 404 Pages durante o Build Produtivo.
