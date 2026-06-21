import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [admissionYear, setAdmissionYear] = useState('2025');
  const [discipline, setDiscipline] = useState('CSE');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await login(admissionYear, discipline);
      alert("Successfully logged in and synced with backend!");
    } catch (err) {
      setError(err.message || 'Failed to log in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">IITGN Academic Dashboard</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Admission Year</label>
          <select 
            value={admissionYear} 
            onChange={(e) => setAdmissionYear(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Discipline</label>
          <select 
            value={discipline} 
            onChange={(e) => setDiscipline(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="AI">Artificial Intelligence</option>
            <option value="CE">Civil Engineering</option>
            <option value="CHE">Chemical Engineering</option>
            <option value="CSE">Computer Science & Eng.</option>
            <option value="EE">Electrical Engineering</option>
            <option value="ICDT">Integrated Circuit Design</option>
            <option value="MSE">Materials Engineering</option>
            <option value="ME">Mechanical Engineering</option>
          </select>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Sign in with IITGN Google
        </button>
      </div>
    </div>
  );
}