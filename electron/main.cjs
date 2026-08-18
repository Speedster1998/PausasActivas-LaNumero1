const { app, BrowserWindow, Notification } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        autoHideMenuBar: true, // Oculta la barra superior de "Archivo, Editar, Ver..."
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    // Si estamos en desarrollo, carga Vite (localhost). En producción, carga los archivos generados.
    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// Cierra el programa cuando se cierran las ventanas (estándar de Windows)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function iniciarTemporizadorPrueba() {
  console.log("Temporizador iniciado: Esperando 10 segundos...");
  
  // Usamos 10 segundos (10000 milisegundos) solo para probar
  setTimeout(() => {
    mostrarNotificacion();
  }, 10000);
}

function mostrarNotificacion() {
  // Verificamos si el sistema operativo soporta notificaciones
  if (Notification.isSupported()) {
    const notificacion = new Notification({
      title: '¡Pausa Activa!',
      body: 'Es momento de tomarte un respiro, estirarte y relajarte. ¿Deseas hacer la pausa activa?'
    });

    notificacion.show();

    // Opcional: Si el usuario hace clic en la notificación, traemos la app al frente
    notificacion.on('click', () => {
      // 1. Si la ventana estaba minimizada o de fondo, la traemos al frente
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        
        // 2. Le gritamos a React: "¡Inicia la pausa!"
        mainWindow.webContents.send('iniciar-pausa');
      }
    });
  } else {
    console.log("Las notificaciones no están soportadas en este sistema.");
  }
}

app.whenReady().then(() => {
  createWindow(); // Tu función que crea la ventana
  
  iniciarTemporizadorPrueba(); // <--- ¡Agrega esta línea!
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});