const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../services/emailService');

class AppointmentController {
  async create(req, res) {
    try {
      const { patientId, date, procedure } = req.body;

      const patient = await prisma.patient.findFirst({
        where: { id: patientId, clinicId: req.user.clinicId }
      });

      if (!patient) {
        return res.status(403).json({ error: 'Paciente não encontrado ou não pertence a esta clínica.' });
      }

      const appointment = await prisma.appointment.create({
        data: {
          clinicId: req.user.clinicId,
          patientId,
          date: new Date(date),
          procedure,
          status: 'pending'
        }
      });
      console.log(`[JOB SCHEDULER] Mensagem do Meta Cloud API agendada para: ${date}`);


      if (patient.email) {
        const frontendUrl = process.env.FRONTEND_URL;
        const confirmLink = `${frontendUrl}/confirmar/${appointment.id}`;
        const html = `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
            <h2>Olá, ${patient.name}!</h2>
            <p>Sua consulta para o procedimento <strong>${procedure || 'Avaliação'}</strong> foi agendada.</p>
            <p>Data e Hora: <strong>${new Date(date).toLocaleString('pt-BR')}</strong></p>
            <p>Por favor, confirme sua presença clicando no botão abaixo:</p>
            <a href="${confirmLink}" style="display: inline-block; background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
              Confirmar Presença
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">Se não puder comparecer, você também pode informar através do mesmo link.</p>
          </div>
        `;
        await sendEmail(patient.email, 'Confirme sua consulta - ToothiFy', html).catch(e => console.error('Erro ao enviar email:', e));
      }

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async list(req, res) {
    const appointments = await prisma.appointment.findMany({
      where: { clinicId: req.user.clinicId },
      include: { patient: true }
    });
    res.json(appointments);
  }
}

module.exports = new AppointmentController();
