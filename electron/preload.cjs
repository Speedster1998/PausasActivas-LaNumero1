const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Función para que React escuche cuando debe iniciar la pausa
  onIniciarPausa: (callback) => ipcRenderer.on('iniciar-pausa', callback),
  responderAlerta: (accion) => ipcRenderer.send('alerta-respuesta', accion),
  guardarConfiguracion: (config) => ipcRenderer.send('guardar-configuracion', config)
});