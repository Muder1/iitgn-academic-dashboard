import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function CourseHistory() {
  const { currentUser } = useAuth();
  
  // State for the form
  const [formData, setFormData] = useState({ courseId: '', semester: '1', grade: 'A+' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  
  // State for the logged courses list
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Your custom grading scale
  const gradingScale = ['A+', 'A', 'A-', 'B', 'B-', 'C-', 'D', 'F'];

  // 1. Fetch existing records on load
  const fetchRecords = async () => {
    try {
      const token = await currentUser.getIdToken();
      // We can grab the records from the dashboard route we built earlier!
      const res = await axios.get('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter for only COMPLETED courses
      const completed = res.data.records.filter(r => r.status === 'COMPLETED');
      setRecords(completed);
    } catch (err) {
      console.error("Error fetching records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [currentUser]);

  // 2. Handle Adding a Course
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      await axios.post('http://localhost:5000/api/records', {
        ...formData,
        status: 'COMPLETED'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(`Successfully logged ${formData.courseId.toUpperCase()}`);
      setFormData({ ...formData, courseId: '' }); // Reset course ID input
      fetchRecords(); // Refresh the list instantly!
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add course.');
    }
  };

  // 3. Handle Deleting a Course
  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to remove this course from your history?")) return;

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`http://localhost:5000/api/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter the deleted record out of the UI instantly
      setRecords(records.filter(record => record.id !== recordId));
    } catch (err) {
      console.error("Failed to delete record", err);
      alert("Failed to delete the course. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4 md:mt-10">
      <h2 className="text-3xl font-bold text-blue-900 mb-2">Log Past Courses</h2>
      <p className="text-gray-500 mb-8">Record your completed courses to calculate your CGPA and track degree progress.</p>

      {message && <div className="bg-green-100 text-green-700 p-4 rounded mb-6 font-medium">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ADD COURSE FORM */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Add Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. EE204" 
                className="w-full p-2 border rounded bg-gray-50 uppercase" 
                value={formData.courseId} 
                onChange={(e) => setFormData({...formData, courseId: e.target.value})} 
              />
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

        {/* LOGGED COURSES LIST */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Your Logged History</h3>
          
          {loading ? (
            <p className="text-gray-400 italic text-sm">Loading history...</p>
          ) : records.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No courses logged yet.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {records.map(record => (
                <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{record.courseId}</p>
                    <p className="text-xs text-gray-500">Sem {record.semester}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-blue-700">{record.grade}</span>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-white border border-red-200 hover:bg-red-50 text-xs transition"
                      title="Delete this record"
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