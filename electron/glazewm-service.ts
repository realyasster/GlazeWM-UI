import { WmClient, WmEventType } from 'glazewm';
import { BrowserWindow } from 'electron';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface GlazeStatus {
  connected: boolean;
  paused: boolean;
  activeWorkspace?: string;
  focusedWindow?: {
    id: string;
    title: string;
    processName: string;
    className: string;
  };
  error?: string;
}

export class GlazeWmService {
  private client: WmClient | null = null;
  private isConnected = false;
  private isPaused = false;
  private lastFocusedWindow: any = null;
  private lastActiveWorkspace = '1';
  private getMainWindow: () => BrowserWindow | null;
  private cliPath: string | null = null;

  constructor(getMainWindow: () => BrowserWindow | null) {
    this.getMainWindow = getMainWindow;
    this.detectCliPath();
    this.initClient();
  }

  private detectCliPath() {
    const candidates = [
      'C:\\Program Files\\glzr.io\\GlazeWM\\glazewm.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'glzr.io', 'GlazeWM', 'glazewm.exe'),
      path.join(process.env.PROGRAMFILES || '', 'glzr.io', 'GlazeWM', 'glazewm.exe'),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        this.cliPath = c;
        break;
      }
    }
  }

  private initClient() {
    try {
      this.client = new WmClient({
        reconnectInterval: 2500,
      });

      this.client.onConnect(async () => {
        this.isConnected = true;
        this.broadcastStatus();
        await this.fetchInitialState();
      });

      this.client.onDisconnect(() => {
        this.isConnected = false;
        this.broadcastStatus();
      });

      this.client.onError((err: any) => {
        this.isConnected = false;
        this.broadcastStatus(err?.message || 'GlazeWM connection error');
      });

      // Event Subscriptions
      this.client.subscribe(WmEventType.FOCUS_CHANGED, (event: any) => {
        if (event && event.focusedContainer) {
          if (event.focusedContainer.type === 'window') {
            this.lastFocusedWindow = {
              id: event.focusedContainer.id,
              title: event.focusedContainer.title,
              processName: event.focusedContainer.processName,
              className: event.focusedContainer.className,
            };
          } else if (event.focusedContainer.type === 'workspace') {
            this.lastActiveWorkspace = event.focusedContainer.name;
          }
        }
        this.broadcastStatus();
        this.sendToRenderer('glaze:event', { type: WmEventType.FOCUS_CHANGED, data: event });
      }).catch(() => {});

      this.client.subscribe(WmEventType.WORKSPACE_ACTIVATED, (event: any) => {
        if (event?.activatedWorkspace) {
          this.lastActiveWorkspace = event.activatedWorkspace.name;
        }
        this.broadcastStatus();
        this.sendToRenderer('glaze:event', { type: WmEventType.WORKSPACE_ACTIVATED, data: event });
      }).catch(() => {});

      this.client.subscribe(WmEventType.PAUSE_CHANGED, (event: any) => {
        this.isPaused = typeof event === 'boolean' ? event : !!event?.isPaused;
        this.broadcastStatus();
        this.sendToRenderer('glaze:event', { type: WmEventType.PAUSE_CHANGED, data: event });
      }).catch(() => {});

      this.client.subscribe(WmEventType.WINDOW_MANAGED, (event: any) => {
        this.sendToRenderer('glaze:event', { type: WmEventType.WINDOW_MANAGED, data: event });
      }).catch(() => {});

      this.client.subscribe(WmEventType.WINDOW_UNMANAGED, (event: any) => {
        this.sendToRenderer('glaze:event', { type: WmEventType.WINDOW_UNMANAGED, data: event });
      }).catch(() => {});
    } catch (err: any) {
      this.isConnected = false;
      this.broadcastStatus(err?.message);
    }
  }

  private async fetchInitialState() {
    if (!this.client || !this.isConnected) return;
    try {
      const [pausedRes, focusedRes] = await Promise.all([
        this.client.queryPaused().catch(() => false),
        this.client.queryFocused().catch(() => ({ focused: null })),
      ]);

      this.isPaused = typeof pausedRes === 'boolean' ? pausedRes : !!(pausedRes as any)?.paused;
      if (focusedRes && (focusedRes as any).focused) {
        const f = (focusedRes as any).focused;
        if (f.type === 'window') {
          this.lastFocusedWindow = {
            id: f.id,
            title: f.title,
            processName: f.processName,
            className: f.className,
          };
        } else if (f.type === 'workspace') {
          this.lastActiveWorkspace = f.name;
        }
      }
      this.broadcastStatus();
    } catch {
      // Ignore initial query errors
    }
  }

  public getStatus(): GlazeStatus {
    return {
      connected: this.isConnected,
      paused: this.isPaused,
      activeWorkspace: this.lastActiveWorkspace,
      focusedWindow: this.lastFocusedWindow,
    };
  }

  public async runCommand(command: string): Promise<{ success: boolean; error?: string }> {
    // Primary: WebSocket IPC
    try {
      if (this.client) {
        if (!this.isConnected) {
          await this.client.connect().catch(() => {});
        }
        await this.client.runCommand(command);

        // When reloading config, also trigger wm-redraw so borders & gaps immediately re-render
        if (command === 'wm-reload-config') {
          await this.client.runCommand('wm-redraw').catch(() => {});
        }

        return { success: true };
      }
    } catch (wsErr: any) {
      // Fallback to CLI if websocket threw
      console.warn('WebSocket command error, trying CLI fallback:', wsErr?.message);
    }

    // Secondary: CLI via PowerShell execution
    return this.runCliFallback(command);
  }

  private runCliFallback(command: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const exe = this.cliPath || 'glazewm.exe';
      const psCommand = `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '${exe}' command '${command}'"`;

      exec(psCommand, async (error, _stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: stderr || error.message });
        } else {
          // If reloading config, also trigger redraw
          if (command === 'wm-reload-config') {
            const redrawCmd = `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '${exe}' command 'wm-redraw'"`;
            exec(redrawCmd, () => {});
          }
          resolve({ success: true });
        }
      });
    });
  }

  public async queryWindows(): Promise<any[]> {
    if (!this.client || !this.isConnected) return [];
    try {
      const res = await this.client.queryWindows();
      return res.windows || [];
    } catch {
      return [];
    }
  }

  public async queryWorkspaces(): Promise<any[]> {
    if (!this.client || !this.isConnected) return [];
    try {
      const res = await this.client.queryWorkspaces();
      return res.workspaces || [];
    } catch {
      return [];
    }
  }

  public async queryMonitors(): Promise<any[]> {
    if (!this.client || !this.isConnected) return [];
    try {
      const res = await this.client.queryMonitors();
      return res.monitors || [];
    } catch {
      return [];
    }
  }

  private broadcastStatus(errorMsg?: string) {
    const status: GlazeStatus = {
      connected: this.isConnected,
      paused: this.isPaused,
      activeWorkspace: this.lastActiveWorkspace,
      focusedWindow: this.lastFocusedWindow,
      error: errorMsg,
    };
    this.sendToRenderer('glaze:status', status);
  }

  private sendToRenderer(channel: string, data: any) {
    const win = this.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, data);
    }
  }
}
