const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ClinicController {
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
