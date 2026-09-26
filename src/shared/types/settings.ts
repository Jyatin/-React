export interface AppSettings {
  charm: {
    selectedId: string;
    size: number;
    customCharms: CustomCharmEntry[];
  };
  rope: {
    selectedId: string;
    length: number;
  };
  physics: {
    gravity: number;
    damping: number;
    swingIntensity: number;
    interactionSensitivity: number;
  };
  desktop: {
    positionX: number;
    positionY: number;
    alwaysOnTop: boolean;
    launchAtStartup: boolean;
  };
  behavior: {
    enableHoverEffects: boolean;
    pausePhysics: boolean;
  };
  window: {
    visible: boolean;
  };
}

export interface CustomCharmEntry {
  id: string;
  name: string;
  imagePath: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  charm: {
    selectedId: 'cat',
    size: 48,
    customCharms: [],
  },
  rope: {
    selectedId: 'black',
    length: 120,
  },
  physics: {
    gravity: 1.0,
    damping: 0.05,
    swingIntensity: 1.0,
    interactionSensitivity: 1.0,
  },
  desktop: {
    positionX: -1,
    positionY: 0,
    alwaysOnTop: true,
    launchAtStartup: false,
  },
  behavior: {
    enableHoverEffects: true,
    pausePhysics: false,
  },
  window: {
    visible: true,
  },
};
