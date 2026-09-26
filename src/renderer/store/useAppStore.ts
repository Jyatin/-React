import { create } from 'zustand';
import { BUILT_IN_CHARMS, CharmDefinition } from '../../shared/types/charm';
import { BUILT_IN_ROPES, RopeStyle } from '../../shared/types/rope';
import { AppSettings, DEFAULT_SETTINGS } from '../../shared/types/settings';
import { getDeskCharmApi } from '../api';

interface AppState {
  settings: AppSettings;
  settingsLoaded: boolean;
  showSettings: boolean;
  showCharmPicker: boolean;
  showContextMenu: boolean;
  contextMenuPos: { x: number; y: number };

  // Derived
  currentCharm: CharmDefinition;
  currentRope: RopeStyle;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  updateCharmSettings: (partial: Partial<AppSettings['charm']>) => Promise<void>;
  updateRopeSettings: (partial: Partial<AppSettings['rope']>) => Promise<void>;
  updatePhysicsSettings: (partial: Partial<AppSettings['physics']>) => Promise<void>;
  updateDesktopSettings: (partial: Partial<AppSettings['desktop']>) => Promise<void>;
  updateBehaviorSettings: (partial: Partial<AppSettings['behavior']>) => Promise<void>;
  setShowSettings: (show: boolean) => void;
  setShowCharmPicker: (show: boolean) => void;
  openContextMenu: (x: number, y: number) => void;
  closeContextMenu: () => void;
  selectCharm: (id: string) => void;
  selectRope: (id: string) => void;
}

function resolveCharm(id: string, customCharms: AppSettings['charm']['customCharms'] = []): CharmDefinition {
  const builtIn = BUILT_IN_CHARMS.find(c => c.id === id);
  if (builtIn) return builtIn;

  const custom = customCharms.find(c => c.id === id);
  if (custom) {
    return {
      id: custom.id,
      name: custom.name,
      emoji: '🖼️',
      color: '#8b5cf6',
      scale: 1,
      mass: 1,
      imagePath: custom.imagePath,
      isCustom: true,
    };
  }

  return BUILT_IN_CHARMS[0];
}

function resolveRope(id: string): RopeStyle {
  return BUILT_IN_ROPES.find(r => r.id === id) ?? BUILT_IN_ROPES[0];
}

export const useAppStore = create<AppState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  settingsLoaded: false,
  showSettings: false,
  showCharmPicker: false,
  showContextMenu: false,
  contextMenuPos: { x: 0, y: 0 },

  currentCharm: BUILT_IN_CHARMS[0],
  currentRope: BUILT_IN_ROPES[0],

  loadSettings: async () => {
    try {
      const api = getDeskCharmApi();
      const settings = await api.getSettings();
      set({
        settings,
        settingsLoaded: true,
        currentCharm: resolveCharm(settings.charm.selectedId, settings.charm.customCharms),
        currentRope: resolveRope(settings.rope.selectedId),
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
      set({ settingsLoaded: true });
    }
  },

  updateSettings: async (partial) => {
    const merged = { ...get().settings, ...partial };
    set({ settings: merged });
    try {
      const api = getDeskCharmApi();
      await api.saveSettings(partial);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  },

  updateCharmSettings: async (partial) => {
    const charm = { ...get().settings.charm, ...partial };
    const settings = { ...get().settings, charm };
    set({
      settings,
      currentCharm: resolveCharm(charm.selectedId, charm.customCharms),
    });
    try {
      const api = getDeskCharmApi();
      await api.saveSettings({ charm });
    } catch (err) {
      console.error('Failed to save charm settings:', err);
    }
  },

  updateRopeSettings: async (partial) => {
    const rope = { ...get().settings.rope, ...partial };
    const settings = { ...get().settings, rope };
    set({
      settings,
      currentRope: resolveRope(rope.selectedId),
    });
    try {
      const api = getDeskCharmApi();
      await api.saveSettings({ rope });
    } catch (err) {
      console.error('Failed to save rope settings:', err);
    }
  },

  updatePhysicsSettings: async (partial) => {
    const physics = { ...get().settings.physics, ...partial };
    const settings = { ...get().settings, physics };
    set({ settings });
    try {
      const api = getDeskCharmApi();
      await api.saveSettings({ physics });
    } catch (err) {
      console.error('Failed to save physics settings:', err);
    }
  },

  updateDesktopSettings: async (partial) => {
    const desktop = { ...get().settings.desktop, ...partial };
    const settings = { ...get().settings, desktop };
    set({ settings });
    try {
      const api = getDeskCharmApi();
      await api.saveSettings({ desktop });
    } catch (err) {
      console.error('Failed to save desktop settings:', err);
    }
  },

  updateBehaviorSettings: async (partial) => {
    const behavior = { ...get().settings.behavior, ...partial };
    const settings = { ...get().settings, behavior };
    set({ settings });
    try {
      const api = getDeskCharmApi();
      await api.saveSettings({ behavior });
    } catch (err) {
      console.error('Failed to save behavior settings:', err);
    }
  },

  setShowSettings: (show) => set({ showSettings: show, showCharmPicker: false, showContextMenu: false }),
  setShowCharmPicker: (show) => set({ showCharmPicker: show, showContextMenu: false }),

  openContextMenu: (x, y) => set({ showContextMenu: true, contextMenuPos: { x, y } }),
  closeContextMenu: () => set({ showContextMenu: false }),

  selectCharm: (id) => {
    get().updateCharmSettings({ selectedId: id });
    set({ showCharmPicker: false });
  },

  selectRope: (id) => {
    get().updateRopeSettings({ selectedId: id });
  },
}));
