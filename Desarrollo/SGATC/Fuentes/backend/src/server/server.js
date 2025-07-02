const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a MySQL (usa tus credenciales)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia por tu usuario de MySQL
  password: 'GHMySQL22.11', // Cambia por tu contraseña
  database: 'SistemaGestorAlmacen',
  port: 3306,
});

// Justo después de crear la conexión a la base de datos
db.connect(async (err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');

  // Actualizar todos los stocks al iniciar
  try {
    const [productos] = await db.promise().query(
      'SELECT id_prod FROM productos WHERE activo = 1'
    );

    for (const producto of productos) {
      await db.promise().query(
        `UPDATE productos 
         SET stock_prod = (
           SELECT COALESCE(SUM(cantidad_lote), 0) 
           FROM lote 
           WHERE id_prod = ?
         )
         WHERE id_prod = ?`,
        [producto.id_prod, producto.id_prod]
      );
    }
    console.log(`Stocks actualizados al iniciar para ${productos.length} productos`);
  } catch (err) {
    console.error('Error al actualizar stocks al iniciar:', err);
  }
});

// Middlewares
app.use(cors()); // Permite peticiones desde React
app.use(express.json()); // Para leer datos JSON del frontend

// Ruta de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Consulta segura con parámetros preparados
  const query = 'SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Error en la base de datos' });
    }

    if (results.length > 0) {
      res.json({ success: true, message: 'Login exitoso', user: results[0] });
    } else {
      res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }
  });
});

// Ruta modificada para obtener productos (siempre con stock calculado)
app.get('/api/productos', async (req, res) => {
  try {
    const [results] = await db.promise().query(`
      SELECT 
        p.*, 
        c.nombre_categ,
        (SELECT COALESCE(SUM(l.cantidad_lote), 0) 
         FROM lote l WHERE l.id_prod = p.id_prod) AS stock_prod
      FROM productos p
      JOIN categoria c ON p.id_categ = c.id_categ
      WHERE p.activo = 1
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Modificar la ruta POST /api/productos para no aceptar stock_prod del frontend
app.post('/api/productos', (req, res) => {
  const { id_prod, nombre, marca, id_categ, unid_medida, precio_prod } = req.body;
  
  // Validación de campos (quitamos stock_prod de las validaciones)
  if (!id_prod || !nombre || !marca || !id_categ || !unid_medida || precio_prod === undefined) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const query = `
    INSERT INTO productos 
    (id_prod, nombre, marca, id_categ, unid_medida, stock_prod, precio_prod, activo, descrip) 
    VALUES (?, ?, ?, ?, ?, 0, ?, 1, '')
  `;
  
  db.query(query, 
    [id_prod, nombre, marca, id_categ, unid_medida, precio_prod], 
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al agregar producto' });
      }
      
      // Devolver el producto completo con información de categoría
      const queryComplete = `
        SELECT p.*, c.nombre_categ 
        FROM productos p
        LEFT JOIN categoria c ON p.id_categ = c.id_categ
        WHERE p.id_prod = ?
      `;
      
      db.query(queryComplete, [id_prod], (err, productResult) => {
        if (err || productResult.length === 0) {
          console.error(err);
          return res.status(500).json({ error: 'Error al recuperar producto insertado' });
        }
        
        res.json(productResult[0]);
      });
    }
  );
});

// Nueva ruta para obtener lotes por producto
app.get('/api/lotes/:id_prod', (req, res) => {
  const { id_prod } = req.params;
  const query = `
    SELECT * FROM lote 
    WHERE id_prod = ?
    ORDER BY fecha_caducidad ASC
  `;
  db.query(query, [id_prod], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener lotes' });
    }
    res.json(results);
  });
});

// Ruta para obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  const query = 'SELECT * FROM categoria ORDER BY nombre_categ';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }
    res.json(results);
  });
});

// Ruta para agregar un nuevo producto
app.post('/api/productos', (req, res) => {
  const { id_prod, nombre, marca, id_categ, unid_medida, stock_prod, precio_prod } = req.body;
  
  // Validación de campos
  if (!id_prod || !nombre || !marca || !id_categ || !unid_medida || stock_prod === undefined || precio_prod === undefined) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const query = `
    INSERT INTO productos 
    (id_prod, nombre, marca, id_categ, unid_medida, stock_prod, precio_prod, activo, descrip) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, '')
  `;
  
  db.query(query, 
    [id_prod, nombre, marca, id_categ, unid_medida, stock_prod, precio_prod], 
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al agregar producto' });
      }
      
      // Devolver el producto completo con información de categoría
      const queryComplete = `
        SELECT p.*, c.nombre_categ 
        FROM productos p
        LEFT JOIN categoria c ON p.id_categ = c.id_categ
        WHERE p.id_prod = ?
      `;
      
      db.query(queryComplete, [id_prod], (err, productResult) => {
        if (err || productResult.length === 0) {
          console.error(err);
          return res.status(500).json({ error: 'Error al recuperar producto insertado' });
        }
        
        res.json(productResult[0]);
      });
    }
  );
});

// Ruta para agregar un nuevo lote
app.post('/api/lotes', async (req, res) => {
  const { id_lote, cantidad_lote, fecha_caducidad, id_prod } = req.body;

  console.log("Datos recibidos:", req.body);

  // Validación más robusta
  if (!id_lote || !cantidad_lote || !fecha_caducidad || !id_prod) {
    return res.status(400).json({ 
      error: 'Faltan campos obligatorios',
      detalles: {
        recibido: req.body,
        requerido: ['id_lote', 'cantidad_lote', 'fecha_caducidad', 'id_prod']
      }
    });
  }

  try {
    // 1. Insertar el lote
    await db.promise().query(
      `INSERT INTO lote (id_lote, cantidad_lote, fecha_caducidad, id_prod, fecha_ingreso)
       VALUES (?, ?, ?, ?, CURDATE())`,
      [id_lote, cantidad_lote, fecha_caducidad, id_prod]
    );

    // 2. Actualizar stock del producto
    await db.promise().query(
      `UPDATE productos 
       SET stock_prod = (
         SELECT COALESCE(SUM(cantidad_lote), 0) 
         FROM lote 
         WHERE id_prod = ?
       )
       WHERE id_prod = ?`,
      [id_prod, id_prod]
    );

    res.json({ 
      success: true,
      message: 'Lote agregado y stock actualizado'
    });

  } catch (err) {
    console.error('Error completo:', {
      mensaje: err.message,
      codigo: err.code,
      stack: err.stack
    });
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El ID de lote ya existe' });
    }
    
    res.status(500).json({ 
      error: 'Error en el servidor',
      detalles: err.message 
    });
  }
});

// Ruta para obtener el último ID de producto
app.get('/api/productos/ultimo-id', (req, res) => {
  const query = `
    SELECT id_prod 
    FROM productos 
    ORDER BY 
      CAST(SUBSTRING(id_prod, 5) AS UNSIGNED) DESC, 
      id_prod DESC
    LIMIT 1
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener último ID de producto' });
    }
    
    const ultimoId = results[0]?.id_prod || null;
    res.json({ ultimoId });
  });
});

//Ruta para eliminar lote
app.delete('/api/lotes/:id_lote', async (req, res) => {
  const { id_lote } = req.params;
  
  try {
    // 1. Obtener el producto asociado al lote
    const [lote] = await db.promise().query(
      'SELECT id_prod FROM lote WHERE id_lote = ?',
      [id_lote]
    );

    if (lote.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Lote no encontrado' 
      });
    }

    const id_prod = lote[0].id_prod;

    // 2. Eliminar el lote
    await db.promise().query(
      'DELETE FROM lote WHERE id_lote = ?',
      [id_lote]
    );

    // 3. Actualizar stock del producto
    await db.promise().query(
      `UPDATE productos 
       SET stock_prod = (
         SELECT COALESCE(SUM(cantidad_lote), 0) 
         FROM lote 
         WHERE id_prod = ?
       )
       WHERE id_prod = ?`,
      [id_prod, id_prod]
    );

    res.json({ 
      success: true,
      message: 'Lote eliminado y stock actualizado'
    });
  } catch (err) {
    console.error('Error al eliminar lote:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error del servidor' 
    });
  }
});

// Ruta para actualizar stocks - server.js
app.post('/api/productos/actualizar-stocks', async (req, res) => {
  try {
    const [productos] = await db.promise().query(
      'SELECT id_prod FROM productos WHERE activo = 1'
    );

    let actualizados = 0;
    for (const producto of productos) {
      await db.promise().query(
        `UPDATE productos 
         SET stock_prod = (
           SELECT COALESCE(SUM(cantidad_lote), 0) 
           FROM lote 
           WHERE id_prod = ?
         )
         WHERE id_prod = ?`,
        [producto.id_prod, producto.id_prod]
      );
      actualizados++;
    }

    res.json({
      success: true,
      message: `Stocks actualizados para ${actualizados} productos`,
      count: actualizados
    });
  } catch (err) {
    console.error('Error al actualizar stocks:', err);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar stocks',
      details: err.message
    });
  }
});

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});