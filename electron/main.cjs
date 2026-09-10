const { app, BrowserWindow, Notification, screen, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let alertWindow = null;
let tray = null;
let isQuitting = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 662,
    minWidth: 600,
    minHeight: 562,
    show: false,
    autoHideMenuBar: true, // Oculta la barra superior de "Archivo, Editar, Ver..."
    icon: path.join(__dirname, '../public/favicon.ico'),
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

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/favicon.ico'); // Asegúrate de tener este icono
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Abrir Pausas Activas', 
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      } 
    },
    { type: 'separator' },
    { 
      label: 'Cerrar por completo', 
      click: () => {
        isQuitting = true;
        app.quit();
      } 
    }
  ]);

  tray.setToolTip('Pausas Activas - La Número 1');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// Cierra el programa cuando se cierran las ventanas (estándar de Windows)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(() => {
  const isHidden = process.argv.includes('--hidden');

  createWindow();
  createTray();

  // Si el usuario abrió la app manualmente (no viene con --hidden), la mostramos
  if (!isHidden && mainWindow) {
    mainWindow.show();
  }

  // Registramos el autoarranque pasando el flag --hidden para Windows
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    args: ['--hidden']
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      mainWindow.show();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

function createAlertWindow(isSnoozed = false) {
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
  const hash = isSnoozed ? 'alert?snoozed=true' : 'alert';
  
  if (isDev) {
    alertWindow.loadURL(`http://localhost:5173/#/${hash}`); // O http://localhost:5173/alert según tu router
  } else {
    alertWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash });
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
let currentConfig = { remindersEnabled: false, reminderTime: 5, snoozeTime: 0 };

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
    const snoozeTime = currentConfig.snoozeTime || 0;
    if (snoozeTime > 0) {
      console.log(`Pausa pospuesta ${snoozeTime} minutos`);
      setTimeout(() => {
        createAlertWindow(true);
      }, snoozeTime * 60 * 1000);
    } else {
      console.log("Pausa pospuesta cancelada (Nunca)");
    }
  }
});