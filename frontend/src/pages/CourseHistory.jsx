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

  const gradingScale = ['A+', 'A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'P', 'F'];

  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      
      // Fetch Master Course Catalog
      const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/records/courses`);
      
      // Sort courses alphabetically by code for a better dropdown experience
      const sortedCourses = courseRes.data.sort((a, b) => a.code.localeCompare(b.code));
      setCourses(sortedCourses);
      
      if (sortedCourses.length > 0 && !formData.courseId) {
        setFormData(prev => ({ ...prev, courseId: sortedCourses[0].id }));
      }

      // Fetch User Records
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const completed = res.data.records.filter(r => r.status === 'COMPLETED');
      setRecords(completed);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);

    const isGraded = !['P', 'F'].includes(formData.grade);

    try {
      const token = await currentUser.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/records`, {
        ...formData,
        isGraded: isGraded,
        status: 'COMPLETED'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(`Successfully logged course!`);
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add course.');
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to remove this course from your history?")) return;

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(records.filter(record => record.id !== recordId));
    } catch (err) {
      console.error("Failed to delete record", err);
      alert("Failed to delete the course.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4 md:mt-10">
      <h2 className="text-3xl font-bold text-blue-900 mb-2">Log Past Courses</h2>
      <p className="text-gray-500 mb-8">Record your completed courses. P/F courses will be excluded from CPI.</p>

      {message && <div className="bg-green-100 text-green-700 p-4 rounded mb-6 font-medium">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ADD ENTRY FORM */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Add Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
              <select 
                required 
                className="w-full p-2 border rounded bg-gray-50" 
                value={formData.courseId} 
                onChange={(e) => setFormData({...formData, courseId: e.target.value})} 
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select 
                  className="w-full p-2 border rounded bg-gray-50"
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                >
                  {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Earned</label>
                <select 
                  className="w-full p-2 border rounded bg-gray-50 font-bold text-blue-700"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                >
                  {gradingScale.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 hover:bg-blue-700 transition">
              Log Course
            </button>
          </form>
        </div>

        {/* LOGGED HISTORY */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Your Logged History</h3>
          
          {loading ? (
            <p className="text-gray-400 italic text-sm">Loading history...</p>
          ) : records.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No courses logged yet.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {records.map(record => (
                <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{record.course?.code}</p>
                    <p className="text-xs text-gray-500">{record.course?.title} • Sem {record.semester}</p>
                    {/* Fixed: Adding the basket name display safely */}
                    <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 block">
                      {record.course?.basket?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-black ${['P', 'F'].includes(record.grade) ? 'text-gray-500' : 'text-blue-700'}`}>
                      {record.grade}
                    </span>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-white border border-red-200 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}