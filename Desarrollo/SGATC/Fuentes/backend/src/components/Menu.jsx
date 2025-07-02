import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EliminarLotes from './EliminarLotes';
import './Menu.css';
import metroLogo from '../images/METRO.png'; 

const Menu = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEliminarLotes, setShowEliminarLotes] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [newLote, setNewLote] = useState({
    id_lote: '',
    cantidad_lote: 0,
    fecha_caducidad: '',
    id_prod: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' o 'desc'
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [newProduct, setNewProduct] = useState({
    id_prod: '', // Se generará automáticamente
    nombre: '',
    marca: '',
    id_categ: '',
    unid_medida: '',
    stock_prod: 0,
    precio_prod: 0,
    activo: 1
  });
  const [categorias, setCategorias] = useState([]);
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false);
  const [showLotesModal, setShowLotesModal] = useState(false);
  const [productoLotes, setProductoLotes] = useState([]);
  const [selectedSortKey, setSelectedSortKey] = useState('');


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/productos');
        // Ordenar los productos por id_prod (código) de forma ascendente
        const sortedProducts = response.data.sort((a, b) => 
          a.id_prod.localeCompare(b.id_prod)
        );
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      setIsLoadingCategorias(true);
      try {
        const response = await axios.get('http://localhost:5000/api/categorias');
        setCategorias(response.data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        alert('Error al cargar categorías');
      } finally {
        setIsLoadingCategorias(false);
      }
    };
    fetchCategorias();
  }, []);

  /*useEffect(() => {
    setProducts(productsData);
    setFilteredProducts(productsData);
    setIsLoading(false);
  }, []);*/

    // Single or Double click const, sólo guarda cuál es la fila activa
    const handleRowClick = (id_prod) => {
      setSelectedProductId(id_prod);
    };

  // Generar código consecutivo basado en el último producto
  const generateProductCode = async () => {
    try {
      // Consultar al backend por el último ID
      const response = await axios.get('http://localhost:5000/api/productos/ultimo-id');
      const ultimoId = response.data.ultimoId;
      
      // Si no hay productos, empezar con PRD-001
      if (!ultimoId) return 'PRD-001';
      
      // Extraer el número del último código (ej: "PRD-126" → 126)
      const numero = parseInt(ultimoId.split('-')[1]);
      
      // Incrementar y formatear con ceros a la izquierda
      const nuevoNumero = numero + 1;
      return `PRD-${nuevoNumero.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error al generar código:', error);
      // Fallback: usar la cantidad de productos + 1
      return `PRD-${(products.length + 1).toString().padStart(3, '0')}`;
    }
  };

  // Agrega esta función dentro del componente Menu, antes del return
const exportToExcel = async () => {
  try {
    // Obtener los datos completos de la API (incluyendo descripción que no se muestra en la tabla)
    const response = await axios.get('http://localhost:5000/api/productos/completos');
    const productosCompletos = response.data;

    // Crear el contenido CSV
    const headers = [
      'Código', 'Nombre', 'Marca', 'Descripción', 'Categoría', 
      'Unidad de Medida', 'Stock', 'Precio (S/.)', 'Estado'
    ].join(',');

    const rows = productosCompletos.map(producto => [
      producto.id_prod,
      `"${producto.nombre}"`, // Entre comillas por si contiene comas
      `"${producto.marca}"`,
      `"${producto.descrip || 'Sin descripción'}"`,
      `"${producto.nombre_categ}"`,
      producto.unid_medida,
      producto.stock_prod,
      Number(producto.precio_prod).toFixed(2),
      producto.activo ? 'Activo' : 'Inactivo'
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');

    // Crear el archivo y descargarlo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `productos_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    alert('Error al generar el archivo de exportación');
  }
};

   
  useEffect(() => {
    const results = products.filter(product => {
      const searchTermLower = searchTerm.toLowerCase();
      
      return [
        product.id_prod?.toLowerCase() || '',
        product.nombre?.toLowerCase() || '',
        product.nombre_categ?.toLowerCase() || '',
        product.unid_medida?.toLowerCase() || ''
      ].some(field => field.includes(searchTermLower));
    });
    
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleDelete = (id_prod) => {  // Cambiado de id a id_prod
    const updatedProducts = products.filter(product => product.id_prod !== id_prod);
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    setSelectedProductId(null);
    setShowDeleteModal(false);
    alert(`Producto eliminado correctamente`);
  };

  const handleAddProduct = async () => {
    // Validación de campos
    if (!newProduct.nombre || !newProduct.marca || !newProduct.id_categ || 
        !newProduct.unid_medida || newProduct.precio_prod <= 0) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }

    try {
      // Generar código automático
      const productCode = await generateProductCode();
      
      // Preparar datos para enviar
      const productToAdd = {
        ...newProduct,
        id_prod: productCode,
        descrip: '', // Campo descripción vacío por defecto
        activo: 1 // Producto activo por defecto
      };

      // Enviar a la API
      await axios.post('http://localhost:5000/api/productos', productToAdd);
      
      // Obtener la categoría completa para mostrar en la tabla
      const categoriaCompleta = categorias.find(c => c.id_categ === parseInt(newProduct.id_categ));
      
      // Crear el objeto de producto completo para la tabla
      const productoParaTabla = {
        id_prod: productCode,
        nombre: newProduct.nombre,
        marca: newProduct.marca,
        id_categ: newProduct.id_categ,
        nombre_categ: categoriaCompleta?.nombre_categ || '',
        unid_medida: newProduct.unid_medida,
        stock_prod: 0, // Inicializamos en 0 porque no tiene lotes aún
        precio_prod: newProduct.precio_prod,
        activo: 1
      };

      // Actualizar estado local
      const updatedProducts = [...products, productoParaTabla];
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      
      // Cerrar modal y resetear formulario
      setShowAddModal(false);
      setNewProduct({
        id_prod: '',
        nombre: '',
        marca: '',
        id_categ: '',
        unid_medida: '',
        precio_prod: 0,
        activo: 1
      });
      
      alert(`Producto agregado correctamente con código: ${productCode}`);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      let errorMessage = 'Error al agregar producto';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Datos inválidos: ' + (error.response.data.message || 'verifique los campos');
        } else if (error.response.status === 500) {
          errorMessage = 'Error en el servidor al intentar agregar el producto';
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleRestock = async () => {
    try {
      // Validación mejorada
      if (!newLote.id_lote?.trim()) {
        alert('El ID del lote es requerido');
        return;
      }
      if (newLote.cantidad_lote <= 0) {
        alert('La cantidad debe ser mayor a 0');
        return;
      }
      if (!newLote.fecha_caducidad) {
        alert('La fecha de caducidad es requerida');
        return;
      }

      // 1. Enviar el nuevo lote al servidor
      await axios.post('http://localhost:5000/api/lotes', newLote);

      // 2. Obtener los productos actualizados
      const productsResponse = await axios.get('http://localhost:5000/api/productos');
      setProducts(productsResponse.data);
      setFilteredProducts(productsResponse.data);
      
      // 3. Obtener los lotes actualizados para el modal
      const lotesResponse = await axios.get(`http://localhost:5000/api/lotes/${newLote.id_prod}`);
      setProductoLotes(lotesResponse.data);

      // Cerrar y resetear
      setShowRestockModal(false);
      setNewLote({
        id_lote: '',
        cantidad_lote: '',
        fecha_caducidad: '',
        id_prod: selectedProductId
      });

      alert('¡Lote agregado correctamente!');

    } catch (error) {
      console.error("Detalles del error:", error);
      
      let errorMessage = 'Error al reabastecer';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Producto no encontrado';
        } else if (error.response.status === 409) {
          errorMessage = 'El ID de lote ya existe';
        } else {
          errorMessage += `: ${error.response.data?.error || error.response.statusText}`;
        }
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const sortArray = (array, key, direction = 'ascending') => {
    return [...array].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      // Si es precio, conviértelo a número
      if (key === 'precio_prod') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      // Comparación estándar
      if (valA < valB) return direction === 'ascending' ? -1 : 1;
      if (valA > valB) return direction === 'ascending' ?  1 : -1;
      return 0;
    });
  };

  // Función para cambiar el orden
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    if (sortConfig.key) {
      const sorted = sortArray(filteredProducts, sortConfig.key, sortOrder === 'asc' ? 'descending' : 'ascending');
      setFilteredProducts(sorted);
    }
  };

  // Modifica la función requestSort para considerar el sortOrder:
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    setSortConfig({ key, direction });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (key === 'precio_prod') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (valA < valB) return direction === 'ascending' ? -1 : 1;
      if (valA > valB) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(sortedProducts);
  };

  const handleSortChange = (e) => {
    const key = e.target.value;

    // Guardamos el criterio elegido
    setSelectedSortKey(key);
    setSortConfig({ key, direction: 'ascending' });

    // Cuando el usuario elige "—", mostramos la lista tal cual
    if (!key) {
      setFilteredProducts([...products]);
      return;
    }

    const sorted = sortArray(filteredProducts, key, 'ascending');
    setFilteredProducts(sorted);
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
    
    const product = products.find(p => p.id_prod === selectedProductId);
    setSelectedProduct(product);
    
    if (actionType === 'delete') {
      setShowDeleteModal(true);
    } else {
      // Configuración para reabastecer
      setNewLote({
        id_lote: '',
        cantidad_lote: '',
        fecha_caducidad: '',
        id_prod: selectedProductId // Se establece automáticamente
      });
      setShowRestockModal(true);
    }
  };

  const handleShowLotes = async (id_prod) => {
    try {
      setSelectedProductId(id_prod);
      const product = filteredProducts.find(p => p.id_prod === id_prod);
      if (!product) throw new Error('Producto no encontrado');

      const response = await axios.get(`http://localhost:5000/api/lotes/${id_prod}`);
      if (!response.data) throw new Error('No se recibieron datos de lotes');

      setProductoLotes(response.data);
      setSelectedProduct(product); //Guarda el producto para usar en el modal
      setShowLotesModal(true);
    } catch (err) {
      console.error(err);
      alert(`Error al cargar lotes: ${err.message}`);
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
          <button 
            onClick={async () => {
              if (window.confirm('¿Estás seguro de actualizar todos los stocks?')) {
                try {
                  const response = await axios.post(
                    'http://localhost:5000/api/productos/actualizar-stocks'
                  );
                  alert(`✅ ${response.data.message}`);
                  // Refrescar productos...
                } catch (error) {
                  console.error('Error completo:', error);
                  alert(`❌ Error: ${error.response?.data?.error || error.message}`);
                }
              }
            }}
          >
            Actualizar Stocks
          </button>

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
            onClick={() => {
              if (!selectedProductId) {
                alert('Selecciona un producto primero');
                return;
              }
              setShowEliminarLotes(true);
            }}
            className="side-menu-btn delete-btn"
          >
            Eliminar Lotes
          </button>

          <button 
            onClick={() => navigate('/reportes')}
            className="side-menu-btn stats-btn"
          >
            <i className="fas fa-chart-bar"></i> Estadísticas
          </button>
          
          <button 
            onClick={exportToExcel}
            className="side-menu-btn export-btn"
          >
            Exportar a Excel
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
                  placeholder="Buscar por código, nombre, categoría o unidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="sort-options-container">
                <div className="sort-select-wrapper">
                  <select 
                    value={selectedSortKey} 
                    onChange={handleSortChange}
                    className="sort-select"
                  >
                    <option value="id_prod">Por Código</option>
                    <option value="nombre">Por Nombre</option>
                    <option value="marca">Por Marca</option>
                    <option value="nombre_categ">Por Categoría</option>
                    <option value="precio_prod">Por Precio</option>
                  </select>
                  <button 
                    onClick={toggleSortOrder}
                    className="sort-order-btn"
                    aria-label={`Orden ${sortOrder === 'asc' ? 'ascendente' : 'descendente'}`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
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
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th>Unidad</th>
                    <th>Stock</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id_prod}
                      /* 1-clic: sólo selecciona */
                      onClick={() => handleRowClick(product.id_prod)}
                      /* 2-clic: abre lotes (y de paso también queda seleccionado) */
                      onDoubleClick={() => handleShowLotes(product.id_prod)}
                      className={selectedProductId === product.id_prod ? 'selected-row' : ''}
                    >
                      <td>{product.id_prod}</td>
                      <td>{product.nombre}</td>
                      <td>{product.marca}</td>
                      <td>{product.nombre_categ}</td>
                      <td>{product.unid_medida}</td>
                      <td>{product.stock_prod}</td>
                      <td>S/.{Number(product.precio_prod).toFixed(2)}</td>
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
                <label>Marca:</label>
                <input
                  type="text"
                  value={newProduct.marca}
                  onChange={(e) => setNewProduct({...newProduct, marca: e.target.value})}
                  placeholder="Marca del producto"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Categoría:</label>
                {isLoadingCategorias ? (
                  <p>Cargando categorías...</p>
                ) : (
                  <select
                    value={newProduct.id_categ}
                    onChange={(e) => setNewProduct({...newProduct, id_categ: e.target.value})}
                    required
                  >
                    <option value="">Seleccione categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id_categ} value={categoria.id_categ}>
                        {categoria.nombre_categ}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="form-group">
                <label>Unidad de Medida:</label>
                <select
                  value={newProduct.unid_medida}
                  onChange={(e) => setNewProduct({...newProduct, unid_medida: e.target.value})}
                  required
                >
                  <option value="">Seleccione unidad</option>
                  <option value="Caja">Caja</option>
                  <option value="Sixpack">Sixpack</option>
                  <option value="Bolsa">Bolsa</option>
                  <option value="Paquete">Paquete</option>
                  <option value="Frasco">Frasco</option>
                  <option value="Botella">Botella</option>
                  <option value="Lata">Lata</option>
                  <option value="Por Kilo">Por Kilo</option>
                </select>
              </div>
              
              {/**<div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  min="1"
                  value={newProduct.stock_prod || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setNewProduct({
                      ...newProduct,
                      stock_prod: isNaN(value) ? '' : value
                    });
                  }}
                  required
                  placeholder="Stock del producto"
                />
              </div>*/}

              <div className="form-group">
                <label>Precio Unitario (S/.):</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newProduct.precio_prod || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setNewProduct({
                      ...newProduct,
                      precio_prod: isNaN(value) ? '' : value
                    });
                  }}
                  required
                  placeholder="Precio del producto"
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
              <p>Código: {selectedProduct.id_prod} | Marca: {selectedProduct.marca}</p>
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
              <h3>Reabastecer Producto</h3>
              <p>Producto: <strong>{selectedProduct?.nombre}</strong></p>
              <p>Código: <strong>{selectedProduct?.id_prod}</strong></p>
              
              <div className="form-group">
                <label>ID Lote:</label>
                <input
                  type="text"
                  value={newLote.id_lote}
                  onChange={(e) => setNewLote({...newLote, id_lote: e.target.value})}
                  placeholder="ID de Lote"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  value={newLote.cantidad_lote || ''}
                  onChange={(e) => setNewLote({...newLote, cantidad_lote: parseInt(e.target.value)})}
                  placeholder="Cantidad de Lote"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Fecha de Caducidad:</label>
                <input
                  type="date"
                  value={newLote.fecha_caducidad}
                  onChange={(e) => setNewLote({...newLote, fecha_caducidad: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]} // Fecha mínima hoy
                />
              </div>
              
              <div className="modal-buttons">
                <button 
                  onClick={handleRestock}
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

        {/* Modal para mostrar lotes */}
        {showLotesModal && (
          <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: '800px' }}>
              <div className="product-header">
                <h3>Lotes del Producto: {selectedProduct?.nombre || selectedProductId}</h3>
                {selectedProduct && (
                  <div className="product-total-price">
                    Precio Total: S/.{(selectedProduct.stock_prod * selectedProduct.precio_prod).toFixed(2)}
                  </div>
                )}
              </div>
              
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID Lote</th>
                    <th>Cantidad</th>
                    <th>Fecha Caducidad</th>
                    <th>Días Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {productoLotes.map((lote) => (
                    <tr key={lote.id_lote}>
                      <td>{lote.id_lote}</td>
                      <td>{lote.cantidad_lote}</td>
                      <td>{new Date(lote.fecha_caducidad).toLocaleDateString()}</td>
                      <td>
                        {Math.floor(
                          (new Date(lote.fecha_caducidad) - new Date()) / (1000 * 60 * 60 * 24)
                        )} días
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="modal-buttons">
                <button 
                  onClick={() => {
                    setShowLotesModal(false);
                    setSelectedProduct(null);
                  }}
                  className="modal-cancel-btn"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal para eliminar lotes */}
        {showEliminarLotes && (
          <EliminarLotes
            productId={selectedProductId}
            productName={products.find(p => p.id_prod === selectedProductId)?.nombre}
            onClose={(updatedProducts) => {
              if (updatedProducts) {
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);
              }
              setShowEliminarLotes(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Menu;