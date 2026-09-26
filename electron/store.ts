import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { DEFAULT_SETTINGS, AppSettings } from '../src/shared/types/settings';

const SETTINGS_FILE = 'deskcharm-settings.json';

class SettingsStore {
  private data: AppSettings;
  private filePath: string;

  constructor() {
    this.filePath = path.join(app.getPath('userData'), SETTINGS_FILE);
    this.data = this.load();
  }

  private load(): AppSettings {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return this.deepMerge(DEFAULT_SETTINGS as unknown as Record<string, unknown>, parsed as Record<string, unknown>);
      }
    } catch (err) {
      console.error('Failed to load settings, using defaults:', err);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }

  private deepMerge(defaults: Record<string, unknown>, overrides: Record<string, unknown>): AppSettings {
    const result: Record<string, unknown> = { ...defaults };
    for (const key of Object.keys(defaults)) {
      if (key in overrides) {
        if (
          typeof defaults[key] === 'object' &&
          defaults[key] !== null &&
          !Array.isArray(defaults[key]) &&
          typeof overrides[key] === 'object' &&
          overrides[key] !== null &&
          !Array.isArray(overrides[key])
        ) {
          result[key] = this.deepMerge(
            defaults[key] as Record<string, unknown>,
            overrides[key] as Record<string, unknown>
          );
        } else {
          result[key] = overrides[key];
        }
      }
    }
    return result as unknown as AppSettings;
  }

  get store(): AppSettings {
    return this.data;
  }

  get(key: string, defaultValue?: unknown): unknown {
    const keys = key.split('.');
    let current: unknown = this.data;
    for (const k of keys) {
      if (typeof current === 'object' && current !== null && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        return defaultValue;
      }
    }
    return current ?? defaultValue;
  }

  set(key: string, value: unknown): void {
    const keys = key.split('.');
    let current: Record<string, unknown> = this.data as unknown as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
    this.save();
  }

  setAll(settings: AppSettings): void {
    this.data = settings;
    this.save();
  }
}

let store: SettingsStore | null = null;

export function getStore(): SettingsStore {
  if (!store) {
    store = new SettingsStore();
  }
  return store;
}
