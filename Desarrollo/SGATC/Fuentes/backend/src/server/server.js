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
  password: 'root', // Cambia por tu contraseña
  database: 'SistemaGestorAlmacen',
  port: 3306,
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

// Ruta para obtener productos con categorías
app.get('/api/productos', (req, res) => {
  const query = `
    SELECT p.*, c.nombre_categ 
    FROM productos p
    JOIN categoria c ON p.id_categ = c.id_categ
    WHERE p.activo = 1
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(results);
  });
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

app.get('/api/productos/completos', (req, res) => {
  const query = `
    SELECT p.*, c.nombre_categ 
    FROM productos p
    JOIN categoria c ON p.id_categ = c.id_categ
    WHERE p.activo = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener productos completos' });
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
app.delete('/api/lotes/:id_lote', (req, res) => {
  const { id_lote } = req.params;
  const sql = 'DELETE FROM lote WHERE id_lote = ?';
  db.query(sql, [id_lote], (err, result) => {
    if (err) {
      console.error('Error al eliminar lote:', err);
      return res.status(500).json({ success: false, error: 'Error del servidor' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Lote no encontrado' });
    }
    res.json({ success: true });
  });
});


// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});