import React from 'react';
import { Activity, Trash2, Droplet, Wind } from 'lucide-react';

const UserDiagnostic: React.FC = () => {
  const diagnostics = [
    { icon: Trash2, label: 'Waste Management', score: 85 },
    { icon: Droplet, label: 'Water Conservation', score: 72 },
    { icon: Wind, label: 'Air Quality', score: 68 },
    { icon: Activity, label: 'Overall Eco-Score', score: 75 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">User Diagnostic</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diagnostics.map((item, index) => (
          <div key={index} className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <item.icon className="text-green-500 mr-2" size={24} />
              <h3 className="text-lg font-semibold">{item.label}</h3>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-300 rounded-full h-4 mr-2">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{item.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDiagnostic;