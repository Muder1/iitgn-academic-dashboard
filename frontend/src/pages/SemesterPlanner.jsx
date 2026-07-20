import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function SemesterPlanner() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [plannedRecords, setPlannedRecords] = useState([]);
  
  const [honorsDeclared, setHonorsDeclared] = useState(false);
  const [declaredMinors, setDeclaredMinors] = useState([]);
  
  const [formData, setFormData] = useState({ courseId: '', semester: '2', isHonors: false, minorTrack: '' });
  
  // State to manage accordion dropdowns
  const [openSemesters, setOpenSemesters] = useState({});

  const fetchData = async () => {
    try {
      const token = await currentUser.getIdToken();
      
      const [courseRes, dashboardRes, specRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/records/courses`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/specializations`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const sortedCourses = courseRes.data.sort((a, b) => a.code.localeCompare(b.code));
      setCourses(sortedCourses);
      if (sortedCourses.length > 0 && !formData.courseId) {
        setFormData(prev => ({ ...prev, courseId: sortedCourses[0].id }));
      }

      const planned = dashboardRes.data.records
        .filter(r => r.status === 'PLANNED')
        .sort((a, b) => a.semester - b.semester);
      setPlannedRecords(planned);

      setHonorsDeclared(specRes.data.declarations.honors || false);
      setDeclaredMinors(specRes.data.declarations.declaredMinors || []);
      
    } catch (error) {
      console.error("Error fetching planner data:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Group planned records by semester
  const groupedPlannedRecords = plannedRecords.reduce((acc, record) => {
    const sem = record.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(record);
    return acc;
  }, {});

  const toggleSemester = (sem) => {
    setOpenSemesters(prev => ({ ...prev, [sem]: !prev[sem] }));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/records`, {
        ...formData,
        isMinor: formData.minorTrack !== '',
        minorTrack: formData.minorTrack === '' ? null : formData.minorTrack,
        status: 'PLANNED', 
        isGraded: true 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Auto-open the dropdown for the semester that was just added to
      setOpenSemesters(prev => ({ ...prev, [formData.semester]: true }));

      setFormData(prev => ({ ...prev, isHonors: false, minorTrack: '' }));
      fetchData(); 
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add course');
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Remove this course from your planner?")) return;
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); 
    } catch (error) {
      alert('Failed to delete course');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 mt-4 md:mt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-blue-900">Semester Planner</h2>
          <p className="text-gray-500 mt-1">Draft your future semesters and track degree requirements.</p>
        </div>
        <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-bold shadow-sm hidden md:block">
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
              <select className="w-full p-2 border rounded bg-gray-50 text-sm" value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Semester</label>
              <select className="w-full p-2 border rounded bg-gray-50" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>Semester {num}</option>)}
              </select>
            </div>

            {(honorsDeclared || declaredMinors.length > 0) && (
              <div className="flex flex-col gap-3 pt-4 border-t mt-4">
                {honorsDeclared && (
                  <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={formData.isHonors} onChange={(e) => setFormData({...formData, isHonors: e.target.checked, minorTrack: e.target.checked ? '' : formData.minorTrack})} className="rounded text-blue-600 w-4 h-4"/>
                    <span className="font-medium">Count towards Honors</span>
                  </label>
                )}
                {declaredMinors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-1">Declare for Minor</label>
                    <select className="w-full p-2 border border-orange-200 rounded bg-orange-50 text-orange-800 text-sm" value={formData.minorTrack} onChange={(e) => setFormData({...formData, minorTrack: e.target.value, isHonors: e.target.value !== '' ? false : formData.isHonors})}>
                      <option value="">Not for Minor</option>
                      {declaredMinors.map(m => <option key={m} value={m}>{m} Minor</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}
            
            <button type="submit" className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded hover:bg-orange-600 transition mt-2">
              Add to Plan
            </button>
          </form>
        </div>

        {/* Planned Courses Accordion List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold text-lg">Your Projected Roadmap</h3>
            <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-md">
              Total Planned: {plannedRecords.reduce((sum, r) => sum + (r.course?.credits || 0), 0)} Credits
            </span>
          </div>
          
          {Object.keys(groupedPlannedRecords).length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-dashed border-gray-300 text-center text-gray-500">
              No courses planned yet. Add a course to see your projected credits.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(groupedPlannedRecords).sort((a,b) => parseInt(a) - parseInt(b)).map((semStr) => {
                const sem = parseInt(semStr);
                const semRecords = groupedPlannedRecords[sem];
                const isOpen = openSemesters[sem];
                
                // CALCULATE CREDITS PER SEMESTER HERE
                const semCredits = semRecords.reduce((sum, r) => sum + (r.course?.credits || 0), 0);

                return (
                  <div key={sem} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                    <button onClick={() => toggleSemester(sem)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors font-bold text-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-md text-sm">Sem {sem}</span>
                        <span className="text-gray-600 text-sm font-bold">{semCredits} Credits</span>
                        <span className="text-gray-400 text-sm font-normal hidden sm:block">• {semRecords.length} courses</span>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    
                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 pt-0 space-y-3">
                          {semRecords.map(record => (
                            <div key={record.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition group">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-800 text-sm">{record.course?.code}</span>
                                  <span className="text-[10px] uppercase font-bold text-gray-500 border px-1 rounded">{record.course?.basket?.name || 'Uncategorized'}</span>
                                  {record.isHonors && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">HONORS</span>}
                                  {record.minorTrack && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{record.minorTrack} MINOR</span>}
                                </div>
                                <div className="text-sm text-gray-600">{record.course?.title}</div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-gray-500">{record.course?.credits} Cr</span>
                                <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700 opacity-50 group-hover:opacity-100 transition px-2 py-1" title="Remove from plan">✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}