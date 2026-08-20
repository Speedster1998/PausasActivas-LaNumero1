import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './AlertBanner.css';

import logoBlanco from '../../images/La_Nro_1_Logo_blanco.png';
import officeWorker from '../../images/office-worker.png';

const AlertBanner = () => {
  const [isSnoozed, setIsSnoozed] = useState(false);
  const snoozeTime = parseInt(localStorage.getItem('pausas_snoozeTime') || '0', 10);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isSecondTime = searchParams.get('snoozed') === 'true';

  const handleAceptar = () => {
    if (window.electron?.responderAlerta) {
      window.electron.responderAlerta('iniciar');
    }
  };

  const handlePosponer = () => {
    setIsSnoozed(true);
    setTimeout(() => {
      if (window.electron?.responderAlerta) {
        window.electron.responderAlerta('posponer');
      }
    }, 10000);
  };

  const handleCerrar = () => {
    if (window.electron?.responderAlerta) {
      window.electron.responderAlerta('cerrar');
    }
  };

  let snoozeText = "";
  if (snoozeTime === 0) {
    snoozeText = "Pospuesto para mañana";
  } else {
    snoozeText = `Pospuesto para ${snoozeTime} minutos`;
  }

  return (
    <div className="alert-container">
      <div className="alert-header">
        <span className="alert-title">Haga una Pausa</span>
        <div className='header-divider'></div>
        <img src={logoBlanco} alt="Logo" className="alert-logo" />
      </div>
      <div className="alert-actions">
        <img src={officeWorker} className='img-office-worker' alt='office-worker' />
        {isSnoozed ? (
          <span className="snooze-message">{snoozeText}</span>
        ) : (
          <>
            <button className="btn-iniciar" onClick={handleAceptar}>INICIAR</button>
            {isSecondTime && snoozeTime > 0 ? (
              <button className="btn-posponer" onClick={handleCerrar}>CERRAR</button>
            ) : (
              <button className="btn-posponer" onClick={handlePosponer}>POSPONER</button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;