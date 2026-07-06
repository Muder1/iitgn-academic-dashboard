import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function AdminPanel() {
  const { currentUser } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [baskets, setBaskets] = useState([]); 
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [formData, setFormData] = useState({ 
      code: '', 
      title: '', 
      credits: 4, 
      basketId: '', 
      branches: '' 
    });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [courseRes, basketRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/records/courses`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/baskets`, {
          headers: { Authorization: `Bearer ${await currentUser.getIdToken()}` }
        })
      ]);
      
      setCourses(courseRes.data);
      setBaskets(basketRes.data);
      
      if (basketRes.data.length > 0 && !formData.basketId) {
        setFormData(prev => ({ ...prev, basketId: basketRes.data[0].id }));
      }
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  useEffect(() => {
    fetchData();
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
      setMessage(`Successfully added ${formData.code.toUpperCase()}`);
      
      setFormData({ 
        code: '', 
        title: '', 
        credits: 4, 
        basketId: baskets[0]?.id || '', 
        branches: '' 
      });
      
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add course. Are you an admin?');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm(`Are you sure you want to permanently delete this course from the master catalog?`)) return;
    
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete course.');
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/courses/${editingCourse.id}`, 
        editingCourse, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEditingCourse(null); 
      fetchData(); // FIXED: Was fetchCourses()
      setMessage("Course updated successfully!");
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update course');
    }
  };

  // Helper to trigger edit mode and format the branches array to a string
  const startEditing = (course) => {
    setMessage('');
    setError(null);
    setEditingCourse({
      ...course,
      branches: course.branches ? course.branches.join(', ') : ''
    });
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
        
        {/* DYNAMIC FORM PANEL: Swaps between Add and Edit */}
        {editingCourse ? (
          <div className="bg-blue-50 p-4 md:p-6 rounded-xl shadow-sm border border-blue-200 h-fit">
            <div className="flex justify-between items-center mb-4 border-b border-blue-200 pb-2">
              <h3 className="font-bold text-lg text-blue-900">Edit Course</h3>
              <button 
                onClick={() => setEditingCourse(null)} 
                className="text-sm text-blue-600 hover:text-blue-800 font-bold"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input 
                  type="text" required 
                  className="w-full p-2 border border-blue-300 rounded bg-white uppercase" 
                  value={editingCourse.code} 
                  onChange={(e) => setEditingCourse({...editingCourse, code: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input 
                  type="text" required 
                  className="w-full p-2 border border-blue-300 rounded bg-white" 
                  value={editingCourse.title} 
                  onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input 
                    type="number" required min="1" max="10" 
                    className="w-full p-2 border border-blue-300 rounded bg-white" 
                    value={editingCourse.credits} 
                    onChange={(e) => setEditingCourse({...editingCourse, credits: parseInt(e.target.value)})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Basket</label>
                  <select 
                    className="w-full p-2 border border-blue-300 rounded bg-white" 
                    value={editingCourse.basketId} 
                    onChange={(e) => setEditingCourse({...editingCourse, basketId: parseInt(e.target.value)})}
                  >
                    {baskets.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branches</label>
                <input 
                  type="text" required 
                  placeholder="e.g. AI, EE, ME" 
                  className="w-full p-2 border border-blue-300 rounded bg-white" 
                  value={editingCourse.branches} 
                  onChange={(e) => setEditingCourse({...editingCourse, branches: e.target.value})} 
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition mt-2 shadow-sm">
                Save Changes
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Add New Course</h3>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input type="text" required placeholder="e.g. EE 410" className="w-full p-2 border rounded bg-gray-50 uppercase" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input type="text" required placeholder="e.g. Microwave Engineering" className="w-full p-2 border rounded bg-gray-50" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input type="number" required min="1" max="10" className="w-full p-2 border rounded bg-gray-50" value={formData.credits} onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Basket</label>
                  <select 
                    className="w-full p-2 border rounded bg-gray-50" 
                    value={formData.basketId} 
                    onChange={(e) => setFormData({...formData, basketId: parseInt(e.target.value)})}
                  >
                    {baskets.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branches</label>
                <input 
                  type="text" required 
                  placeholder="e.g. AI, EE, ME (comma separated)" 
                  className="w-full p-2 border rounded bg-gray-50" 
                  value={formData.branches} 
                  onChange={(e) => setFormData({...formData, branches: e.target.value})} 
                />
              </div>

              <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition mt-2">
                Add to Catalog
              </button>
            </form>
          </div>
        )}

        {/* Master Course List */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Master Course Directory ({courses.length})</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {courses.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100 transition">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-gray-800 w-20 inline-block">{c.code}</span>
                    <span className="text-gray-700 font-medium">{c.title}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {c.basket?.name || 'No Basket'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {c.branches ? c.branches.join(', ') : 'All'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="text-sm font-bold text-gray-600 mr-2">{c.credits} Cr</span>
                  
                  {/* EDIT BUTTON */}
                  <button 
                    onClick={() => startEditing(c)} 
                    className="text-blue-600 hover:text-blue-800 font-bold px-3 py-1 rounded bg-white border border-blue-200 hover:bg-blue-50 text-xs transition"
                  >
                    Edit
                  </button>
                  
                  {/* DELETE BUTTON */}
                  <button 
                    onClick={() => handleDelete(c.id)} 
                    className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded bg-white border border-red-200 hover:bg-red-50 text-xs transition"
                  >
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