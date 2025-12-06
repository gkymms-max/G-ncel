const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      enableRemoteModule: true,
      partition: 'persist:main'
    },
    icon: path.join(__dirname, 'build/icon.png'),
    title: 'Fiyat Teklifi Yönetim Sistemi',
    backgroundColor: '#ffffff',
    show: false
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Remove X-Frame-Options for all sessions
  const setupSession = (sessionName) => {
    const ses = session.fromPartition(sessionName);
    ses.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'X-Frame-Options': null,
          'Content-Security-Policy': null,
          'X-Content-Security-Policy': null
        }
      });
    });
  };

  // Setup main session
  setupSession('persist:main');
  
  // Setup default session
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'X-Frame-Options': null,
        'Content-Security-Policy': null
      }
    });
  });

  // Handle channel-specific sessions
  ipcMain.on('setup-channel-session', (event, channelId) => {
    setupSession(`persist:channel_${channelId}`);
  });

  // Load the app
  const serverUrl = isDev 
    ? 'http://localhost:3000'
    : 'https://bizquoter-1.preview.emergentagent.com';
  
  mainWindow.loadURL(serverUrl);

  // Open DevTools in development only
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
