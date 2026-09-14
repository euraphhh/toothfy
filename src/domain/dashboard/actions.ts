"use server"

import { db, withTenantContext } from "@/db";
import { appointments, patients } from "@/db/schema";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { count, eq, gte, lt, sum, and } from "drizzle-orm";

async function getTenantId() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.session?.activeOrganizationId) {
    return "00000000-0000-0000-0000-000000000000";
  }
  return session.session.activeOrganizationId;
}

export async function getDashboardMetrics() {
  const tenantId = await getTenantId();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return withTenantContext(tenantId, async (tx) => {
    // Agendamentos Hoje
    const [agendamentosHoje] = await tx
      .select({ value: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.scheduledAt, today),
          lt(appointments.scheduledAt, tomorrow)
        )
      );

    // Novos Pacientes
    const [novosPacientes] = await tx
      .select({ value: count() })
      .from(patients); // Simplificado: total de pacientes por enquanto, depois podemos filtrar por data

    // Próximas Consultas
    const proximasConsultas = await tx
      .select({
        id: appointments.id,
        patientName: patients.name,
        scheduledAt: appointments.scheduledAt,
        status: appointments.status,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(gte(appointments.scheduledAt, new Date()))
      .orderBy(appointments.scheduledAt)
      .limit(5);

    return {
      agendamentosHoje: agendamentosHoje.value,
      novosPacientes: novosPacientes.value,
      receberHoje: 0, // Mockado até ter tabela de financeiro real, mas via DB
      proximasConsultas
    };
  });
}
