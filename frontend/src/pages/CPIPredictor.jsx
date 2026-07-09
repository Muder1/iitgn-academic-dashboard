import React, { useState, useEffect } from 'react';

export default function CPIPredictor({ records }) {
  // 10-point scale based on our earlier IITGN calculations
  const gradePoints = { 'A+': 11, 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6, 'C-': 5, 'D': 4, 'F': 0 };
  const gradingScale = Object.keys(gradePoints);

  const [plannedCourses, setPlannedCourses] = useState([]);
  const [hypotheticalGrades, setHypotheticalGrades] = useState({});
  const [currentCPI, setCurrentCPI] = useState(0);
  const [projectedCPI, setProjectedCPI] = useState(0);

  useEffect(() => {
    if (!records) return;

    // 1. Separate Completed vs Planned courses
    const completed = records.filter(r => r.status === 'COMPLETED' && r.isGraded !== false);
    const planned = records.filter(r => r.status === 'PLANNED');
    
    setPlannedCourses(planned);

    // 2. Calculate Base (Current) CPI
    let baseQualityPoints = 0;
    let baseCredits = 0;

    completed.forEach(record => {
      const credits = record.course?.credits || 0;
      const points = gradePoints[record.grade] || 0;
      if (points !== undefined) {
        baseQualityPoints += (credits * points);
        baseCredits += credits;
      }
    });

    const actualCPI = baseCredits > 0 ? (baseQualityPoints / baseCredits) : 0;
    setCurrentCPI(actualCPI);

    // 3. Set default hypothetical grades to 'A' for all planned courses if not set
    const initialHypotheticals = { ...hypotheticalGrades };
    let needsUpdate = false;
    planned.forEach(record => {
      if (!initialHypotheticals[record.id]) {
        initialHypotheticals[record.id] = 'A'; // Default optimistic projection
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) setHypotheticalGrades(initialHypotheticals);

    // 4. Calculate Projected CPI
    let projectedQualityPoints = baseQualityPoints;
    let projectedCredits = baseCredits;

    planned.forEach(record => {
      const credits = record.course?.credits || 0;
      const predictedGrade = initialHypotheticals[record.id] || 'A';
      const points = gradePoints[predictedGrade] || 0;
      
      projectedQualityPoints += (credits * points);
      projectedCredits += credits;
    });

    const calculatedProjected = projectedCredits > 0 ? (projectedQualityPoints / projectedCredits) : 0;
    setProjectedCPI(calculatedProjected);

  }, [records, hypotheticalGrades]);

  const handleGradeChange = (recordId, newGrade) => {
    setHypotheticalGrades(prev => ({
      ...prev,
      [recordId]: newGrade
    }));
  };

  if (!plannedCourses || plannedCourses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
        <p>You have no future courses planned.</p>
        <p className="text-sm mt-1">Head to the Semester Planner to draft your upcoming schedule and predict your CPI!</p>
      </div>
    );
  }

  const cpiDifference = (projectedCPI - currentCPI).toFixed(2);
  const isIncrease = cpiDifference > 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-blue-900">"What-If" CPI Predictor</h3>
          <p className="text-sm text-gray-500 mt-1">Estimate your future CPI based on your planned schedule.</p>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Projected CPI</p>
          <div className="flex items-baseline gap-2 justify-end">
            <span className="text-3xl font-black text-blue-700">{projectedCPI.toFixed(2)}</span>
            {cpiDifference != 0 && (
              <span className={`text-sm font-bold ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                {isIncrease ? '↑ +' : '↓ '}{cpiDifference}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {plannedCourses.map(record => (
          <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">Sem {record.semester}</span>
                <span className="font-bold text-gray-800 text-sm">{record.course?.code}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{record.course?.title} ({record.course?.credits} Cr)</p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Grade</label>
              <select 
                className="p-1.5 border border-blue-200 rounded text-sm font-bold text-blue-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hypotheticalGrades[record.id] || 'A'}
                onChange={(e) => handleGradeChange(record.id, e.target.value)}
              >
                {gradingScale.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}