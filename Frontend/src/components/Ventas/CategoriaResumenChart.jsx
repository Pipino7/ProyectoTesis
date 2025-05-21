// src/components/Ventas/CategoriaResumenChart.jsx
import PropTypes from 'prop-types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  DoughnutController
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, 
  DoughnutController,
  Title,
  Tooltip,
  Legend
);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount || 0);
};

const CategoriaResumenChart = ({ categorias = [] }) => {

  if (!categorias || categorias.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center h-60">
        <p className="text-gray-500">No hay datos de categorías disponibles</p>
      </div>
    );
  }


  const topCategorias = [...categorias].sort((a, b) => b.monto - a.monto).slice(0, 5);
  

  const colors = {
    backgrounds: [
      'rgba(54, 162, 235, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(255, 99, 132, 0.7)'
    ],
    borders: [
      'rgba(54, 162, 235, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 99, 132, 1)'
    ],
    highlightBackgrounds: [
      'rgba(54, 162, 235, 0.9)',
      'rgba(75, 192, 192, 0.9)',
      'rgba(153, 102, 255, 0.9)',
      'rgba(255, 159, 64, 0.9)',
      'rgba(255, 99, 132, 0.9)'
    ]
  };

  // Datos para el gráfico de barras
  const barChartData = {
    labels: topCategorias.map(cat => cat.nombre),
    datasets: [
      {
        label: 'Monto de ventas',
        data: topCategorias.map(cat => cat.monto),
        backgroundColor: colors.backgrounds,
        borderColor: colors.borders,
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: colors.highlightBackgrounds
      }
    ]
  };

  // Opciones para el gráfico de barras
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Ventas por Categoría',
        color: '#374151',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.parsed.y);
          },
          afterLabel: function(context) {
            const categoria = topCategorias[context.dataIndex];
            return `Cantidad: ${categoria.cantidad}`;
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad'
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };
  
  // Datos para el gráfico de donut (circular)
  const donutChartData = {
    labels: topCategorias.map(cat => cat.nombre),
    datasets: [
      {
        data: topCategorias.map(cat => cat.porcentaje || Math.round((cat.cantidad / topCategorias.reduce((acc, curr) => acc + curr.cantidad, 0)) * 100)),
        backgroundColor: colors.backgrounds,
        borderColor: colors.borders,
        borderWidth: 1,
        hoverBackgroundColor: colors.highlightBackgrounds,
        hoverOffset: 10
      }
    ]
  };
  
  // Opciones para el gráfico de donut
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}% (${formatCurrency(topCategorias[context.dataIndex].monto)})`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    },
    cutout: '65%'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por Categoría</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras */}
        <div className="h-60">
          <Bar data={barChartData} options={barOptions} />
        </div>
        
        {/* Gráfico de donut */}
        <div className="h-60 flex items-center justify-center">
          <Doughnut data={donutChartData} options={donutOptions} />
        </div>
        
        {/* Información de la categoría más vendida */}
        <div className="lg:col-span-2 bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Categoría más vendida</p>
          <p className="text-xl font-bold text-blue-700">{topCategorias[0]?.nombre || 'N/A'}</p>
          <div className="flex justify-center gap-6 mt-2">
            <div>
              <p className="text-xs text-gray-500">Monto</p>
              <p className="font-semibold">{formatCurrency(topCategorias[0]?.monto || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Cantidad</p>
              <p className="font-semibold">{topCategorias[0]?.cantidad || 0} prendas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CategoriaResumenChart.propTypes = {
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      nombre: PropTypes.string,
      monto: PropTypes.number,
      cantidad: PropTypes.number,
      porcentaje: PropTypes.number
    })
  )
};

export default CategoriaResumenChart;
