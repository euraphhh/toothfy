const { PrismaClient } = require('@prisma/client');
const whatsappService = require('../services/whatsappService');

const prisma = new PrismaClient();

class WebhookController {
  // Verificação de segurança da Meta
  verify(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Em produção, isso viria do env
    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'toothify_secret_token';

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[Webhook] Verificado com sucesso pela Meta');
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }
    return res.sendStatus(400);
  }

  // Recebimento de mensagens (Inbound)
  async receive(req, res) {
    try {
      const { entry } = req.body;

      if (!entry || !entry[0]?.changes?.[0]?.value?.messages) {
        return res.sendStatus(200); // Evento irrelevante (ex: status lido/entregue)
      }

      const value = entry[0].changes[0].value;
      const message = value.messages[0];
      const fromPhone = message.from;
      const text = message.text?.body?.toLowerCase().trim();

      console.log(`[Webhook] Mensagem recebida de ${fromPhone}: ${text}`);

      if (!text) return res.sendStatus(200);

      // 1. Tentar encontrar de qual paciente é esse número
      const patient = await prisma.patient.findFirst({
        where: { phone: { endsWith: fromPhone.slice(-8) } } // Busca generosa ignorando DDI/DDD exatos
      });

      if (!patient) {
        console.log(`[Webhook] Paciente não encontrado para o número ${fromPhone}`);
        return res.sendStatus(200);
      }

      // 2. Encontrar a consulta pendente mais próxima desse paciente
      const appointment = await prisma.appointment.findFirst({
        where: { 
          patientId: patient.id,
          status: 'pending',
          date: { gte: new Date() }
        },
        orderBy: { date: 'asc' }
      });

      if (!appointment) {
        console.log(`[Webhook] Nenhuma consulta pendente para o paciente ${patient.name}`);
        // Salva a mensagem como solta (opcional)
        return res.sendStatus(200);
      }

      // 3. Registrar a mensagem no histórico
      await prisma.message.create({
        data: {
          clinicId: appointment.clinicId,
          appointmentId: appointment.id,
          type: 'reply',
          direction: 'in',
          status: 'delivered',
          externalId: message.id
        }
      });

      // 4. Lógica NLP / Fallback
      let newStatus = null;
      let replyMessage = null;

      if (text === '1' || text === 'sim' || text === 'confirmar') {
        newStatus = 'confirmed';
        replyMessage = 'Presença confirmada! Agradecemos e aguardamos você.';
      } else if (text === '2' || text === 'não' || text === 'nao' || text === 'cancelar') {
        newStatus = 'canceled';
        replyMessage = 'Consulta cancelada com sucesso. Se precisar reagendar, entre em contato.';
      } else {
        newStatus = 'needs_attention';
        replyMessage = 'Recebemos sua mensagem. A secretária entrará em contato em breve para te ajudar.';
      }

      // 5. Atualizar o status da consulta
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: newStatus }
      });

      // 6. Enviar mensagem de resposta
      await whatsappService.sendTextMessage(appointment.clinicId, fromPhone, replyMessage);

      res.sendStatus(200);
    } catch (error) {
      console.error('[Webhook Error]:', error);
      res.sendStatus(500);
    }
  }
}

module.exports = new WebhookController();
