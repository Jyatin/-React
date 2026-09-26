import type { DeskCharmAPI } from './global';
import { DEFAULT_SETTINGS, AppSettings } from '../shared/types/settings';

const LOCAL_STORAGE_KEY = 'deskcharm_browser_settings';

function getMockApi(): DeskCharmAPI {
  let currentSettings: AppSettings = { ...DEFAULT_SETTINGS };
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      currentSettings = JSON.parse(saved);
    }
  } catch {
    // Ignore storage parse errors
  }

  const listeners: Set<(settings: AppSettings) => void> = new Set();

  return {
    getSettings: async () => currentSettings,
    saveSettings: async (partial: Partial<AppSettings>) => {
      currentSettings = { ...currentSettings, ...partial };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentSettings));
      } catch {
        // Ignore storage save errors
      }
      listeners.forEach((cb) => cb(currentSettings));
    },
    selectImage: async () => null,
    setStartup: async () => {},
    quitApp: () => {
      alert('Quit App called (Browser Preview Mode)');
    },
    hideCharm: () => {},
    showCharm: () => {},
    getDisplayInfo: async () => ({
      width: window.innerWidth,
      height: window.innerHeight,
      scaleFactor: window.devicePixelRatio || 1,
    }),
    onSettingsUpdated: (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
  };
}

export function getDeskCharmApi(): DeskCharmAPI {
  if (typeof window !== 'undefined' && window.deskcharm) {
    return window.deskcharm;
  }
  return getMockApi();
}
