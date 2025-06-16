require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Configuración básica
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'gestion_almacen',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Middleware para conectar a la base de datos
app.use(async (req, res, next) => {
  try {
    req.db = await pool.getConnection();
    next();
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).json({ error: 'Error de conexión a la base de datos' });
  }
});

// Middleware para liberar conexiones
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.db) req.db.release();
  });
  next();
});

// Helper para ejecutar consultas
const query = async (sql, params, db) => {
  try {
    const [results] = await (db || pool).execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error en consulta SQL:', error);
    throw error;
  }
};

// ==============================================
// ENDPOINTS PARA PRODUCTOS
// ==============================================

// Obtener todos los productos con información de categoría
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await query(`
      SELECT 
        p.producto_id as id,
        p.codigo_barras as codigo,
        p.nombre,
        p.descripcion,
        p.unidad_medida,
        p.precio_venta,
        c.nombre as categoria,
        COALESCE(SUM(i.cantidad), 0) as cantidad,
        (SELECT lote FROM inventario WHERE producto_id = p.producto_id LIMIT 1) as lote,
        (SELECT fecha_caducidad FROM inventario WHERE producto_id = p.producto_id LIMIT 1) as fvencimiento
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN inventario i ON p.producto_id = i.producto_id
      WHERE p.activo = 1
      GROUP BY p.producto_id
    `);
    
    res.json(productos.map(p => ({
      ...p,
      fvencimiento: p.fvencimiento || '---',
      tipodeguardado: p.categoria || 'General'
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
});

// Agregar nuevo producto
app.post('/api/productos', async (req, res) => {
  const { nombre, lote, fvencimiento, tipodeguardado, cantidad } = req.body;
  
  try {
    // Obtener ID de categoría
    const [categoria] = await query(
      'SELECT categoria_id FROM categorias WHERE nombre LIKE ? LIMIT 1', 
      [`%${tipodeguardado}%`]
    );
    
    const categoriaId = categoria?.categoria_id || 1; // Default
    
    // Insertar producto
    const codigo = `PROD-${Date.now().toString().slice(-6)}`;
    const { insertId } = await query(
      `INSERT INTO productos 
       (nombre, codigo_barras, categoria_id, unidad_medida, precio_compra, precio_venta, stock_minimo, stock_maximo, activo)
       VALUES (?, ?, ?, 'unidad', 0, 0, 0, 100, 1)`,
      [nombre, codigo, categoriaId]
    );
    
    // Insertar en inventario
    await query(
      `INSERT INTO inventario 
       (producto_id, ubicacion_id, cantidad, lote, fecha_caducidad)
       VALUES (?, 1, ?, ?, ?)`,
      [insertId, cantidad, lote, fvencimiento === '---' ? null : fvencimiento]
    );
    
    res.status(201).json({ 
      id: insertId,
      codigo,
      message: 'Producto agregado correctamente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error agregando producto' });
  }
});

// Eliminar producto (marcar como inactivo)
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await query(
      'UPDATE productos SET activo = 0 WHERE producto_id = ?',
      [id]
    );
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando producto' });
  }
});

// Actualizar inventario (reabastecer)
app.put('/api/inventario/:productoId', async (req, res) => {
  const { productoId } = req.params;
  const { cantidad } = req.body;
  
  try {
    await query(
      `UPDATE inventario 
       SET cantidad = cantidad + ? 
       WHERE producto_id = ?`,
      [cantidad, productoId]
    );
    
    res.json({ message: 'Inventario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando inventario' });
  }
});

// ==============================================
// ENDPOINTS PARA CATEGORÍAS
// ==============================================

app.get('/api/categorias', async (req, res) => {
  try {
    const categorias = await query('SELECT * FROM categorias');
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
});

// ==============================================
// ENDPOINTS PARA REPORTES
// ==============================================

// Obtener productos bajos en stock
app.get('/api/reportes/stock-bajo', async (req, res) => {
  try {
    const productos = await query(`
      SELECT 
        p.producto_id,
        p.nombre,
        p.stock_minimo,
        COALESCE(SUM(i.cantidad), 0) as stock_actual
      FROM productos p
      LEFT JOIN inventario i ON p.producto_id = i.producto_id
      WHERE p.activo = 1
      GROUP BY p.producto_id
      HAVING stock_actual < p.stock_minimo OR stock_actual = 0
    `);
    
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo reporte de stock bajo' });
  }
});

// ==============================================
// ENDPOINTS PARA UBICACIONES
// ==============================================

app.get('/api/ubicaciones', async (req, res) => {
  try {
    const ubicaciones = await query('SELECT * FROM ubicaciones');
    res.json(ubicaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo ubicaciones' });
  }
});

// ==============================================
// INICIALIZACIÓN DEL SERVIDOR
// ==============================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

process.on('SIGINT', () => {
  pool.end();
  process.exit();
});