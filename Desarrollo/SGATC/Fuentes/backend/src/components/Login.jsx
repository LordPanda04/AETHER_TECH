import React, { useState } from 'react';
import './Login.css';

const Login = ({ logo, onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          <img src={logo} alt="Logo Metro" className="metro-logo" />
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="field-label">Usuario:</label>
            <input
              type="text"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
            />
          </div>
          
          <div className="form-field">
            <label className="field-label">Contraseña:</label>
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;