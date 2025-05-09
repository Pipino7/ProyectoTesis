import React from 'react';

const Section = ({ title, icon, children, color = 'gray' }) => {
  const headerColors = {
    gray: 'border-gray-200 text-gray-700',
    green: 'border-green-200 text-green-700',
    red: 'border-red-200 text-red-700',
    blue: 'border-blue-200 text-blue-700',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
      <div className={`px-4 py-3 bg-gray-50 border-b ${headerColors} flex items-center`}>
        {icon && <span className="mr-2">{icon}</span>}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Section;
