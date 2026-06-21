import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function AdminPanel() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ id: '', title: '', credits: 4 });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/records/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/courses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`Successfully added ${formData.id.toUpperCase()}`);
      setFormData({ id: '', title: '', credits: 4 });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add course. Are you an admin?');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${courseId} from the master catalog?`)) return;
    
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete course.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 mt-4 md:mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-red-900">Admin Control Panel</h2>
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
          Superuser Access
        </span>
      </div>

      {message && <div className="bg-green-100 text-green-700 p-4 rounded mb-6 font-medium">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form to Add Course */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Add New Course</h3>
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input type="text" required placeholder="e.g. EE410" className="w-full p-2 border rounded bg-gray-50 uppercase" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input type="text" required placeholder="e.g. Microwave Engineering" className="w-full p-2 border rounded bg-gray-50" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <input type="number" required min="1" max="10" className="w-full p-2 border rounded bg-gray-50" value={formData.credits} onChange={(e) => setFormData({...formData, credits: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition">
              Add to Catalog
            </button>
          </form>
        </div>

        {/* Master Course List */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Master Course Directory ({courses.length})</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {courses.map(c => (
              <div key={c.code} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100 transition">
                <div>
                  <span className="font-bold text-gray-800 w-20 inline-block">{c.code}</span>
                  <span className="text-gray-600">{c.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-500">{c.credits} Cr</span>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-white border border-red-200 hover:bg-red-50 text-xs">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}