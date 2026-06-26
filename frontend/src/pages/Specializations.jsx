import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function Specializations() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ honors: false, minor: '' });

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
        minor: res.data.declarations.minor || '' 
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
        pursuingMinor: editForm.minor
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchSpecializations(); // Refresh to show new titles
    } catch (err) {
      alert("Failed to save your specializations.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 mt-10">Loading your specializations...</div>;
  if (!data) return null;

  const renderSpecCard = (title, specData, colorClass, bgColorClass, isDeclared) => {
    const progress = Math.min(100, (specData.creditsEarned / specData.required) * 100);
    
    return (
      <div className={`p-6 rounded-xl shadow-sm border transition-all ${isDeclared ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-300 opacity-70'}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            {!isDeclared && <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Not Declared</p>}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${bgColorClass} ${colorClass}`}>
            Target: {specData.required} Cr
          </span>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-600">Progress</span>
            <span className={`font-bold ${colorClass}`}>{specData.creditsEarned} / {specData.required}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${colorClass.replace('text-', 'bg-')}`}
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
    <div className="max-w-5xl mx-auto p-4 md:p-8 mt-4 md:mt-6">
      
      {/* Header & Declaration Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-900">Honors & Minors</h2>
          <p className="text-gray-500 mt-1">Track your progress towards additional degree specializations.</p>
        </div>
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded border border-gray-300 transition"
        >
          {isEditing ? "Cancel" : "Manage Declarations"}
        </button>
      </div>

      {/* Editing Panel */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-8 shadow-sm">
          <h3 className="font-bold text-blue-900 mb-4 text-lg">Update Your Declarations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Honors Toggle */}
            <div className="bg-white p-4 rounded shadow-sm border border-blue-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">Institute Honors</p>
                <p className="text-xs text-gray-500">20 credits in your major discipline</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={editForm.honors}
                  onChange={(e) => setEditForm({...editForm, honors: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Minor Selector */}
            <div className="bg-white p-4 rounded shadow-sm border border-blue-50">
              <label className="block font-bold text-gray-800 mb-1">Declared Minor</label>
              <select 
                className="w-full p-2 border rounded bg-gray-50 text-sm"
                value={editForm.minor}
                onChange={(e) => setEditForm({...editForm, minor: e.target.value})}
              >
                <option value="">None (Not pursuing a minor)</option>
                {availableMinors.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleSaveDeclarations}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition shadow"
          >
            Save Declarations
          </button>
        </div>
      )}

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderSpecCard(
          "Honors Track", 
          data.honors, 
          "text-purple-600", 
          "bg-purple-100", 
          data.declarations.honors
        )}
        
        {renderSpecCard(
          data.declarations.minor ? `Minor in ${data.declarations.minor}` : "Minor Track", 
          data.minor, 
          "text-orange-600", 
          "bg-orange-100", 
          !!data.declarations.minor
        )}
      </div>
    </div>
  );
}