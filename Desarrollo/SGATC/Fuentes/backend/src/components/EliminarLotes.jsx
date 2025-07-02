import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EliminarLotes.css';   

/**
 * Props esperadas:
 *  - productId   : string  (ej. 'PRD-013')
 *  - productName : string  (ej. 'Salsa de Tomate')
 *  - onClose()   : función para cerrar el modal y refrescar Menu
 */
const EliminarLotes = ({ productId, productName, onClose }) => {
  const [lotes, setLotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmData, setConfirmData] = useState(null); // { id_lote, cantidad_lote }

  /* 1 ▸ Cargar lotes al montar el componente */
  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const resp = await axios.get(
          `http://localhost:5000/api/lotes/${productId}`
        );
        setLotes(resp.data || []);
      } catch (err) {
        setError('Error al cargar lotes');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLotes();
  }, [productId]);

  /* 2 ▸ Solicitar confirmación */
  const askDelete = (lote) => {
    setConfirmData(lote); // abre la vista de confirmación
  };

  /* 3 ▸ Ejecutar DELETE en BD y refrescar la lista */
  const handleConfirmDelete = async () => {
    if (!confirmData) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/lotes/${confirmData.id_lote}`
      );

      // Filtramos localmente
      setLotes((prev) =>
        prev.filter((l) => l.id_lote !== confirmData.id_lote)
      );
      setConfirmData(null);   // volvemos a lista

      // Actualizar la lista de productos en el componente padre
      const response = await axios.get('http://localhost:5000/api/productos');
      onClose(response.data); // Modificamos onClose para recibir datos actualizados

    } catch (err) {
      alert('No se pudo eliminar el lote');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">Cargando lotes…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <p>{error}</p>
          <button onClick={onClose} className="modal-cancel-btn">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Vista de confirmación
  if (confirmData) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <h3>Confirmar eliminación</h3>
          <p>
            ¿Desea eliminar el lote <strong>{confirmData.id_lote}</strong> del
            producto <strong>{productName}</strong>?
          </p>

          <div className="modal-buttons">
            <button
              onClick={handleConfirmDelete}
              className="modal-confirm-btn delete-btn"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmData(null)}
              className="modal-cancel-btn"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal: lista de lotes
  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '800px' }}>
        <h3>
          Lotes del Producto:&nbsp;<span style={{ color: '#e12213' }}>{productName}</span>
        </h3>

        {lotes.length === 0 ? (
          <p style={{ margin: '20px 0' }}>
            Este producto no tiene lotes registrados.
          </p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID Lote</th>
                <th>Cantidad</th>
                <th>Fecha Caducidad</th>
                <th>Días Restantes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lotes.map((lote) => (
                <tr key={lote.id_lote}>
                  <td>{lote.id_lote}</td>
                  <td>{lote.cantidad_lote}</td>
                  <td>{new Date(lote.fecha_caducidad).toLocaleDateString()}</td>
                  <td>
                    {Math.floor(
                      (new Date(lote.fecha_caducidad) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    días
                  </td>
                  <td>
                    <button
                      onClick={() => askDelete(lote)}
                      className="modal-confirm-btn delete-btn"
                      style={{ padding: '6px 12px', fontSize: 13 }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button 
          onClick={() => onClose()} // Solo llamamos a onClose sin parámetros
          className="modal-cancel-btn"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default EliminarLotes;
