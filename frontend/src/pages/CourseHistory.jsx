import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function CourseHistory() {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({ courseId: '', semester: '1', grade: 'A', minorTrack: '', isHonors: false });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  
  // States for Dialog Box (Modal) Editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, code: '', title: '', grade: 'A', isHonors: false, minorTrack: '' });
  
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [declaredMinors, setDeclaredMinors] = useState([]); 
  const [honorsDeclared, setHonorsDeclared] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [openSemesters, setOpenSemesters] = useState({});

  const gradingScale = ['A+', 'A', 'A-', 'B', 'B-','C', 'C-', 'D', 'P', 'F'];

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
      
      setDeclaredMinors(specRes.data.declarations.declaredMinors || []);
      setHonorsDeclared(specRes.data.declarations.honors || false);
      
      if (sortedCourses.length > 0 && !formData.courseId) {
        setFormData(prev => ({ ...prev, courseId: sortedCourses[0].id }));
      }
      
      setRecords(dashboardRes.data.records.filter(r => r.status === 'COMPLETED'));
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser]);

  const groupedRecords = records.reduce((acc, record) => {
    const sem = record.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(record);
    return acc;
  }, {});

  const toggleSemester = (sem) => {
    setOpenSemesters(prev => ({ ...prev, [sem]: !prev[sem] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(null);
    const isGraded = !['P', 'F'].includes(formData.grade);

    try {
      const token = await currentUser.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/records`, {
        ...formData,
        isGraded,
        isMinor: formData.minorTrack !== '',
        minorTrack: formData.minorTrack === '' ? null : formData.minorTrack,
        isHonors: formData.isHonors,
        status: 'COMPLETED'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Successfully logged course!");
      
      // Auto-open the semester we just added to
      setOpenSemesters(prev => ({ ...prev, [formData.semester]: true }));
      
      setFormData(prev => ({ ...prev, minorTrack: '', isHonors: false })); 
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add course.');
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Remove this course?")) return;
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) { alert("Failed to delete."); }
  };

  const handleEditClick = (record) => {
    setEditForm({
      id: record.id,
      code: record.course?.code,
      title: record.course?.title,
      grade: record.grade,
      isHonors: record.isHonors || false,
      minorTrack: record.minorTrack || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      const isGraded = (editForm.grade !== 'Not Graded' && editForm.grade !== 'P' && editForm.grade !== 'F');

      await axios.put(`${import.meta.env.VITE_API_URL}/api/records/${editForm.id}`, {
        grade: editForm.grade,
        isGraded: isGraded,
        isMinor: editForm.minorTrack !== '',
        minorTrack: editForm.minorTrack === '' ? null : editForm.minorTrack,
        isHonors: editForm.isHonors
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsEditModalOpen(false); 
      fetchData(); 
    } catch (error) {
      console.error(error);
      alert('Failed to update record.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-4 md:mt-10 relative">
      
      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-1">Edit Course</h3>
            <p className="text-sm font-bold text-gray-700 mb-4">{editForm.code} - <span className="font-normal">{editForm.title}</span></p>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select className="w-full p-2 border rounded bg-gray-50 font-bold text-blue-700" value={editForm.grade} onChange={(e) => setEditForm({...editForm, grade: e.target.value})}>
                  {gradingScale.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {(honorsDeclared || declaredMinors.length > 0) && (
                <div className="flex flex-col gap-3 pt-3 border-t mt-3">
                  {honorsDeclared && (
                    <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={editForm.isHonors} onChange={(e) => setEditForm({...editForm, isHonors: e.target.checked, minorTrack: e.target.checked ? '' : editForm.minorTrack})} className="rounded text-blue-600 w-4 h-4"/>
                      <span className="font-medium">Count towards Honors</span>
                    </label>
                  )}
                  {declaredMinors.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 mt-1">Declare for Minor</label>
                      <select className="w-full p-2 border border-purple-200 rounded bg-purple-50 text-purple-800 text-sm" value={editForm.minorTrack} onChange={(e) => setEditForm({...editForm, minorTrack: e.target.value, isHonors: e.target.value !== '' ? false : editForm.isHonors})}>
                        <option value="">Not for Minor</option>
                        {declaredMinors.map(m => <option key={m} value={m}>{m} Minor</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold text-blue-900 mb-2">Log Past Courses</h2>
      <p className="text-gray-500 mb-8">Record completed courses. P/F courses are excluded from CPI.</p>

      {message && <div className="bg-green-100 text-green-700 p-4 rounded mb-6 font-medium">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6 font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ADD ENTRY FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Add Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
              <select className="w-full p-2 border rounded bg-gray-50 text-sm" value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select className="w-full p-2 border rounded bg-gray-50" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                  {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select className="w-full p-2 border rounded bg-gray-50 font-bold text-blue-700" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})}>
                  {gradingScale.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
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
                    <select className="w-full p-2 border border-purple-200 rounded bg-purple-50 text-purple-800 text-sm" value={formData.minorTrack} onChange={(e) => setFormData({...formData, minorTrack: e.target.value, isHonors: e.target.value !== '' ? false : formData.isHonors})}>
                      <option value="">Not for Minor</option>
                      {declaredMinors.map(m => <option key={m} value={m}>{m} Minor</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 hover:bg-blue-700 transition">Log Course</button>
          </form>
        </div>

        {/* ACCORDION HISTORY */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-4 text-gray-700">History by Semester</h3>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
            const semRecords = groupedRecords[sem] || [];
            if (semRecords.length === 0) return null; 
            const isOpen = openSemesters[sem];
            
            // CALCULATE CREDITS PER SEMESTER HERE
            const semCredits = semRecords.reduce((sum, r) => sum + (r.course?.credits || 0), 0);
            
            return (
              <div key={sem} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                <button onClick={() => toggleSemester(sem)} className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors font-bold text-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-md text-sm">Sem {sem}</span>
                    <span className="text-gray-600 text-sm font-bold">{semCredits} Credits</span>
                    <span className="text-gray-400 text-sm font-normal hidden sm:block">• {semRecords.length} courses</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0 space-y-3">
                      {semRecords.map(record => (
                        <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-800 block text-sm">{record.course?.code}</span>
                              
                              {record.isHonors && <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">HONORS</span>}
                              {record.minorTrack && <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">{record.minorTrack} MINOR</span>}
                            </div>
                            <span className="text-gray-500 text-xs">{record.course?.title}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-black text-blue-700 bg-blue-50 px-2 py-1 rounded text-sm">{record.grade}</span>
                            <button onClick={() => handleEditClick(record)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-200 ml-2 transition">Edit</button>
                            <button onClick={() => handleDelete(record.id)} className="text-gray-400 hover:text-red-600 transition-colors ml-1 px-1" title="Delete Course">✕</button>
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
      </div>
    </div>
  );
}