import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Reportes.css';
import metroLogo from '../images/METRO.png';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reportes = () => {
  const navigate = useNavigate();
  const [lotesPorFecha, setLotesPorFecha] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/lotes-reporte');
        const { lotesAgrupados, chartData } = organizarDatos(response.data);
        setLotesPorFecha(lotesAgrupados);
        setChartData(chartData);
      } catch (err) {
        setError('Error al cargar los lotes');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLotes();
  }, []);

  const organizarDatos = (lotes) => {
    const lotesAgrupados = {};
    const datosGrafico = {
        labels: [],
        datasets: [{
        label: 'Total Ingresado por Fecha',
        data: [],
        backgroundColor: '#e12213',
        borderColor: '#c11a0f',
        borderWidth: 1
        }]
    };
    
    // Agrupar por fecha y calcular totales
    lotes.forEach(lote => {
        const fecha = new Date(lote.fecha_ingreso).toLocaleDateString();
        
        if (!lotesAgrupados[fecha]) {
        lotesAgrupados[fecha] = {
            lotes: [],
            total: 0,
            fechaObj: new Date(lote.fecha_ingreso) // Guardamos el objeto Date para ordenar
        };
        }
        
        lotesAgrupados[fecha].lotes.push(lote);
        lotesAgrupados[fecha].total += lote.cantidad_lote;
    });

    // Ordenar fechas de más reciente a más antigua
    const fechasOrdenadas = Object.keys(lotesAgrupados).sort((a, b) => {
        return lotesAgrupados[b].fechaObj - lotesAgrupados[a].fechaObj;
    });

    // Preparar datos ordenados para el estado y el gráfico
    const lotesOrdenados = {};
    fechasOrdenadas.forEach(fecha => {
        lotesOrdenados[fecha] = lotesAgrupados[fecha];
        datosGrafico.labels.push(fecha);
        datosGrafico.datasets[0].data.push(lotesAgrupados[fecha].total);
    });

    return { lotesAgrupados: lotesOrdenados, chartData: datosGrafico };
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  if (isLoading) return <div className="loading">Cargando reportes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="reportes-page">
      <div className="menu-overlay"></div>
      <div className="menu-container">
        {/* Menú lateral (igual que en Menu.jsx) */}
        <div className="side-menu">
          <div className="logo-container">
            <img src={metroLogo} alt="Logo Metro" className="metro-logo" />
          </div>
          
          <h2 className="side-menu-title">Acciones</h2>
          
          <button 
            onClick={handleBackToMenu}
            className="side-menu-btn back-btn"
          >
            Volver al Menú
          </button>
        </div>

        {/* Contenido principal */}
        <div className="main-content">
          <header className="menu-header">
            <h1 className="main-title">Reportes de Lotes</h1>
          </header>

          <div className="reportes-content">
            {/* Gráfico de barras */}
            {chartData && (
              <div className="chart-container">
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Total de Productos Ingresados por Fecha',
                        font: { size: 16 }
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Cantidad Total'
                        }
                      }
                    }
                  }} 
                />
              </div>
            )}

            {/* Tablas por fecha */}
            {Object.keys(lotesPorFecha).length === 0 ? (
              <div className="no-data">No hay lotes registrados</div>
            ) : (
              Object.entries(lotesPorFecha).map(([fecha, {lotes, total}]) => (
                <div key={fecha} className="reporte-fecha">
                  <h3 className="fecha-titulo">
                    Lotes ingresados el: {fecha} 
                    <span className="total-fecha">Total: {total} unidades</span>
                  </h3>
                  <table className="reportes-table">
                    <thead>
                      <tr>
                        <th>ID Lote</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Fecha Caducidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lotes.map(lote => (
                        <tr key={lote.id_lote}>
                          <td>{lote.id_lote}</td>
                          <td>{lote.producto_nombre || lote.id_prod}</td>
                          <td>{lote.cantidad_lote}</td>
                          <td>{new Date(lote.fecha_caducidad).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;