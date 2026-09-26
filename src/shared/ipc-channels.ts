export const IPC_CHANNELS = {
  GET_SETTINGS: 'settings:get',
  SAVE_SETTINGS: 'settings:save',
  SELECT_IMAGE: 'dialog:select-image',
  SET_STARTUP: 'app:set-startup',
  QUIT_APP: 'app:quit',
  HIDE_CHARM: 'window:hide',
  SHOW_CHARM: 'window:show',
  GET_DISPLAY_INFO: 'display:info',
  OPEN_SETTINGS_WINDOW: 'window:open-settings',
  SETTINGS_UPDATED: 'settings:updated',
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
