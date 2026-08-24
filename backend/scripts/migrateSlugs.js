const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

async function main() {
  const clinics = await prisma.clinic.findMany();
  for (const clinic of clinics) {
    let baseSlug = generateSlug(clinic.name);
    if (!baseSlug) baseSlug = 'clinica';
    
    let slug = baseSlug;
    let counter = 1;
    let exists = true;
    
    while (exists) {
      const check = await prisma.clinic.findFirst({ where: { slug, id: { not: clinic.id } } });
      if (check) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      } else {
        exists = false;
      }
    }

    await prisma.clinic.update({
      where: { id: clinic.id },
      data: { slug }
    });
    console.log(`Updated clinic ${clinic.id} with slug: ${slug}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
