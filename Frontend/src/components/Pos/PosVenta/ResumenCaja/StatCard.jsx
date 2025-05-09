import React from 'react';

const StatCard = ({ icon, title, value, subtitle, color = 'blue' }) => {
  const bgColor = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
  }[color];
  const textColor = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    red: 'text-red-700',
  }[color];

  return (
    <div className={`${bgColor} p-4 rounded-lg shadow-sm border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-gray-600 font-medium text-sm">{title}</h4>
          <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
