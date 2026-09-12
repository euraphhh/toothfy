"use server"

import { db, withTenantContext } from "@/db";
import { appointments, patients } from "@/db/schema";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

async function getTenantId() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.session?.activeOrganizationId) {
    return "00000000-0000-0000-0000-000000000000";
  }
  return session.session.activeOrganizationId;
}

export async function getAppointments() {
  const tenantId = await getTenantId();
  return withTenantContext(tenantId, async (tx) => {
    return tx.select({
      id: appointments.id,
      patientId: appointments.patientId,
      patientName: patients.name,
      scheduledAt: appointments.scheduledAt,
      durationMinutes: appointments.durationMinutes,
      status: appointments.status,
      chairId: appointments.chairId,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .orderBy(desc(appointments.scheduledAt));
  });
}
