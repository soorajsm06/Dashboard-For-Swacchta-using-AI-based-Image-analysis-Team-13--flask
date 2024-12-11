import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './components/store/authStore';
import Sidebar from './components/common/Sidebar';
import Marquee from './components/common/Marquee';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import UserProfile from './components/user/UserProfile';
import Alerts from './components/dashboard/Alerts';
import UserDiagnostic from './components/user/UserDiagnostic';
import Contribution from './components/dashboard/Contribution';
import Settings from './components/settings/Settings';
import Upload from './components/upload/upload';
import { LoginForm } from './components/user/LoginForm';
import { RegisterForm } from './components/user/RegisterForm';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard'); // Active tab state
  const { isAuthenticated, isLoading, ping } = useAuthStore();

  useEffect(() => {
    const debouncePing = setTimeout(async () => {
      try {
        await ping();
      } catch (error) {
        console.error('Ping failed:', error);
      }
    }, 200);

    return () => clearTimeout(debouncePing);
  }, [ping, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      {isAuthenticated ? (
        <LoginForm />
      ) : (
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Marquee />
          <div className="flex flex-1">
            {/* Sidebar and main content */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 p-6">
              <Routes>
                {/* Define your routes here */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/diagnostic" element={<UserDiagnostic />} />
                <Route path="/contribution" element={<Contribution />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/upload" element={<Upload />} />
                {/* <Route path="*" element={<NotFound />} /> */}
              </Routes>
            </main>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
