import React, { useState } from 'react';
import { Bell, Moon, Sun, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="text-green-500 mr-2" size={24} />
            <span className="text-lg">Notifications</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {darkMode ? (
              <Moon className="text-green-500 mr-2" size={24} />
            ) : (
              <Sun className="text-green-500 mr-2" size={24} />
            )}
            <span className="text-lg">Dark Mode</span>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="text-green-500 mr-2" size={24} />
            <span className="text-lg">Language</span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;