import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Volume2, VolumeX, Sparkles, HelpCircle, Globe } from 'lucide-react';
import { AssistantState, LanguageMode } from '../types/index.ts';

interface AndroidHeaderProps {
  state: AssistantState;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onOpenHelp: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  state,
  language,
  onLanguageChange,
  autoSpeak,
  onToggleAutoSpeak,
  onOpenHelp,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const stateConfig = {
    idle: { label: 'Online', color: 'bg-emerald-400', glow: 'shadow-[0_0_10px_#10b981]' },
    listening: { label: 'Listening...', color: 'bg-cyan-400 animate-ping', glow: 'shadow-[0_0_12px_#06b6d4]' },
    thinking: { label: 'Thinking...', color: 'bg-purple-400 animate-pulse', glow: 'shadow-[0_0_12px_#a855f7]' },
    speaking: { label: 'Speaking...', color: 'bg-emerald-300 animate-bounce', glow: 'shadow-[0_0_12px_#34d399]' },
  }[state];

  const cycleLanguage = () => {
    const order: LanguageMode[] = ['auto', 'hi', 'en', 'hinglish'];
    const nextIdx = (order.indexOf(language) + 1) % order.length;
    onLanguageChange(order[nextIdx]);
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'hi':
        return 'हिन्दी (HI)';
      case 'en':
        return 'English (EN)';
      case 'hinglish':
        return 'Hinglish';
      case 'auto':
      default:
        return 'Auto (HI/EN)';
    }
  };

  return (
    <header className="w-full bg-[#070c18]/90 backdrop-blur-md border-b border-cyan-500/10 sticky top-0 z-40">
      {/* Android Top System Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-[11px] font-mono text-slate-400 tracking-wider">
        <span>{time || '10:50 AM'}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-cyan-400 font-bold">5G</span>
          <Wifi className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1">
            <span className="text-[10px]">98%</span>
            <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* App Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          {/* Logo icon with glow */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${stateConfig.color} ${stateConfig.glow}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                NOVA AI
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                VOICE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${stateConfig.color}`} />
              <span>{stateConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Language Toggle Button */}
          <button
            onClick={cycleLanguage}
            title="Switch Language (Auto, Hindi, English, Hinglish)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-medium text-cyan-300 hover:bg-cyan-950/40 hover:border-cyan-400 transition-all active:scale-95 shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">{getLanguageLabel()}</span>
          </button>

          {/* Voice Auto-Speak Toggle */}
          <button
            onClick={onToggleAutoSpeak}
            title={autoSpeak ? 'Voice output: ON (Click to mute)' : 'Voice output: MUTED (Click to unmute)'}
            className={`p-2 rounded-full border transition-all active:scale-95 ${
              autoSpeak
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Beginner Guide Help Button */}
          <button
            onClick={onOpenHelp}
            title="Beginner Guide: How to use NOVA"
            className="p-2 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
