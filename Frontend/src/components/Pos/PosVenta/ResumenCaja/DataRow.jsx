import React from 'react';


const DataRow = ({ label, value, isTotal = false, textColor = '' }) => {
  const rowClass = isTotal
    ? 'font-bold py-2 border-t border-gray-200 mt-2'
    : 'py-2 border-b border-gray-100';
  const valueClass = textColor || (isTotal ? 'text-gray-900' : 'text-gray-700');

  return (
    <div className={`flex justify-between items-center ${rowClass}`}>
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
};

export default DataRow;
