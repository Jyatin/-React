import React, { useEffect } from 'react';
import { DragonScene } from './dragon/DragonScene';
import { MinimalUI } from './components/MinimalUI';
import { useAppStore } from './store/useAppStore';

const App: React.FC = () => {
  const loadSettings = useAppStore((s) => s.loadSettings);
  const settingsLoaded = useAppStore((s) => s.settingsLoaded);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (!settingsLoaded) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-amber-500/80 text-sm font-sans bg-slate-950">
        Initializing DeskCharm 3D Dragon Engine...
      </div>
    );
  }

  const isBrowserMode = typeof window !== 'undefined' && !window.deskcharm;

  return (
    <div
      className={`w-screen h-screen relative overflow-hidden select-none font-sans ${
        isBrowserMode ? 'bg-slate-950' : 'bg-transparent'
      }`}
      style={{
        background: isBrowserMode ? '#06070c' : 'transparent',
      }}
    >
      {/* 1. Real-time 3D Flying Fire Dragon Canvas */}
      <DragonScene />

      {/* 2. Sleek Minimal UI Controls */}
      <MinimalUI />
    </div>
  );
};

export default App;
