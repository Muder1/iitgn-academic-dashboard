const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Curriculum Requirements...");

  // 1. Fetch basket IDs to link dynamically
  const baskets = await prisma.basket.findMany();
  const basketMap = baskets.reduce((acc, b) => {
    acc[b.name] = b.id;
    return acc;
  }, {});

  // 2. Define the rules based on the Academic Norms
  const requirements = [
    // --- COMMON REQUIREMENTS (All Branches, 2022 onwards) ---
    { branch: 'All', cohortStart: 2022, cohortEnd: 2099, basket: 'Institute Core', credits: 34 },
    { branch: 'All', cohortStart: 2022, cohortEnd: 2099, basket: 'Math', credits: 10 },
    { branch: 'All', cohortStart: 2022, cohortEnd: 2099, basket: 'Science', credits: 12 },
    
    // --- COHORT: 2022 to 2024 ---
    { branch: 'All', cohortStart: 2022, cohortEnd: 2024, basket: 'Humanities', credits: 28 },
    { branch: 'All', cohortStart: 2022, cohortEnd: 2024, basket: 'Open Elective', credits: 16 },
    
    { branch: 'Computer Science & Engineering', cohortStart: 2022, cohortEnd: 2024, basket: 'Discipline Core', credits: 36 },
    { branch: 'Computer Science & Engineering', cohortStart: 2022, cohortEnd: 2024, basket: 'Discipline Elective', credits: 26 },
    
    { branch: 'Electrical Engineering', cohortStart: 2022, cohortEnd: 2024, basket: 'Discipline Core', credits: 43 },
    { branch: 'Electrical Engineering', cohortStart: 2022, cohortEnd: 2024, basket: 'Discipline Elective', credits: 20 },
    
    // (Add the rest of the 2022-2024 branch specific targets here...)

    // --- COHORT: 2025 Onwards ---
    { branch: 'All', cohortStart: 2025, cohortEnd: 2099, basket: 'Humanities', credits: 20 },
    { branch: 'All', cohortStart: 2025, cohortEnd: 2099, basket: 'Open Elective', credits: 20 },
    
    { branch: 'Computer Science & Engineering', cohortStart: 2025, cohortEnd: 2099, basket: 'Discipline Core', credits: 36 },
    { branch: 'Computer Science & Engineering', cohortStart: 2025, cohortEnd: 2099, basket: 'Discipline Elective', credits: 32 },
    
    { branch: 'Mechanical Engineering', cohortStart: 2025, cohortEnd: 2099, basket: 'Discipline Core', credits: 44 },
    { branch: 'Mechanical Engineering', cohortStart: 2025, cohortEnd: 2099, basket: 'Discipline Elective', credits: 24 },
    
    // (Add the rest of the 2025+ branch specific targets here...)
  ];

  // 3. Insert into the database
  for (const req of requirements) {
    if (!basketMap[req.basket]) continue; // Skip if basket doesn't exist

    await prisma.curriculumRequirement.upsert({
      where: {
        branch_cohortStart_basketId: {
          branch: req.branch,
          cohortStart: req.cohortStart,
          basketId: basketMap[req.basket]
        }
      },
      update: { creditsTarget: req.credits, cohortEnd: req.cohortEnd },
      create: {
        branch: req.branch,
        cohortStart: req.cohortStart,
        cohortEnd: req.cohortEnd,
        creditsTarget: req.credits,
        basketId: basketMap[req.basket]
      }
    });
  }

  console.log("Requirements seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());