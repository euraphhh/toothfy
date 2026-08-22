require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

async function setupStripe() {
  try {
    console.log('Creating Toothfy Stripe Products and Prices...');
    
    // Pro Tier
    const proProduct = await stripe.products.create({
      name: 'Toothfy Pro',
      description: 'Plano Pro: Automação de WhatsApp e Recall',
    });
    
    const proMonthlyPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 9700, // R$ 97.00
      currency: 'brl',
      recurring: { interval: 'month' },
    });
    
    const proAnnualPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 97000, // R$ 970.00
      currency: 'brl',
      recurring: { interval: 'year' },
    });

    // Ultra Tier
    const ultraProduct = await stripe.products.create({
      name: 'Toothfy Ultra',
      description: 'Plano Ultra: IA Avançada e Relatórios',
    });
    
    const ultraMonthlyPrice = await stripe.prices.create({
      product: ultraProduct.id,
      unit_amount: 19700, // R$ 197.00
      currency: 'brl',
      recurring: { interval: 'month' },
    });
    
    const ultraAnnualPrice = await stripe.prices.create({
      product: ultraProduct.id,
      unit_amount: 197000, // R$ 1970.00
      currency: 'brl',
      recurring: { interval: 'year' },
    });

    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Add missing env variables
    const newEnvLines = [
      `STRIPE_PRICE_PRO_MONTHLY=${proMonthlyPrice.id}`,
      `STRIPE_PRICE_PRO_ANNUAL=${proAnnualPrice.id}`,
      `STRIPE_PRICE_ULTRA_MONTHLY=${ultraMonthlyPrice.id}`,
      `STRIPE_PRICE_ULTRA_ANNUAL=${ultraAnnualPrice.id}`,
    ].join('\n');

    fs.appendFileSync(envPath, '\n' + newEnvLines + '\n');
    console.log('Successfully created Stripe products and updated .env!');
  } catch (err) {
    console.error('Failed to setup Stripe:', err.message);
  }
}

setupStripe();
