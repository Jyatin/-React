import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getDeskCharmApi } from '../api';

export const ContextMenu: React.FC = () => {
  const show = useAppStore(s => s.showContextMenu);
  const pos = useAppStore(s => s.contextMenuPos);
  const close = useAppStore(s => s.closeContextMenu);
  const setShowCharmPicker = useAppStore(s => s.setShowCharmPicker);
  const setShowSettings = useAppStore(s => s.setShowSettings);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show, close]);

  if (!show) return null;

  const items = [
    { label: 'Change Charm', action: () => { close(); setShowCharmPicker(true); } },
    { label: 'Change Rope', action: () => { close(); setShowSettings(true); } },
    null, // separator
    { label: 'Settings', action: () => { close(); setShowSettings(true); } },
    null,
    { label: 'Quit', action: () => getDeskCharmApi().quitApp() },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 animate-scale-in"
      style={{
        left: Math.min(pos.x, window.innerWidth - 180),
        top: Math.min(pos.y, window.innerHeight - 250),
      }}
    >
      <div className="bg-surface-900/95 backdrop-blur-md border border-surface-700/50 rounded-lg shadow-2xl overflow-hidden min-w-[160px] py-1">
        {items.map((item, i) => {
          if (!item) {
            return <div key={i} className="border-t border-surface-700/30 my-1" />;
          }
          return (
            <button
              key={i}
              onClick={item.action}
              className="w-full px-3 py-1.5 text-left text-sm text-surface-200 hover:bg-surface-700/50 transition-colors duration-100 font-medium"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
