import React, { useState } from 'react';
import Axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import metroLogo from './images/METRO.png';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

// Componente para la página de login
const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  // Base de datos local de usuarios (¡NO seguro para producción!)
  const validUsers = [
    { username: "admin", password: "metro123" },
    { username: "usuario1", password: "clave123" },
    { username: "ola", password: "123" },
  ];

  const handleLogin = (username, password) => {
    // Verifica si el usuario y contraseña coinciden
    const isValidUser = validUsers.some(
      (user) => user.username === username && user.password === password
    );

    if (isValidUser) {
      console.log("¡Login exitoso!");
      // Guarda el estado de autenticación (puedes usar localStorage para persistencia)
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', username);
      navigate(''); // Redirige al dashboard
    } else {
      console.log("Credenciales incorrectas");
      setLoginError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="App">
      <Login 
        logo={metroLogo} 
        onLogin={handleLogin} 
        error={loginError}
      />
    </div>
  );
};

// Componente para rutas privadas (protegidas por autenticación)
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default App;