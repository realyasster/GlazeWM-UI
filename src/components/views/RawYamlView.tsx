import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import YAML from 'yaml';
import { FileCode2, History, RotateCcw, CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface RawYamlViewProps {
  onConfigSaved: () => void;
}

export const RawYamlView: React.FC<RawYamlViewProps> = ({ onConfigSaved }) => {
  const [yamlContent, setYamlContent] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [backups, setBackups] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await api.loadRawConfig();
      if (res.success && res.data) {
        setYamlContent(res.data);
      }
      const bList = await api.listBackups();
      setBackups(bList);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidate = () => {
    try {
      YAML.parse(yamlContent);
      setValidationError(null);
      setValidationSuccess(true);
      setTimeout(() => setValidationSuccess(false), 3000);
      return true;
    } catch (err: any) {
      setValidationError(err.message || 'Geçersiz YAML formatı!');
      setValidationSuccess(false);
      return false;
    }
  };

  const handleSave = async () => {
    if (!handleValidate()) return;
    setSaving(true);
    try {
      const res = await api.saveConfig(yamlContent);
      if (res.success) {
        setSaveSuccessMsg('Konfigürasyon kaydedildi ve GlazeWM güncellendi!');
        await api.runCommand('wm-reload-config');
        onConfigSaved();
        const bList = await api.listBackups();
        setBackups(bList);
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      } else {
        setValidationError(res.error || 'Kaydetme hatası!');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (backupPath: string) => {
    if (!window.confirm('Bu yedeği geri yüklemek istediğinize emin misiniz?')) return;
    const res = await api.restoreBackup(backupPath);
    if (res.success && res.data) {
      setYamlContent(res.data);
      await api.runCommand('wm-reload-config');
      onConfigSaved();
      setSaveSuccessMsg('Yedek başarıyla geri yüklendi!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileCode2 className="text-blue-400" size={20} />
            Doğrudan YAML Editörü ve Yedekleme Geçmişi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            GlazeWM config dosyasını satır satır düzenleyin, sözdizimini doğrulayın ve geçmiş yedeklere geri dönün.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleValidate}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#181d2a] hover:bg-[#22293b] text-slate-300 hover:text-white border border-[#2b354c] transition-all"
          >
            Sözdizimi Kontrolü
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
          >
            <Save size={14} />
            <span>{saving ? 'Kaydediliyor...' : 'Kaydet & Uygula'}</span>
          </button>
        </div>
      </div>

      {validationSuccess && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
          <CheckCircle2 size={16} />
          <span>YAML sözdizimi geçerli ve hatasız.</span>
        </div>
      )}

      {validationError && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
          <AlertCircle size={16} />
          <span className="font-mono">{validationError}</span>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
          <CheckCircle2 size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Editor Area */}
        <div className="lg:col-span-3 bg-[#0d0f17] border border-[#23293a] rounded-2xl overflow-hidden flex flex-col shadow-inner">
          <div className="bg-[#121622] px-4 py-2 border-b border-[#202738] text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>config.yaml</span>
            <span>UTF-8 • YAML</span>
          </div>

          <textarea
            value={yamlContent}
            onChange={(e) => {
              setYamlContent(e.target.value);
              setValidationError(null);
            }}
            placeholder="YAML içeriği yükleniyor..."
            spellCheck={false}
            className="w-full h-[460px] p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-blue-600 selection:text-white"
          />
        </div>

        {/* Backups Column */}
        <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-4 space-y-3 flex flex-col h-[505px]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <History size={15} className="text-blue-400" />
            <span>Otomatik Yedekler ({backups.length})</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Her kayıt işleminden önce güvenliğiniz için otomatik yedek alınır.
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {backups.length === 0 ? (
              <div className="text-[11px] text-slate-500 text-center py-6">
                Henüz kayıtlı yedek yok.
              </div>
            ) : (
              backups.map((bPath, idx) => {
                const fileName = bPath.replace(/^.*[\\/]/, '');
                const cleanDate = fileName
                  .replace('config.backup-', '')
                  .replace('.yaml', '')
                  .replace(/T/, ' ')
                  .replace(/-\d\d-\d\d\dZ/, '');

                return (
                  <div
                    key={idx}
                    className="bg-[#161a26] border border-[#222938] hover:border-slate-700 p-2.5 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="text-[10px] text-slate-300 font-mono truncate" title={fileName}>
                      {cleanDate || fileName}
                    </div>
                    <button
                      onClick={() => handleRestore(bPath)}
                      className="w-full flex items-center justify-center gap-1 text-[10px] bg-[#1e2435] hover:bg-blue-600 hover:text-white text-slate-300 py-1 rounded-lg transition-colors font-medium"
                    >
                      <RotateCcw size={11} />
                      <span>Geri Yükle</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
