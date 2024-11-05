// InputField.jsx
import React from 'react';

const InputField = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = '',
  IconComponent, 
}) => (
  <div className="mb-4">
    <div className="relative">
      {}
      {IconComponent && (
        <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}c
        placeholder={placeholder}
        className={`w-full p-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        required={required}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default InputField;
