require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

const billingController = require('./controllers/BillingController');
// Stripe Webhook needs raw body
app.post('/billing/webhook', express.raw({type: 'application/json'}), billingController.handleWebhook);

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id_to_avoid_crash',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

// Registrar rotas
app.use('/', routes);

module.exports = app;
