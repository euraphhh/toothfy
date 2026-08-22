const { Router } = require('express');
const passport = require('passport');
const authMiddleware = require('../middlewares/authMiddleware');
const PatientController = require('../controllers/PatientController');
const AppointmentController = require('../controllers/AppointmentController');
const AuthController = require('../controllers/AuthController');
const DashboardController = require('../controllers/DashboardController');
const ClinicController = require('../controllers/ClinicController');

const routes = Router();

routes.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth
routes.post('/auth/register/request-code', AuthController.requestCode);
routes.post('/auth/register/verify-code', AuthController.verifyCode);
routes.post('/auth/register/complete', AuthController.completeRegistration);
routes.post('/auth/login', AuthController.login);
routes.post('/auth/forgot-password', AuthController.forgotPassword);
routes.post('/auth/reset-password', AuthController.resetPassword);

// Google OAuth
routes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
routes.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=oauth_failed' }), AuthController.googleCallback);

// Rotas Protegidas (Requer JWT)
routes.use(authMiddleware);

// Dashboard
routes.get('/dashboard', DashboardController.getMetrics);

// Billing
const billingRoutes = require('./billing.routes');
routes.use('/billing', billingRoutes);

// Clinic Settings
routes.get('/clinic/settings', ClinicController.getSettings);
routes.put('/clinic/settings', ClinicController.updateSettings);

// Patients
routes.post('/patients', PatientController.create);
routes.get('/patients', PatientController.list);

// Appointments
routes.post('/appointments', AppointmentController.create);
routes.get('/appointments', AppointmentController.list);
// We will need a way to update status, but for now we'll mock it if not implemented in controller, wait, let's just add it if we added it, but I didn't add it to AppointmentController. Let's just add it here and I will add it to the controller later.
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
