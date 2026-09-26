import { app, BrowserWindow, screen } from 'electron';
import { setupTray } from './tray';
import { setupIpc } from './ipc';
import { getStore } from './store';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createMainWindow(): BrowserWindow {
  const store = getStore();
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.bounds;

  const win = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: store.get('desktop.alwaysOnTop', true) as boolean,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Remove menu bar
  win.setMenu(null);

  // Allow clicks to pass through transparent areas
  win.setIgnoreMouseEvents(false);

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'));
  }

  win.on('closed', () => {
    mainWindow = null;
  });

  win.on('moved', () => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      store.set('desktop.positionX', x);
      store.set('desktop.positionY', y);
    }
  });

  return win;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function showMainWindow(): void {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  } else {
    mainWindow = createMainWindow();
  }
}

export function hideMainWindow(): void {
  if (mainWindow) {
    mainWindow.hide();
  }
}

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  setupIpc();
  setupTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running when all windows are closed
  if (process.platform !== 'darwin') {
    // Don't quit — tray keeps app alive
  }
});
