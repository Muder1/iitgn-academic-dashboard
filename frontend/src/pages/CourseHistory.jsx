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
  const [openSemesters, setOpenSemesters] = useState({});

  const gradingScale = ['A+', 'A', 'A-', 'B', 'B-', 'C-', 'D', 'P', 'F'];

  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      
      // Fetch Master Catalog & User Records
      const [courseRes, res] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/records/courses`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const sortedCourses = courseRes.data.sort((a, b) => a.code.localeCompare(b.code));
      setCourses(sortedCourses);
      
      if (sortedCourses.length > 0 && !formData.courseId) {
        setFormData(prev => ({ ...prev, courseId: sortedCourses[0].id }));
      }
      
      setRecords(res.data.records.filter(r => r.status === 'COMPLETED'));
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser]);

  const groupedRecords = records.reduce((acc, record) => {
    const sem = record.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(record);
    return acc;
  }, {});

  const toggleSemester = (sem) => {
    setOpenSemesters(prev => ({ ...prev, [sem]: !prev[sem] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);
    const isGraded = !['P', 'F'].includes(formData.grade);

    try {
      const token = await currentUser.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/records`, {
        ...formData,
        isGraded,
        status: 'COMPLETED'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Successfully logged course!");
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add course.');
    }
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
      <h2 className="text-3xl font-bold text-blue-900 mb-2">Log Past Courses</h2>
      <p className="text-gray-500 mb-8">Record completed courses. P/F courses are excluded from CPI.</p>

      {message && <div className="bg-green-100 text-green-700 p-4 rounded mb-6 font-medium">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ADD ENTRY FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Add Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
              <select className="w-full p-2 border rounded bg-gray-50" value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select className="w-full p-2 border rounded bg-gray-50" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                  {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select className="w-full p-2 border rounded bg-gray-50 font-bold text-blue-700" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})}>
                  {gradingScale.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 hover:bg-blue-700 transition">Log Course</button>
          </form>
        </div>

        {/* ACCORDION HISTORY */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-4 text-gray-700">History by Semester</h3>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
            const semRecords = groupedRecords[sem] || [];
            const isOpen = openSemesters[sem];
            return (
              <div key={sem} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                <button onClick={() => toggleSemester(sem)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors font-bold text-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-md text-sm">Sem {sem}</span>
                    <span className="text-gray-400 text-sm font-normal">{semRecords.length} courses</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0 space-y-3">
                      {semRecords.map(record => (
                        <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div>
                            <span className="font-bold text-gray-800 block text-sm">{record.course?.code}</span>
                            <span className="text-gray-500 text-xs">{record.course?.title}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-black text-blue-700 bg-blue-50 px-2 py-1 rounded text-sm">{record.grade}</span>
                            <button onClick={() => handleDelete(record.id)} className="text-red-400 hover:text-red-600 transition-colors">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}