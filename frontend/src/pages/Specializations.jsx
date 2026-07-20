import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function Specializations() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ honors: false, declaredMinors: [] });

  const availableMinors = [
    "Artificial Intelligence", "Computer Science", "Management", 
    "Data Science", "Design", "Materials Engineering", 
    "Mechanical Engineering", "South Asian Studies"
  ];

  const fetchSpecializations = async () => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/specializations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setEditForm({ 
        honors: res.data.declarations.honors, 
        declaredMinors: res.data.declarations.declaredMinors || [] 
      });
    } catch (err) {
      console.error("Error fetching specializations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpecializations(); }, [currentUser]);

  const handleSaveDeclarations = async () => {
    try {
      const token = await currentUser.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/specializations/declare`, {
        pursuingHonors: editForm.honors,
        declaredMinors: editForm.declaredMinors
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchSpecializations();
    } catch (err) {
      alert("Failed to save your specializations.");
    }
  };

  const handleMinorToggle = (minorName) => {
    setEditForm(prev => {
      if (prev.declaredMinors.includes(minorName)) {
        return { ...prev, declaredMinors: prev.declaredMinors.filter(m => m !== minorName) };
      } else {
        return { ...prev, declaredMinors: [...prev.declaredMinors, minorName] };
      }
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500 mt-10">Loading your specializations...</div>;
  if (!data) return null;

  // FIXED: Simplified the progress bar styling logic
  const renderSpecCard = (title, specData, textColor, bgColor, isDeclared) => {
    const progress = Math.min(100, (specData.creditsEarned / specData.required) * 100) || 0;
    
    return (
      <div className={`p-6 rounded-xl shadow-sm border transition-all ${isDeclared ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-300 opacity-70'}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            {!isDeclared && <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Not Declared</p>}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${bgColor} ${textColor}`}>
            Target: {specData.required} Cr
          </span>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-600">Progress</span>
            <span className={`font-bold ${textColor}`}>{specData.creditsEarned} / {specData.required}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${bgColor.replace('bg-', 'bg-').replace('100', '500')}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-2">Allocated Courses</h4>
          {specData.courses.length === 0 ? (
            <p className="text-gray-400 italic text-sm text-center py-4">No courses allocated yet.</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {specData.courses.map(record => (
                <div key={record.id} className="flex justify-between items-center p-3 bg-white rounded border border-gray-100 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-800">{record.course?.code}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${record.status === 'PLANNED' ? 'text-orange-500 border-orange-200' : 'text-green-600 border-green-200'}`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{record.course?.title}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-600">{record.course?.credits} Cr</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-900">Honors & Minors</h2>
          <p className="text-gray-500 mt-1">Track your progress towards additional degree specializations.</p>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded border border-gray-300 transition">
          {isEditing ? "Cancel" : "Manage Declarations"}
        </button>
      </div>

      {isEditing && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-8 shadow-sm">
          <h3 className="font-bold text-blue-900 mb-4 text-lg">Update Your Declarations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow-sm border border-blue-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">Institute Honors</p>
                <p className="text-xs text-gray-500">20 credits in your major discipline</p>
              </div>
              <input type="checkbox" checked={editForm.honors} onChange={(e) => setEditForm({...editForm, honors: e.target.checked})} className="w-5 h-5" />
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-blue-50">
              <label className="block font-bold text-gray-800 mb-3">Declared Minors</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableMinors.map(m => (
                  <label key={m} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={editForm.declaredMinors.includes(m)} onChange={() => handleMinorToggle(m)} className="w-4 h-4" />
                    {m}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleSaveDeclarations} className="mt-6 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded">Save Declarations</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.declarations.honors && renderSpecCard("Honors Track", data.honors, "text-purple-600", "bg-purple-100", true)}
        
        {data.declarations.declaredMinors.map((minorName, index) => {
          const minorCourses = data.minor.courses.filter(c => c.minorTrack === minorName);
          const creditsEarned = minorCourses.reduce((sum, r) => sum + (r.course?.credits || 0), 0);
          const theme = index % 2 === 0 ? { text: "text-orange-600", bg: "bg-orange-100" } : { text: "text-teal-600", bg: "bg-teal-100" };
          
          return renderSpecCard(
            `Minor in ${minorName}`, 
            { creditsEarned, required: 20, courses: minorCourses }, 
            theme.text, 
            theme.bg, 
            true
          );
        })}
      </div>
    </div>
  );
}