import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function CourseHistory() {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({ courseId: '', semester: '1', grade: 'A' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track which semesters are open
  const [openSemesters, setOpenSemesters] = useState({});

  const gradingScale = ['A+', 'A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'P', 'F'];

  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/records/courses`);
      const sortedCourses = courseRes.data.sort((a, b) => a.code.localeCompare(b.code));
      setCourses(sortedCourses);
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRecords(res.data.records.filter(r => r.status === 'COMPLETED'));
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser]);

  // NEW: Group records by semester
  const groupedRecords = records.reduce((acc, record) => {
    const sem = record.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(record);
    return acc;
  }, {});

  const toggleSemester = (sem) => {
    setOpenSemesters(prev => ({ ...prev, [sem]: !prev[sem] }));
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Remove this course?")) return;
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) { alert("Failed to delete."); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4 md:mt-10">
      <h2 className="text-3xl font-bold text-blue-900 mb-8">Log Past Courses</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ADD ENTRY FORM (Same as before) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
           {/* ... Form remains the same ... */}
        </div>

        {/* NEW: COLLAPSIBLE SEMESTER LIST */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg mb-4">History by Semester</h3>
          
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
            const semRecords = groupedRecords[sem] || [];
            const isOpen = openSemesters[sem];

            return (
              <div key={sem} className="border rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleSemester(sem)}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 font-bold transition"
                >
                  <span>Semester {sem}</span>
                  <span className="text-sm text-gray-500">{semRecords.length} Courses</span>
                </button>
                
                {isOpen && (
                  <div className="p-2 bg-white border-t space-y-2">
                    {semRecords.length === 0 ? (
                      <p className="text-gray-400 italic text-sm p-2">No courses logged.</p>
                    ) : (
                      semRecords.map(record => (
                        <div key={record.id} className="flex justify-between items-center p-2 text-sm border-b last:border-0">
                          <div>
                            <span className="font-bold">{record.course?.code}</span>
                            <span className="text-gray-600 ml-2">{record.course?.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-blue-700">{record.grade}</span>
                            <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">✕</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}