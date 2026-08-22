const express = require('express');
const router = express.Router();
const billingController = require('../controllers/BillingController');
const authMiddleware = require('../middlewares/authMiddleware');

// Checkout and Portal routes (require auth)
router.post('/checkout', authMiddleware, billingController.createCheckoutSession);
router.post('/portal', authMiddleware, billingController.createPortalSession);
router.get('/status', authMiddleware, billingController.getStatus);
router.post('/cancel', authMiddleware, billingController.cancelSubscription);
router.post('/retention-discount', authMiddleware, billingController.applyRetentionDiscount);

// Webhook route (does NOT require auth, requires raw body)
// We use express.raw({type: 'application/json'}) to keep the raw body for Stripe signature verification
router.post('/webhook', express.raw({type: 'application/json'}), billingController.handleWebhook);

module.exports = router;
