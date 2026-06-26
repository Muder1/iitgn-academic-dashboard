const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");

  // ==========================================
  // 1. CREATE BASKETS
  // ==========================================
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
  console.log("Baskets created/verified.");

  // ==========================================
  // 2. DEFINE MASTER COURSE CATALOG (114+ Courses)
  // ==========================================
  const courses = [
    // --- INSTITUTE CORE & FOUNDATION ---
    { code: 'FP 100', title: 'Foundation Programme', credits: 4, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 101', title: 'Engineering Graphics', credits: 3, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 112', title: 'Computing', credits: 3, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 113', title: 'Data Centric Computing', credits: 3, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 119', title: 'Principles of Artificial Intelligence', credits: 4, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 114', title: 'Probability, Statistics and Data Visualization', credits: 3, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 115', title: 'Design, Innovation and Prototyping', credits: 5, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 116', title: 'Principles and Applications of Electrical Engineering', credits: 5, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 117', title: 'The World of Engineering', credits: 2, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 118', title: 'Materials for the Future', credits: 3, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'ES 243', title: 'Biology for Engineers', credits: 4, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'MSE 211', title: 'Material Characterization Techniques', credits: 3, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'PE 101', title: 'Physical Education', credits: 0, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'PE 102', title: 'Physical Education', credits: 0, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'IN 101', title: 'Comprehensive Viva Voce', credits: 0, basketId: basketMap['Institute Core'], branches: ['All'] },
    { code: 'IN 102', title: 'Comprehensive Viva Voce', credits: 0, basketId: basketMap['Institute Core'], branches: ['All'] },

    // --- MATH ---
    { code: 'MA 103', title: 'Calculus of Single Variable & Linear Algebra', credits: 4, basketId: basketMap['Math'], branches: ['All'] },
    { code: 'MA 104', title: 'Ordinary Differential Equations', credits: 2, basketId: basketMap['Math'], branches: ['All'] },
    { code: 'MA 203', title: 'Numerical Methods', credits: 2, basketId: basketMap['Math'], branches: ['All'] },

    // --- SCIENCE ---
    { code: 'BS 192', title: 'Undergraduate Science Laboratory', credits: 3, basketId: basketMap['Science'], branches: ['All'] },

    // --- HUMANITIES ---
    { code: 'HS 191', title: 'Introduction to Writing I', credits: 2, basketId: basketMap['Humanities'], branches: ['All'] },
    { code: 'HS 192', title: 'Introduction to Writing II', credits: 2, basketId: basketMap['Humanities'], branches: ['All'] },
    { code: 'HS 151', title: 'Economics', credits: 4, basketId: basketMap['Humanities'], branches: ['All'] },
    { code: 'HS 221', title: 'Introduction to Philosophy', credits: 4, basketId: basketMap['Humanities'], branches: ['All'] },
    { code: 'HS 201', title: 'World Civilizations and Cultures', credits: 4, basketId: basketMap['Humanities'], branches: ['All'] },
    { code: 'GE 101', title: 'General Education I', credits: 2, basketId: basketMap['Humanities'], branches: ['All'] },

    // --- DISCIPLINE CORE (Shared Across Multiple Branches) ---
    { code: 'ES 204', title: 'Digital Systems', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence', 'Computer Science & Engineering', 'Electrical Engineering', 'Integrated Circuit Design & Technology'] },
    { code: 'ES 242', title: 'Data Structures & Algorithms I', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence', 'Computer Science & Engineering'] },
    { code: 'ES 244', title: 'Signals, Systems & Random Processes', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence', 'Electrical Engineering', 'Integrated Circuit Design & Technology'] },
    { code: 'ES 245', title: 'Control Systems', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence', 'Electrical Engineering', 'Mechanical Engineering'] },
    { code: 'ES 336', title: 'Computer Organization & Architecture', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence', 'Computer Science & Engineering', 'Integrated Circuit Design & Technology'] },
    { code: 'CS 201', title: 'Theory of Computing', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence', 'Computer Science & Engineering'] },
    { code: 'CS 329', title: 'Foundations of AI: Multiagent Systems', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence', 'Computer Science & Engineering'] },
    { code: 'ES 211', title: 'Thermodynamics', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering', 'Mechanical Engineering'] },
    { code: 'ES 221', title: 'Mechanics of Solids', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering', 'Mechanical Engineering'] },
    { code: 'EE 226', title: 'Semiconductor Devices', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering', 'Integrated Circuit Design & Technology'] },
    { code: 'EE 322', title: 'Analog & Mixed Signal Circuits', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering', 'Integrated Circuit Design & Technology'] },

    // --- ARTIFICIAL INTELLIGENCE ---
    { code: 'CS 303', title: 'Mathematical Foundations for AI', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence'] },
    { code: 'CS 203', title: 'Software Tools & Techniques for AI', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence'] },
    { code: 'ES 335', title: 'Machine Learning', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence'] },
    { code: 'CS 328', title: 'Introduction to Data Science', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Artificial Intelligence'] },

    // --- CHEMICAL ENGINEERING ---
    { code: 'CL 201', title: 'Chemical Process Calculations', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 202', title: 'Chemical Engineering Thermodynamics', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 203', title: 'Process Fluid Mechanics', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 205', title: 'Chemical Reaction Engineering I', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 204', title: 'Heat Transfer', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 313', title: 'Chemical Reaction Engineering II', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 314', title: 'Separation Processes I', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 315', title: 'Process Dynamics & Control', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 326', title: 'Integrated Chemical Engineering Lab-I', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 316', title: 'Separation Processes II', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 317', title: 'Process Synthesis, Design & Simulation', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 325', title: 'Transport Phenomena', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },
    { code: 'CL 327', title: 'Integrated Chemical Engineering Lab-II', credits: 2, basketId: basketMap['Discipline Core'], branches: ['Chemical Engineering'] },

    // --- CIVIL ENGINEERING ---
    { code: 'CE 201', title: 'Earth Materials & Processes', credits: 2, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'CE 203', title: 'Geospatial Engineering', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'CE 302', title: 'Structural Analysis', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'ES 212', title: 'Fluid Mechanics', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'CE 202', title: 'Sustainability & Environment', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'CE 310', title: 'Hydrology & Hydraulics', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'CE 312', title: 'Design of Steel Structures', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'CE 301', title: 'Soil Mechanics', credits: 5, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'CE 311', title: 'Design of Reinforced Concrete Structures', credits: 5, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },
    { code: 'CE 403', title: 'Construction Technology & Management', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Civil Engineering'] },

    // --- COMPUTER SCIENCE & ENGINEERING ---
    { code: 'ES 214', title: 'Discrete Mathematics', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Computer Science & Engineering'] },
    { code: 'CS 330', title: 'Operating Systems', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Computer Science & Engineering'] },
    { code: 'CS 202', title: 'Software Tools and Techniques for CSE', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Computer Science & Engineering'] },
    { code: 'CS 331', title: 'Computer Networks', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Computer Science & Engineering'] },

    // --- ELECTRICAL ENGINEERING ---
    { code: 'EE 221', title: 'Electronic Devices', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering'] },
    { code: 'EE 223', title: 'Electrical Machines', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering'] },
    { code: 'EE 224', title: 'Power Systems', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering'] },
    { code: 'EE 312', title: 'Engineering Electromagnetics', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering'] },
    { code: 'EE 333', title: 'Power Electronics', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering'] },
    { code: 'EE 323', title: 'Digital Signal Processing', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering'] },
    { code: 'EE 341', title: 'Communication Systems', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Electrical Engineering'] },

    // --- INTEGRATED CIRCUIT DESIGN & TECHNOLOGY ---
    { code: 'EE 225', title: 'Unveiling the Semiconductor World', credits: 2, basketId: basketMap['Discipline Core'], branches: ['Integrated Circuit Design & Technology'] },
    { code: 'EE 227', title: 'CMOS Circuit Design', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Integrated Circuit Design & Technology'] },
    { code: 'ES 247', title: 'IC Fabrication & Manufacturing', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Integrated Circuit Design & Technology'] },
    { code: 'TBD-001', title: 'Semiconductor Material & Device Characterization', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Integrated Circuit Design & Technology'] },
    { code: 'TBD-002', title: 'Thin Film Science & Vacuum Technology', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Integrated Circuit Design & Technology'] },
    { code: 'TBD-003', title: 'IC Fabrication Lab', credits: 2, basketId: basketMap['Discipline Core'], branches: ['Integrated Circuit Design & Technology'] },
    { code: 'TBD-004', title: 'Semiconductor Package Assembly & Manufacturing', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Integrated Circuit Design & Technology'] },

    // --- MATERIALS ENGINEERING ---
    { code: 'MSE 207', title: 'Structure of Materials', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 202', title: 'Materials Thermodynamics', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 204', title: 'Transport Phenomena in Materials Engineering', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 210', title: 'Microstructural Engineering', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 206', title: 'Physics of Materials', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 203', title: 'Integrated Computational Materials Engineering', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 205', title: 'Mechanical Behaviour of Materials', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 313', title: 'Polymers, Ceramics and Composites', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 307', title: 'Materials Processing', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 302', title: 'Corrosion & Degradation of Materials', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },
    { code: 'MSE 312', title: 'Materials & Environment', credits: 2, basketId: basketMap['Discipline Core'], branches: ['Materials Engineering'] },

    // --- MECHANICAL ENGINEERING ---
    { code: 'ME 206', title: 'Statics & Dynamics', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'ME 207', title: 'Fluid Dynamics', credits: 5, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'ME 209', title: 'Principles of Manufacturing Processes', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'ME 208', title: 'Vibrations', credits: 2, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'ME 334', title: 'Heat and Mass Transfer', credits: 4, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'ME 362', title: 'Introduction to Manufacturing Systems & Metrology', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'ME 333', title: 'Mechanics of Materials', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'ME 335', title: 'Synthesis and Analysis of Mechanisms', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'ME 337', title: 'Mechanical Systems Design', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] },
    { code: 'ES 337', title: 'Energy Systems', credits: 3, basketId: basketMap['Discipline Core'], branches: ['Mechanical Engineering'] }
  ];

  // ==========================================
  // 3. EXECUTE SEEDING
  // ==========================================
  console.log(`Seeding ${courses.length} courses...`);
  
  for (const course of courses) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: {
        title: course.title,
        credits: course.credits,
        branches: course.branches,
        basketId: course.basketId
      },
      create: course,
    });
  }
  
  console.log("Seeding complete! You are ready to go.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });