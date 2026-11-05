import React, { useState } from 'react';
import { GlazeConfig } from '../../types/config';
import { Sparkles, Maximize2, Palette } from 'lucide-react';

interface GapsAndEffectsViewProps {
  config: GlazeConfig;
  onChange: (updated: Partial<GlazeConfig>) => void;
}

export const GapsAndEffectsView: React.FC<GapsAndEffectsViewProps> = ({ config, onChange }) => {
  // Helper to parse integer pixels from '12px'
  const parsePx = (val?: string, defaultVal = 10) => {
    if (!val) return defaultVal;
    const num = parseInt(val.replace('px', ''), 10);
    return isNaN(num) ? defaultVal : num;
  };

  const innerGapPx = parsePx(config.gaps?.inner_gap, 12);
  const outerTopPx = parsePx(config.gaps?.outer_gap?.top, 12);
  const outerRightPx = parsePx(config.gaps?.outer_gap?.right, 12);
  const outerBottomPx = parsePx(config.gaps?.outer_gap?.bottom, 12);
  const outerLeftPx = parsePx(config.gaps?.outer_gap?.left, 12);

  const focusedBorderColor = config.window_effects?.focused_window?.border?.color || '#3b82f6';
  const otherBorderColor = config.window_effects?.other_windows?.border?.color || '#272d3d';
  const focusedCornerStyle = config.window_effects?.focused_window?.corner_style?.style || 'rounded';

  const [activeMock, setActiveMock] = useState<number>(1);

  const updateInnerGap = (px: number) => {
    onChange({
      gaps: {
        ...config.gaps,
        inner_gap: `${px}px`,
        outer_gap: config.gaps?.outer_gap || {
          top: '12px',
          right: '12px',
          bottom: '12px',
          left: '12px',
        },
      },
    });
  };

  const updateAllOuterGaps = (px: number) => {
    onChange({
      gaps: {
        ...config.gaps,
        inner_gap: config.gaps?.inner_gap || '12px',
        outer_gap: {
          top: `${px}px`,
          right: `${px}px`,
          bottom: `${px}px`,
          left: `${px}px`,
        },
      },
    });
  };

  const updateFocusedBorderColor = (color: string) => {
    onChange({
      window_effects: {
        ...config.window_effects,
        focused_window: {
          ...config.window_effects?.focused_window,
          border: {
            enabled: true,
            color,
          },
        },
        other_windows: config.window_effects?.other_windows || {
          border: { enabled: true, color: '#272d3d' },
        },
      },
    });
  };

  const updateOtherBorderColor = (color: string) => {
    onChange({
      window_effects: {
        ...config.window_effects,
        focused_window: config.window_effects?.focused_window || {
          border: { enabled: true, color: '#3b82f6' },
        },
        other_windows: {
          ...config.window_effects?.other_windows,
          border: {
            enabled: true,
            color,
          },
        },
      },
    });
  };

  const updateCornerStyle = (style: 'square' | 'rounded' | 'small_rounded') => {
    onChange({
      window_effects: {
        ...config.window_effects,
        focused_window: {
          ...config.window_effects?.focused_window,
          border: config.window_effects?.focused_window?.border || { enabled: true, color: '#3b82f6' },
          corner_style: { enabled: true, style },
        },
        other_windows: {
          ...config.window_effects?.other_windows,
          border: config.window_effects?.other_windows?.border || { enabled: true, color: '#272d3d' },
          corner_style: { enabled: true, style },
        },
      },
    });
  };

  const getBorderRadiusClass = () => {
    if (focusedCornerStyle === 'square') return 'rounded-none';
    if (focusedCornerStyle === 'small_rounded') return 'rounded-md';
    return 'rounded-xl';
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="text-blue-400" size={20} />
          Boşluklar ve Pencere Efektleri (Gaps & Effects)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Döşenen pencerelerin aralarındaki boşlukları, kenarlık renklerini ve köşe stillerini anlık olarak özelleştirin.
        </p>
      </div>

      {/* Live Interactive Preview Box */}
      <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Canlı Masaüstü Önizlemesi</span>
          <span>Herhangi bir pencereye tıklayarak odak durumunu değiştirin</span>
        </div>

        {/* Mock Screen */}
        <div
          className="bg-[#090b10] rounded-xl border border-[#1e2333] relative h-64 overflow-hidden flex flex-col transition-all"
          style={{
            padding: `${Math.min(outerTopPx, 30)}px ${Math.min(outerRightPx, 30)}px ${Math.min(
              outerBottomPx,
              30
            )}px ${Math.min(outerLeftPx, 30)}px`,
          }}
        >
          <div
            className="flex-1 flex gap-3"
            style={{ gap: `${Math.min(innerGapPx, 30)}px` }}
          >
            {/* Left Mock Window */}
            <div
              onClick={() => setActiveMock(1)}
              className={`flex-1 bg-[#151926] transition-all cursor-pointer p-3 flex flex-col justify-between ${getBorderRadiusClass()}`}
              style={{
                border: `2px solid ${activeMock === 1 ? focusedBorderColor : otherBorderColor}`,
                boxShadow: activeMock === 1 ? `0 0 16px ${focusedBorderColor}33` : 'none',
              }}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
                <span className="font-medium text-slate-200">Terminal (PowerShell)</span>
                {activeMock === 1 && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono">
                    Odaklı
                  </span>
                )}
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                $ glazewm command focus --direction right
              </div>
            </div>

            {/* Right Stack */}
            <div
              className="flex-1 flex flex-col"
              style={{ gap: `${Math.min(innerGapPx, 30)}px` }}
            >
              <div
                onClick={() => setActiveMock(2)}
                className={`flex-1 bg-[#151926] transition-all cursor-pointer p-3 flex flex-col justify-between ${getBorderRadiusClass()}`}
                style={{
                  border: `2px solid ${activeMock === 2 ? focusedBorderColor : otherBorderColor}`,
                  boxShadow: activeMock === 2 ? `0 0 16px ${focusedBorderColor}33` : 'none',
                }}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="font-medium text-slate-200">Visual Studio Code</span>
                  {activeMock === 2 && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono">
                      Odaklı
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">src/components/App.tsx</div>
              </div>

              <div
                onClick={() => setActiveMock(3)}
                className={`flex-1 bg-[#151926] transition-all cursor-pointer p-3 flex flex-col justify-between ${getBorderRadiusClass()}`}
                style={{
                  border: `2px solid ${activeMock === 3 ? focusedBorderColor : otherBorderColor}`,
                  boxShadow: activeMock === 3 ? `0 0 16px ${focusedBorderColor}33` : 'none',
                }}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="font-medium text-slate-200">Tarayıcı</span>
                  {activeMock === 3 && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono">
                      Odaklı
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">github.com/glzr-io/glazewm</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gap Controls Card */}
        <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Maximize2 size={16} className="text-blue-400" />
            Boşluk Ayarları (Gaps)
          </div>

          {/* Inner Gap Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">İç Boşluk (Pencereler Arası)</span>
              <span className="font-mono text-blue-400 font-bold">{innerGapPx}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={innerGapPx}
              onChange={(e) => updateInnerGap(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Outer Gap Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Dış Boşluk (Ekran Kenarları)</span>
              <span className="font-mono text-blue-400 font-bold">{outerTopPx}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={outerTopPx}
              onChange={(e) => updateAllOuterGaps(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* DPI Scaling Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1f2535]">
            <span className="text-xs text-slate-300 font-medium">DPI ile Otomatik Ölçekle</span>
            <input
              type="checkbox"
              checked={config.gaps?.scale_with_dpi ?? true}
              onChange={(e) =>
                onChange({
                  gaps: {
                    ...config.gaps,
                    inner_gap: config.gaps?.inner_gap || '12px',
                    outer_gap: config.gaps?.outer_gap || {
                      top: '12px',
                      right: '12px',
                      bottom: '12px',
                      left: '12px',
                    },
                    scale_with_dpi: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-700"
            />
          </div>
        </div>

        {/* Window Styling Card */}
        <div className="bg-[#121520] border border-[#23293a] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Palette size={16} className="text-emerald-400" />
            Kenarlık ve Stil Efektleri
          </div>

          {/* Focused Window Border Color */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Odaklı Pencere Kenarlığı</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={focusedBorderColor}
                onChange={(e) => updateFocusedBorderColor(e.target.value)}
                className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-slate-400 text-[11px]">{focusedBorderColor}</span>
            </div>
          </div>

          {/* Other Windows Border Color */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Diğer Pencereler Kenarlığı</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={otherBorderColor}
                onChange={(e) => updateOtherBorderColor(e.target.value)}
                className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-slate-400 text-[11px]">{otherBorderColor}</span>
            </div>
          </div>

          {/* Corner Style (Windows 11) */}
          <div className="pt-2 border-t border-[#1f2535] space-y-2">
            <div className="text-xs text-slate-300 font-medium">Köşe Stili (Windows 11)</div>
            <div className="grid grid-cols-3 gap-2">
              {(['square', 'rounded', 'small_rounded'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateCornerStyle(style)}
                  className={`text-xs py-1.5 px-2 rounded-lg border text-center transition-all ${
                    focusedCornerStyle === style
                      ? 'bg-blue-600 text-white border-blue-500 font-medium shadow-sm'
                      : 'bg-[#181d2a] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {style === 'square' ? 'Köşeli' : style === 'rounded' ? 'Yuvarlak' : 'Hafif Yuvarlak'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
