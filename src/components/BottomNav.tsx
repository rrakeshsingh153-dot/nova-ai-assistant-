import React from 'react';
import { Home, MessageSquare, Mic, LayoutGrid, Youtube, Clock, Settings } from 'lucide-react';
import { TabType } from '../types/index.ts';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isListening?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  isListening = false,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
    { id: 'apps' as TabType, label: 'Apps', icon: LayoutGrid },
    {
      id: 'voice' as TabType,
      label: 'Voice',
      icon: Mic,
      isSpecial: true,
    },
    { id: 'youtube' as TabType, label: 'YouTube', icon: Youtube },
    { id: 'history' as TabType, label: 'History', icon: Clock },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full bg-[#070c18]/95 backdrop-blur-xl border-t border-cyan-500/15 sticky bottom-0 z-40 px-2 py-1 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isSpecial) {
            // Raised center Voice button (Android style)
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="relative -top-3 flex flex-col items-center group cursor-pointer"
                aria-label="Voice Mode"
              >
                <div
                  className={`relative flex items-center justify-center w-13 h-13 rounded-full transition-all duration-300 shadow-lg active:scale-95 ${
                    isListening
                      ? 'bg-gradient-to-tr from-emerald-500 to-cyan-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.8)] scale-105'
                      : isActive
                      ? 'bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                      : 'bg-[#0f1f33] border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:border-cyan-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
                  {isListening && (
                    <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-wide mt-0.5 transition-colors ${
                    isActive ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-cyan-300' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                )}
              </div>
              <span className={`text-[10px] tracking-wide mt-1 font-medium ${isActive ? 'text-cyan-300 font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
