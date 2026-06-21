import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function SemesterPlanner() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [plannedRecords, setPlannedRecords] = useState([]);
  const [formData, setFormData] = useState({ courseId: '', semester: '2', isHonors: false, isMinor: false });
  // Fetch courses and current planned records
  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      
      // Get course catalog
      const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/records/courses`);
      setCourses(courseRes.data);
      if (courseRes.data.length > 0 && !formData.courseId) {
        setFormData(prev => ({ ...prev, courseId: courseRes.data[0].id }));
      }

      // Get user's planned records
      const dashboardRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const planned = dashboardRes.data.records.filter(r => r.status === 'PLANNED');
      setPlannedRecords(planned);
      
    } catch (error) {
      console.error("Error fetching planner data:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/records`, {
        ...formData,
        status: 'PLANNED' // Flag this as a future course
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add course');
    }
  };

  const handleDelete = async (recordId) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh the list
    } catch (error) {
      alert('Failed to delete course');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4 md:mt-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-blue-900">Semester Planner</h2>
        <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-bold shadow-sm">
          Sandbox Mode
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Course Form */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Draft Future Course</h3>
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
              <select 
                className="w-full p-2 border rounded bg-gray-50"
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Semester</label>
              <select 
                className="w-full p-2 border rounded bg-gray-50"
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
              >
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>

            {/* Honors & Minors Checkboxes */}
            <div className="flex gap-4 pt-2 border-t mt-4">
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isHonors}
                  onChange={(e) => setFormData({...formData, isHonors: e.target.checked, isMinor: false})}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <span>Count towards Honors</span>
              </label>
              
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isMinor}
                  onChange={(e) => setFormData({...formData, isMinor: e.target.checked, isHonors: false})}
                  className="rounded text-orange-600 w-4 h-4"
                />
                <span>Count towards Minor</span>
              </label>
            </div>
            
            <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition">
              Add to Plan
            </button>
          </form>
        </div>

        {/* Planned Courses List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-lg mb-2">Your Projected Roadmap</h3>
          {plannedRecords.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-dashed border-gray-300 text-center text-gray-500">
              No courses planned yet. Add a course to see your projected credits.
            </div>
          ) : (
            plannedRecords.map(record => (
              <div key={record.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
                <div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-3">Sem {record.semester}</span>
                  <span className="font-bold">{record.course?.code}</span> - {record.course?.title}
                  <span className="ml-3 text-sm text-gray-500">({record.course?.credits} Credits)</span>
                </div>
                <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full">
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}