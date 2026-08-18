const { contextBridge, ipcRenderer } = require('electron');

// Exponemos un objeto llamado "electron" a la ventana (React)
contextBridge.exposeInMainWorld('electron', {
  // Función para que React escuche cuando debe iniciar la pausa
  onIniciarPausa: (callback) => ipcRenderer.on('iniciar-pausa', callback)
});