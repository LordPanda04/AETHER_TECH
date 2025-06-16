import React from 'react';
import Login from './Login';
import metroLogo from '../images/METRO.png';

function App() {
  // Base de datos local de usuarios (¡NO seguro para producción!)
  const validUsers = [
    { username: "admin", password: "metro123" },
    { username: "usuario1", password: "clave123" },
  ];

  const handleLogin = (username, password) => {
    // Verifica si el usuario y contraseña coinciden
    const isValidUser = validUsers.some(
      (user) => user.username === username && user.password === password
    );

    if (isValidUser) {
      console.log("¡Login exitoso!");
      // Redirige o cambia el estado de la aplicación (ej: mostrar dashboard)
      alert("Bienvenido, " + username + "!");
    } else {
      console.log("Credenciales incorrectas");
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="App">
      <Login 
        logo={metroLogo} 
        onLogin={handleLogin} 
      />
    </div>
  );
}

export default App;