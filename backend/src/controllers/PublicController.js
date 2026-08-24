const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../services/emailService');

class PublicController {
  // GET /api/public/appointments/:id
  async getAppointmentDetails(req, res) {
    try {
      const { id } = req.params;
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          patient: true,
          clinic: true,
        }
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Consulta não encontrada.' });
      }

      res.json({
        id: appointment.id,
        date: appointment.date,
        procedure: appointment.procedure,
        status: appointment.status,
        patientName: appointment.patient.name,
        clinicName: appointment.clinic.name
      });
    } catch (error) {
      console.error('[PublicController Error]:', error);
      res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
  }

  // PUT /api/public/appointments/:id/confirm
  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'confirmed' ou 'canceled'

      if (!['confirmed', 'canceled'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido.' });
      }

      const appointment = await prisma.appointment.update({
        where: { id },
        data: { status },
        include: { patient: true } // Precisamos do nome do paciente pro e-mail
      });

      // Busca administradores da clínica para notificar
      const admins = await prisma.user.findMany({
        where: { clinicId: appointment.clinicId, role: 'admin' }
      });

      const statusText = status === 'confirmed' ? 'Confirmou Presença' : 'Cancelou a Consulta';
      const statusColor = status === 'confirmed' ? '#16a34a' : '#dc2626';

      const html = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #0f172a; margin-top: 0;">Atualização de Consulta</h2>
          <p style="font-size: 16px; color: #334155;">
            O paciente <strong>${appointment.patient.name}</strong> acabou de interagir com o link público.
          </p>
          <div style="background-color: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 12px; margin: 20px 0;">
            <p style="margin: 0; color: ${statusColor}; font-weight: bold; font-size: 18px;">
              ${statusText}
            </p>
          </div>
          <p style="font-size: 14px; color: #64748b;">Acesse o painel do ToothiFy para mais detalhes.</p>
        </div>
      `;

      // Envia notificação para todos os admins
      for (const admin of admins) {
        if (admin.email) {
          await sendEmail(admin.email, `Atualização: ${appointment.patient.name} ${statusText.toLowerCase()}`, html).catch(e => console.error('Erro ao enviar email:', e));
        }
      }

      res.json({ message: 'Status atualizado com sucesso.', status: appointment.status });
    } catch (error) {
      console.error('[PublicController Error]:', error);
      res.status(500).json({ error: 'Erro ao atualizar status.' });
    }
  }
}

module.exports = new PublicController();
