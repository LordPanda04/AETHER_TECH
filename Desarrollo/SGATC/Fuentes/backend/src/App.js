import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Asegúrate de instalarlo: npm install axios
import Login from './components/Login';
import Menu from './components/Menu'; // Asegúrate de crear este componente
import metroLogo from './images/METRO.png';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

// Componente para la página de login
const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', username);
        navigate('/menu');
      } else {
        setLoginError(response.data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      setLoginError('Error al conectar con el servidor');
      console.error('Error:', error);
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