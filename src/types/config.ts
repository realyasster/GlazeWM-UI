export interface GlazeGaps {
  scale_with_dpi?: boolean;
  inner_gap: string;
  outer_gap: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export interface WindowEffectStyle {
  border: {
    enabled: boolean;
    color: string;
  };
  hide_title_bar?: {
    enabled: boolean;
  };
  corner_style?: {
    enabled: boolean;
    style: 'square' | 'rounded' | 'small_rounded';
  };
  transparency?: {
    enabled: boolean;
    opacity: string;
  };
}

export interface GlazeWindowEffects {
  focused_window: WindowEffectStyle;
  other_windows: WindowEffectStyle;
}

export interface GlazeGeneral {
  startup_commands?: string[];
  shutdown_commands?: string[];
  config_reload_commands?: string[];
  focus_follows_cursor?: boolean;
  toggle_workspace_on_refocus?: boolean;
  cursor_jump?: {
    enabled: boolean;
    trigger: 'monitor_focus' | 'window_focus';
  };
  hide_method?: 'cloak' | 'hide' | 'place_in_corner';
  show_all_in_taskbar?: boolean;
}

export interface GlazeWorkspace {
  name: string;
  display_name?: string;
  bind_to_monitor?: number | string;
}

export interface WindowRuleMatch {
  window_process?: { equals?: string; contains?: string; regex?: string };
  window_class?: { equals?: string; contains?: string; regex?: string };
  window_title?: { equals?: string; contains?: string; regex?: string };
}

export interface WindowRule {
  commands: string[];
  match: WindowRuleMatch[];
}

export interface Keybinding {
  commands: string[];
  bindings: string[];
}

export interface BindingMode {
  name: string;
  keybindings: Keybinding[];
}

export interface GlazeConfig {
  general?: GlazeGeneral;
  gaps?: GlazeGaps;
  window_effects?: GlazeWindowEffects;
  window_behavior?: {
    initial_state?: 'tiling' | 'floating';
    state_defaults?: {
      floating?: { centered?: boolean; shown_on_top?: boolean };
      fullscreen?: { maximized?: boolean; shown_on_top?: boolean };
    };
  };
  workspaces?: GlazeWorkspace[];
  window_rules?: WindowRule[];
  keybindings?: Keybinding[];
  binding_modes?: BindingMode[];
}

export interface ActiveWindowInfo {
  id: string;
  title: string;
  processName: string;
  className: string;
  hasFocus?: boolean;
  state?: any;
}
