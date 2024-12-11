import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

// Define a TypeScript interface for the user data
interface UserProfileProps {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string; // Optional: to display role or other attributes
  profilePicture?: string; // Optional: allow custom profile picture
}

const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  phone,
  address,
  role,
  profilePicture = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <img
          src={profilePicture}
          alt="Profile"
          className="w-24 h-24 rounded-full mr-6"
        />
        <div>
          <h2 className="text-2xl font-bold">{name}</h2>
          {role && <p className="text-gray-600">{role}</p>}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <User className="mr-2 text-green-500" size={20} />
          <span>{name}</span>
        </div>
        <div className="flex items-center">
          <Mail className="mr-2 text-green-500" size={20} />
          <span>{email}</span>
        </div>
        <div className="flex items-center">
          <Phone className="mr-2 text-green-500" size={20} />
          <span>{phone}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="mr-2 text-green-500" size={20} />
          <span>{address}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
