const { Router } = require('express');
const passport = require('passport');
const authMiddleware = require('../middlewares/authMiddleware');
const PatientController = require('../controllers/PatientController');
const AppointmentController = require('../controllers/AppointmentController');
const AuthController = require('../controllers/AuthController');
const DashboardController = require('../controllers/DashboardController');
const ClinicController = require('../controllers/ClinicController');
const MessageController = require('../controllers/MessageController');
const PublicController = require('../controllers/PublicController');
const WebhookController = require('../controllers/WebhookController');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente mais tarde.' }
});

const routes = Router();

routes.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth
routes.post('/auth/register/request-code', authLimiter, AuthController.requestCode);
routes.post('/auth/register/verify-code', authLimiter, AuthController.verifyCode);
routes.post('/auth/register/complete', AuthController.completeRegistration);
routes.post('/auth/login', authLimiter, AuthController.login);
routes.post('/auth/forgot-password', authLimiter, AuthController.forgotPassword);
routes.post('/auth/reset-password', authLimiter, AuthController.resetPassword);

// Public Patient Actions (Confirmação de Consulta)
routes.get('/public/appointments/:id', PublicController.getAppointmentDetails);
routes.put('/public/appointments/:id/confirm', PublicController.updateAppointmentStatus);

// Meta WhatsApp Webhook
routes.get('/webhooks/meta', WebhookController.verify);
routes.post('/webhooks/meta', WebhookController.receive);

// Google OAuth
routes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
routes.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }), AuthController.googleCallback);

// Clínicas (Públicas - para Subdomínio e Cadastro)
routes.get('/clinics/check-slug', ClinicController.checkSlug);
routes.get('/clinics/slug/:slug', ClinicController.getBySlug);

// Rotas Protegidas (Requer JWT)
routes.use(authMiddleware);

// Dashboard
routes.get('/dashboard', DashboardController.getMetrics);

// Clinic Settings
routes.get('/clinic/settings', ClinicController.getSettings);
routes.put('/clinic/settings', ClinicController.updateSettings);

// Logs
routes.get('/logs', MessageController.list);

// Patients
routes.post('/patients', PatientController.create);
routes.get('/patients', PatientController.list);

// Appointments
routes.post('/appointments', AppointmentController.create);
routes.get('/appointments', AppointmentController.list);
routes.put('/appointments/:id/status', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const { status, procedure } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id, clinicId: req.user.clinicId },
      data: { status, procedure }
    });
    res.json(appointment);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = routes;
