"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var ipc_channels_1 = require("../src/shared/ipc-channels");
var api = {
    getSettings: function () { return electron_1.ipcRenderer.invoke(ipc_channels_1.IPC_CHANNELS.GET_SETTINGS); },
    saveSettings: function (settings) { return electron_1.ipcRenderer.invoke(ipc_channels_1.IPC_CHANNELS.SAVE_SETTINGS, settings); },
    selectImage: function () { return electron_1.ipcRenderer.invoke(ipc_channels_1.IPC_CHANNELS.SELECT_IMAGE); },
    setStartup: function (enabled) { return electron_1.ipcRenderer.invoke(ipc_channels_1.IPC_CHANNELS.SET_STARTUP, enabled); },
    quitApp: function () { electron_1.ipcRenderer.send(ipc_channels_1.IPC_CHANNELS.QUIT_APP); },
    hideCharm: function () { electron_1.ipcRenderer.send(ipc_channels_1.IPC_CHANNELS.HIDE_CHARM); },
    showCharm: function () { electron_1.ipcRenderer.send(ipc_channels_1.IPC_CHANNELS.SHOW_CHARM); },
    getDisplayInfo: function () {
        return electron_1.ipcRenderer.invoke(ipc_channels_1.IPC_CHANNELS.GET_DISPLAY_INFO);
    },
    onSettingsUpdated: function (callback) {
        var handler = function (_event, settings) { return callback(settings); };
        electron_1.ipcRenderer.on(ipc_channels_1.IPC_CHANNELS.SETTINGS_UPDATED, handler);
        return function () {
            electron_1.ipcRenderer.removeListener(ipc_channels_1.IPC_CHANNELS.SETTINGS_UPDATED, handler);
        };
    },
};
electron_1.contextBridge.exposeInMainWorld('deskcharm', api);
