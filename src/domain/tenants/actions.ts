"use server";

import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function createTenantAndOnboard(name: string, subdomain: string) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders
  });

  console.log("=== DEBUG createTenantAndOnboard ===");
  console.log("Cookie:", reqHeaders.get("cookie"));
  console.log("Session:", session);
  console.log("====================================");

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  // Validar se o subdomínio já existe no nosso banco principal
  const existing = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain)).limit(1);
  if (existing.length > 0) {
    throw new Error("Subdomínio já está em uso por outra clínica.");
  }

  const tenantId = uuidv4();

  // Criar organização no Better Auth
  let org;
  try {
    // Usando chamadas do servidor para o plugin de organization
    // Note: O Better Auth Organization plugin cria o vinculo do Owner automaticamente
    org = await auth.api.createOrganization({
      headers: reqHeaders,
      body: {
        name: name,
        slug: subdomain,
        logo: ""
      }
    });
  } catch (err: any) {
    throw new Error("Erro ao criar organização: " + err.message);
  }

  if (!org) {
    throw new Error("Falha ao criar organização no provedor de autenticação.");
  }

  // Persistir o Tenant na nossa tabela de isolamento de dados
  await db.insert(tenants).values({
    id: tenantId,
    name,
    subdomain,
    plan: "solo",
    status: "pending_payment"
  });

  return { tenantId, organizationId: org.id };
}
