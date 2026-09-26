"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStore = getStore;
var path_1 = require("path");
var fs_1 = require("fs");
var electron_1 = require("electron");
var settings_1 = require("../src/shared/types/settings");
var SETTINGS_FILE = 'deskcharm-settings.json';
var SettingsStore = /** @class */ (function () {
    function SettingsStore() {
        this.filePath = path_1.default.join(electron_1.app.getPath('userData'), SETTINGS_FILE);
        this.data = this.load();
    }
    SettingsStore.prototype.load = function () {
        try {
            if (fs_1.default.existsSync(this.filePath)) {
                var raw = fs_1.default.readFileSync(this.filePath, 'utf-8');
                var parsed = JSON.parse(raw);
                return this.deepMerge(settings_1.DEFAULT_SETTINGS, parsed);
            }
        }
        catch (err) {
            console.error('Failed to load settings, using defaults:', err);
        }
        return __assign({}, settings_1.DEFAULT_SETTINGS);
    };
    SettingsStore.prototype.save = function () {
        try {
            var dir = path_1.default.dirname(this.filePath);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            fs_1.default.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Failed to save settings:', err);
        }
    };
    SettingsStore.prototype.deepMerge = function (defaults, overrides) {
        var result = __assign({}, defaults);
        for (var _i = 0, _a = Object.keys(defaults); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key in overrides) {
                if (typeof defaults[key] === 'object' &&
                    defaults[key] !== null &&
                    !Array.isArray(defaults[key]) &&
                    typeof overrides[key] === 'object' &&
                    overrides[key] !== null &&
                    !Array.isArray(overrides[key])) {
                    result[key] = this.deepMerge(defaults[key], overrides[key]);
                }
                else {
                    result[key] = overrides[key];
                }
            }
        }
        return result;
    };
    Object.defineProperty(SettingsStore.prototype, "store", {
        get: function () {
            return this.data;
        },
        enumerable: false,
        configurable: true
    });
    SettingsStore.prototype.get = function (key, defaultValue) {
        var keys = key.split('.');
        var current = this.data;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var k = keys_1[_i];
            if (typeof current === 'object' && current !== null && k in current) {
                current = current[k];
            }
            else {
                return defaultValue;
            }
        }
        return current !== null && current !== void 0 ? current : defaultValue;
    };
    SettingsStore.prototype.set = function (key, value) {
        var keys = key.split('.');
        var current = this.data;
        for (var i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        this.save();
    };
    SettingsStore.prototype.setAll = function (settings) {
        this.data = settings;
        this.save();
    };
    return SettingsStore;
}());
var store = null;
function getStore() {
    if (!store) {
        store = new SettingsStore();
    }
    return store;
}
