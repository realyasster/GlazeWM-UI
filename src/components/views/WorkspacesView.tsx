import React, { useState } from 'react';
import { GlazeConfig, GlazeWorkspace } from '../../types/config';
import { api } from '../../services/api';
import { Monitor, Plus, Trash2, Play } from 'lucide-react';

interface WorkspacesViewProps {
  config: GlazeConfig;
  onChange: (updated: Partial<GlazeConfig>) => void;
}

export const WorkspacesView: React.FC<WorkspacesViewProps> = ({ config, onChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newMonitor, setNewMonitor] = useState<string>('');

  const workspaces = config.workspaces || [];

  const handleFocusWorkspace = async (name: string) => {
    await api.runCommand(`focus --workspace ${name}`);
  };

  const handleDeleteWorkspace = (index: number) => {
    const updated = [...workspaces];
    updated.splice(index, 1);
    onChange({ workspaces: updated });
  };

  const handleAddWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newWs: GlazeWorkspace = {
      name: newName.trim(),
      display_name: newDisplayName.trim() || undefined,
      bind_to_monitor: newMonitor !== '' ? Number(newMonitor) : undefined,
    };

    onChange({ workspaces: [...workspaces, newWs] });
    setShowModal(false);
    setNewName('');
    setNewDisplayName('');
    setNewMonitor('');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Monitor className="text-blue-400" size={20} />
            Çalışma Alanları (Workspaces)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sanal masaüstlerinizi, çubuk etiketlerini ve hangi monitöre sabitleneceklerini (pin) yönetin.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
        >
          <Plus size={15} />
          <span>Yeni Çalışma Alanı</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((ws, idx) => (
          <div
            key={ws.name || idx}
            className="bg-[#121520] border border-[#23293a] hover:border-blue-500/40 p-4 rounded-2xl space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold text-xs flex items-center justify-center border border-blue-500/30">
                  {ws.name}
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {ws.display_name || `Workspace ${ws.name}`}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleFocusWorkspace(ws.name)}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                  title="Bu alana geçiş yap (IPC Test)"
                >
                  <Play size={13} />
                </button>
                <button
                  onClick={() => handleDeleteWorkspace(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Alanı Sil"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-[#1d2334]">
              <span>Monitör Sabitleme:</span>
              <span className="font-mono text-slate-300 font-medium">
                {ws.bind_to_monitor !== undefined ? `Monitör #${ws.bind_to_monitor}` : 'Tüm Monitörler'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121622] border border-[#273046] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Yeni Çalışma Alanı Ekle</h3>

            <form onSubmit={handleAddWorkspace} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Alan Adı / ID (Örn: 1, 2, code, web)</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="örn: 5 veya dev"
                  className="w-full bg-[#181d2a] border border-[#293248] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Görünür Etiket (Display Name)</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="örn: 5: Eğlence veya [D] Dev"
                  className="w-full bg-[#181d2a] border border-[#293248] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Bağlanacak Monitör İndeksi (Opsiyonel)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={newMonitor}
                  onChange={(e) => setNewMonitor(e.target.value)}
                  placeholder="Boş bırakılırsa tüm monitörlerde serbesttir"
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
                  Alanı Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
