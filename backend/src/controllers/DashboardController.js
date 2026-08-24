const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DashboardController {
  async getMetrics(req, res) {
    try {
      const clinicId = req.user.clinicId;
      const dateParam = req.query.date;
      const today = dateParam ? new Date(`${dateParam}T00:00:00.000Z`) : new Date();
      if (!dateParam) today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Total Appointments for selected date
      const totalAppointments = await prisma.appointment.count({
        where: {
          clinicId,
          date: { gte: today, lt: tomorrow }
        }
      });

      // Total Patients Ever
      const totalPatients = await prisma.patient.count({
        where: { clinicId }
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

      // Unconfirmed Appointments for Tomorrow OR needs_attention
      const attentionAppointments = await prisma.appointment.findMany({
        where: {
          clinicId,
          OR: [
            { date: { gte: tomorrow, lt: new Date(tomorrow.getTime() + 86400000) }, status: 'pending' },
            { status: 'needs_attention' }
          ]
        },
        include: { patient: true }
      });

      // Map to attentionNeeded format
      const attentionNeeded = attentionAppointments.map(apt => ({
        id: apt.id,
        name: apt.patient.name,
        reason: apt.status === 'needs_attention' ? "Mensagem não compreendida (Atenção)" : "Consulta amanhã (Pendente)",
        time: apt.status === 'needs_attention' ? "Urgente" : "Verifique"
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

      // Canceled Appointments (selected date)
      const canceledAppointments = await prisma.appointment.count({
        where: {
          clinicId,
          date: { gte: today, lt: tomorrow },
          status: 'canceled'
        }
      });

      res.json({
        metrics: {
          totalAppointments,
          totalPatients,
          canceledAppointments,
          confirmationRate: `${confirmationRate}%`,
          messagesSent
        },
        attentionNeeded,
        todayAppointments: todayAppointments.map(a => ({
          id: a.id,
          name: a.patient.name,
          time: a.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: aptStatusLabel(a.status),
          procedure: a.procedure || 'Consulta'
        }))
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

function aptStatusLabel(status) {
  if (status === 'confirmed') return 'Confirmado';
  if (status === 'canceled') return 'Cancelado';
  if (status === 'completed') return 'Concluído';
  if (status === 'needs_attention') return 'Requer Atenção';
  return 'Pendente';
}

module.exports = new DashboardController();
