import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/auth/Login';
import Profile from './pages/auth/Profile';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SchoolAdminDashboard from './pages/schooladmin/SchoolAdminDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';

function MainApp() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Auth Guard
  if (!currentUser) {
    return <Login />;
  }

  // Tab router
  const renderContent = () => {
    // If the active tab is profile, load the Profile component for everyone
    if (activeTab === 'profile') {
      return <Profile />;
    }

    // Otherwise render dashboard based on roles
    switch (currentUser.role) {
      case 'super_admin':
        return <SuperAdminDashboard activeSection={activeTab} />;
      case 'school_admin':
        return <SchoolAdminDashboard activeSection={activeTab} />;
      case 'parent':
        return <ParentDashboard activeSection={activeTab} />;
      case 'student':
        return <StudentDashboard />;
      case 'canteen_vendor':
      case 'stationery_vendor':
        return <VendorDashboard activeSection={activeTab} />;
      case 'teacher':
        return <TeacherDashboard activeSection={activeTab} />;
      default:
        return (
          <div className="py-12 text-center text-red-500 font-bold">
            Unauthorized Role: Please contact system support.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Core viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activeTab={activeTab} />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
