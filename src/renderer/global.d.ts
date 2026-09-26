import type { AppSettings } from '../shared/types/settings';

export interface DeskCharmAPI {
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: Partial<AppSettings>): Promise<void>;
  selectImage(): Promise<string | null>;
  setStartup(enabled: boolean): Promise<void>;
  quitApp(): void;
  hideCharm(): void;
  showCharm(): void;
  getDisplayInfo(): Promise<{ width: number; height: number; scaleFactor: number }>;
  onSettingsUpdated(callback: (settings: AppSettings) => void): () => void;
}

declare global {
  interface Window {
    deskcharm: DeskCharmAPI;
  }
}

export {};
