import './App.css';
import logo from './images/METRO.png';
import Login from './components/login.jsx';
import React, { useState, ChangeEvent } from 'react';

function App() {
  return (
    <div className="App">
      <Login /> {/* Solo renderiza el componente Login */}
    </div>
  );
}

export default App;