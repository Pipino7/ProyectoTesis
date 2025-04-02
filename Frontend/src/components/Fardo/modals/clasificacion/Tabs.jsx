import { FaTshirt, FaTag, FaBoxOpen } from 'react-icons/fa';

const Tabs = ({ activeTab, setActiveTab, prendasBodega, totalClasificadas }) => {
  return (
    <div className="flex items-center border-b">
      <button 
        className={`px-6 py-4 font-medium flex items-center ${
          activeTab === 'clasificar'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-blue-600'
        }`}
        onClick={() => setActiveTab('clasificar')}
      >
        <FaTshirt className="mr-2" /> Clasificar
      </button>

      <button 
        className={`px-6 py-4 font-medium flex items-center ${
          activeTab === 'clasificadas'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-blue-600'
        }`}
        onClick={() => setActiveTab('clasificadas')}
      >
        <FaTag className="mr-2" /> Clasificadas ({totalClasificadas})
      </button>

      <div className="ml-auto mr-5 px-4 py-2 bg-blue-100 text-blue-800 rounded-full flex items-center">
        <FaBoxOpen className="mr-2" />
        <span className="font-medium">{prendasBodega}</span> prendas en bodega
      </div>
    </div>
  );
};

export default Tabs;
