const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding IITGN Master Course Catalog...");

  const courses = [
    // Institute Core & Foundation
    { id: 'FP100', title: 'Foundation Programme', credits: 4 },
    { id: 'HS191', title: 'Introduction to Writing I', credits: 2 },
    { id: 'HS192', title: 'Introduction to Writing II', credits: 2 },
    { id: 'HS151', title: 'Economics', credits: 4 },
    { id: 'HS201', title: 'World Civilizations and Cultures', credits: 4 },
    { id: 'HS221', title: 'Introduction to Philosophy', credits: 4 },
    { id: 'ES101', title: 'Engineering Graphics', credits: 3 },
    { id: 'ES112', title: 'Computing', credits: 3 },
    { id: 'ES113', title: 'Data Centric Computing', credits: 3 },
    { id: 'ES114', title: 'Probability, Statistics and Data Visualization', credits: 3 },
    { id: 'ES115', title: 'Design, Innovation and Prototyping', credits: 5 },
    { id: 'ES116', title: 'Principles and Applications of Electrical Engineering', credits: 5 },
    { id: 'ES117', title: 'The World of Engineering', credits: 2 },
    { id: 'ES243', title: 'Biology for Engineers', credits: 4 },
    { id: 'BS192', title: 'Undergraduate Science Laboratory', credits: 3 },
    { id: 'PE101', title: 'Physical Education I', credits: 0 },

    // Mathematics, Science & Materials Baskets
    { id: 'MA103', title: 'Calculus of Single Variable & Linear Algebra', credits: 4 },
    { id: 'MA104', title: 'Ordinary Differential Equations', credits: 2 },
    { id: 'MA203', title: 'Numerical Methods', credits: 2 },
    { id: 'ES118', title: 'Materials for the Future', credits: 3 },
    { id: 'PH201', title: 'Introduction to Electrodynamics', credits: 4 },
    { id: 'PH203', title: 'Solid State Physics', credits: 4 },

    // Electrical Engineering Core (EE)
    { id: 'ES244', title: 'Signals, Systems & Random Processes', credits: 4 },
    { id: 'EE221', title: 'Electronic Devices', credits: 3 },
    { id: 'EE226', title: 'Semiconductor Devices', credits: 4 },
    { id: 'EE223', title: 'Electrical Machines', credits: 4 },
    { id: 'EE224', title: 'Power Systems', credits: 4 },
    { id: 'ES245', title: 'Control Systems', credits: 4 },
    { id: 'ES204', title: 'Digital Systems', credits: 4 },
    { id: 'EE312', title: 'Engineering Electromagnetics', credits: 4 },
    { id: 'EE322', title: 'Analog & Mixed Signal Circuits', credits: 4 },
    { id: 'EE333', title: 'Power Electronics', credits: 4 },
    { id: 'EE323', title: 'Digital Signal Processing', credits: 4 },
    { id: 'EE341', title: 'Communication Systems', credits: 4 },
  ];

  // 1. Upsert Courses
  for (const course of courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: course, // Updates credits or titles if they changed
      create: course,
    });
  }
  console.log(`✅ Inserted ${courses.length} courses.`);

  // 2. Define Basket Mappings
  const basketMappings = [
    // Institute Core Mappings
    { courseId: 'FP100', basketName: 'Institute Core' },
    { courseId: 'ES101', basketName: 'Institute Core' },
    { courseId: 'ES112', basketName: 'Institute Core' },
    { courseId: 'ES113', basketName: 'Institute Core' },
    { courseId: 'ES114', basketName: 'Institute Core' },
    { courseId: 'ES115', basketName: 'Institute Core' },
    { courseId: 'ES116', basketName: 'Institute Core' },
    { courseId: 'ES117', basketName: 'Institute Core' },
    { courseId: 'ES243', basketName: 'Institute Core' },
    { courseId: 'BS192', basketName: 'Institute Core' },
    { courseId: 'PE101', basketName: 'Institute Core' },

    // HSS Basket Mappings
    { courseId: 'HS191', basketName: 'Humanities (HSS)' },
    { courseId: 'HS192', basketName: 'Humanities (HSS)' },
    { courseId: 'HS151', basketName: 'Humanities (HSS)' },
    { courseId: 'HS201', basketName: 'Humanities (HSS)' },
    { courseId: 'HS221', basketName: 'Humanities (HSS)' },

    // Math/Science/Engineering Science Baskets
    { courseId: 'MA103', basketName: 'Basic Science' }, 
    { courseId: 'MA104', basketName: 'Basic Science' },
    { courseId: 'MA203', basketName: 'Basic Science' },
    { courseId: 'ES118', basketName: 'Engineering Science' },
    { courseId: 'PH201', basketName: 'Basic Science' },
    { courseId: 'PH203', basketName: 'Basic Science' },

    // Electrical Engineering Discipline Core Mappings
    { courseId: 'ES244', basketName: 'Discipline Core' },
    { courseId: 'EE221', basketName: 'Discipline Core' },
    { courseId: 'EE226', basketName: 'Discipline Core' },
    { courseId: 'EE223', basketName: 'Discipline Core' },
    { courseId: 'EE224', basketName: 'Discipline Core' },
    { courseId: 'ES245', basketName: 'Discipline Core' },
    { courseId: 'ES204', basketName: 'Discipline Core' },
    { courseId: 'EE312', basketName: 'Discipline Core' },
    { courseId: 'EE322', basketName: 'Discipline Core' },
    { courseId: 'EE333', basketName: 'Discipline Core' },
    { courseId: 'EE323', basketName: 'Discipline Core' },
    { courseId: 'EE341', basketName: 'Discipline Core' }
  ];

  // 3. Upsert Basket Mappings
  for (const mapping of basketMappings) {
    await prisma.courseBasket.upsert({
      where: {
        courseId_basketName: {
          courseId: mapping.courseId,
          basketName: mapping.basketName
        }
      },
      update: {},
      create: mapping,
    });
  }

  console.log(`✅ Inserted ${basketMappings.length} basket mappings.`);
  console.log("🚀 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });