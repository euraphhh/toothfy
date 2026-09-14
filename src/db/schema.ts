import { pgTable, uuid, text, timestamp, date, jsonb, numeric, boolean, vector } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tenant (a clínica)
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  subdomain: text('subdomain').unique().notNull(),
  name: text('name').notNull(),
  plan: text('plan').notNull().default('solo'), // solo | growth | enterprise
  status: text('status').notNull().default('pending_payment'), // active | pending_payment
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Usuários (staff, dentistas, gestores)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  authId: text('auth_id').notNull(), // id do provedor de autenticação (Better Auth user id)
  role: text('role').notNull(), // owner | manager | dentist | receptionist
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Pacientes
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  cpf: text('cpf'),
  phone: text('phone').notNull(), // chave de correlação com WhatsApp
  birthDate: date('birth_date'),
  anamnesis: jsonb('anamnesis').default({}),
  lgpdConsentAt: timestamp('lgpd_consent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true })
});

// Profissionais (dentistas)
export const professionals = pgTable('professionals', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').references(() => users.id),
  croNumber: text('cro_number'),
  specialty: text('specialty'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Cadeiras/salas
export const chairs = pgTable('chairs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  label: text('label').notNull(),
  unitId: uuid('unit_id') // referência a unidade física
});

// Agendamentos
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  professionalId: uuid('professional_id').notNull().references(() => professionals.id),
  chairId: uuid('chair_id').references(() => chairs.id),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  durationMinutes: numeric('duration_minutes').notNull().default('30'),
  status: text('status').notNull().default('scheduled'), // scheduled | confirmed | done | no_show | cancelled
  createdBy: text('created_by').notNull().default('human'), // 'human' | 'ai_agent'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Prontuário / evolução clínica
export const dentalRecords = pgTable('dental_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  professionalId: uuid('professional_id').notNull().references(() => professionals.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  odontogramData: jsonb('odontogram_data').default({}),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Procedimentos
export const procedures = pgTable('procedures', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  defaultPrice: numeric('default_price', { precision: 10, scale: 2 }).notNull(),
  category: text('category')
});

// Financeiro
export const financialTransactions = pgTable('financial_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  patientId: uuid('patient_id').references(() => patients.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // pending | paid | overdue | negotiating
  dueDate: date('due_date'),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Conversas do WhatsApp
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  patientId: uuid('patient_id').references(() => patients.id),
  channelIdentifier: text('channel_identifier').notNull(), // número do WhatsApp
  status: text('status').notNull().default('open'), // open | escalated | closed
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Mensagens
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  sender: text('sender').notNull(), // 'patient' | 'ai_agent' | 'human_staff'
  contentText: text('content_text'),
  audioUrl: text('audio_url'),
  transcribedText: text('transcribed_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Log de ações do agente
export const aiAgentActions = pgTable('ai_agent_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  actionType: text('action_type').notNull(), // 'schedule' | 'reschedule' | 'negotiate_payment' | 'escalate_human'
  payload: jsonb('payload').notNull(),
  requiredApproval: boolean('required_approval').notNull().default(false),
  approvedBy: uuid('approved_by').references(() => users.id),
  status: text('status').notNull().default('executed'), // executed | pending_approval | rejected
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// Embeddings
export const aiEmbeddings = pgTable('ai_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  sourceType: text('source_type').notNull(), // 'message' | 'dental_record' | 'patient_summary'
  sourceId: uuid('source_id').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export * from "./auth-schema";
