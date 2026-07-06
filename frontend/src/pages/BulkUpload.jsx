import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';
import Papa from 'papaparse';

export default function BulkUpload() {
  const { currentUser } = useAuth();
  const [baskets, setBaskets] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [status, setStatus] = useState({ message: '', error: '', loading: false });

  // Fetch baskets to map string names from the CSV to database IDs
  useEffect(() => {
    const fetchBaskets = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/baskets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBaskets(res.data);
      } catch (err) {
        console.error("Failed to fetch baskets", err);
      }
    };
    if (currentUser) fetchBaskets();
  }, [currentUser]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus({ message: '', error: '', loading: false });

    Papa.parse(file, {
      header: true, // Expects CSV headers: code, title, credits, basketName, branches
      skipEmptyLines: true,
      complete: (results) => {
        const mappedData = results.data.map(row => {
          // Find the matching basket ID by name (case-insensitive)
          const matchedBasket = baskets.find(
            b => b.name.toLowerCase().trim() === row.basketName?.toLowerCase().trim()
          );
          
          return {
            ...row,
            credits: parseInt(row.credits) || 0,
            basketId: matchedBasket ? matchedBasket.id : null,
            // Convert "EE, CS" string into ['EE', 'CS'] array
            branches: row.branches 
              ? row.branches.split(',').map(b => b.trim()).filter(b => b !== '') 
              : ['All']
          };
        });
        setParsedData(mappedData);
      },
      error: (error) => {
        setStatus({ message: '', error: `Error parsing CSV: ${error.message}`, loading: false });
      }
    });
  };

  const submitBulkData = async () => {
    setStatus({ message: '', error: '', loading: true });
    try {
      const token = await currentUser.getIdToken();
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/courses/bulk`, 
        { courses: parsedData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStatus({ message: `Successfully uploaded ${res.data.count} courses!`, error: '', loading: false });
      setParsedData([]); // Clear table on success
    } catch (err) {
      setStatus({ message: '', error: err.response?.data?.error || 'Upload failed', loading: false });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 mt-4 md:mt-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-red-900">Bulk Course Upload</h2>
        <p className="text-gray-600 mt-1">Import multiple courses simultaneously using a CSV file.</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <p className="text-sm text-gray-700 mb-4">
          Your CSV file must include exactly these headers (case-sensitive): <br/>
          <span className="font-mono bg-gray-100 p-1.5 rounded font-bold text-red-600 inline-block mt-2">
            code, title, credits, basketName, branches
          </span>
        </p>
        
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition cursor-pointer"
        />
      </div>

      {status.message && <div className="bg-green-100 text-green-700 p-4 rounded mb-6 font-bold">{status.message}</div>}
      {status.error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6 font-bold">{status.error}</div>}

      {/* Data Preview Table */}
      {parsedData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Data Preview ({parsedData.length} records)</h3>
            <button 
              onClick={submitBulkData} 
              disabled={status.loading || parsedData.some(r => !r.basketId)}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
            >
              {status.loading ? 'Uploading...' : 'Confirm & Upload'}
            </button>
          </div>
          
          {parsedData.some(r => !r.basketId) && (
            <div className="mb-4 text-sm text-red-600 font-bold">
              Warning: Some rows have unmatched baskets. Please fix the CSV and re-upload.
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto rounded border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 sticky top-0 border-b">
                <tr>
                  <th className="p-3 font-bold">Code</th>
                  <th className="p-3 font-bold">Title</th>
                  <th className="p-3 font-bold">Cr</th>
                  <th className="p-3 font-bold">Basket Match</th>
                  <th className="p-3 font-bold">Branches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedData.map((row, idx) => (
                  <tr key={idx} className={!row.basketId ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="p-3 font-bold text-gray-800">{row.code}</td>
                    <td className="p-3 text-gray-700">{row.title}</td>
                    <td className="p-3 font-medium">{row.credits}</td>
                    <td className="p-3">
                      {row.basketId 
                        ? <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">ID: {row.basketId}</span>
                        : <span className="text-red-500 font-bold text-xs">Unmatched: {row.basketName}</span>}
                    </td>
                    <td className="p-3 text-xs text-gray-500">{row.branches.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}