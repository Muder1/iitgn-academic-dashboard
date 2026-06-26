const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBaskets() {
  const basketNames = [
    'Institute Core',
    'Discipline Core',
    'Discipline Elective',
    'Open Elective',
    'Humanities',
    'Math',
    'Science'
  ];

  console.log("Seeding Baskets...");
  
  for (const name of basketNames) {
    await prisma.basket.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Baskets seeded successfully.");
}

seedBaskets()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());