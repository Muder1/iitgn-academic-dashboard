const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting full database seeding...");

  // 1. Define Baskets
  const basketNames = [
    'Institute Core',
    'Discipline Core',
    'Discipline Elective',
    'Open Elective',
    'Humanities',
    'Math',
    'Science'
  ];

  const basketMap = {};
  for (const name of basketNames) {
    const b = await prisma.basket.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    basketMap[name] = b.id;
  }

  // 2. Full Course Catalog
  const courses = [
    // --- INSTITUTE CORE ---
    { code: 'FP 100', title: 'Foundation Programme', credits: 4, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 101', title: 'Engineering Graphics', credits: 3, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'MA 103', title: 'Calculus of Single Variable and Linear Algebra', credits: 4, basketId: basketMap['Math'], branches: ['All'] },
    { code: 'ES 112', title: 'Computing', credits: 4, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 113', title: 'Data-Centric Computing', credits: 3, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 114', title: 'Probability, Statistics, and Data Visualization', credits: 3, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 115', title: 'Design, Innovation, and Prototyping', credits: 5, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 116', title: 'Principles and Applications of Electrical Engineering', credits: 5, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 117', title: 'The World of Engineering', credits: 2, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 119', title: 'Principles of Artificial Intelligence', credits: 4, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'BS 192', title: 'Undergraduate Science Laboratory', credits: 3, basketId: basketMap['Science'], branches: ['All'] },
    { code: 'HS 191', title: 'Introduction to Writing I', credits: 2, basketId: basketMap['Humanities'], branches: ['All'] },
    { code: 'HS 192', title: 'Introduction to Writing II', credits: 2, basketId: basketMap['Humanities'], branches: ['All'] },
    { code: 'GE 101', title: 'General Education I', credits: 2, basketId: basketMap['Humanities'], branches: ['All'] },
    { code: 'PE 101', title: 'Physical Education', credits: 0, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'PE 102', title: 'Physical Education', credits: 0, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'IN 101', title: 'Comprehensive Viva Voce', credits: 0, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'IN 102', title: 'Comprehensive Viva Voce', credits: 0, basketId: basketMap['Institute Core'], branches: ['All'] },

    // --- DISCIPLINE CORE (Partial selection from full catalog) ---
    { code: 'CE 202', title: 'Sustainability and Environment', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'CS 203', title: 'Software Tools & Techniques for AI', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence'] },
    { code: 'ES 211', title: 'Thermodynamics', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering', 'Chemical Engineering'] },
    { code: 'ES 214', title: 'Discrete Mathematics', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Computer Science & Engineering'] },
    { code: 'EE 225', title: 'Unveiling the Semiconductor World', credits: 2, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering'] },
    { code: 'EE 226', title: 'Semiconductor Devices', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering', 'IC Design'] },
    { code: 'MSE 207', title: 'Structure of Materials', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'ME 207', title: 'Fluid Dynamics', credits: 5, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'MA 204', title: 'Introduction to Partial Differential Equations', credits: 2, basketId: basketMap['Math'], branches: ['All'] }
    
    // Continue adding remaining ~90+ courses following this pattern...
  ];

  // 3. Perform Upsert
  for (const course of courses) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: {
        title: course.title,
        credits: course.credits,
        basketId: course.basketId,
        branches: course.branches
      },
      create: course,
    });
  }
  console.log("Seeding complete. Database is synchronized.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());