import { contextBridge, ipcRenderer } from 'electron';

export const API = {
  // Config Operations
  getConfigPath: () => ipcRenderer.invoke('config:get-path'),
  loadRawConfig: () => ipcRenderer.invoke('config:load-raw'),
  loadParsedConfig: () => ipcRenderer.invoke('config:load-parsed'),
  saveConfig: (content: string | object) => ipcRenderer.invoke('config:save', content),
  listBackups: () => ipcRenderer.invoke('config:list-backups'),
  restoreBackup: (backupPath: string) => ipcRenderer.invoke('config:restore-backup', backupPath),

  // GlazeWM IPC Operations
  getGlazeStatus: () => ipcRenderer.invoke('glaze:get-status'),
  runCommand: (command: string) => ipcRenderer.invoke('glaze:run-command', command),
  queryWindows: () => ipcRenderer.invoke('glaze:query-windows'),
  queryWorkspaces: () => ipcRenderer.invoke('glaze:query-workspaces'),
  queryMonitors: () => ipcRenderer.invoke('glaze:query-monitors'),

  // Event Listeners
  onGlazeStatus: (callback: (status: any) => void) => {
    const handler = (_event: any, status: any) => callback(status);
    ipcRenderer.on('glaze:status', handler);
    return () => ipcRenderer.removeListener('glaze:status', handler);
  },
  onGlazeEvent: (callback: (event: any) => void) => {
    const handler = (_event: any, eventData: any) => callback(eventData);
    ipcRenderer.on('glaze:event', handler);
    return () => ipcRenderer.removeListener('glaze:event', handler);
  },

  // Window Controls
  minimizeToTray: () => ipcRenderer.send('window:minimize-to-tray'),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
};

contextBridge.exposeInMainWorld('api', API);

export type ElectronAPI = typeof API;
