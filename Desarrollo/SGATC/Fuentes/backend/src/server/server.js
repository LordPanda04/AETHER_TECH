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

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});