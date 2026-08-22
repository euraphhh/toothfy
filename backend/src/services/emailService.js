const { Resend } = require('resend');

// A chave será puxada automaticamente do seu .env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia um email transacional
 * @param {string} to - Destinatário
 * @param {string} subject - Assunto
 * @param {string} html - Conteúdo HTML
 */
const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: 'SaaS Odonto <onboarding@resend.dev>', // Modifique para o domínio verificado depois
      to: [to],
      subject: subject,
      html: html,
    });
    
    console.log('Email enviado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
