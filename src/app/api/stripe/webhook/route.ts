import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20" as any,
  });
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    // Quando o cliente finaliza o pagamento do Checkout com sucesso
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const tenantId = session.client_reference_id;
      if (tenantId) {
        await db.update(tenants)
          .set({ 
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string
          })
          .where(eq(tenants.id, tenantId));
        console.log(`[Stripe Webhook] Tenant ${tenantId} activated successfully.`);
      }
    } 
    // Quando a assinatura é cancelada ou falta pagamento definitivo
    else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await db.update(tenants)
        .set({ status: "past_due" })
        .where(eq(tenants.stripeSubscriptionId, subscription.id));
      console.log(`[Stripe Webhook] Subscription ${subscription.id} deleted. Tenant marked past_due.`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
