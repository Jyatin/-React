import { ipcMain, dialog, screen, app } from 'electron';
import { IPC_CHANNELS } from '../src/shared/ipc-channels';
import { getStore } from './store';
import { getMainWindow } from './main';
import type { AppSettings } from '../src/shared/types/settings';
import path from 'path';
import fs from 'fs';

export function setupIpc(): void {
  const store = getStore();

  ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, () => {
    return store.store;
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_SETTINGS, (_event, settings: Partial<AppSettings>) => {
    // Deep merge settings
    for (const [category, values] of Object.entries(settings)) {
      if (typeof values === 'object' && values !== null) {
        for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
          store.set(`${category}.${key}` , value);
        }
      }
    }
    // Notify renderer of update
    const win = getMainWindow();
    if (win) {
      win.webContents.send(IPC_CHANNELS.SETTINGS_UPDATED, store.store);
    }
  });

  ipcMain.handle(IPC_CHANNELS.SELECT_IMAGE, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const sourcePath = result.filePaths[0];
    const ext = path.extname(sourcePath);
    const id = `custom-${Date.now()}`;
    const destDir = path.join(app.getPath('userData'), 'custom-charms');

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const destPath = path.join(destDir, `${id}${ext}`);
    fs.copyFileSync(sourcePath, destPath);

    return destPath;
  });

  ipcMain.handle(IPC_CHANNELS.SET_STARTUP, (_event, enabled: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
    });
    store.set('desktop.launchAtStartup', enabled);
  });

  ipcMain.on(IPC_CHANNELS.QUIT_APP, () => {
    app.quit();
  });

  ipcMain.on(IPC_CHANNELS.HIDE_CHARM, () => {
    const win = getMainWindow();
    if (win) {
      win.hide();
      store.set('window.visible', false);
    }
  });

  ipcMain.on(IPC_CHANNELS.SHOW_CHARM, () => {
    const win = getMainWindow();
    if (win) {
      win.show();
      store.set('window.visible', true);
    }
  });

  ipcMain.handle(IPC_CHANNELS.GET_DISPLAY_INFO, () => {
    const display = screen.getPrimaryDisplay();
    return {
      width: display.workAreaSize.width,
      height: display.workAreaSize.height,
      scaleFactor: display.scaleFactor,
    };
  });
}
