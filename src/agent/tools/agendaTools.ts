import { z } from "zod";

export const getAvailabilitySchema = z.object({
  professional_id: z.string().uuid().optional().describe("Opcional: ID do dentista/profissional."),
  date_range: z.object({
    from: z.string().describe("Data de início em formato ISO 8601 (ex: 2026-09-12T00:00:00Z)"),
    to: z.string().describe("Data final em formato ISO 8601")
  }).describe("Período para buscar horários livres")
});

export const scheduleAppointmentSchema = z.object({
  idempotency_key: z.string().uuid().describe("Chave única UUID para garantir que a requisição não seja processada duas vezes em caso de retry"),
  patient_id: z.string().uuid().describe("UUID do paciente"),
  professional_id: z.string().uuid().describe("UUID do profissional"),
  starts_at: z.string().describe("Data e hora de início em ISO 8601"),
  procedure_id: z.string().uuid().optional().describe("Opcional: UUID do procedimento")
});

export const rescheduleAppointmentSchema = z.object({
  idempotency_key: z.string().uuid().describe("Chave única UUID para evitar duplicidade"),
  appointment_id: z.string().uuid().describe("UUID do agendamento existente"),
  new_starts_at: z.string().describe("Nova data e hora de início em ISO 8601")
});

export type GetAvailabilityInput = z.infer<typeof getAvailabilitySchema>;
export type ScheduleAppointmentInput = z.infer<typeof scheduleAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
