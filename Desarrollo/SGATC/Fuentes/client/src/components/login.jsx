import React, { useState } from 'react';
import './login.css';
import metroLogo from '../images/METRO.png';

const Login = () => {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        console.log({
            username,
            password
        });
        // Aquí iría la lógica de autenticación
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="logo-container">
                    <img src={metroLogo} alt="Metro Logo" className="metro-logo" />
                </div>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">USUARIO</label>
                        <input 
                            type="text" 
                            id="username" 
                            placeholder="usuario" 
                            className="login-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">CONTRASEÑA</label>
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="**********" 
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="login-button">
                        INICIAR SESIÓN
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;