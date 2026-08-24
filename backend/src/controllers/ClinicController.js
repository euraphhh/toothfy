const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ClinicController {
  async checkSlug(req, res) {
    try {
      const { slug } = req.query;
      if (!slug) {
        return res.status(400).json({ error: 'Slug é obrigatório.' });
      }

      // Procura se já existe uma clínica com esse slug
      const clinic = await prisma.clinic.findUnique({
        where: { slug }
      });

      res.json({ available: !clinic });
    } catch (error) {
      console.error('[Check Slug Error]:', error);
      res.status(500).json({ error: 'Erro ao verificar disponibilidade do slug.' });
    }
  }

  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      
      const clinic = await prisma.clinic.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true
        }
      });

      if (!clinic) {
        return res.status(404).json({ error: 'Clínica não encontrada.' });
      }

      res.json(clinic);
    } catch (error) {
      console.error('[Get Clinic By Slug Error]:', error);
      res.status(500).json({ error: 'Erro ao buscar clínica.' });
    }
  }

  async getSettings(req, res) {
    try {
      const clinic = await prisma.clinic.findUnique({
        where: { id: req.user.clinicId },
        select: { metaBusinessId: true, whatsappNumber: true }
      });
      res.json(clinic || {});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateSettings(req, res) {
    try {
      const { metaBusinessId, whatsappNumber } = req.body;
      const clinic = await prisma.clinic.update({
        where: { id: req.user.clinicId },
        data: { metaBusinessId, whatsappNumber }
      });
      res.json({ success: true, clinic });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ClinicController();
