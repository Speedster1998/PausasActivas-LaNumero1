import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackCircleOutline } from "react-icons/io5";
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    const saved = localStorage.getItem('pausas_remindersEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem('pausas_reminderTime') || '5';
  });
  const [snoozeTime, setSnoozeTime] = useState(() => {
    return localStorage.getItem('pausas_snoozeTime') || '0';
  });
  const [showFeedback, setShowFeedback] = useState(false);

  const saveConfig = () => {
    // Guardado local
    localStorage.setItem('pausas_remindersEnabled', JSON.stringify(remindersEnabled));
    localStorage.setItem('pausas_reminderTime', reminderTime);
    localStorage.setItem('pausas_snoozeTime', snoozeTime);

    console.log("Configuración guardada localmente:", {
      remindersEnabled,
      reminderTime,
      snoozeTime
    });

    // Comunicar a Electron si está disponible
    if (window.electron?.guardarConfiguracion) {
      window.electron.guardarConfiguracion({
        remindersEnabled,
        reminderTime: parseInt(reminderTime, 10),
        snoozeTime: parseInt(snoozeTime, 10)
      });
    }

    // Mostrar feedback visual
    setShowFeedback(true);
  };

  return (
    <div className="settings-container">
      {/* Botón de retroceso */}
      <button className="back-button" onClick={() => navigate('/')} title="Volver">
        <div className='back-icon'>
          <IoArrowBackCircleOutline />
        </div>
      </button>

      <div className="settings-card">
        <h1 className="settings-title">Configuración</h1>
        
        <div className="settings-option">
          <div className="settings-option-text">
            <h2>Recordatorios</h2>
            <p>Activar notificaciones para las pausas activas.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {remindersEnabled && (
          <div className="settings-option animated-dropdown">
            <div className="settings-option-text">
              <h2>Tiempo de anticipación</h2>
              <p>Las pausas activas son a las 3:15 p.m. ¿Cuánto tiempo antes deseas que te avisemos?</p>
            </div>
            <select 
              className="settings-select"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            >
              <option value="0.5">30 segundos antes</option>
              <option value="1">1 minuto antes</option>
              <option value="5">5 minutos antes</option>
              <option value="10">10 minutos antes</option>
              <option value="30">30 minutos antes</option>
            </select>
          </div>
        )}

        {remindersEnabled && (
          <div className="settings-option animated-dropdown">
            <div className="settings-option-text">
              <h2>Tiempo para posponer</h2>
              <p>¿Cuánto tiempo debe pasar para volver a notificarte si pospones la alerta?</p>
            </div>
            <select 
              className="settings-select"
              value={snoozeTime}
              onChange={(e) => setSnoozeTime(e.target.value)}
            >
              <option value="0">Nunca</option>
              <option value="5">5 minutos después</option>
              <option value="10">10 minutos después</option>
            </select>
          </div>
        )}

        <button className='btn-save' onClick={saveConfig}>Guardar Cambios</button>
      </div>

      {/* Modal de confirmación */}
      {showFeedback && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div class="success-icon-container">
              <svg viewBox="0 0 52 52" class="success-icon-svg">
                <circle class="success-icon-circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="success-icon-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>

            <h2>Cambios realizados</h2>
            <p>La configuración se ha actualizado correctamente.</p>

            <button className="btn-save" onClick={() => setShowFeedback(false)}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;