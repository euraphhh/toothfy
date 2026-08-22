const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DashboardController {
  async getMetrics(req, res) {
    try {
      const clinicId = req.user.clinicId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Total Appointments Today
      const totalAppointments = await prisma.appointment.count({
        where: {
          clinicId,
          date: { gte: today, lt: tomorrow }
        }
      });

      // Confirmed Appointments Today
      const confirmedAppointments = await prisma.appointment.count({
        where: {
          clinicId,
          date: { gte: today, lt: tomorrow },
          status: 'confirmed'
        }
      });

      const confirmationRate = totalAppointments > 0 
        ? Math.round((confirmedAppointments / totalAppointments) * 100) 
        : 0;

      // Unconfirmed Appointments for Tomorrow (Needs Attention)
      const unconfirmedTomorrow = await prisma.appointment.findMany({
        where: {
          clinicId,
          date: { gte: tomorrow, lt: new Date(tomorrow.getTime() + 86400000) },
          status: 'pending'
        },
        include: { patient: true }
      });

      // Map to attentionNeeded format
      const attentionNeeded = unconfirmedTomorrow.map(apt => ({
        id: apt.id,
        name: apt.patient.name,
        reason: "Consulta amanhã (Pendente)",
        time: "Verifique"
      }));

      // Today's appointments list
      const todayAppointments = await prisma.appointment.findMany({
        where: {
          clinicId,
          date: { gte: today, lt: tomorrow }
        },
        include: { patient: true },
        orderBy: { date: 'asc' }
      });

      // Messages Sent Today
      const messagesSent = await prisma.message.count({
        where: {
          clinicId,
          createdAt: { gte: today, lt: tomorrow },
          direction: 'out'
        }
      });

      res.json({
        metrics: {
          totalAppointments,
          confirmationRate: `${confirmationRate}%`,
          messagesSent
        },
        attentionNeeded,
        todayAppointments: todayAppointments.map(a => ({
          id: a.id,
          name: a.patient.name,
          time: a.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: a.status === 'confirmed' ? 'Confirmado' : (a.status === 'canceled' ? 'Cancelado' : (a.status === 'completed' ? 'Concluído' : 'Pendente')),
          procedure: a.procedure || 'Consulta'
        }))
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DashboardController();
