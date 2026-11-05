import React from 'react';
import { LayoutGrid, ShieldAlert, Keyboard, Monitor, Sliders, FileCode2 } from 'lucide-react';

export type NavTab = 'gaps' | 'rules' | 'keybindings' | 'workspaces' | 'general' | 'raw';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  configPath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, configPath }) => {
  const tabs = [
    { id: 'gaps', label: 'Boşluk & Efektler', icon: LayoutGrid, desc: 'Gaps, borders & styles' },
    { id: 'rules', label: 'Pencere Kuralları', icon: ShieldAlert, desc: 'Window rules & floating' },
    { id: 'keybindings', label: 'Kısayol Tuşları', icon: Keyboard, desc: 'Hotkeys & keybindings' },
    { id: 'workspaces', label: 'Çalışma Alanları', icon: Monitor, desc: 'Workspaces & monitors' },
    { id: 'general', label: 'Genel Tercihler', icon: Sliders, desc: 'Focus & startup scripts' },
    { id: 'raw', label: 'YAML & Yedekler', icon: FileCode2, desc: 'Direct editor & history' },
  ];

  return (
    <div className="w-64 bg-[#0e111a] border-r border-[#1f2433] flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Modüller
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as NavTab)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a26]'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/40'
                    : 'bg-[#181d2c] text-slate-400 group-hover:text-white'
                }`}
              >
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate">{tab.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{tab.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#131722] rounded-xl border border-[#22293d] text-[11px] space-y-1">
        <div className="text-slate-400 font-medium">Config Dosyası:</div>
        <div className="text-[10px] text-slate-500 font-mono break-all truncate" title={configPath}>
          {configPath ? configPath.replace(/^.*[\\/]/, '') : 'config.yaml'}
        </div>
        <div className="text-[9px] text-emerald-400/90 pt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
          Her kayıtta otomatik yedek alınır
        </div>
      </div>
    </div>
  );
};
