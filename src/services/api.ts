import { GlazeConfig, ActiveWindowInfo } from '../types/config';

// Define the global window.api
declare global {
  interface Window {
    api?: {
      getConfigPath: () => Promise<string>;
      loadRawConfig: () => Promise<{ success: boolean; data?: string; error?: string }>;
      loadParsedConfig: () => Promise<{ success: boolean; data?: GlazeConfig; error?: string }>;
      saveConfig: (content: string | object) => Promise<{ success: boolean; data?: { backupPath: string }; error?: string }>;
      listBackups: () => Promise<string[]>;
      restoreBackup: (backupPath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      getGlazeStatus: () => Promise<any>;
      runCommand: (command: string) => Promise<{ success: boolean; error?: string }>;
      queryWindows: () => Promise<ActiveWindowInfo[]>;
      queryWorkspaces: () => Promise<any[]>;
      queryMonitors: () => Promise<any[]>;
      onGlazeStatus: (callback: (status: any) => void) => () => void;
      onGlazeEvent: (callback: (event: any) => void) => () => void;
      minimizeToTray: () => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}

// Safe wrapper fallback for browser testing if opened directly
export const api = window.api || {
  getConfigPath: async () => 'C:\\Users\\User\\.glzr\\glazewm\\config.yaml',
  loadRawConfig: async () => ({ success: true, data: '# Mock Config' }),
  loadParsedConfig: async () => ({ success: true, data: {} as GlazeConfig }),
  saveConfig: async () => ({ success: true, data: { backupPath: 'mock-backup.yaml' } }),
  listBackups: async () => [],
  restoreBackup: async () => ({ success: true, data: '' }),
  getGlazeStatus: async () => ({ connected: false, paused: false }),
  runCommand: async () => ({ success: true }),
  queryWindows: async () => [],
  queryWorkspaces: async () => [],
  queryMonitors: async () => [],
  onGlazeStatus: () => () => {},
  onGlazeEvent: () => () => {},
  minimizeToTray: () => {},
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  closeWindow: () => {},
};
