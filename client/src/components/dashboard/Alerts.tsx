import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const Alerts: React.FC = () => {
  const alerts = [
    { id: 1, type: 'warning', message: 'Plastic waste detected in your area' },
    { id: 2, type: 'success', message: 'Great job! You have reduced water usage by 20%' },
    { id: 3, type: 'warning', message: 'Air quality index is high today' },
    { id: 4, type: 'success', message: 'You have achieved 100% waste segregation this week' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Alerts</h2>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg flex items-start ${
              alert.type === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
            }`}
          >
            {alert.type === 'warning' ? (
              <AlertTriangle className="text-yellow-500 mr-3 flex-shrink-0" size={24} />
            ) : (
              <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={24} />
            )}
            <p className={alert.type === 'warning' ? 'text-yellow-700' : 'text-green-700'}>
              {alert.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;