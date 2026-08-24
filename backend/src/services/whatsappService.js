const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WhatsappService {
  constructor() {
    this.apiBase = 'https://graph.facebook.com/v17.0';
  }

  async sendMessage(clinicId, toPhone, templateName, templateLanguage = 'pt_BR') {
    try {
      // Busca as configurações da clínica (onde deve estar o Token e PhoneID reais na V2)
      // No MVP, vamos simular ou usar variáveis de ambiente como fallback
      const clinic = await prisma.clinic.findUnique({
        where: { id: clinicId }
      });

      if (!clinic) throw new Error('Clínica não encontrada');

      const phoneId = process.env.META_PHONE_ID; // Usar do env para MVP, futuramente do banco
      const token = process.env.META_ACCESS_TOKEN; // Usar do env para MVP

      if (!phoneId || !token) {
        console.warn(`[WhatsappService] Credenciais da Meta não configuradas para clinicId ${clinicId}`);
        // Retorna "simulado" para não quebrar o fluxo de testes do MVP
        return { success: true, simulated: true, externalId: `sim_${Date.now()}` };
      }

      const response = await axios.post(
        `${this.apiBase}/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: toPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: templateLanguage }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        externalId: response.data?.messages?.[0]?.id,
        simulated: false
      };
    } catch (error) {
      console.error('[WhatsappService Error]:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async sendTextMessage(clinicId, toPhone, text) {
    try {
      const phoneId = process.env.META_PHONE_ID; 
      const token = process.env.META_ACCESS_TOKEN;

      if (!phoneId || !token) {
        return { success: true, simulated: true };
      }

      const response = await axios.post(
        `${this.apiBase}/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: toPhone,
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, externalId: response.data?.messages?.[0]?.id };
    } catch (error) {
      console.error('[WhatsappService Text Error]:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new WhatsappService();
