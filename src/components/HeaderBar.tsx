import React, { useState } from 'react';
import { RefreshCw, Save, Terminal, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface HeaderBarProps {
  status: {
    connected: boolean;
    paused: boolean;
    activeWorkspace?: string;
    focusedWindow?: any;
    error?: string;
  };
  hasUnsavedChanges: boolean;
  onSave: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  status,
  hasUnsavedChanges,
  onSave,
  onRefresh,
  onShowToast,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [showCommandBox, setShowCommandBox] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleRunCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim() || commandLoading) return;
    setCommandLoading(true);
    const res = await api.runCommand(commandInput.trim());
    setCommandLoading(false);
    if (res.success) {
      onShowToast(`Komut çalıştırıldı: ${commandInput.trim()}`, 'success');
      setCommandInput('');
      setShowCommandBox(false);
    } else {
      onShowToast(`Komut hatası: ${res.error || 'Bilinmeyen hata'}`, 'error');
    }
  };

  const handleReloadGlazeConfig = async () => {
    if (isReloading) return;
    setIsReloading(true);
    try {
      const res = await api.runCommand('wm-reload-config');
      await onRefresh();
      if (res.success) {
        onShowToast('GlazeWM yapılandırması başarıyla yeniden yüklendi!', 'success');
      } else {
        onShowToast(`Yeniden yükleme hatası: ${res.error || 'Komut başarısız oldu'}`, 'error');
      }
    } catch (err: any) {
      onShowToast(`Hata: ${err.message || 'Bilinmeyen hata'}`, 'error');
    } finally {
      setIsReloading(false);
    }
  };

  const handleSaveAndApply = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTiling = async () => {
    const res = await api.runCommand('toggle-tiling-direction');
    if (res.success) {
      onShowToast('Tiling yönü değiştirildi', 'success');
    }
  };

  return (
    <div className="bg-[#121620] border-b border-[#222838] px-5 py-3 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Left: Status Badges */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-[#1a2030] px-3 py-1.5 rounded-lg border border-[#2a324b]">
          <span className="relative flex h-2.5 w-2.5">
            {status.connected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                status.connected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span className="text-xs font-medium text-slate-300">
            {status.connected ? 'GlazeWM IPC Bağlı' : 'GlazeWM Bağlı Değil'}
          </span>
        </div>

        {status.activeWorkspace && (
          <div className="flex items-center space-x-1.5 bg-[#1a2030] px-3 py-1.5 rounded-lg border border-[#2a324b] text-xs">
            <span className="text-slate-400">Aktif Alan:</span>
            <span className="font-semibold text-blue-400">{status.activeWorkspace}</span>
          </div>
        )}

        {status.focusedWindow && (
          <div className="hidden lg:flex items-center space-x-1.5 bg-[#1a2030] px-3 py-1.5 rounded-lg border border-[#2a324b] text-xs max-w-xs truncate">
            <span className="text-slate-400">Odak:</span>
            <span className="font-medium text-slate-200 truncate" title={status.focusedWindow.title}>
              {status.focusedWindow.processName || status.focusedWindow.title || 'Pencere'}
            </span>
          </div>
        )}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center space-x-2.5">
        {showCommandBox ? (
          <form onSubmit={handleRunCommand} className="flex items-center space-x-1 bg-[#1a2030] rounded-lg border border-[#3b82f6] px-2 py-1">
            <Terminal size={14} className="text-blue-400 mr-1" />
            <input
              type="text"
              placeholder="örn: focus --workspace 2"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-48 font-mono"
              autoFocus
            />
            <button
              type="submit"
              disabled={commandLoading}
              className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-white font-medium"
            >
              Çalıştır
            </button>
            <button
              type="button"
              onClick={() => setShowCommandBox(false)}
              className="text-xs text-slate-400 hover:text-white px-1"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowCommandBox(true)}
            className="flex items-center space-x-1.5 bg-[#1a2030] hover:bg-[#232b40] text-slate-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-[#2a324b] transition-colors"
            title="GlazeWM CLI komutu çalıştır"
          >
            <Terminal size={14} className="text-blue-400" />
            <span>CLI Komutu</span>
          </button>
        )}

        <button
          onClick={handleToggleTiling}
          className="flex items-center space-x-1.5 bg-[#1a2030] hover:bg-[#232b40] text-slate-300 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-[#2a324b] transition-colors"
          title="Tiling yönünü değiştir (Yatay / Dikey)"
        >
          <RefreshCw size={14} className="text-amber-400" />
          <span>Yön Değiştir</span>
        </button>

        {/* Reload Config Button */}
        <button
          onClick={handleReloadGlazeConfig}
          disabled={isReloading}
          className="flex items-center space-x-1.5 bg-[#1a2030] hover:bg-[#232b40] text-slate-200 hover:text-white text-xs font-medium px-3.5 py-1.5 rounded-lg border border-[#2a324b] hover:border-emerald-500/50 transition-all shadow-sm active:scale-95"
          title="GlazeWM config dosyasını anında yeniden yükler (wm-reload-config)"
        >
          {isReloading ? (
            <Loader2 size={14} className="text-emerald-400 animate-spin" />
          ) : (
            <RefreshCw size={14} className="text-emerald-400" />
          )}
          <span>{isReloading ? 'Yenileniyor...' : 'Config Yenile'}</span>
        </button>

        {/* Save and Apply Button (ALWAYS CLICKABLE) */}
        <button
          onClick={handleSaveAndApply}
          disabled={isSaving}
          className={`flex items-center space-x-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer ${
            hasUnsavedChanges
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 ring-2 ring-blue-400/50 animate-pulse'
              : 'bg-blue-600/80 hover:bg-blue-600 text-white shadow-blue-500/20'
          }`}
          title="Tüm ayarları config.yaml dosyasına kaydeder ve GlazeWM'e uygular"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          <span>
            {isSaving
              ? 'Kaydediliyor...'
              : hasUnsavedChanges
              ? 'Kaydet & Uygula *'
              : 'Kaydet & Uygula'}
          </span>
        </button>
      </div>
    </div>
  );
};
