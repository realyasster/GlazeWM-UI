import React, { useState } from 'react';
import { GlazeConfig } from '../../types/config';
import { Sliders, Terminal, MousePointer2, Trash2 } from 'lucide-react';

interface GeneralSettingsViewProps {
  config: GlazeConfig;
  onChange: (updated: Partial<GlazeConfig>) => void;
}

export const GeneralSettingsView: React.FC<GeneralSettingsViewProps> = ({ config, onChange }) => {
  const general = config.general || {};

  const [newStartupCmd, setNewStartupCmd] = useState('');
  const [newShutdownCmd, setNewShutdownCmd] = useState('');

  const updateGeneral = (field: string, value: any) => {
    onChange({
      general: {
        ...general,
        [field]: value,
      },
    });
  };

  const addStartupCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartupCmd.trim()) return;
    const current = general.startup_commands || [];
    updateGeneral('startup_commands', [...current, newStartupCmd.trim()]);
    setNewStartupCmd('');
  };

  const removeStartupCommand = (index: number) => {
    const current = [...(general.startup_commands || [])];
    current.splice(index, 1);
    updateGeneral('startup_commands', current);
  };

  const addShutdownCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShutdownCmd.trim()) return;
    const current = general.shutdown_commands || [];
    updateGeneral('shutdown_commands', [...current, newShutdownCmd.trim()]);
    setNewShutdownCmd('');
  };

  const removeShutdownCommand = (index: number) => {
    const current = [...(general.shutdown_commands || [])];
    current.splice(index, 1);
    updateGeneral('shutdown_commands', current);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="text-blue-400" size={20} />
          Genel Tercihler ve Başlangıç Komutları
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Pencere odak davranışları, imleç hareketleri ve GlazeWM açılış/kapanış betiklerini yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Focus & Cursor Behavior */}
        <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <MousePointer2 size={16} className="text-blue-400" />
            Odak ve İmleç Davranışları
          </div>

          <div className="space-y-3">
            {/* Focus Follows Cursor */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a26] border border-[#202738]">
              <div>
                <div className="text-xs font-medium text-slate-200">Fareyi Takip Eden Odak</div>
                <div className="text-[10px] text-slate-400">
                  Fare imleci pencere üzerine geldiğinde otomatik olarak odaklanır.
                </div>
              </div>
              <input
                type="checkbox"
                checked={general.focus_follows_cursor ?? false}
                onChange={(e) => updateGeneral('focus_follows_cursor', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>

            {/* Toggle Workspace on Refocus */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a26] border border-[#202738]">
              <div>
                <div className="text-xs font-medium text-slate-200">Tekrar Tıklamada Geri Dön</div>
                <div className="text-[10px] text-slate-400">
                  Aktif alana tekrar tıklandığında bir önceki çalışma alanına döner.
                </div>
              </div>
              <input
                type="checkbox"
                checked={general.toggle_workspace_on_refocus ?? false}
                onChange={(e) => updateGeneral('toggle_workspace_on_refocus', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>

            {/* Show all in taskbar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a26] border border-[#202738]">
              <div>
                <div className="text-xs font-medium text-slate-200">Görev Çubuğunda Tümünü Göster</div>
                <div className="text-[10px] text-slate-400">
                  Gizli alanlardaki pencereleri Windows görev çubuğunda gizlemez.
                </div>
              </div>
              <input
                type="checkbox"
                checked={general.show_all_in_taskbar ?? false}
                onChange={(e) => updateGeneral('show_all_in_taskbar', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>

            {/* Hide Method */}
            <div className="p-3 rounded-xl bg-[#161a26] border border-[#202738] space-y-1.5">
              <div className="text-xs font-medium text-slate-200">Gizleme Yöntemi (Hide Method)</div>
              <select
                value={general.hide_method || 'cloak'}
                onChange={(e) => updateGeneral('hide_method', e.target.value)}
                className="w-full bg-[#1c2232] border border-[#2b354c] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="cloak">Cloak (Önerilen - Hızlı ve temiz)</option>
                <option value="hide">Hide (Tamamen gizle)</option>
                <option value="place_in_corner">Place in Corner (Köşeye küçült)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Startup & Shutdown Commands */}
        <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Terminal size={16} className="text-emerald-400" />
            Otomatik Başlatma Komutları
          </div>

          {/* Startup Commands */}
          <div className="space-y-2">
            <div className="text-xs text-slate-300 font-medium">GlazeWM Açıldığında Çalıştırılanlar</div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {(general.startup_commands || []).map((cmd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#161a26] border border-[#202738] px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300"
                >
                  <span className="truncate">{cmd}</span>
                  <button
                    onClick={() => removeStartupCommand(idx)}
                    className="text-slate-500 hover:text-rose-400 ml-2"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addStartupCommand} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newStartupCmd}
                onChange={(e) => setNewStartupCmd(e.target.value)}
                placeholder="örn: shell-exec zebar"
                className="flex-1 bg-[#161a26] border border-[#202738] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium"
              >
                Ekle
              </button>
            </form>
          </div>

          {/* Shutdown Commands */}
          <div className="space-y-2 pt-2 border-t border-[#1f2535]">
            <div className="text-xs text-slate-300 font-medium">GlazeWM Kapanırken Çalıştırılanlar</div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {(general.shutdown_commands || []).map((cmd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#161a26] border border-[#202738] px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300"
                >
                  <span className="truncate">{cmd}</span>
                  <button
                    onClick={() => removeShutdownCommand(idx)}
                    className="text-slate-500 hover:text-rose-400 ml-2"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addShutdownCommand} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newShutdownCmd}
                onChange={(e) => setNewShutdownCmd(e.target.value)}
                placeholder="örn: shell-exec taskkill /IM zebar.exe /F"
                className="flex-1 bg-[#161a26] border border-[#202738] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium"
              >
                Ekle
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
