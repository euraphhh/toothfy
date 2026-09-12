import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20" as any,
  });
  try {
    const { tenantId } = await req.json();

    const tenantInfo = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!tenantInfo.length) {
      return NextResponse.json({ error: "Clínica não encontrada no sistema" }, { status: 404 });
    }

    const priceId = process.env.STRIPE_SOLO_PLAN_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "Configuração do plano não encontrada no servidor" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto", "pix"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      // URL para onde o usuário volta se der certo ou se cancelar
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding?canceled=true`,
      // Envia o tenantId para que o Webhook saiba quem ativou o plano
      client_reference_id: tenantId, 
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
