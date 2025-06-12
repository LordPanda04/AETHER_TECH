import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Menu from './components/Menu';
import metroLogo from './images/METRO.png';

const App = () => {
  const [auth, setAuth] = useState(() => {
    // Inicializa el estado de autenticación desde localStorage
    return {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      user: localStorage.getItem('currentUser') || null
    };
  });

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setAuth={setAuth} />} />
        <Route 
          path="/menu" 
          element={
            <PrivateRoute auth={auth}>
              <Menu auth={auth} setAuth={setAuth} />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

const LoginPage = ({ setAuth }) => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  const validUsers = [
    { username: "admin", password: "metro123" },
    { username: "usuario1", password: "clave123" },
    { username: "ola", password: "123" },
  ];

  const handleLogin = (username, password) => {
    setLoginError(''); // Resetea errores previos
    
    const user = validUsers.find(
      user => user.username === username && user.password === password
    );

    if (user) {
      setAuth({
        isAuthenticated: true,
        user: username
      });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', username);
      navigate('/menu');
    } else {
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

const PrivateRoute = ({ auth, children }) => {
  return auth.isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default App;