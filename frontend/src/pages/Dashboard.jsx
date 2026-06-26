import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { auth } from '../firebase';
import axios from 'axios';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl text-blue-900">Loading your academic profile...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-600">Failed to load data.</div>;

const completedPercentage = Math.min(100, (data.stats.completedCredits / data.stats.targetCredits) * 100);
const plannedPercentage = Math.min(100 - completedPercentage, (data.stats.plannedCredits / data.stats.targetCredits) * 100);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-900">IITGN Academic Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{data.user.name} ({data.user.discipline} '{data.user.admissionYear})</span>
          <button onClick={logout} className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Semester Overview</h2>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* NEW CGPA CARD */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-xl shadow-md text-white border border-blue-800">
            <h3 className="text-sm text-blue-200 uppercase tracking-wider mb-2 font-semibold">Current CGPA</h3>
            <p className="text-4xl font-bold">{data.stats.cgpa}</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Completed Credits</h3>
            <p className="text-4xl font-bold text-blue-600">{data.stats.completedCredits} <span className="text-lg text-gray-400 font-normal">/ {data.stats.targetCredits}</span></p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Planned Credits</h3>
            <p className="text-4xl font-bold text-orange-500">{data.stats.plannedCredits}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Courses Logged</h3>
            <p className="text-4xl font-bold text-green-600">{data.stats.coursesTaken}</p>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Graduation Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden flex">
            <div 
              className="bg-blue-600 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${completedPercentage}%` }}
              title={`Completed: ${data.stats.completedCredits} Credits`}
            ></div>
            <div 
              className="bg-orange-400 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${plannedPercentage}%` }}
              title={`Planned: ${data.stats.plannedCredits} Credits`}
            ></div>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-blue-600">{Math.round(completedPercentage)}% Completed</span>
            <span className="text-orange-500">{Math.round(plannedPercentage)}% Planned</span>
          </div>
        </div>
        
        {/* Recent Courses Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mt-8">
          <h3 className="text-lg font-bold mb-4">Recently Logged Courses</h3>
          
          {data.records.length === 0 ? (
            <p className="text-gray-500 italic">No courses logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 uppercase text-xs border-b">
                    <th className="pb-2 font-semibold">Course</th>
                    <th className="pb-2 font-semibold">Title</th>
                    <th className="pb-2 font-semibold">Basket</th>
                    <th className="pb-2 font-semibold text-center">Credits</th>
                    <th className="pb-2 font-semibold text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.records.filter(r => r.status === 'COMPLETED').map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-bold text-gray-800">{record.course?.code}</td>
                      <td className="py-3 text-gray-600">{record.course?.title}</td>
                      
                      {/* THIS IS THE CRITICAL FIX FOR THE NEW DATABASE SCHEMA */}
                      <td className="py-3 text-gray-500 text-xs">
                        {record.course?.basket?.name || 'Uncategorized'}
                      </td>
                      
                      <td className="py-3 text-center text-gray-600">{record.course?.credits}</td>
                      <td className="py-3 text-right font-black text-blue-700">{record.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}