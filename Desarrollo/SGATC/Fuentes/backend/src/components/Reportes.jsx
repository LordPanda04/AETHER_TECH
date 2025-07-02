import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Reportes.css';
import metroLogo from '../images/METRO.png';

const Reportes = () => {
  const navigate = useNavigate();
  const [lotesPorFecha, setLotesPorFecha] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/lotes-reporte');
        organizarLotesPorFecha(response.data);
      } catch (err) {
        setError('Error al cargar los lotes');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLotes();
  }, []);

  const organizarLotesPorFecha = (lotes) => {
    const lotesAgrupados = {};
    
    lotes.forEach(lote => {
      const fecha = new Date(lote.fecha_ingreso).toLocaleDateString();
      
      if (!lotesAgrupados[fecha]) {
        lotesAgrupados[fecha] = [];
      }
      
      lotesAgrupados[fecha].push(lote);
    });
    
    setLotesPorFecha(lotesAgrupados);
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  if (isLoading) {
    return <div className="loading">Cargando reportes...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="reportes-page">
      <div className="menu-overlay"></div>
      <div className="menu-container">
        {/* Menú lateral */}
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
            {Object.keys(lotesPorFecha).length === 0 ? (
              <div className="no-data">No hay lotes registrados</div>
            ) : (
              Object.entries(lotesPorFecha).map(([fecha, lotes]) => (
                <div key={fecha} className="reporte-fecha">
                  <h3 className="fecha-titulo">Lotes ingresados el: {fecha}</h3>
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