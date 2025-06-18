import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productsData from './productsData';
import './Menu.css';
import metroLogo from '../images/METRO.png'; 

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
    fvencimiento: '---',
    tipodeguardado: '',
    cantidad: 0
  });

  useEffect(() => {
    setProducts(productsData);
    setFilteredProducts(productsData);
    setIsLoading(false);
  }, []);

  // Generar código consecutivo basado en el último producto
  const generateConsecutiveCode = () => {
    if (products.length === 0) return 'PROD-001';
    
    const lastCode = products[products.length - 1].codigo;
    const number = parseInt(lastCode.split('-')[1]) + 1;
    return `PROD-${number.toString().padStart(3, '0')}`;
  };

  useEffect(() => {
    const results = products.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.lote.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleDelete = (id) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    setSelectedProductId(null);
    setShowDeleteModal(false);
    alert(`Producto eliminado correctamente`);
  };

  const handleRestock = (id, quantity) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, cantidad: product.cantidad + quantity } : product
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    setSelectedProductId(null);
    setShowRestockModal(false);
    alert(`Producto reabastecido correctamente. Nueva cantidad: ${updatedProducts.find(p => p.id === id).cantidad}`);
  };

  const handleAddProduct = () => {
    if (!newProduct.nombre || !newProduct.lote || !newProduct.tipodeguardado || newProduct.cantidad <= 0) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }

    const consecutiveCode = generateConsecutiveCode();
    const productToAdd = {
      id: products.length + 1,
      codigo: consecutiveCode,
      ...newProduct,
      cantidad: parseInt(newProduct.cantidad)
    };

    const updatedProducts = [...products, productToAdd];
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    setShowAddModal(false);
    setNewProduct({
      nombre: '',
      lote: '',
      fvencimiento: '---',
      tipodeguardado: '',
      cantidad: 0
    });
    alert(`Producto agregado correctamente con código: ${consecutiveCode}`);
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
                      <td>{product.lote}</td>
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
                />
              </div>
              
              <div className="form-group">
                <label>Lote:</label>
                <input
                  type="text"
                  value={newProduct.lote}
                  onChange={(e) => setNewProduct({...newProduct, lote: e.target.value})}
                  placeholder="Número de lote"
                />
              </div>
              
              <div className="form-group">
                <label>Fecha de Vencimiento:</label>
                <input
                  type="text"
                  value={newProduct.fvencimiento}
                  onChange={(e) => setNewProduct({...newProduct, fvencimiento: e.target.value})}
                  placeholder="--- o DD/MM/AAAA"
                />
              </div>
              
              <div className="form-group">
                <label>Tipo de Guardado:</label>
                <input
                  type="text"
                  value={newProduct.tipodeguardado}
                  onChange={(e) => setNewProduct({...newProduct, tipodeguardado: e.target.value})}
                  placeholder="Ej: Refrigerado, Seco, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  value={newProduct.cantidad}
                  onChange={(e) => setNewProduct({...newProduct, cantidad: e.target.value})}
                  placeholder="Cantidad inicial"
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
              <p>Código: {selectedProduct.codigo} | Lote: {selectedProduct.lote}</p>
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
              <p>Código: {selectedProduct.codigo} | Lote: {selectedProduct.lote}</p>
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