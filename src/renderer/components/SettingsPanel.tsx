import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { getDeskCharmApi } from '../api';
import { BUILT_IN_ROPES } from '../../shared/types/rope';
import { X, Minus, Plus } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const show = useAppStore(s => s.showSettings);
  const setShowSettings = useAppStore(s => s.setShowSettings);
  const close = () => setShowSettings(false);
  const settings = useAppStore(s => s.settings);
  const currentRope = useAppStore(s => s.currentRope);
  const selectRope = useAppStore(s => s.selectRope);
  const updateCharmSettings = useAppStore(s => s.updateCharmSettings);
  const updateRopeSettings = useAppStore(s => s.updateRopeSettings);
  const updatePhysicsSettings = useAppStore(s => s.updatePhysicsSettings);
  const updateDesktopSettings = useAppStore(s => s.updateDesktopSettings);
  const updateBehaviorSettings = useAppStore(s => s.updateBehaviorSettings);
  const setShowCharmPicker = useAppStore(s => s.setShowCharmPicker);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={close}>
      <div
        className="bg-surface-900/95 backdrop-blur-xl border border-surface-700/40 rounded-2xl shadow-2xl w-[340px] max-h-[460px] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-900/95 backdrop-blur-xl flex items-center justify-between p-4 pb-3 border-b border-surface-700/30">
          <h2 className="text-base font-semibold text-surface-100">Settings</h2>
          <button
            onClick={close}
            className="p-1 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Appearance */}
          <Section title="Appearance">
            <button
              onClick={() => { close(); setShowCharmPicker(true); }}
              className="w-full text-left px-3 py-2 bg-surface-800/50 rounded-lg border border-surface-700/30 text-sm text-surface-200 hover:bg-surface-700/40 transition-colors"
            >
              Change Charm →
            </button>

            <SliderField
              label="Charm Size"
              value={settings.charm.size}
              min={24}
              max={96}
              step={4}
              onChange={(v) => updateCharmSettings({ size: v })}
              format={(v) => `${v}px`}
            />
          </Section>

          {/* Rope */}
          <Section title="Rope">
            <div className="flex gap-2">
              {BUILT_IN_ROPES.map((rope) => (
                <button
                  key={rope.id}
                  onClick={() => selectRope(rope.id)}
                  className={`
                    flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-150
                    ${currentRope.id === rope.id
                      ? 'bg-accent/20 border border-accent/40 text-accent-light'
                      : 'bg-surface-800/50 border border-surface-700/30 text-surface-300 hover:bg-surface-700/40'}
                  `}
                  title={rope.name}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: rope.color }}
                  />
                  <span className="block truncate px-1">{rope.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <SliderField
              label="Rope Length"
              value={settings.rope.length}
              min={40}
              max={300}
              step={10}
              onChange={(v) => updateRopeSettings({ length: v })}
              format={(v) => `${v}px`}
            />
          </Section>

          {/* Physics */}
          <Section title="Physics">
            <SliderField
              label="Gravity"
              value={settings.physics.gravity}
              min={0.1}
              max={3.0}
              step={0.1}
              onChange={(v) => updatePhysicsSettings({ gravity: v })}
              format={(v) => v.toFixed(1)}
            />

            <SliderField
              label="Damping"
              value={settings.physics.damping}
              min={0.001}
              max={0.2}
              step={0.005}
              onChange={(v) => updatePhysicsSettings({ damping: v })}
              format={(v) => v.toFixed(3)}
            />

            <SliderField
              label="Swing Intensity"
              value={settings.physics.swingIntensity}
              min={0.1}
              max={3.0}
              step={0.1}
              onChange={(v) => updatePhysicsSettings({ swingIntensity: v })}
              format={(v) => v.toFixed(1)}
            />
          </Section>

          {/* Desktop */}
          <Section title="Desktop">
            <ToggleField
              label="Always on Top"
              value={settings.desktop.alwaysOnTop}
              onChange={(v) => updateDesktopSettings({ alwaysOnTop: v })}
            />
            <ToggleField
              label="Launch at Startup"
              value={settings.desktop.launchAtStartup}
              onChange={(v) => {
                updateDesktopSettings({ launchAtStartup: v });
                getDeskCharmApi().setStartup(v);
              }}
            />
          </Section>

          {/* Behavior */}
          <Section title="Behavior">
            <ToggleField
              label="Hover Effects"
              value={settings.behavior.enableHoverEffects}
              onChange={(v) => updateBehaviorSettings({ enableHoverEffects: v })}
            />
            <ToggleField
              label="Pause Physics"
              value={settings.behavior.pausePhysics}
              onChange={(v) => updateBehaviorSettings({ pausePhysics: v })}
            />
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2.5">{title}</h3>
    <div className="space-y-2.5">{children}</div>
  </div>
);

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

const SliderField: React.FC<SliderFieldProps> = ({ label, value, min, max, step, onChange, format }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm text-surface-300">{label}</span>
      <span className="text-xs text-surface-400 font-mono">{format ? format(value) : value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-surface-700 rounded-full appearance-none cursor-pointer accent-accent"
    />
  </div>
);

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-surface-300">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`
        relative w-9 h-5 rounded-full transition-colors duration-200
        ${value ? 'bg-accent' : 'bg-surface-600'}
      `}
    >
      <div
        className={`
          absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm
          ${value ? 'translate-x-4' : 'translate-x-0.5'}
        `}
      />
    </button>
  </div>
);
