import React, { useState, useEffect } from 'react';
import { GlazeConfig, WindowRule, ActiveWindowInfo } from '../../types/config';
import { api } from '../../services/api';
import { ShieldCheck, Plus, Trash2, RefreshCw, AppWindow } from 'lucide-react';

interface WindowRulesViewProps {
  config: GlazeConfig;
  onChange: (updated: Partial<GlazeConfig>) => void;
}

export const WindowRulesView: React.FC<WindowRulesViewProps> = ({ config, onChange }) => {
  const [activeWindows, setActiveWindows] = useState<ActiveWindowInfo[]>([]);
  const [loadingWindows, setLoadingWindows] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // New Rule Form State
  const [ruleAction, setRuleAction] = useState<string>('set-floating');
  const [targetWorkspace, setTargetWorkspace] = useState<string>('2');
  const [matchType, setMatchType] = useState<'process' | 'class' | 'title'>('process');
  const [matchOperator, setMatchOperator] = useState<'equals' | 'contains' | 'regex'>('equals');
  const [matchValue, setMatchValue] = useState<string>('');

  const fetchActiveWindows = async () => {
    setLoadingWindows(true);
    try {
      const windows = await api.queryWindows();
      setActiveWindows(windows);
    } catch {
      setActiveWindows([]);
    } finally {
      setLoadingWindows(false);
    }
  };

  useEffect(() => {
    fetchActiveWindows();
  }, []);

  const openRuleModalForWindow = (win: ActiveWindowInfo) => {
    setMatchType('process');
    setMatchOperator('equals');
    setMatchValue(win.processName || '');
    setRuleAction('set-floating');
    setShowModal(true);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchValue.trim()) return;

    let command = ruleAction;
    if (ruleAction === 'move') {
      command = `move --workspace ${targetWorkspace}`;
    }

    const matchObj: any = {};
    if (matchType === 'process') {
      matchObj.window_process = { [matchOperator]: matchValue.trim() };
    } else if (matchType === 'class') {
      matchObj.window_class = { [matchOperator]: matchValue.trim() };
    } else {
      matchObj.window_title = { [matchOperator]: matchValue.trim() };
    }

    const newRule: WindowRule = {
      commands: [command],
      match: [matchObj],
    };

    const existingRules = config.window_rules || [];
    onChange({
      window_rules: [...existingRules, newRule],
    });

    setShowModal(false);
    setMatchValue('');
  };

  const handleDeleteRule = (index: number) => {
    const existingRules = [...(config.window_rules || [])];
    existingRules.splice(index, 1);
    onChange({ window_rules: existingRules });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-blue-400" size={20} />
            Pencere Kuralları (Window Rules)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Uygulamaların otomatik olarak kayan pencere (floating), yok sayılan (ignore) veya belirli bir çalışma alanına yönlendirilmesini yapılandırın.
          </p>
        </div>

        <button
          onClick={() => {
            setMatchValue('');
            setShowModal(true);
          }}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
        >
          <Plus size={15} />
          <span>Yeni Kural Ekle</span>
        </button>
      </div>

      {/* Live Active Windows Section */}
      <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <AppWindow size={15} className="text-emerald-400" />
            <span>Açık Pencerelerden Tek Tıkla Kural Oluştur</span>
            <span className="text-[10px] text-slate-500 font-normal">
              ({activeWindows.length} pencere algılandı)
            </span>
          </div>
          <button
            onClick={fetchActiveWindows}
            disabled={loadingWindows}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-[#181d2a] hover:bg-[#202738] transition-colors"
          >
            <RefreshCw size={12} className={loadingWindows ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>
        </div>

        {activeWindows.length === 0 ? (
          <div className="text-xs text-slate-500 py-4 text-center bg-[#0d1018] rounded-xl border border-dashed border-slate-800">
            Şu an algılanan açık pencere yok veya GlazeWM çalışmıyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {activeWindows.map((win, idx) => (
              <div
                key={win.id || idx}
                className="bg-[#161b27] hover:bg-[#1a2131] border border-[#22293b] p-2.5 rounded-xl flex items-center justify-between gap-2 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-200 truncate" title={win.title}>
                    {win.title || win.processName || 'İsimsiz Pencere'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5 truncate">
                    <span>proc: <strong className="text-blue-400">{win.processName}</strong></span>
                    {win.className && <span>cls: {win.className}</span>}
                  </div>
                </div>
                <button
                  onClick={() => openRuleModalForWindow(win)}
                  className="text-[10px] bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2 py-1 rounded-lg border border-blue-500/30 transition-all font-medium whitespace-nowrap"
                  title="Bu uygulama için kural tanımla"
                >
                  + Kural
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configured Rules List */}
      <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-5 space-y-3">
        <div className="text-xs font-semibold text-slate-200">
          Mevcut Yapılandırılmış Kurallar ({config.window_rules?.length || 0})
        </div>

        {(!config.window_rules || config.window_rules.length === 0) ? (
          <div className="text-xs text-slate-500 py-6 text-center bg-[#0d1018] rounded-xl border border-dashed border-slate-800">
            Henüz tanımlanmış bir kural bulunmuyor.
          </div>
        ) : (
          <div className="space-y-2">
            {config.window_rules.map((rule, idx) => {
              const cmd = rule.commands?.join(', ') || 'komut yok';
              const matchSummary = rule.match
                ?.map((m) => {
                  if (m.window_process) return `process == "${Object.values(m.window_process)[0]}"`;
                  if (m.window_class) return `class == "${Object.values(m.window_class)[0]}"`;
                  if (m.window_title) return `title == "${Object.values(m.window_title)[0]}"`;
                  return 'kural';
                })
                .join(' VEYA ');

              return (
                <div
                  key={idx}
                  className="bg-[#151926] border border-[#22293b] p-3 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                        {cmd}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Eşleşme: <span className="text-slate-300">{matchSummary}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRule(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Kuralı Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121622] border border-[#273046] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Yeni Pencere Kuralı</h3>

            <form onSubmit={handleAddRule} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Uygulanacak Eylem</label>
                <select
                  value={ruleAction}
                  onChange={(e) => setRuleAction(e.target.value)}
                  className="w-full bg-[#181d2a] border border-[#293248] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="set-floating">Her Zaman Kayan Pencere (set-floating)</option>
                  <option value="ignore">GlazeWM Yönetmesin (ignore)</option>
                  <option value="set-tiling">Her Zaman Döşe (set-tiling)</option>
                  <option value="move">Belirli Bir Alana Taşı (move --workspace)</option>
                </select>
              </div>

              {ruleAction === 'move' && (
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Hedef Çalışma Alanı</label>
                  <input
                    type="text"
                    value={targetWorkspace}
                    onChange={(e) => setTargetWorkspace(e.target.value)}
                    placeholder="örn: 2 veya 3"
                    className="w-full bg-[#181d2a] border border-[#293248] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Eşleşme Kriteri</label>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value as any)}
                    className="w-full bg-[#181d2a] border border-[#293248] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="process">İşlem Adı (Process)</option>
                    <option value="class">Pencere Sınıfı (Class)</option>
                    <option value="title">Pencere Başlığı (Title)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Operatör</label>
                  <select
                    value={matchOperator}
                    onChange={(e) => setMatchOperator(e.target.value as any)}
                    className="w-full bg-[#181d2a] border border-[#293248] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="equals">Tam Eşleşme (equals)</option>
                    <option value="contains">İçerir (contains)</option>
                    <option value="regex">Düzenli İfade (regex)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Eşleşecek Değer</label>
                <input
                  type="text"
                  required
                  value={matchValue}
                  onChange={(e) => setMatchValue(e.target.value)}
                  placeholder="örn: spotify veya chrome"
                  className="w-full bg-[#181d2a] border border-[#293248] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-[#181d2a]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm"
                >
                  Kuralı Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
