import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseHistory from './pages/CourseHistory';
import SemesterPlanner from './pages/SemesterPlanner';
import BasketTracking from './pages/BasketTracking'; 
import Specializations from './pages/Specializations';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile toggle state

  if (!currentUser) return <Login />;

  // Helper function to handle navigation and close mobile menu
  const handleNav = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history', label: 'Log Past Courses' },
    { id: 'planner', label: 'Semester Planner' },
    { id: 'baskets', label: 'Basket Audit' },
    { id: 'specializations', label: 'Specializations' },
    { id: 'admin', label: 'Admin', adminOnly: true } // Special styling flag
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* RESPONSIVE NAVIGATION BAR */}
      <nav className="bg-blue-900 text-white shadow-md relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Branding / Logo */}
            <div className="flex-shrink-0 font-bold text-xl tracking-wider text-orange-400">
              IITGN<span className="text-white">TRACKER</span>
            </div>

            {/* Desktop Menu (Hidden on mobile, flex on medium screens and up) */}
            <div className="hidden md:flex space-x-6 items-center">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => handleNav(item.id)} 
                  className={`text-sm font-medium transition-colors ${
                    currentView === item.id 
                      ? (item.adminOnly ? 'text-red-400 border-b-2 border-red-400 pb-1' : 'text-white border-b-2 border-orange-500 pb-1')
                      : (item.adminOnly ? 'text-gray-400 hover:text-red-300' : 'text-blue-300 hover:text-white')
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button (Visible only on small screens) */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none p-2"
              >
                {/* SVG Hamburger Icon */}
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
          <div className="md:hidden bg-blue-800 shadow-xl border-t border-blue-700 absolute w-full">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => handleNav(item.id)} 
                  className={`block text-left px-3 py-3 rounded-md text-base font-medium ${
                    currentView === item.id 
                      ? (item.adminOnly ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-white')
                      : (item.adminOnly ? 'text-gray-400 hover:bg-blue-700' : 'text-blue-200 hover:bg-blue-700 hover:text-white')
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Page Content Rendered Below */}
      <div className="transition-all duration-300">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'history' && <CourseHistory />}
        {currentView === 'planner' && <SemesterPlanner />}
        {currentView === 'baskets' && <BasketTracking />}
        {currentView === 'specializations' && <Specializations />}
        {currentView === 'admin' && <AdminPanel />}
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