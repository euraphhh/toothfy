const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AppointmentController {
  async create(req, res) {
    try {
      const { patientId, date, procedure } = req.body;
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
