const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const whatsappService = require('../services/whatsappService');

const prisma = new PrismaClient();

class JobScheduler {
  constructor() {
    this.jobs = [];
  }

  start() {
    console.log('[JobScheduler] Iniciando workers...');

    // Roda a cada hora no minuto 0 (ex: 09:00, 10:00)
    // Para testes no MVP, podemos rodar a cada 5 minutos usando '*/5 * * * *'
    const reminderJob = cron.schedule('*/5 * * * *', async () => {
      console.log('[JobScheduler] Executando rotina de lembretes...');
      await this.processReminders();
    });

    this.jobs.push(reminderJob);
  }

  async processReminders() {
    try {
      const today = new Date();
      
      // Busca consultas pendentes que ainda não receberam lembrete
      const appointments = await prisma.appointment.findMany({
        where: {
          status: 'pending',
          date: {
            gte: new Date(today.getTime() + 24 * 60 * 60 * 1000), // A partir de amanhã
            lte: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000) // Até 4 dias
          }
        },
        include: { patient: true }
      });

      console.log(`[JobScheduler] Encontrou ${appointments.length} consultas potenciais para lembrete.`);

      for (const apt of appointments) {
        const daysDiff = Math.ceil((apt.date.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        let type = null;
        if (daysDiff === 3) type = 'reminder_3d';
        else if (daysDiff === 1) type = 'reminder_1d';

        if (!type) continue; // Não está no alvo

        // Verifica se já mandou essa mensagem
        const existingMsg = await prisma.message.findFirst({
          where: { appointmentId: apt.id, type }
        });

        if (existingMsg) continue; // Já foi enviado

        console.log(`[JobScheduler] Enviando ${type} para ${apt.patient.name}...`);

        // Idealmente teríamos templates aprovados (ex: 'lembrete_consulta_3d')
        const templateName = type === 'reminder_3d' ? 'lembrete_3d' : 'lembrete_1d';
        
        const result = await whatsappService.sendMessage(
          apt.clinicId, 
          apt.patient.phone, 
          templateName
        );

        // Registra a mensagem
        await prisma.message.create({
          data: {
            clinicId: apt.clinicId,
            appointmentId: apt.id,
            type,
            direction: 'out',
            status: result.success ? 'sent' : 'failed',
            externalId: result.externalId || null
          }
        });
      }
    } catch (error) {
      console.error('[JobScheduler] Erro na rotina de lembretes:', error);
    }
  }
}

module.exports = new JobScheduler();
