import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/db/schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/toothfy';

async function seed() {
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    console.log("Seeding fake tenant for local development...");
    await db.insert(schema.tenants).values({
      id: "00000000-0000-0000-0000-000000000000",
      subdomain: "demo",
      name: "Clínica Demo",
      plan: "solo",
      status: "active"
    }).onConflictDoNothing();
    console.log("Fake tenant seeded successfully!");
  } catch (err) {
    console.error("Error seeding tenant:", err);
  } finally {
    await client.end();
  }
}

seed();
