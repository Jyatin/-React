"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainWindow = getMainWindow;
exports.showMainWindow = showMainWindow;
exports.hideMainWindow = hideMainWindow;
var electron_1 = require("electron");
var tray_1 = require("./tray");
var ipc_1 = require("./ipc");
var store_1 = require("./store");
var path_1 = require("path");
var mainWindow = null;
var isDev = !electron_1.app.isPackaged;
function createMainWindow() {
    var store = (0, store_1.getStore)();
    var display = electron_1.screen.getPrimaryDisplay();
    var screenWidth = display.workAreaSize.width;
    var windowWidth = 400;
    var windowHeight = 500;
    var posX = store.get('desktop.positionX', -1);
    var posY = store.get('desktop.positionY', 0);
    // Center horizontally on first launch
    if (posX < 0) {
        posX = Math.round((screenWidth - windowWidth) / 2);
    }
    var win = new electron_1.BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: posX,
        y: posY,
        frame: false,
        transparent: true,
        alwaysOnTop: store.get('desktop.alwaysOnTop', true),
        skipTaskbar: true,
        resizable: false,
        hasShadow: false,
        focusable: true,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
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
    }
    else {
        win.loadFile(path_1.default.join(__dirname, '..', '..', 'renderer', 'index.html'));
    }
    win.on('closed', function () {
        mainWindow = null;
    });
    win.on('moved', function () {
        if (mainWindow) {
            var _a = mainWindow.getPosition(), x = _a[0], y = _a[1];
            store.set('desktop.positionX', x);
            store.set('desktop.positionY', y);
        }
    });
    return win;
}
function getMainWindow() {
    return mainWindow;
}
function showMainWindow() {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
    }
    else {
        mainWindow = createMainWindow();
    }
}
function hideMainWindow() {
    if (mainWindow) {
        mainWindow.hide();
    }
}
electron_1.app.whenReady().then(function () {
    mainWindow = createMainWindow();
    (0, ipc_1.setupIpc)();
    (0, tray_1.setupTray)();
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createMainWindow();
        }
    });
});
electron_1.app.on('window-all-closed', function () {
    // On macOS, keep app running when all windows are closed
    if (process.platform !== 'darwin') {
        // Don't quit — tray keeps app alive
    }
});
