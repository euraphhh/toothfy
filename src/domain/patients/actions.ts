"use server"

import { db, withTenantContext } from "@/db";
import { patients } from "@/db/schema";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

/**
 * Utilitário interno para pegar o tenant ID seguro a partir da sessão ativa.
 */
async function getTenantId() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  // No Better Auth com plugin organization, o activeOrganizationId atua como tenantId
  if (!session?.session?.activeOrganizationId) {
    // Para facilitar testes visuais de UI antes do fluxo de Auth completo:
    return "00000000-0000-0000-0000-000000000000";
  }
  
  return session.session.activeOrganizationId;
}

export async function getPatients() {
  const tenantId = await getTenantId();
  
  return withTenantContext(tenantId, async (tx) => {
    return tx.select().from(patients).orderBy(desc(patients.createdAt));
  });
}

export async function createPatient(data: { name: string; phone: string; cpf?: string }) {
  const tenantId = await getTenantId();
  
  return withTenantContext(tenantId, async (tx) => {
    const [newPatient] = await tx.insert(patients).values({
      tenantId,
      name: data.name,
      phone: data.phone,
      cpf: data.cpf,
    }).returning();
    return newPatient;
  });
}

export async function getPatientById(id: string) {
  const tenantId = await getTenantId();
  
  return withTenantContext(tenantId, async (tx) => {
    const [patient] = await tx.select().from(patients).where(eq(patients.id, id));
    return patient;
  });
}
