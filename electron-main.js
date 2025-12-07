const { app, BrowserWindow, BrowserView, session, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let browserViews = {}; // Store browser views for each channel

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
    
    // Set user agent for the session (NO Electron identifier - WhatsApp blocks it)
    ses.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    
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

  // Handle BrowserView creation for channels
  ipcMain.on('create-browser-view', (event, { channelId, url }) => {
    console.log('Creating BrowserView for channel:', channelId, url);
    
    // Remove existing view if any
    if (browserViews[channelId]) {
      mainWindow.removeBrowserView(browserViews[channelId]);
      browserViews[channelId].webContents.destroy();
      delete browserViews[channelId];
    }

    // Create new BrowserView with session partition
    const view = new BrowserView({
      webPreferences: {
        partition: `persist:channel_${channelId}`,
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true
      }
    });

    // Setup session for this view
    setupSession(`persist:channel_${channelId}`);

    // Set bounds - leave space for sidebar (256px = w-64) and header (120px)
    const { width, height } = mainWindow.getBounds();
    view.setBounds({ x: 256, y: 120, width: width - 256, height: height - 120 });
    view.setAutoResize({ width: true, height: true, horizontal: { width: true } });
    
    // Set alwaysOnTop to false so dialogs can appear above
    view.setBackgroundColor('#ffffff');

    // Load URL
    view.webContents.loadURL(url);

    // Store view
    browserViews[channelId] = view;
    mainWindow.addBrowserView(view);

    // Send ready event
    event.reply('browser-view-ready', channelId);
  });

  // Handle BrowserView visibility toggle
  ipcMain.on('show-browser-view', (event, channelId) => {
    console.log('Showing BrowserView:', channelId);
    
    // Hide all views
    Object.values(browserViews).forEach(view => {
      mainWindow.removeBrowserView(view);
    });

    // Show requested view
    if (browserViews[channelId]) {
      mainWindow.addBrowserView(browserViews[channelId]);
      
      // Update bounds - leave space for sidebar (200px) and header (120px)
      const { width, height } = mainWindow.getBounds();
      browserViews[channelId].setBounds({ x: 200, y: 120, width: width - 200, height: height - 120 });
    }
  });

  // Handle BrowserView removal
  ipcMain.on('remove-browser-view', (event, channelId) => {
    console.log('Removing BrowserView:', channelId);
    
    if (browserViews[channelId]) {
      mainWindow.removeBrowserView(browserViews[channelId]);
      browserViews[channelId].webContents.destroy();
      delete browserViews[channelId];
    }
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

  // Update BrowserView bounds on window resize
  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
    Object.values(browserViews).forEach(view => {
      view.setBounds({ x: 200, y: 120, width: width - 200, height: height - 120 });
    });
  });

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
