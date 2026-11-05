import fs from 'fs';
import path from 'path';
import os from 'os';
import YAML from 'yaml';

export interface ConfigServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ConfigService {
  private configPath: string;

  constructor() {
    this.configPath = this.resolveConfigPath();
  }

  public getConfigPath(): string {
    return this.configPath;
  }

  private resolveConfigPath(): string {
    if (process.env.GLAZEWM_CONFIG_PATH && fs.existsSync(process.env.GLAZEWM_CONFIG_PATH)) {
      return process.env.GLAZEWM_CONFIG_PATH;
    }

    const homeDir = os.homedir();
    const defaultGlazePath = path.join(homeDir, '.glzr', 'glazewm', 'config.yaml');
    return defaultGlazePath;
  }

  public readRawConfig(): ConfigServiceResult<string> {
    try {
      if (!fs.existsSync(this.configPath)) {
        // Return starter template if not yet present
        const starter = this.getStarterConfig();
        return { success: true, data: starter };
      }
      const content = fs.readFileSync(this.configPath, 'utf8');
      return { success: true, data: content };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to read config file.' };
    }
  }

  public readParsedConfig(): ConfigServiceResult<any> {
    const raw = this.readRawConfig();
    if (!raw.success || !raw.data) {
      return { success: false, error: raw.error };
    }

    try {
      const parsed = YAML.parse(raw.data);
      return { success: true, data: parsed };
    } catch (err: any) {
      return { success: false, error: `YAML parse error: ${err.message}` };
    }
  }

  public saveConfig(newContent: string | object): ConfigServiceResult<{ backupPath: string }> {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create backup first if file already exists
      let backupPath = '';
      if (fs.existsSync(this.configPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(dir, 'backups');
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        backupPath = path.join(backupDir, `config.backup-${timestamp}.yaml`);
        fs.copyFileSync(this.configPath, backupPath);
      }

      let contentToWrite = '';
      if (typeof newContent === 'string') {
        // Validate YAML syntax before writing
        YAML.parse(newContent);
        contentToWrite = newContent;
      } else {
        contentToWrite = YAML.stringify(newContent, {
          indent: 2,
        });
      }

      fs.writeFileSync(this.configPath, contentToWrite, 'utf8');
      return { success: true, data: { backupPath } };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to save config.' };
    }
  }

  public listBackups(): string[] {
    try {
      const backupDir = path.join(path.dirname(this.configPath), 'backups');
      if (!fs.existsSync(backupDir)) return [];
      return fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.yaml'))
        .sort()
        .reverse()
        .map(f => path.join(backupDir, f));
    } catch {
      return [];
    }
  }

  public restoreBackup(backupFilePath: string): ConfigServiceResult<string> {
    try {
      if (!fs.existsSync(backupFilePath)) {
        return { success: false, error: 'Backup file not found.' };
      }
      const content = fs.readFileSync(backupFilePath, 'utf8');
      fs.writeFileSync(this.configPath, content, 'utf8');
      return { success: true, data: content };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to restore backup.' };
    }
  }

  public getStarterConfig(): string {
    return `# GlazeWM Configuration
general:
  startup_commands: []
  shutdown_commands: []
  config_reload_commands: []
  focus_follows_cursor: false
  toggle_workspace_on_refocus: false
  cursor_jump:
    enabled: true
    trigger: 'monitor_focus'
  hide_method: 'cloak'
  show_all_in_taskbar: false

gaps:
  scale_with_dpi: true
  inner_gap: '12px'
  outer_gap:
    top: '12px'
    right: '12px'
    bottom: '12px'
    left: '12px'

window_effects:
  focused_window:
    border:
      enabled: true
      color: '#3b82f6'
    hide_title_bar:
      enabled: false
    corner_style:
      enabled: true
      style: 'rounded'
    transparency:
      enabled: false
      opacity: '100%'
  other_windows:
    border:
      enabled: true
      color: '#272d3d'
    hide_title_bar:
      enabled: false
    corner_style:
      enabled: true
      style: 'rounded'
    transparency:
      enabled: false
      opacity: '100%'

window_behavior:
  initial_state: 'tiling'
  state_defaults:
    floating:
      centered: true
      shown_on_top: false
    fullscreen:
      maximized: false
      shown_on_top: false

workspaces:
  - name: '1'
    display_name: '1: Main'
  - name: '2'
    display_name: '2: Code'
  - name: '3'
    display_name: '3: Web'
  - name: '4'
    display_name: '4: Media'

window_rules:
  - commands: ['set-floating']
    match:
      - window_title: { regex: '[Pp]icture-in-[Pp]icture' }
  - commands: ['ignore']
    match:
      - window_process: { equals: 'zebar' }
      - window_process: { equals: 'GlazeWM-UI' }

keybindings:
  - commands: ['focus --direction left']
    bindings: ['alt+h', 'alt+left']
  - commands: ['focus --direction right']
    bindings: ['alt+l', 'alt+right']
  - commands: ['focus --direction up']
    bindings: ['alt+k', 'alt+up']
  - commands: ['focus --direction down']
    bindings: ['alt+j', 'alt+down']
  - commands: ['toggle-floating']
    bindings: ['alt+shift+space']
  - commands: ['toggle-fullscreen']
    bindings: ['alt+f']
  - commands: ['close']
    bindings: ['alt+shift+q']
  - commands: ['wm-reload-config']
    bindings: ['alt+shift+r']
  - commands: ['focus --workspace 1']
    bindings: ['alt+1']
  - commands: ['focus --workspace 2']
    bindings: ['alt+2']
  - commands: ['focus --workspace 3']
    bindings: ['alt+3']
  - commands: ['focus --workspace 4']
    bindings: ['alt+4']
`;
  }
}
