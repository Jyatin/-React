import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../src/shared/ipc-channels';
import type { AppSettings } from '../src/shared/types/settings';

const api = {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  saveSettings: (settings: Partial<AppSettings>): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.SAVE_SETTINGS, settings),
  selectImage: (): Promise<string | null> => ipcRenderer.invoke(IPC_CHANNELS.SELECT_IMAGE),
  setStartup: (enabled: boolean): Promise<void> => ipcRenderer.invoke(IPC_CHANNELS.SET_STARTUP, enabled),
  quitApp: (): void => { ipcRenderer.send(IPC_CHANNELS.QUIT_APP); },
  hideCharm: (): void => { ipcRenderer.send(IPC_CHANNELS.HIDE_CHARM); },
  showCharm: (): void => { ipcRenderer.send(IPC_CHANNELS.SHOW_CHARM); },
  getDisplayInfo: (): Promise<{ width: number; height: number; scaleFactor: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_DISPLAY_INFO),
  onSettingsUpdated: (callback: (settings: AppSettings) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, settings: AppSettings) => callback(settings);
    ipcRenderer.on(IPC_CHANNELS.SETTINGS_UPDATED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.SETTINGS_UPDATED, handler);
    };
  },
};

contextBridge.exposeInMainWorld('deskcharm', api);
