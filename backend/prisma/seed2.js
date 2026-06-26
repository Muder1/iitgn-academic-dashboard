const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCourses() {
  const courses = [
    { code: 'FP 100', title: 'Foundation Programme', credits: 4, basket: 'Institute Core', branch: 'All' },
    { code: 'ES 101', title: 'Engineering Graphics', credits: 3, basket: 'Institute Core', branch: 'All' },
    { code: 'MA 103', title: 'Calculus of Single Variable and Linear Algebra', credits: 4, basket: 'Institute Core', branch: 'All' },
    { code: 'ES 112', title: 'Computing', credits: 4, basket: 'Institute Core', branch: 'All' },
    { code: 'ES 115', title: 'Design, Innovation, and Prototyping', credits: 5, basket: 'Institute Core', branch: 'All' },
    { code: 'HS 191', title: 'Introduction to Writing I', credits: 2, basket: 'Humanities', branch: 'All' },
    { code: 'BS 192', title: 'Undergraduate Science Laboratory', credits: 3, basket: 'Institute Core', branch: 'All' },
    { code: 'GE 101', title: 'General Education I', credits: 2, basket: 'Humanities', branch: 'All' },
    { code: 'MA 104', title: 'Ordinary Differential Equations', credits: 2, basket: 'Mathematics', branch: 'All' },
    { code: 'ES 113', title: 'Data-Centric Computing', credits: 3, basket: 'Institute Core', branch: 'All' },
    { code: 'ES 119', title: 'Principles of Artificial Intelligence', credits: 4, basket: 'Institute Core', branch: 'All' },
    { code: 'ES 114', title: 'Probability, Statistics, and Data Visualization', credits: 3, basket: 'Institute Core', branch: 'All' },
    { code: 'ES 116', title: 'Principles and Applications of Electrical Engineering', credits: 5, basket: 'Institute Core', branch: 'All' },
    { code: 'ES 117', title: 'The World of Engineering', credits: 2, basket: 'Institute Core', branch: 'All' },
    { code: 'CE 202', title: 'Sustainability and Environment', credits: 3, basket: 'Discipline Core', branch: 'CE' },
    { code: 'CS 203', title: 'Software Tools & Techniques for AI', credits: 4, basket: 'Discipline Core', branch: 'AI' },
    { code: 'ES 211', title: 'Thermodynamics', credits: 3, basket: 'Discipline Core', branch: 'CL' },
    { code: 'ES 214', title: 'Discrete Mathematics', credits: 4, basket: 'Discipline Core', branch: 'CSE' },
    { code: 'EE 225', title: 'Unveiling the Semiconductor World', credits: 2, basket: 'Discipline Core', branch: 'EE' },
    { code: 'EE 226', title: 'Semiconductor Devices', credits: 4, basket: 'Discipline Core', branch: 'EE' },
    { code: 'HS 192', title: 'Introduction to Writing II', credits: 2, basket: 'Humanities', branch: 'All' },
    { code: 'MSE 207', title: 'Structure of Materials', credits: 4, basket: 'Discipline Core', branch: 'MSE' },
    { code: 'PE 102', title: 'Physical Education', credits: 0, basket: 'Institute Core', branch: 'All' },
    { code: 'IN 102', title: 'Comprehensive Viva Voce', credits: 0, basket: 'Institute Core', branch: 'All' }
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: {},
      create: course
    });
  }
}

seedCourses();