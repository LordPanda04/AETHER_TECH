import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    id_prod: '', // Se generará automáticamente
    nombre: '',
    marca: '',
    descrip: '', // Nuevo campo añadido
    id_categ: '',
    unid_medida: '',
    stock_prod: '',
    precio_prod: '',
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
        setProducts(response.data);
        setFilteredProducts(response.data);
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

  const handleRestock = (id_prod, quantity) => {  // Cambiado de id a id_prod
    const updatedProducts = products.map(product => 
      product.id_prod === id_prod ? { ...product, stock_prod: product.stock_prod + quantity } : product
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    setSelectedProductId(null);
    setShowRestockModal(false);
    alert(`Producto reabastecido correctamente. Nueva cantidad: ${updatedProducts.find(p => p.id === id_prod).cantidad}`);
  };

  const handleAddProduct = async () => {
    // Validación de campos (añadir descripción si es requerida)
    if (!newProduct.nombre || !newProduct.marca || !newProduct.id_categ || 
        !newProduct.unid_medida || !newProduct.stock_prod || newProduct.stock_prod < 1 || 
        !newProduct.precio_prod || newProduct.precio_prod <= 0) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      // Generar código automático
      const productCode = await generateProductCode();
      
      // Preparar datos para enviar
      const productToAdd = {
        ...newProduct,
        id_prod: productCode,
        activo: 1 // Producto activo por defecto
        // descrip ya está incluido en ...newProduct
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
        stock_prod: newProduct.stock_prod,
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
        descrip: '',
        id_categ: '',
        unid_medida: '',
        stock_prod: '',
        precio_prod: '',
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
                  placeholder="Buscar por código, nombre, categoría o unidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="sort-select">
                <select value={selectedSortKey} onChange={handleSortChange}>
                  <option value="">— Ordenar por —</option>
                  <option value="nombre_categ">Categoría</option>
                  <option value="marca">Marca (A-Z)</option>
                  <option value="nombre">Nombre (A-Z)</option>
                  <option value="precio_prod">Precio</option>
                </select>
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
                <label>Descripción:</label>
                <textarea
                  value={newProduct.descrip}
                  onChange={(e) => setNewProduct({...newProduct, descrip: e.target.value})}
                  placeholder="Descripción del producto (máx. 60 caracteres)"
                  maxLength="60"
                  rows="3"
                  className="description-input"
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
              
              <div className="form-group">
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
              </div>

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

        {/* Modal para mostrar lotes */}
        {showLotesModal && (
          <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: '800px' }}>
              <h3>Lotes del Producto: {selectedProduct?.nombre || selectedProductId}</h3>

              
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
      </div>
    </div>
  );
};

export default Menu;