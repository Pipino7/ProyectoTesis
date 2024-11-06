// src/components/DashboardModule.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardModule = ({ icon: Icon, title, description, navigateTo }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-purple-200 transition duration-200 flex items-center"
      onClick={() => navigate(navigateTo)}
    >
      <Icon className="text-purple-700 mr-4" size={40} />
      <div>
        <h2 className="text-xl font-semibold text-purple-700">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default DashboardModule;
