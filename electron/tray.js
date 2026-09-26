"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTray = setupTray;
var electron_1 = require("electron");
var main_1 = require("./main");
var tray = null;
function setupTray() {
    // Create a simple 16x16 icon programmatically
    var iconSize = 16;
    var icon = electron_1.nativeImage.createEmpty();
    // Use a simple built-in approach: create from buffer
    var canvas = Buffer.alloc(iconSize * iconSize * 4);
    for (var y = 0; y < iconSize; y++) {
        for (var x = 0; x < iconSize; x++) {
            var i = (y * iconSize + x) * 4;
            // Draw a small diamond/charm shape
            var cx = iconSize / 2;
            var cy = iconSize / 2;
            var dist = Math.abs(x - cx) + Math.abs(y - cy);
            if (dist < 6) {
                canvas[i] = 139; // R (purple)
                canvas[i + 1] = 92; // G
                canvas[i + 2] = 246; // B
                canvas[i + 3] = 255; // A
            }
            else {
                canvas[i + 3] = 0; // transparent
            }
        }
    }
    var trayIcon = electron_1.nativeImage.createFromBuffer(canvas, {
        width: iconSize,
        height: iconSize,
    });
    tray = new electron_1.Tray(trayIcon);
    tray.setToolTip('DeskCharm');
    var contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'DeskCharm',
            enabled: false,
        },
        { type: 'separator' },
        {
            label: 'Show Charm',
            click: function () { return (0, main_1.showMainWindow)(); },
        },
        {
            label: 'Hide Charm',
            click: function () { return (0, main_1.hideMainWindow)(); },
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: function () { return electron_1.app.quit(); },
        },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', function () {
        var win = (0, main_1.getMainWindow)();
        if (win === null || win === void 0 ? void 0 : win.isVisible()) {
            (0, main_1.hideMainWindow)();
        }
        else {
            (0, main_1.showMainWindow)();
        }
    });
}
