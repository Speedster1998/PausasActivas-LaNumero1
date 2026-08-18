const { app, BrowserWindow, Notification, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let alertWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 850,
        height: 650,
        minWidth: 700,
        minHeight: 500,
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
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

function createAlertWindow() {
  if (alertWindow) return;

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const alertWidth = 360;
  const alertHeight = 115;

  alertWindow = new BrowserWindow({
    width: alertWidth,
    height: alertHeight,
    x: screenWidth - alertWidth - 20,
    y: screenHeight - alertHeight - 20,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    alertWindow.loadURL('http://localhost:5173/#/alert'); // O http://localhost:5173/alert según tu router
  } else {
    alertWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'alert' });
  }

  alertWindow.once('ready-to-show', () => {
    alertWindow.show();
  });

  alertWindow.on('closed', () => {
    alertWindow = null;
  });
}

// --- SISTEMA DE NOTIFICACIONES Y PROGRAMACION ---
let pauseTimeout = null;
let currentConfig = { remindersEnabled: false, reminderTime: 5 };

function programarSiguientePausa() {
  if (pauseTimeout) clearTimeout(pauseTimeout);
  if (!currentConfig.remindersEnabled) {
    console.log("Recordatorios desactivados.");
    return;
  }

  const ahora = new Date();
  // La pausa es a las 3:15 p.m. (15:15)
  let fechaPausa = new Date();
  fechaPausa.setHours(15, 15, 0, 0);

  // Restamos el tiempo de anticipación (reminderTime) en minutos
  fechaPausa.setMinutes(fechaPausa.getMinutes() - currentConfig.reminderTime);

  // Si la hora calculada ya pasó hoy, programamos para mañana
  if (ahora.getTime() > fechaPausa.getTime()) {
    fechaPausa.setDate(fechaPausa.getDate() + 1);
  }

  const tiempoRestante = fechaPausa.getTime() - ahora.getTime();
  console.log(`Próxima notificación en ${Math.round(tiempoRestante / 60000)} minutos.`);

  pauseTimeout = setTimeout(() => {
    createAlertWindow(); // Mostramos el AlertBanner
    programarSiguientePausa(); // Reprogramamos para el siguiente día
  }, tiempoRestante);
}

ipcMain.on('guardar-configuracion', (event, config) => {
  currentConfig = config;
  console.log('Nueva configuración recibida desde Settings:', currentConfig);
  programarSiguientePausa();
});

// Escuchar respuesta desde el componente AlertBanner
ipcMain.on('alerta-respuesta', (event, accion) => {
  if (alertWindow) {
    alertWindow.close();
    alertWindow = null;
  }

  if (accion === 'iniciar') {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('iniciar-pausa');
    }
  } else if (accion === 'posponer') {
    console.log("Pausa pospuesta 5 minutos");
    setTimeout(() => {
      createAlertWindow();
    }, 5 * 60 * 1000);
  }
});