import React from 'react';
import { Minus, Square, X, Layers } from 'lucide-react';
import { api } from '../services/api';

export const TitleBar: React.FC = () => {
  return (
    <div className="h-9 bg-[#0e1017] border-b border-[#1f2433] flex items-center justify-between px-3 app-drag-region select-none">
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
          <Layers size={13} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-semibold tracking-wide text-slate-300">
          GlazeWM Control Center
        </span>
        <span className="text-[10px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
          v1.0
        </span>
      </div>

      <div className="flex items-center space-x-1 app-no-drag">
        <button
          onClick={() => api.minimizeWindow()}
          className="w-7 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Simge durumuna küçült"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => api.maximizeWindow()}
          className="w-7 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Ekranı kapla"
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => api.minimizeToTray()}
          className="w-7 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Tepsiye Küçült / Kapat"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
