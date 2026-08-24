const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Limpa o banco caso já exista esse email pra não dar erro de duplicate
  await prisma.user.deleteMany({ where: { email: 'euraphh@gmail.com' } });

  const clinic = await prisma.clinic.create({
    data: {
      name: 'Clínica Odonto Prime (Teste)',
      whatsappNumber: '5511999999999',
    }
  });

  const passwordHash = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Dr. Raphael (Teste)',
      email: 'euraphh@gmail.com',
      passwordHash,
      clinicId: clinic.id,
      role: 'admin'
    }
  });

  console.log('--- CONTA CRIADA ---');
  console.log(`Login: euraphh@gmail.com`);
  console.log(`Senha: 123456`);
  console.log('--------------------');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
