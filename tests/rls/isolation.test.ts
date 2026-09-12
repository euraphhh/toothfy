import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db, withTenantContext } from '../../src/db';
import { tenants, patients } from '../../src/db/schema';
import { sql } from 'drizzle-orm';

describe('Row Level Security - Tenant Isolation', () => {
  let tenantAId: string;
  let tenantBId: string;

  beforeAll(async () => {
    // In CI this test needs a running Postgres with migrations applied.
    
    // Create Tenant A
    const [tenantA] = await db.insert(tenants).values({
      subdomain: `clinica-a-${Date.now()}`,
      name: 'Clínica A'
    }).returning({ id: tenants.id });

    // Create Tenant B
    const [tenantB] = await db.insert(tenants).values({
      subdomain: `clinica-b-${Date.now()}`,
      name: 'Clínica B'
    }).returning({ id: tenants.id });

    tenantAId = tenantA.id;
    tenantBId = tenantB.id;
    
    await withTenantContext(tenantAId, async (tx) => {
      await tx.insert(patients).values({
        tenantId: tenantAId,
        name: 'Paciente do Tenant A',
        phone: '11999999999'
      });
    });

    await withTenantContext(tenantBId, async (tx) => {
      await tx.insert(patients).values({
        tenantId: tenantBId,
        name: 'Paciente do Tenant B',
        phone: '11888888888'
      });
    });
  });

  afterAll(async () => {
    await withTenantContext(tenantAId, async (tx) => {
      await tx.delete(patients).where(sql`tenant_id = ${tenantAId}`);
    });
    await withTenantContext(tenantBId, async (tx) => {
      await tx.delete(patients).where(sql`tenant_id = ${tenantBId}`);
    });
    await db.delete(tenants).where(sql`id IN (${tenantAId}, ${tenantBId})`);
  });

  it('deve retornar apenas os pacientes do Tenant A quando no contexto do Tenant A', async () => {
    await withTenantContext(tenantAId, async (tx) => {
      const result = await tx.select().from(patients);
      
      expect(result.length).toBeGreaterThan(0);
      
      const hasTenantBData = result.some(p => p.tenantId === tenantBId);
      expect(hasTenantBData).toBe(false);

      const allBelongToTenantA = result.every(p => p.tenantId === tenantAId);
      expect(allBelongToTenantA).toBe(true);
    });
  });

  it('deve retornar vazio caso tente ler pacientes do Tenant B estando no contexto do Tenant A', async () => {
    await withTenantContext(tenantAId, async (tx) => {
      // Query vazada intencionalmente buscando dado de outro tenant
      const result = await tx.select().from(patients).where(sql`tenant_id = ${tenantBId}`);
      
      // O RLS no banco deve sobrepor o filtro e retornar 0 linhas
      expect(result.length).toBe(0);
    });
  });
});
