const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MessageController {
  async list(req, res) {
    try {
      const messages = await prisma.message.findMany({
        where: { clinicId: req.user.clinicId },
        include: {
          appointment: {
            include: { patient: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(messages);
    } catch (error) {
      console.error('[MessageController Error]:', error);
      res.status(500).json({ error: 'Erro ao buscar mensagens.' });
    }
  }
}

module.exports = new MessageController();
