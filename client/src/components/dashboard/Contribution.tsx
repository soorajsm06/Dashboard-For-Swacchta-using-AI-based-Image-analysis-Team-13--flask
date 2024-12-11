import React from 'react';
import { Award, Users, Calendar } from 'lucide-react';

const Contribution: React.FC = () => {
  const contributions = [
    { icon: Award, label: 'Cleanliness Drives Participated', value: 12 },
    { icon: Users, label: 'Community Members Inspired', value: 47 },
    { icon: Calendar, label: 'Consecutive Days of Eco-friendly Practices', value: 30 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Your Contributions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contributions.map((item, index) => (
          <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
            <item.icon className="text-green-500 mx-auto mb-2" size={32} />
            <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
            <p className="text-3xl font-bold text-green-600">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Activities</h3>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
            Participated in beach cleanup drive
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
            Organized a workshop on waste segregation
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
            Planted 10 trees in the community park
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Contribution;