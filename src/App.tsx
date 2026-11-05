import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { HeaderBar } from './components/HeaderBar';
import { Sidebar, NavTab } from './components/Sidebar';
import { GapsAndEffectsView } from './components/views/GapsAndEffectsView';
import { WindowRulesView } from './components/views/WindowRulesView';
import { KeybindingsView } from './components/views/KeybindingsView';
import { WorkspacesView } from './components/views/WorkspacesView';
import { GeneralSettingsView } from './components/views/GeneralSettingsView';
import { RawYamlView } from './components/views/RawYamlView';
import { GlazeConfig } from './types/config';
import { api } from './services/api';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('gaps');
  const [config, setConfig] = useState<GlazeConfig>({});
  const [originalConfigStr, setOriginalConfigStr] = useState<string>('');
  const [configPath, setConfigPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });
  const [status, setStatus] = useState({
    connected: false,
    paused: false,
    activeWorkspace: '1',
    focusedWindow: undefined as any,
    error: undefined as string | undefined,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [pathRes, parsedRes, statusRes] = await Promise.all([
        api.getConfigPath(),
        api.loadParsedConfig(),
        api.getGlazeStatus(),
      ]);

      setConfigPath(pathRes);
      if (parsedRes.success && parsedRes.data) {
        setConfig(parsedRes.data);
        setOriginalConfigStr(JSON.stringify(parsedRes.data));
      }
      if (statusRes) {
        setStatus(statusRes);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Listen for live GlazeWM updates
    const unsubscribeStatus = api.onGlazeStatus((newStatus) => {
      setStatus(newStatus);
    });

    const unsubscribeEvent = api.onGlazeEvent(() => {
      // Event received
    });

    return () => {
      unsubscribeStatus();
      unsubscribeEvent();
    };
  }, []);

  const hasUnsavedChanges = JSON.stringify(config) !== originalConfigStr;

  const handleConfigChange = (updated: Partial<GlazeConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await api.saveConfig(config);
      if (res.success) {
        setOriginalConfigStr(JSON.stringify(config));
        // Reload GlazeWM config and redraw
        const reloadRes = await api.runCommand('wm-reload-config');
        if (reloadRes.success) {
          showToast('Yapılandırma kaydedildi ve GlazeWM\'e başarıyla uygulandı!', 'success');
        } else {
          showToast(`Kaydedildi fakat GlazeWM yenilenemedi: ${reloadRes.error || 'IPC hatası'}`, 'error');
        }
      } else {
        showToast(`Kaydetme hatası: ${res.error || 'Dosyaya yazılamadı'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Hata: ${err.message || 'Beklenmeyen hata'}`, 'error');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090b10] text-slate-100 overflow-hidden font-sans select-none relative">
      {/* Toast Alert Banner */}
      {toast.show && (
        <div className="fixed top-12 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-3 duration-200 text-xs font-medium max-w-md bg-[#111726]/95 border-[#2b395a]">
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span className="text-slate-100 flex-1 leading-normal">{toast.message}</span>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-white shrink-0 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Frameless Top Drag Bar */}
      <TitleBar />

      {/* Global Status and Quick Controls */}
      <HeaderBar
        status={status}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onRefresh={loadInitialData}
        onShowToast={showToast}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          configPath={configPath}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0c0e15] custom-scroll">
          {loading ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              Yapılandırma yükleniyor...
            </div>
          ) : (
            <>
              {currentTab === 'gaps' && (
                <GapsAndEffectsView config={config} onChange={handleConfigChange} />
              )}
              {currentTab === 'rules' && (
                <WindowRulesView config={config} onChange={handleConfigChange} />
              )}
              {currentTab === 'keybindings' && (
                <KeybindingsView config={config} onChange={handleConfigChange} />
              )}
              {currentTab === 'workspaces' && (
                <WorkspacesView config={config} onChange={handleConfigChange} />
              )}
              {currentTab === 'general' && (
                <GeneralSettingsView config={config} onChange={handleConfigChange} />
              )}
              {currentTab === 'raw' && (
                <RawYamlView onConfigSaved={loadInitialData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
