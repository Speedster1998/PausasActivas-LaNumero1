import React from 'react';
import './AlertBanner.css';

const AlertBanner = () => {
  const handleAceptar = () => {
    if (window.electron?.responderAlerta) {
      window.electron.responderAlerta('iniciar');
    }
  };

  const handlePosponer = () => {
    if (window.electron?.responderAlerta) {
      window.electron.responderAlerta('posponer');
    }
  };

  return (
    <div className="alert-container">
      <div className="alert-header">
        <span className="alert-title">Haga una Pausa</span>
        <div className='header-divider'></div>
        <img src="./src/images/La_Nro_1_Logo_blanco.png" alt="Logo" className="alert-logo" />
      </div>
      <div className="alert-actions">
        <button className="btn-iniciar" onClick={handleAceptar}>AHORA</button>
        <button className="btn-posponer" onClick={handlePosponer}>POSTERGAR</button>
      </div>
    </div>
  );
};

export default AlertBanner;