import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function BasketTracking() {
  const { currentUser } = useAuth();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/baskets/analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // We now store the entire response object { analysis, totalTarget }
        setAuditData(res.data);
      } catch (error) {
        console.error("Error fetching basket data", error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchAnalysis();
  }, [currentUser]);

  if (loading) return <div className="p-8 text-center text-gray-500 mt-10">Evaluating your curriculum baskets...</div>;
  if (!auditData || !auditData.analysis) return <div className="p-8 text-center text-red-500 bg-red-50 mt-10 rounded">Error rendering curriculum audit.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 mt-4 md:mt-6">
      
      {/* Header & New Total Target Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-900 mb-1">Curriculum Basket Audit</h2>
          <p className="text-gray-500">Track distribution targets required across degree components.</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg text-center shadow-sm">
          <p className="text-xs text-blue-800 font-bold uppercase tracking-wider">Total Degree Requirement</p>
          <p className="text-2xl font-black text-blue-900">{auditData.totalTarget} Cr</p>
        </div>
      </div>

      {/* Grid of Baskets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* We explicitly loop over auditData.analysis now */}
        {Object.entries(auditData.analysis).map(([basketName, data]) => {
          const totalEarned = data.completed + data.planned;
          const completedWidth = Math.min(100, (data.completed / data.required) * 100) || 0;
          const plannedWidth = Math.min(100 - completedWidth, (data.planned / data.required) * 100) || 0;
          const remaining = Math.max(0, data.required - data.completed);

          return (
            <div key={basketName} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{basketName}</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    Target: {data.required} Cr
                  </span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                  <span className="text-blue-600 font-bold">Completed: {data.completed}</span>
                  {data.planned > 0 && <span className="text-orange-500 font-bold">Planned: +{data.planned}</span>}
                  <span className="text-gray-400 font-medium">Remaining: {remaining}</span>
                </div>

                {/* Stacked Progress Bar */}
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex mb-4">
                  <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${completedWidth}%` }}></div>
                  <div className="bg-orange-400 h-full transition-all duration-500" style={{ width: `${plannedWidth}%` }}></div>
                </div>
              </div>

              {/* Collapsible List details for courses inside this basket */}
              <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-2 max-h-32 overflow-y-auto border border-gray-100">
                <p className="text-gray-400 font-bold uppercase tracking-wider mb-2 border-b pb-1">Allocated Courses</p>
                {data.courses.length === 0 ? (
                  <p className="text-gray-400 italic text-center py-2">No classes applied yet.</p>
                ) : (
                  data.courses.map(c => (
                    <div key={c.id} className="flex justify-between items-center text-gray-600 bg-white p-2 rounded shadow-sm border border-gray-50">
                      <span className="font-medium">• {c.code} <span className="text-gray-400 ml-1">({c.credits} Cr)</span></span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${c.status === 'COMPLETED' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-orange-500 border-orange-200 bg-orange-50'}`}>
                        {c.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}