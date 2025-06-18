const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

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

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});