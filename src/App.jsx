import { useEffect } from 'react';
import './App.css'
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Settings from './pages/Settings/Settings';
import AlertBanner from './components/AlertBanner/AlertBanner';

const App = () => {
  useEffect(() => {
    if (window.electron?.guardarConfiguracion) {
      const savedEnabled = localStorage.getItem('pausas_remindersEnabled');
      const savedTime = localStorage.getItem('pausas_reminderTime');
      const savedSnooze = localStorage.getItem('pausas_snoozeTime');
      
      const config = {
        remindersEnabled: savedEnabled !== null ? JSON.parse(savedEnabled) : false,
        reminderTime: parseInt(savedTime || '5', 10),
        snoozeTime: parseInt(savedSnooze || '0', 10)
      };
      
      window.electron.guardarConfiguracion(config);
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/alert" element={<AlertBanner />} />
      </Routes>
    </HashRouter>
  );
};

export default App
