import React, { useState } from 'react';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseHistory from './pages/CourseHistory';
import SemesterPlanner from './pages/SemesterPlanner';
import BasketTracking from './pages/BasketTracking'; 
import Specializations from './pages/Specializations';
import AdminPanel from './pages/AdminPanel';

import { signOut } from 'firebase/auth';
import { auth } from './firebase'; 

function AppContent() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewMode, setViewMode] = useState('student'); // 'student' or 'admin'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) return <Login />;

  const handleNav = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleSwitchMode = () => {
    if (viewMode === 'student') {
      setViewMode('admin');
      setCurrentView('admin'); // Land on default admin tab
    } else {
      setViewMode('student');
      setCurrentView('dashboard'); // Land on default student tab
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Separated Tab Arrays
  const studentTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history', label: 'Log Past Courses' },
    { id: 'planner', label: 'Semester Planner' },
    { id: 'baskets', label: 'Basket Audit' },
    { id: 'specializations', label: 'Specializations' }
  ];

  const adminTabs = [
    { id: 'admin', label: 'Master Catalog' },
    // We will add { id: 'bulk-upload', label: 'Bulk Upload' } here in Step 2!
  ];

  const activeTabs = viewMode === 'admin' ? adminTabs : studentTabs;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* RESPONSIVE NAVIGATION BAR */}
      <nav className={`shadow-md relative z-50 transition-colors duration-300 ${viewMode === 'admin' ? 'bg-red-900' : 'bg-blue-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 font-bold text-xl tracking-wider text-orange-400">
              IITGN<span className="text-white">TRACKER</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6 items-center flex-grow justify-center">
              {activeTabs.map(item => (
                <button 
                  key={item.id}
                  onClick={() => handleNav(item.id)} 
                  className={`text-sm font-medium transition-colors ${
                    currentView === item.id 
                      ? 'text-white border-b-2 border-orange-500 pb-1'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Desktop Controls (Toggle & Logout) */}
            <div className="hidden md:flex items-center space-x-4">
              {/* NOTE: You might want to wrap this button in a condition like {currentUser.isAdmin && (...)} later */}
              <button 
                onClick={handleSwitchMode}
                className={`text-xs font-bold px-3 py-1.5 rounded transition ${
                  viewMode === 'admin' 
                    ? 'bg-red-800 text-white hover:bg-red-700 border border-red-700' 
                    : 'bg-blue-800 text-white hover:bg-blue-700 border border-blue-700'
                }`}
              >
                Switch to {viewMode === 'admin' ? 'Student' : 'Admin'}
              </button>

              <button 
                onClick={handleLogout}
                className="px-4 py-1.5 bg-gray-100 text-gray-800 text-sm font-bold rounded hover:bg-white transition-colors"
              >
                Log Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden shadow-xl border-t absolute w-full ${viewMode === 'admin' ? 'bg-red-800 border-red-700' : 'bg-blue-800 border-blue-700'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
              
              {/* Mobile View Toggle */}
              <button 
                onClick={handleSwitchMode}
                className="block text-center px-3 py-2 mb-2 rounded-md text-sm font-bold bg-gray-900 text-white opacity-80"
              >
                Switch to {viewMode === 'admin' ? 'Student' : 'Admin'} Mode
              </button>

              {activeTabs.map(item => (
                <button 
                  key={item.id}
                  onClick={() => handleNav(item.id)} 
                  className={`block text-left px-3 py-3 rounded-md text-base font-medium ${
                    currentView === item.id 
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Logout Button */}
              <button 
                onClick={handleLogout}
                className="block text-left px-3 py-3 mt-2 rounded-md text-base font-medium bg-gray-100 text-gray-900 hover:bg-white transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content Rendered Below */}
      <div className="flex-grow">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'history' && <CourseHistory />}
        {currentView === 'planner' && <SemesterPlanner />}
        {currentView === 'baskets' && <BasketTracking />}
        {currentView === 'specializations' && <Specializations />}
        {currentView === 'admin' && <AdminPanel />}
        {/* Step 2 component will render here when we add it */}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}