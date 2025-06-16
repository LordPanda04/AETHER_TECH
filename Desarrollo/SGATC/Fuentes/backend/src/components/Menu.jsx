import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Menu.css';
import metroLogo from '../images/METRO.png';

const API_URL = 'http://localhost:3001/api'; // Ajusta según tu configuración

const Menu = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    lote: '',
    fvencimiento: null,
    categoria_id: 1,
    cantidad: 0
  });
  const [categorias, setCategorias] = useState([]);

  // Cargar productos y categorías al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodResponse, catResponse] = await Promise.all([
          axios.get(`${API_URL}/productos`),
          axios.get(`${API_URL}/categorias`)
        ]);
        
        const productosAdaptados = prodResponse.data.map(producto => ({
          ...producto,
          id: producto.producto_id,
          codigo: producto.codigo_barras,
          tipodeguardado: producto.categoria_nombre || 'General',
          fvencimiento: producto.fvencimiento || '---'
        }));
        
        setProducts(productosAdaptados);
        setFilteredProducts(productosAdaptados);
        setCategorias(catResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Generar código consecutivo basado en el último producto
  const generateConsecutiveCode = () => {
    if (products.length === 0) return 'PROD-001';
    const lastCode = products[products.length - 1].codigo;
    const number = parseInt(lastCode.split('-')[1]) + 1;
    return `PROD-${number.toString().padStart(3, '0')}`;
  };

  // Filtrar productos
  useEffect(() => {
    const results = products.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.lote && product.lote.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  // Manejar eliminación de producto
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/productos/${id}`);
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setSelectedProductId(null);
      setShowDeleteModal(false);
      alert('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar el producto');
    }
  };

  // Manejar reabastecimiento
  const handleRestock = async (id, quantity) => {
    try {
      await axios.put(`${API_URL}/inventario/${id}`, { cantidad: quantity });
      
      const updatedProducts = products.map(product => 
        product.id === id ? { 
          ...product, 
          cantidad: product.cantidad + quantity 
        } : product
      );
      
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setSelectedProductId(null);
      setShowRestockModal(false);
      
      alert(`Producto reabastecido. Nueva cantidad: ${
        updatedProducts.find(p => p.id === id).cantidad
      }`);
    } catch (error) {
      console.error('Error reabasteciendo:', error);
      alert('Error al reabastecer el producto');
    }
  };

  // Agregar nuevo producto
  const handleAddProduct = async () => {
    if (!newProduct.nombre || !newProduct.lote || newProduct.cantidad <= 0) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    try {
      const productData = {
        nombre: newProduct.nombre,
        codigo_barras: generateConsecutiveCode(),
        categoria_id: newProduct.categoria_id,
        unidad_medida: 'unidad',
        precio_compra: 0,
        precio_venta: 0,
        stock_minimo: 0,
        stock_maximo: 100
      };

      // Crear producto
      const response = await axios.post(`${API_URL}/productos`, productData);
      
      // Agregar al inventario
      await axios.post(`${API_URL}/inventario`, {
        producto_id: response.data.id,
        ubicacion_id: 1, // Ubicación por defecto
        cantidad: newProduct.cantidad,
        lote: newProduct.lote,
        fecha_caducidad: newProduct.fvencimiento
      });

      // Actualizar estado local
      const productToAdd = {
        id: response.data.id,
        codigo: productData.codigo_barras,
        nombre: newProduct.nombre,
        lote: newProduct.lote,
        fvencimiento: newProduct.fvencimiento || '---',
        tipodeguardado: categorias.find(c => c.categoria_id === newProduct.categoria_id)?.nombre || 'General',
        cantidad: newProduct.cantidad
      };

      const updatedProducts = [...products, productToAdd];
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setShowAddModal(false);
      setNewProduct({
        nombre: '',
        lote: '',
        fvencimiento: null,
        categoria_id: 1,
        cantidad: 0
      });
      
      alert(`Producto agregado con código: ${productData.codigo_barras}`);
    } catch (error) {
      console.error('Error agregando producto:', error);
      alert('Error al agregar el producto');
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredProducts(sortedProducts);
  };

  const initiateAction = (actionType) => {
    if (actionType === 'add') {
      setShowAddModal(true);
      return;
    }

    if (!selectedProductId) {
      alert('Por favor selecciona un producto de la tabla primero');
      return;
    }
    
    const product = products.find(p => p.id === selectedProductId);
    setSelectedProduct(product);
    
    if (actionType === 'delete') {
      setShowDeleteModal(true);
    } else {
      if (product.fvencimiento !== "---") {
        alert('No se puede reabastecer producto con fecha de vencimiento definida');
        return;
      }
      setRestockQuantity(10);
      setShowRestockModal(true);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="menu-page">
      <div className="menu-overlay"></div>
      <div className="menu-container">
        {/* Menú lateral */}
        <div className="side-menu">
          <div className="logo-container">
            <img src={metroLogo} alt="Logo Metro" className="metro-logo" />
          </div>
          
          <h2 className="side-menu-title">Acciones</h2>
          
          <button 
            onClick={() => initiateAction('add')} 
            className="side-menu-btn add-btn"
          >
            Agregar Producto
          </button>
          
          <button 
            onClick={() => initiateAction('restock')}
            className="side-menu-btn restock-btn"
          >
            Reabastecer Producto
          </button>
          
          <button 
            onClick={() => initiateAction('delete')}
            className="side-menu-btn delete-btn"
          >
            Eliminar Producto
          </button>

          <button 
            onClick={() => navigate('/estadisticas')}
            className="side-menu-btn stats-btn"
          >
            Estadísticas
          </button>
          
          <button 
            onClick={handleLogout} 
            className="side-menu-btn logout-btn"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Contenido principal */}
        <div className="main-content">
          <header className="menu-header">
            <h1 className="main-title">Productos</h1>
          </header>

          <div className="menu-content">
            <div className="search-sort-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="sort-buttons">
                <button 
                  onClick={() => requestSort('tipodeguardado')}
                  className="sort-btn"
                >
                  Ordenar por Tipo
                </button>
                <button 
                  onClick={() => requestSort('fvencimiento')}
                  className="sort-btn"
                >
                  Ordenar por Fecha
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products">
                No se encontraron productos
              </div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Lote</th>
                    <th>F. Vencimiento</th>
                    <th>Tipo de Guardado</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      className={selectedProductId === product.id ? 'selected-row' : ''}
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <td>{product.codigo}</td>
                      <td>{product.nombre}</td>
                      <td>{product.lote || 'N/A'}</td>
                      <td>{product.fvencimiento}</td>
                      <td>{product.tipodeguardado}</td>
                      <td>{product.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <footer className="menu-footer">
            <p>Metro</p>
          </footer>
        </div>

        {/* Modal para agregar producto */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <h3>Agregar Nuevo Producto</h3>
              
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Lote:</label>
                <input
                  type="text"
                  value={newProduct.lote}
                  onChange={(e) => setNewProduct({...newProduct, lote: e.target.value})}
                  placeholder="Número de lote"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Fecha de Vencimiento:</label>
                <input
                  type="date"
                  value={newProduct.fvencimiento || ''}
                  onChange={(e) => setNewProduct({...newProduct, fvencimiento: e.target.value || null})}
                />
              </div>
              
              <div className="form-group">
                <label>Tipo de Guardado:</label>
                <select
                  value={newProduct.categoria_id}
                  onChange={(e) => setNewProduct({...newProduct, categoria_id: parseInt(e.target.value)})}
                  required
                >
                  {categorias.map(cat => (
                    <option key={cat.categoria_id} value={cat.categoria_id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  value={newProduct.cantidad}
                  onChange={(e) => setNewProduct({...newProduct, cantidad: parseInt(e.target.value) || 0})}
                  placeholder="Cantidad inicial"
                  required
                />
              </div>
              
              <div className="modal-buttons">
                <button 
                  onClick={handleAddProduct}
                  className="modal-confirm-btn add-btn"
                >
                  Agregar Producto
                </button>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="modal-cancel-btn"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro que deseas eliminar el producto: <strong>{selectedProduct.nombre}</strong>?</p>
              <p>Código: {selectedProduct.codigo} | Lote: {selectedProduct.lote || 'N/A'}</p>
              <div className="modal-buttons">
                <button 
                  onClick={() => handleDelete(selectedProduct.id)} 
                  className="modal-confirm-btn delete-btn"
                >
                  Confirmar Eliminación
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="modal-cancel-btn"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para reabastecer */}
        {showRestockModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <h3>Confirmar Reabastecimiento</h3>
              <p>¿Deseas reabastecer el producto: <strong>{selectedProduct.nombre}</strong>?</p>
              <p>Código: {selectedProduct.codigo} | Lote: {selectedProduct.lote || 'N/A'}</p>
              <p>Cantidad actual: {selectedProduct.cantidad}</p>
              
              <div className="restock-input-container">
                <label>Cantidad a agregar:</label>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="modal-buttons">
                <button 
                  onClick={() => {
                    if (restockQuantity > 0) {
                      handleRestock(selectedProduct.id, restockQuantity);
                    } else {
                      alert('Por favor ingrese una cantidad válida mayor a cero');
                    }
                  }} 
                  className="modal-confirm-btn restock-btn"
                >
                  Confirmar Reabastecimiento
                </button>
                <button 
                  onClick={() => setShowRestockModal(false)} 
                  className="modal-cancel-btn"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;