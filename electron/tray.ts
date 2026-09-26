import { Tray, Menu, nativeImage, app } from 'electron';
import { getMainWindow, showMainWindow, hideMainWindow } from './main';
import path from 'path';

let tray: Tray | null = null;

export function setupTray(): void {
  // Create a simple 16x16 icon programmatically
  const iconSize = 16;
  const icon = nativeImage.createEmpty();

  // Use a simple built-in approach: create from buffer
  const canvas = Buffer.alloc(iconSize * iconSize * 4);
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const i = (y * iconSize + x) * 4;
      // Draw a small diamond/charm shape
      const cx = iconSize / 2;
      const cy = iconSize / 2;
      const dist = Math.abs(x - cx) + Math.abs(y - cy);
      if (dist < 6) {
        canvas[i] = 139;     // R (purple)
        canvas[i + 1] = 92;  // G
        canvas[i + 2] = 246; // B
        canvas[i + 3] = 255; // A
      } else {
        canvas[i + 3] = 0;   // transparent
      }
    }
  }

  const trayIcon = nativeImage.createFromBuffer(canvas, {
    width: iconSize,
    height: iconSize,
  });

  tray = new Tray(trayIcon);
  tray.setToolTip('DeskCharm');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'DeskCharm',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Show Charm',
      click: () => showMainWindow(),
    },
    {
      label: 'Hide Charm',
      click: () => hideMainWindow(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    const win = getMainWindow();
    if (win?.isVisible()) {
      hideMainWindow();
    } else {
      showMainWindow();
    }
  });
}
