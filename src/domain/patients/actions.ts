"use server"

import { db, withTenantContext } from "@/db";
import { patients } from "@/db/schema";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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

export type CreatePatientInput = {
  name: string;
  phone: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: string;
  profession?: string;
  email?: string;
  landline?: string;
  emergencyContact?: any;
  address?: any;
  howFoundUs?: string;
  notes?: string;
  categories?: string[];
  responsibleName?: string;
  responsibleCpf?: string;
  insuranceData?: any;
  generateRegistrationLink?: boolean;
};

export async function createPatient(data: CreatePatientInput) {
  const tenantId = await getTenantId();
  
  return withTenantContext(tenantId, async (tx) => {
    const token = data.generateRegistrationLink ? uuidv4() : null;

    const [newPatient] = await tx.insert(patients).values({
      tenantId,
      name: data.name,
      phone: data.phone,
      cpf: data.cpf,
      rg: data.rg,
      birthDate: data.birthDate,
      gender: data.gender,
      profession: data.profession,
      email: data.email,
      landline: data.landline,
      emergencyContact: data.emergencyContact,
      address: data.address,
      howFoundUs: data.howFoundUs,
      notes: data.notes,
      categories: data.categories,
      responsibleName: data.responsibleName,
      responsibleCpf: data.responsibleCpf,
      insuranceData: data.insuranceData,
      selfRegistrationToken: token,
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

export async function getPatientByToken(token: string) {
  // Using the raw db connection here because we don't have the tenant context yet from an unauthenticated user.
  // The token is a secure UUID.
  const [patient] = await db.select().from(patients).where(eq(patients.selfRegistrationToken, token));
  return patient || null;
}

export async function completeSelfRegistration(token: string, updateData: Partial<typeof patients.$inferInsert>) {
  const patient = await getPatientByToken(token);
  if (!patient) throw new Error("Link inválido ou expirado");
  if (patient.selfRegistrationCompleted) throw new Error("Cadastro já foi preenchido");

  return withTenantContext(patient.tenantId, async (tx) => {
    const [updated] = await tx.update(patients)
      .set({
        ...updateData,
        selfRegistrationCompleted: true,
      })
      .where(eq(patients.id, patient.id))
      .returning();
    return updated;
  });
}
