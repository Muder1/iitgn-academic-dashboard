import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function BasketTracking() {
  const { currentUser } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/baskets/analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalysis(res.data);
      } catch (error) {
        console.error("Error fetching basket data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [currentUser]);

  if (loading) return <div className="p-8 text-center text-gray-500">Evaluating your curriculum baskets...</div>;
  if (!analysis) return <div className="p-8 text-center text-red-500">Error rendering curriculum audit.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 mt-4 md:mt-6">
      <h2 className="text-3xl font-bold text-blue-900 mb-2">Curriculum Basket Audit</h2>
      <p className="text-gray-500 mb-8">Track distribution targets required across degree components.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(analysis).map(([basketName, data]) => {
          const totalEarned = data.completed + data.planned;
          const completedWidth = Math.min(100, (data.completed / data.required) * 100);
          const plannedWidth = Math.min(100 - completedWidth, (data.planned / data.required) * 100);
          const remaining = Math.max(0, data.required - data.completed);

          return (
            <div key={basketName} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{basketName}</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
                    Target: {data.required} Cr
                  </span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                  <span className="text-blue-600 font-medium">Completed: {data.completed}</span>
                  {data.planned > 0 && <span className="text-orange-500 font-medium">Planned: +{data.planned}</span>}
                  <span className="text-gray-400">Remaining: {remaining}</span>
                </div>

                {/* Stacked Progress Bar */}
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex mb-4">
                  <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${completedWidth}%` }}></div>
                  <div className="bg-orange-400 h-full transition-all duration-500" style={{ width: `${plannedWidth}%` }}></div>
                </div>
              </div>

              {/* Collapsible List details for courses inside this basket */}
              <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 max-h-24 overflow-y-auto">
                <p className="text-gray-400 font-medium uppercase tracking-wider mb-1">Allocated Courses</p>
                {data.courses.length === 0 ? (
                  <p className="text-gray-400 italic">No classes applied yet.</p>
                ) : (
                  data.courses.map(c => (
                    <div key={c.id} className="flex justify-between text-gray-600">
                      <span>• {c.code || c.course?.code} ({c.credits} Cr)</span>
                      <span className={c.status === 'COMPLETED' ? 'text-blue-500' : 'text-orange-500 font-medium'}>
                        {c.status.toLowerCase()}
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