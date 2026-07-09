import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function CPIPredictor() {
  const { currentUser } = useAuth();
  const gradePoints = { 'A+': 10, 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6, 'C-': 5, 'D': 4, 'F': 0 };
  const gradingScale = Object.keys(gradePoints);

  const [loading, setLoading] = useState(true);
  const [completedRecords, setCompletedRecords] = useState([]);
  const [plannedCourses, setPlannedCourses] = useState([]);
  const [hypotheticalGrades, setHypotheticalGrades] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const records = response.data.records;
        setCompletedRecords(records.filter(r => r.status === 'COMPLETED' && r.isGraded !== false));
        
        const planned = records.filter(r => r.status === 'PLANNED');
        setPlannedCourses(planned);

        // Set default 'A' grades
        const initialHypotheticals = {};
        planned.forEach(record => { initialHypotheticals[record.id] = 'A'; });
        setHypotheticalGrades(initialHypotheticals);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  const handleGradeChange = (recordId, newGrade) => {
    setHypotheticalGrades(prev => ({ ...prev, [recordId]: newGrade }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500 mt-10">Loading prediction engine...</div>;

  // --- MATH CALCULATION ---
  let basePoints = 0;
  let baseCredits = 0;
  completedRecords.forEach(r => {
    basePoints += (r.course?.credits * gradePoints[r.grade]);
    baseCredits += r.course?.credits;
  });
  const currentCPI = baseCredits > 0 ? (basePoints / baseCredits) : 0;

  let projectedPoints = basePoints;
  let projectedCredits = baseCredits;
  plannedCourses.forEach(r => {
    projectedPoints += (r.course?.credits * gradePoints[hypotheticalGrades[r.id] || 'A']);
    projectedCredits += r.course?.credits;
  });
  const projectedCPI = projectedCredits > 0 ? (projectedPoints / projectedCredits) : 0;

  const cpiDifference = (projectedCPI - currentCPI).toFixed(2);
  const isIncrease = cpiDifference > 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4 md:mt-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-900">Grade Forecaster</h2>
        <p className="text-gray-500 mt-1">Select target grades for your planned courses to see their impact on your CPI.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h3 className="font-bold text-lg text-blue-900">Simulation</h3>
            <p className="text-sm text-gray-500 mt-1">Current CPI: <strong>{currentCPI.toFixed(2)}</strong></p>
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

        {plannedCourses.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            You have no future courses planned. Draft your schedule in the Planner first!
          </div>
        ) : (
          <div className="space-y-3">
            {plannedCourses.map(record => (
              <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">Sem {record.semester}</span>
                    <span className="font-bold text-gray-800 text-sm">{record.course?.code}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{record.course?.title} ({record.course?.credits} Cr)</p>
                </div>
                
                <div className="flex flex-col">
                  <select 
                    className="p-1.5 border border-blue-200 rounded text-sm font-bold text-blue-700 bg-white"
                    value={hypotheticalGrades[record.id] || 'A'}
                    onChange={(e) => handleGradeChange(record.id, e.target.value)}
                  >
                    {gradingScale.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}