import React from 'react';
import { GlowingOrb } from './GlowingOrb.tsx';
import { AssistantState, ChatMessage, UserPreferences, TabType } from '../types/index.ts';
import { Mic, Volume2, Sparkles, Brain, ArrowRight, CheckCircle2, Play, Youtube, LayoutGrid, Phone, MessageCircle } from 'lucide-react';

interface HomeTabProps {
  state: AssistantState;
  lastMessage: ChatMessage | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onReplaySpeech: (text: string) => void;
  onQuickPrompt: (prompt: string) => void;
  preferences: UserPreferences;
  onNavigateToTab: (tab: TabType) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  state,
  lastMessage,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onReplaySpeech,
  onQuickPrompt,
  preferences,
  onNavigateToTab,
}) => {
  const quickPrompts = [
    { text: 'कॉल करो / डायलर खोलो', label: 'Call / Phone 📞', lang: 'hi' },
    { text: 'व्हाट्सएप खोलो', label: 'WhatsApp 💬', lang: 'hi' },
    { text: 'कैमरा चालू करो', label: 'Camera 📷', lang: 'hi' },
    { text: 'YouTube par Arijit Singh ke gaane chalao', label: 'YouTube Gaane 🎵', lang: 'hi' },
    { text: 'कैलकुलेटर खोलो', label: 'Calculator 🧮', lang: 'hi' },
    { text: 'रास्ता दिखाओ (Google Maps)', label: 'Maps GPS 📍', lang: 'hi' },
  ];

  const handleOrbClick = () => {
    if (state === 'listening') {
      onStopListening();
    } else if (state === 'speaking') {
      onStopSpeaking();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 max-w-lg mx-auto w-full overflow-y-auto">
      {/* Top Welcome & Persona Tag */}
      <div className="w-full flex items-center justify-between py-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Hello, <span className="text-cyan-300">{preferences.userName || 'Friend'}</span>
            <span className="inline-block animate-wave text-lg">👋</span>
          </h2>
          <p className="text-xs text-slate-400">
            {preferences.language === 'hi'
              ? 'हिंदी में कुछ भी पूछें या बोलें'
              : preferences.language === 'hinglish'
              ? 'Hinglish ya English me baat karein'
              : 'Speak in Hindi or English freely'}
          </p>
        </div>

        {/* Memory badge */}
        <button
          onClick={() => onNavigateToTab('settings')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono hover:bg-emerald-900/40 transition-colors"
          title="View NOVA Memories"
        >
          <Brain className="w-3.5 h-3.5 text-emerald-400" />
          <span>{preferences.memories.length} facts</span>
        </button>
      </div>

      {/* Center Hero: Glowing Green/Blue AI Orb */}
      <div className="my-auto py-4 flex flex-col items-center">
        <GlowingOrb state={state} onClick={handleOrbClick} size="lg" />

        {/* Large Primary Android Mic Action Button */}
        <div className="mt-4 flex flex-col items-center">
          <button
            onClick={handleOrbClick}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide uppercase transition-all duration-300 active:scale-95 shadow-xl ${
              state === 'listening'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse'
                : state === 'speaking'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : state === 'thinking'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] cursor-wait'
                : 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)]'
            }`}
          >
            <Mic className={`w-5 h-5 ${state === 'listening' ? 'animate-bounce' : ''}`} />
            <span>
              {state === 'listening'
                ? 'Listening... Tap to Stop'
                : state === 'speaking'
                ? 'Speaking... Tap to Mute'
                : state === 'thinking'
                ? 'Processing Thought...'
                : 'Tap to Speak'}
            </span>
          </button>
          <span className="text-[11px] text-slate-400 mt-2 font-mono">
            {state === 'listening' ? '🎙️ Mic is listening in real-time' : 'Bilingual Hindi (हिंदी) & English Core'}
          </span>
        </div>
      </div>

      {/* Bottom Area: Latest Answer Card or Quick Suggestions */}
      <div className="w-full space-y-2 mt-auto pt-2">
        {/* Quick Hubs Row: Mobile Apps & YouTube */}
        <div className="grid grid-cols-2 gap-2">
          {/* Mobile Phone Apps Card */}
          <div
            onClick={() => onNavigateToTab('apps')}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-[#0d1f33] via-[#09152b] to-[#07101f] border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer transition-all active:scale-98 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate">Mobile Apps</div>
              <div className="text-[9px] text-cyan-300 truncate">16 Apps & Dialer</div>
            </div>
          </div>

          {/* NOVA YouTube Hub Quick Access Card */}
          <div
            onClick={() => onNavigateToTab('youtube')}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-[#180911] via-[#1c0d20] to-[#0d1628] border border-red-500/30 hover:border-red-400/60 shadow-[0_0_15px_rgba(239,68,68,0.15)] cursor-pointer transition-all active:scale-98 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-600 text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate">YouTube Music</div>
              <div className="text-[9px] text-red-300 truncate">Hindi & Bhajans</div>
            </div>
          </div>
        </div>

        {lastMessage && lastMessage.role === 'assistant' ? (
          <div className="relative rounded-2xl bg-gradient-to-b from-[#0b162c] to-[#070e1c] border border-cyan-500/20 p-3.5 shadow-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase text-cyan-400 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                Latest Answer
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onReplaySpeech(lastMessage.text)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Replay Voice</span>
                </button>
                <button
                  onClick={() => onNavigateToTab('chat')}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
                >
                  <span>Chat</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
              {lastMessage.text}
            </p>
          </div>
        ) : (
          /* Quick Prompt Chips */
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Try asking in Hindi / English:
              </span>
              <button
                onClick={() => onNavigateToTab('chat')}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <span>Full Chat</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickPrompt(p.text)}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 hover:bg-[#0b1d2e] border border-cyan-500/15 hover:border-cyan-400/40 text-left transition-all active:scale-95 group"
                >
                  <span className="text-xs text-slate-200 group-hover:text-cyan-200 truncate">
                    {p.label}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
