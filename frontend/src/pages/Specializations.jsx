import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Specializations() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // New error tracker

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await axios.get('http://localhost:5000/api/specializations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Network Error:", err);
        // If the backend refuses the connection, we catch it here
        setError(err.response?.status === 404 ? "Route not found. Check server.js!" : err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchSpecializations();
    }
  }, [currentUser]);

  // CRASH PROTECTION LAYER
  if (loading) return <div className="p-8 text-center text-gray-500 font-bold mt-10">Loading Specializations Data...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-bold mt-10 bg-red-50 border border-red-200 rounded max-w-2xl mx-auto">API Error: {error}</div>;
  if (!data) return <div className="p-8 text-center text-red-600 font-bold mt-10 bg-red-50 border border-red-200 rounded max-w-2xl mx-auto">Critical Error: Backend returned null data.</div>;
  if (!data.honors || !data.minor) return <div className="p-8 text-center text-red-600 font-bold mt-10 bg-red-50 border border-red-200 rounded max-w-2xl mx-auto">Critical Error: Backend returned malformed data. Expected 'honors' and 'minor' objects.</div>;

  // If it survives the checks above, it is safe to render
  const renderCard = (title, specData, colorClass, bgClass) => {
    const progress = Math.min(100, (specData.creditsEarned / specData.required) * 100);
    
    return (
      <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <span className={`${bgClass} text-white px-3 py-1 rounded-full text-sm font-bold`}>
            {specData.creditsEarned} / {specData.required} Credits
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
          <div className={`${bgClass} h-full transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
        </div>

        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Approved Courses</h4>
        <div className="space-y-2">
          {specData.courses.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No courses flagged for {title} yet.</p>
          ) : (
            specData.courses.map(record => (
              <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <span className="font-medium text-gray-700">{record.courseId} - {record.course.title}</span>
                <div className="flex gap-3 text-sm">
                  <span className="text-gray-500">{record.course.credits} Cr</span>
                  <span className={record.status === 'COMPLETED' ? 'text-blue-600 font-medium' : 'text-orange-500 font-medium'}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 mt-4 md:mt-6">
      <h2 className="text-3xl font-bold text-blue-900 mb-2">Honors & Minors Tracking</h2>
      <p className="text-gray-500 mb-8">Plan and track your extra credits required for degree specializations.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderCard("Departmental Honors", data.honors, "text-blue-700", "bg-blue-500")}
        {renderCard("Secondary Minor", data.minor, "text-purple-700", "bg-purple-500")}
      </div>
    </div>
  );
}