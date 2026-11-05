# GlazeWM UI — Control Center & Configurator

> A modern, fast and easy-to-use desktop control center for the [GlazeWM](https://github.com/glzr-io/glazewm) tiling window manager on Windows.

**English** · [Türkçe](README.tr.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D6.svg)](#)
[![Electron](https://img.shields.io/badge/Electron-34-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)

---

## 📥 Download

Grab the latest portable `.exe` from the [**Releases**](https://github.com/realyasster/GlazeWM-UI/releases/latest) page — no installation required.

> Requires [GlazeWM](https://github.com/glzr-io/glazewm) to be installed and running. The app talks to it over the local IPC socket and reads/writes your `config.yaml`.

---

## ✨ Features

- **🎨 Gaps & Effects Studio**
  - Tune inner and outer window gaps (`inner_gap`, `outer_gap`) live with sliders.
  - Color pickers for focused and inactive window borders.
  - Windows 11 corner styles (`square`, `rounded`, `small_rounded`).
  - **Live interactive preview** of how your desktop will look while you tweak settings.

- **🛡️ Smart Window Rules**
  - **Live Window Detector:** lists every open window (`process_name`, `class_name`, `title`) via GlazeWM IPC.
  - **One-click rule creation:** make floating windows (`set-floating`), ignore windows (`ignore`) or move them to a workspace (`move --workspace X`) without typing app names by hand.

- **⌨️ Keybindings & Conflict Detection**
  - Search and filter all shortcuts with visual key badges (`<kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>Q</kbd>`).
  - **Conflict detector:** automatically flags combinations bound to more than one command.
  - Add and remove shortcuts from a simple form.

- **🗂️ Workspaces**
  - Manage workspace labels (`display_name`) and monitor bindings (`bind_to_monitor`).
  - One-click focus test for any workspace (`focus --workspace`).

- **⚙️ General Preferences**
  - `focus_follows_cursor`, `toggle_workspace_on_refocus`.
  - Manage `startup_commands` and `shutdown_commands`.

- **📝 YAML Editor & Auto-Backup**
  - Edit `config.yaml` directly with syntax validation.
  - Every save creates a timestamped backup (`config.backup-YYYY-MM-DD.yaml`) with one-click restore.

- **⚡ System Tray & Real-time IPC**
  - Connects to the GlazeWM background service over local WebSocket IPC.
  - Tray menu shortcuts: reload config (`wm-reload-config`), toggle floating, change tiling direction.

---

## 🚀 Getting Started

### Prerequisites

- Windows 10/11
- [GlazeWM](https://github.com/glzr-io/glazewm) installed
- [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/)

### Development mode

```bash
# Install dependencies
pnpm install

# Start the Vite dev server and Electron together
pnpm run electron:dev
```

### Build a Windows `.exe`

```bash
# Portable single-file .exe (no installation needed)
pnpm run package:portable

# NSIS installer + portable .exe
pnpm run package
```

Artifacts are written to `release/` (e.g. `release/GlazeWM UI 1.0.0.exe`).

---

## 🧱 Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Shell    | Electron 34                         |
| UI       | React 19 + TypeScript               |
| Styling  | Tailwind CSS 3                      |
| Build    | Vite 6 + electron-builder           |
| Config   | YAML (`yaml`) + GlazeWM IPC         |
| Icons    | lucide-react                        |

---

## 📁 Project Structure

```
electron/        Main process, preload bridge, config & GlazeWM services
src/             React renderer (views, components, services, types)
index.html       Renderer entry point
vite.config.ts   Vite build configuration
package.json     Scripts, dependencies and electron-builder config
```

---

## 🤝 Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first so we can discuss the approach.

## 📄 License

Released under the [MIT License](LICENSE).
