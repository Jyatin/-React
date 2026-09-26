import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { getDeskCharmApi } from '../api';
import { BUILT_IN_CHARMS } from '../../shared/types/charm';
import { X, ImagePlus } from 'lucide-react';

export const CharmPicker: React.FC = () => {
  const show = useAppStore(s => s.showCharmPicker);
  const setShowCharmPicker = useAppStore(s => s.setShowCharmPicker);
  const close = () => setShowCharmPicker(false);
  const selectCharm = useAppStore(s => s.selectCharm);
  const currentCharm = useAppStore(s => s.currentCharm);
  const settings = useAppStore(s => s.settings);
  const updateCharmSettings = useAppStore(s => s.updateCharmSettings);

  if (!show) return null;

  const handleCustomImage = async () => {
    try {
      const imagePath = await getDeskCharmApi().selectImage();
      if (imagePath) {
        const id = `custom-${Date.now()}`;
        const entry = { id, name: 'Custom', imagePath };
        const customCharms = [...settings.charm.customCharms, entry];
        await updateCharmSettings({ customCharms, selectedId: id });
        close();
      }
    } catch (err) {
      console.error('Failed to add custom charm:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={close}>
      <div
        className="bg-surface-900/95 backdrop-blur-xl border border-surface-700/40 rounded-2xl shadow-2xl p-5 w-[320px] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-100">Choose Charm</h2>
          <button
            onClick={close}
            className="p-1 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {BUILT_IN_CHARMS.map((charm) => (
            <button
              key={charm.id}
              onClick={() => selectCharm(charm.id)}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-150
                ${currentCharm.id === charm.id
                  ? 'bg-accent/20 border border-accent/40 shadow-lg shadow-accent/10'
                  : 'bg-surface-800/50 border border-transparent hover:bg-surface-700/50 hover:border-surface-600/30'}
              `}
            >
              <span className="text-2xl">{charm.emoji}</span>
              <span className="text-xs text-surface-300 font-medium">{charm.name}</span>
            </button>
          ))}

          {/* Custom charms */}
          {settings.charm.customCharms.map((custom) => (
            <button
              key={custom.id}
              onClick={() => selectCharm(custom.id)}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-150
                ${currentCharm.id === custom.id
                  ? 'bg-accent/20 border border-accent/40 shadow-lg shadow-accent/10'
                  : 'bg-surface-800/50 border border-transparent hover:bg-surface-700/50 hover:border-surface-600/30'}
              `}
            >
              <span className="text-2xl">🖼️</span>
              <span className="text-xs text-surface-300 font-medium truncate w-full text-center">{custom.name}</span>
            </button>
          ))}

          {/* Add custom */}
          <button
            onClick={handleCustomImage}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-800/30 border border-dashed border-surface-600/30 hover:bg-surface-700/30 hover:border-surface-500/40 transition-all duration-150"
          >
            <ImagePlus size={24} className="text-surface-400" />
            <span className="text-xs text-surface-400 font-medium">Custom</span>
          </button>
        </div>
      </div>
    </div>
  );
};
