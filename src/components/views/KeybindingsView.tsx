import React, { useState } from 'react';
import { GlazeConfig, Keybinding } from '../../types/config';
import { Keyboard, Plus, Trash2, Search, AlertTriangle } from 'lucide-react';

interface KeybindingsViewProps {
  config: GlazeConfig;
  onChange: (updated: Partial<GlazeConfig>) => void;
}

export const KeybindingsView: React.FC<KeybindingsViewProps> = ({ config, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'focus' | 'move' | 'workspace' | 'wm'>('all');
  const [showModal, setShowModal] = useState(false);

  // New binding form
  const [newCommand, setNewCommand] = useState('focus --direction left');
  const [newBindings, setNewBindings] = useState('alt+h');

  const keybindings = config.keybindings || [];

  // Detect key conflicts
  const conflictMap: Record<string, number> = {};
  keybindings.forEach((k) => {
    k.bindings?.forEach((b) => {
      const normalized = b.toLowerCase().trim();
      conflictMap[normalized] = (conflictMap[normalized] || 0) + 1;
    });
  });

  const filteredBindings = keybindings.filter((kb) => {
    const cmdStr = (kb.commands || []).join(' ').toLowerCase();
    const bindStr = (kb.bindings || []).join(' ').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = cmdStr.includes(query) || bindStr.includes(query);
    if (!matchesSearch) return false;

    if (selectedCategory === 'focus') return cmdStr.includes('focus');
    if (selectedCategory === 'move') return cmdStr.includes('move');
    if (selectedCategory === 'workspace') return cmdStr.includes('workspace');
    if (selectedCategory === 'wm') return cmdStr.includes('wm-') || cmdStr.includes('toggle') || cmdStr.includes('close');
    return true;
  });

  const handleDeleteBinding = (index: number) => {
    const updated = [...keybindings];
    updated.splice(index, 1);
    onChange({ keybindings: updated });
  };

  const handleAddBinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommand.trim() || !newBindings.trim()) return;

    const bindingsArr = newBindings.split(',').map((b) => b.trim()).filter(Boolean);
    const updated: Keybinding[] = [
      ...keybindings,
      {
        commands: [newCommand.trim()],
        bindings: bindingsArr,
      },
    ];

    onChange({ keybindings: updated });
    setShowModal(false);
    setNewBindings('');
  };

  const renderKeyPill = (combo: string) => {
    const keys = combo.split('+');
    const isConflicted = conflictMap[combo.toLowerCase().trim()] > 1;

    return (
      <span
        key={combo}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border ${
          isConflicted
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : 'bg-[#1b2234] text-slate-200 border-[#2d3752]'
        }`}
      >
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            <kbd className="px-1 py-0.2 rounded bg-[#242d45] border border-slate-700 text-slate-100 uppercase text-[10px]">
              {k}
            </kbd>
            {i < keys.length - 1 && <span className="text-slate-500">+</span>}
          </React.Fragment>
        ))}
        {isConflicted && (
          <span title="Bu kısayol birden fazla komuta atanmış!" className="ml-1 text-amber-400">
            ⚠️
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Keyboard className="text-blue-400" size={20} />
            Klavye Kısayolları (Keybindings)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            GlazeWM komutlarına atanmış tuş kombinasyonlarını görüntüleyin, çakışmaları tespit edin ve yeni kısayol ekleyin.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
        >
          <Plus size={15} />
          <span>Yeni Kısayol Ekle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex items-center space-x-2 bg-[#181d2a] border border-[#273046] px-3 py-1.5 rounded-xl flex-1 max-w-md">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Komut veya tuş ara (örn: alt+1, focus, reload)..."
            className="bg-transparent text-xs text-white focus:outline-none w-full"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-xs text-slate-500 hover:text-white">
              ✕
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'focus', label: 'Odak' },
            { id: 'move', label: 'Taşıma' },
            { id: 'workspace', label: 'Alanlar' },
            { id: 'wm', label: 'Sistem' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-500 font-medium'
                  : 'bg-[#181d2a] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keybindings Table */}
      <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-5 space-y-3">
        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Tanımlı Kısayollar ({filteredBindings.length})</span>
          {Object.values(conflictMap).some((c) => c > 1) && (
            <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <AlertTriangle size={12} />
              Bazı kısayollarda çakışma tespit edildi
            </span>
          )}
        </div>

        {filteredBindings.length === 0 ? (
          <div className="text-xs text-slate-500 py-8 text-center bg-[#0d1018] rounded-xl border border-dashed border-slate-800">
            Arama kriterine uygun kısayol bulunamadı.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBindings.map((kb, idx) => (
              <div
                key={idx}
                className="bg-[#151926] hover:bg-[#181d2c] border border-[#22293b] p-3 rounded-xl flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    {kb.bindings?.map((b) => renderKeyPill(b))}
                  </div>
                  <div className="text-xs font-mono text-slate-300 font-semibold truncate">
                    {kb.commands?.join('; ')}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteBinding(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Kısayolu Sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Shortcut Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121622] border border-[#273046] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Yeni Klavye Kısayolu Tanımla</h3>

            <form onSubmit={handleAddBinding} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">GlazeWM Komutu</label>
                <input
                  type="text"
                  required
                  value={newCommand}
                  onChange={(e) => setNewCommand(e.target.value)}
                  placeholder="örn: focus --direction right veya close"
                  className="w-full bg-[#181d2a] border border-[#293248] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">
                  Tuş Kombinasyonları (Virgülle ayırarak çoklu tuş ekleyebilirsiniz)
                </label>
                <input
                  type="text"
                  required
                  value={newBindings}
                  onChange={(e) => setNewBindings(e.target.value)}
                  placeholder="örn: alt+shift+d veya alt+d, alt+right"
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
                  Kısayolu Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
