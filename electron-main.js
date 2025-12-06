const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
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

  // Remove X-Frame-Options for all sessions and set user agent
  const setupSession = (sessionName) => {
    const ses = session.fromPartition(sessionName);
    
    // Set user agent for the session
    ses.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Electron/28.0.0');
    
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
  const serverUrl = !app.isPackaged 
    ? 'http://localhost:3000'
    : 'https://quote-desktop.preview.emergentagent.com';
  
  mainWindow.loadURL(serverUrl);

  // Open DevTools in development only
  if (!app.isPackaged) {
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
