import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateTranscript = (userData, records) => {
  // 1. Initialize a standard A4 portrait document
  const doc = new jsPDF();

  // 2. Add Header Text
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 138); // IITGN Blue-ish
  doc.text('Indian Institute of Technology Gandhinagar', 14, 22);
  
  doc.setFontSize(16);
  doc.setTextColor(50, 50, 50);
  doc.text('Unofficial Academic Transcript', 14, 32);

  // 3. Add Student Details
  doc.setFontSize(11);
  doc.text(`Name: ${userData.name}`, 14, 45);
  doc.text(`Discipline: ${userData.discipline}`, 14, 52);
  doc.text(`Admission Year: ${userData.admissionYear}`, 14, 59);

  // Calculate CPI for the header
  let basePoints = 0;
  let baseCredits = 0;
  const gradePoints = { 'A+': 11, 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6, 'C-': 5, 'D': 4, 'F': 0 };

  const completed = records.filter(r => r.status === 'COMPLETED');
  
  completed.forEach(r => {
    const isGE = r.course?.code?.toUpperCase().startsWith('GE');
    if (!isGE && gradePoints[r.grade] !== undefined) {
      basePoints += (r.course?.credits * gradePoints[r.grade]);
      baseCredits += r.course?.credits;
    }
  });
  
  const currentCPI = baseCredits > 0 ? (basePoints / baseCredits).toFixed(2) : '0.00';
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Cumulative Performance Index (CPI): ${currentCPI}`, 14, 69);

  // 4. Group Records by Semester
  const recordsBySem = completed.reduce((acc, record) => {
    const sem = record.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(record);
    return acc;
  }, {});

  // 5. Draw Tables for Each Semester
  let currentY = 78; // Starting Y position for the first table

  Object.keys(recordsBySem).sort().forEach(sem => {
    // Add Semester Subheading
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`Semester ${sem}`, 14, currentY);
    
    currentY += 4;

    // Prepare Table Data
    const tableData = recordsBySem[sem].map(record => [
      record.course?.code || 'N/A',
      record.course?.title || 'Unknown Course',
      record.course?.credits || 0,
      record.grade || '-'
    ]);

    // Draw the Table
    doc.autoTable({
      startY: currentY,
      head: [['Code', 'Course Title', 'Credits', 'Grade']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' }, // Code
        1: { cellWidth: 110 }, // Title
        2: { cellWidth: 20, halign: 'center' }, // Credits
        3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' } // Grade
      }
    });

    // Update Y position for the next semester (using the end position of the last table)
    currentY = doc.lastAutoTable.finalY + 12;
  });

  // 6. Save the PDF
  const filename = `${userData.name.replace(/\s+/g, '_')}_Transcript.pdf`;
  doc.save(filename);
};