"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpc = setupIpc;
var electron_1 = require("electron");
var ipc_channels_1 = require("../src/shared/ipc-channels");
var store_1 = require("./store");
var main_1 = require("./main");
var path_1 = require("path");
var fs_1 = require("fs");
function setupIpc() {
    var _this = this;
    var store = (0, store_1.getStore)();
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.GET_SETTINGS, function () {
        return store.store;
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.SAVE_SETTINGS, function (_event, settings) {
        // Deep merge settings
        for (var _i = 0, _a = Object.entries(settings); _i < _a.length; _i++) {
            var _b = _a[_i], category = _b[0], values = _b[1];
            if (typeof values === 'object' && values !== null) {
                for (var _c = 0, _d = Object.entries(values); _c < _d.length; _c++) {
                    var _e = _d[_c], key = _e[0], value = _e[1];
                    store.set("".concat(category, ".").concat(key), value);
                }
            }
        }
        // Notify renderer of update
        var win = (0, main_1.getMainWindow)();
        if (win) {
            win.webContents.send(ipc_channels_1.IPC_CHANNELS.SETTINGS_UPDATED, store.store);
        }
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.SELECT_IMAGE, function () { return __awaiter(_this, void 0, void 0, function () {
        var result, sourcePath, ext, id, destDir, destPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, electron_1.dialog.showOpenDialog({
                        properties: ['openFile'],
                        filters: [
                            { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
                        ],
                    })];
                case 1:
                    result = _a.sent();
                    if (result.canceled || result.filePaths.length === 0) {
                        return [2 /*return*/, null];
                    }
                    sourcePath = result.filePaths[0];
                    ext = path_1.default.extname(sourcePath);
                    id = "custom-".concat(Date.now());
                    destDir = path_1.default.join(electron_1.app.getPath('userData'), 'custom-charms');
                    if (!fs_1.default.existsSync(destDir)) {
                        fs_1.default.mkdirSync(destDir, { recursive: true });
                    }
                    destPath = path_1.default.join(destDir, "".concat(id).concat(ext));
                    fs_1.default.copyFileSync(sourcePath, destPath);
                    return [2 /*return*/, destPath];
            }
        });
    }); });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.SET_STARTUP, function (_event, enabled) {
        electron_1.app.setLoginItemSettings({
            openAtLogin: enabled,
        });
        store.set('desktop.launchAtStartup', enabled);
    });
    electron_1.ipcMain.on(ipc_channels_1.IPC_CHANNELS.QUIT_APP, function () {
        electron_1.app.quit();
    });
    electron_1.ipcMain.on(ipc_channels_1.IPC_CHANNELS.HIDE_CHARM, function () {
        var win = (0, main_1.getMainWindow)();
        if (win) {
            win.hide();
            store.set('window.visible', false);
        }
    });
    electron_1.ipcMain.on(ipc_channels_1.IPC_CHANNELS.SHOW_CHARM, function () {
        var win = (0, main_1.getMainWindow)();
        if (win) {
            win.show();
            store.set('window.visible', true);
        }
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.GET_DISPLAY_INFO, function () {
        var display = electron_1.screen.getPrimaryDisplay();
        return {
            width: display.workAreaSize.width,
            height: display.workAreaSize.height,
            scaleFactor: display.scaleFactor,
        };
    });
}
