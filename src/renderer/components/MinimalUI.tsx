import React, { useState } from 'react';
import { Flame, Sliders, X, Power, Volume2, Shield } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getDeskCharmApi } from '../api';

interface MinimalUIProps {
  onTriggerFire?: () => void;
}

export const MinimalUI: React.FC<MinimalUIProps> = ({ onTriggerFire }) => {
  const [openSettings, setOpenSettings] = useState(false);
  const settings = useAppStore((s) => s.settings);
  const updateCharmSettings = useAppStore((s) => s.updateCharmSettings);
  const updateDesktopSettings = useAppStore((s) => s.updateDesktopSettings);

  return (
    <>
      {/* Tiny Floating Trigger Button (Bottom-Right corner) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={onTriggerFire}
          className="p-2.5 rounded-full bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border border-orange-400/30 group"
          title="Breathe Fire"
        >
          <Flame className="w-4 h-4 animate-pulse group-hover:scale-125 transition-transform" />
        </button>

        <button
          onClick={() => setOpenSettings(!openSettings)}
          className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          title="DeskCharm Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Sleek Minimal Settings Modal */}
      {openSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div
            className="w-[320px] bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-100 font-sans backdrop-blur-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🐉</span>
                <span className="font-semibold text-sm tracking-wide text-amber-400">DeskCharm Dragon</span>
              </div>
              <button
                onClick={() => setOpenSettings(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4 text-xs">
              <button
                onClick={() => {
                  onTriggerFire?.();
                  setOpenSettings(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all"
              >
                <Flame className="w-4 h-4" />
                Breathe Fire Now
              </button>

              {/* Dragon Size Slider */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1.5 font-medium">
                  <span>Dragon Scale</span>
                  <span className="text-amber-400 font-mono">{settings.charm?.size || 48}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="96"
                  step="4"
                  value={settings.charm?.size || 48}
                  onChange={(e) => updateCharmSettings({ size: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Always on top toggle */}
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-300 font-medium">Always On Top</span>
                <button
                  onClick={() => updateDesktopSettings({ alwaysOnTop: !settings.desktop?.alwaysOnTop })}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    settings.desktop?.alwaysOnTop ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${
                      settings.desktop?.alwaysOnTop ? 'translate-x-4.5' : 'translate-x-0.75'
                    }`}
                  />
                </button>
              </div>

              {/* Quit App */}
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => getDeskCharmApi().quitApp()}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Power className="w-3.5 h-3.5" />
                  Exit DeskCharm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
