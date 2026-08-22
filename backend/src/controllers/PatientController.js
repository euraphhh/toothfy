const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PatientController {
  async create(req, res) {
    try {
      const { name, phone } = req.body;
      const patient = await prisma.patient.create({
        data: { name, phone, clinicId: req.user.clinicId }
      });
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async list(req, res) {
    const patients = await prisma.patient.findMany({
      where: { clinicId: req.user.clinicId }
    });
    res.json(patients);
  }
}

module.exports = new PatientController();
