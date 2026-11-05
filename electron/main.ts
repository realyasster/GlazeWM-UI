import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { ConfigService } from './config-service';
import { GlazeWmService } from './glazewm-service';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let configService: ConfigService;
let glazeService: GlazeWmService;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createPlaceholderTrayIcon(): Electron.NativeImage {
  // 16x16 RGBA buffer for default blue tray icon
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const offset = i * 4;
    buffer[offset] = 59;     // R (3b)
    buffer[offset + 1] = 130; // G (82)
    buffer[offset + 2] = 246; // B (f6)
    buffer[offset + 3] = 255; // A
  }
  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#090a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('close', (event) => {
    // If not quitting, minimize to tray
    if (!(app as any).isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
    return false;
  });
}

function createTray() {
  let icon = createPlaceholderTrayIcon();
  const iconPath = path.join(__dirname, '../resources/icon.ico');
  try {
    const loadedIcon = nativeImage.createFromPath(iconPath);
    if (!loadedIcon.isEmpty()) {
      icon = loadedIcon;
    }
  } catch {
    // Use fallback
  }

  tray = new Tray(icon);
  tray.setToolTip('GlazeWM Control Center');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open GlazeWM UI',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Reload Config (Alt+Shift+R)',
      click: async () => {
        await glazeService.runCommand('wm-reload-config');
      },
    },
    {
      label: 'Toggle Floating (Alt+Shift+Space)',
      click: async () => {
        await glazeService.runCommand('toggle-floating');
      },
    },
    {
      label: 'Pause / Resume Tiling',
      click: async () => {
        await glazeService.runCommand('toggle-tiling-direction');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        (app as any).isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

app.whenReady().then(() => {
  configService = new ConfigService();
  glazeService = new GlazeWmService(() => mainWindow);

  createWindow();
  createTray();

  // Register IPC Handlers
  ipcMain.handle('config:get-path', () => configService.getConfigPath());
  ipcMain.handle('config:load-raw', () => configService.readRawConfig());
  ipcMain.handle('config:load-parsed', () => configService.readParsedConfig());
  ipcMain.handle('config:save', (_event, content) => configService.saveConfig(content));
  ipcMain.handle('config:list-backups', () => configService.listBackups());
  ipcMain.handle('config:restore-backup', (_event, backupPath) => configService.restoreBackup(backupPath));

  ipcMain.handle('glaze:get-status', () => glazeService.getStatus());
  ipcMain.handle('glaze:run-command', (_event, command) => glazeService.runCommand(command));
  ipcMain.handle('glaze:query-windows', () => glazeService.queryWindows());
  ipcMain.handle('glaze:query-workspaces', () => glazeService.queryWorkspaces());
  ipcMain.handle('glaze:query-monitors', () => glazeService.queryMonitors());

  ipcMain.on('window:minimize-to-tray', () => mainWindow?.hide());
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => {
    mainWindow?.hide();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep alive in tray on Windows unless explicitly quit
});
