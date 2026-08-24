const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PatientController {
  async create(req, res) {
    try {
      const { name, phone, email, cpf, rg, birthDate, cep, address, neighborhood, city, state } = req.body;
      const patient = await prisma.patient.create({
        data: {
          clinicId: req.user.clinicId,
          name,
          phone,
          email: email || '',
          cpf,
          rg,
          birthDate: birthDate ? new Date(birthDate) : null,
          cep,
          address,
          neighborhood,
          city,
          state
        }
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
