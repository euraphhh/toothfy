const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  ultra_monthly: process.env.STRIPE_PRICE_ULTRA_MONTHLY,
  ultra_annual: process.env.STRIPE_PRICE_ULTRA_ANNUAL,
};

class BillingController {
  // POST /api/billing/checkout
  async createCheckoutSession(req, res) {
    try {
      const { tier, cycle } = req.body; // tier: 'pro' | 'ultra', cycle: 'monthly' | 'annual'
      const { clinicId } = req.user;

      if (!['pro', 'ultra'].includes(tier) || !['monthly', 'annual'].includes(cycle)) {
        return res.status(400).json({ error: 'Invalid tier or cycle' });
      }

      const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
      if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

      let stripeCustomerId = clinic.stripeCustomerId;

      // Create Stripe Customer if it doesn't exist
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          name: clinic.name,
          metadata: { clinicId: clinic.id }
        });
        stripeCustomerId = customer.id;
        await prisma.clinic.update({
          where: { id: clinic.id },
          data: { stripeCustomerId }
        });
      }

      const priceId = STRIPE_PRICES[`${tier}_${cycle}`];

      if (!priceId) {
        return res.status(500).json({ error: 'Price ID not configured in environment.' });
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?upgraded=true&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?canceled=true`,
        metadata: {
          clinicId: clinic.id,
          tier,
        }
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  // POST /api/billing/portal
  async createPortalSession(req, res) {
    try {
      const { clinicId } = req.user;
      
      const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
      if (!clinic || !clinic.stripeCustomerId) {
        return res.status(400).json({ error: 'No active Stripe customer for this clinic.' });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: clinic.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Portal error:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  }

  // POST /api/billing/cancel
  async cancelSubscription(req, res) {
    try {
      const { clinicId } = req.user;
      
      const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
      
      if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

      // If they have a stripe customer, cancel their active subscriptions
      if (clinic.stripeCustomerId) {
        const subscriptions = await stripe.subscriptions.list({
          customer: clinic.stripeCustomerId,
          status: 'active',
        });

        for (const sub of subscriptions.data) {
          await stripe.subscriptions.cancel(sub.id);
        }
      }

      await prisma.clinic.update({
        where: { id: clinicId },
        data: {
          subscriptionTier: 'free',
          subscriptionStatus: 'canceled'
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Cancel error:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }

  // POST /api/billing/retention-discount
  async applyRetentionDiscount(req, res) {
    try {
      const { clinicId } = req.user;
      
      // In a real scenario, you'd apply a coupon ID to the Stripe subscription.
      // For this MVP, we just mock success and keep the user on their current tier.
      console.log(`Applied retention discount to clinic: ${clinicId}`);

      res.json({ success: true });
    } catch (error) {
      console.error('Discount error:', error);
      res.status(500).json({ error: 'Failed to apply discount' });
    }
  }

  // POST /api/billing/webhook
  // Note: This endpoint must receive raw body, which means we might need express.raw() in the router
  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const clinicId = session.metadata.clinicId;
        const tier = session.metadata.tier;

        if (clinicId && tier) {
          await prisma.clinic.update({
            where: { id: clinicId },
            data: { 
              subscriptionTier: tier,
              subscriptionStatus: 'active'
            }
          });
          console.log(`Clinic ${clinicId} upgraded to ${tier}.`);
        }
      } else if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        await prisma.clinic.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: subscription.status
          }
        });
      } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        await prisma.clinic.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionTier: 'free',
            subscriptionStatus: 'canceled'
          }
        });
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  }

  // GET /api/billing/status
  async getStatus(req, res) {
    try {
      const { clinicId } = req.user;
      const clinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
        select: { subscriptionTier: true, subscriptionStatus: true }
      });
      if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
      
      res.json(clinic);
    } catch (error) {
      console.error('Status error:', error);
      res.status(500).json({ error: 'Failed to fetch status' });
    }
  }
}

module.exports = new BillingController();
