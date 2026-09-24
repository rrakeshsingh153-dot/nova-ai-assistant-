import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { AssistantState } from '../types/index.ts';

interface GlowingOrbProps {
  state: AssistantState;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  statusText?: string;
}

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  state,
  onClick,
  size = 'lg',
  statusText,
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-60 h-60 sm:w-72 sm:h-72',
  }[size];

  const stateAnimationClass = {
    idle: 'animate-orb-idle',
    listening: 'animate-orb-listening',
    thinking: 'animate-orb-thinking',
    speaking: 'animate-orb-speaking',
  }[state];

  const helperText = statusText || {
    idle: 'Tap to speak (Hindi or English)',
    listening: 'Listening to your voice...',
    thinking: 'NOVA is processing...',
    speaking: 'NOVA is answering...',
  }[state];

  return (
    <div className="flex flex-col items-center justify-center select-none py-2">
      {/* Outer Glow & Particle Container */}
      <div className="relative flex items-center justify-center">
        {/* Expanding Soundwave Ripples when listening */}
        {state === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ripple pointer-events-none" />
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ripple-delay pointer-events-none" />
          </>
        )}

        {/* Ambient background glow ring */}
        <div
          className={`absolute rounded-full filter blur-2xl transition-all duration-700 pointer-events-none ${
            state === 'listening'
              ? 'w-72 h-72 sm:w-88 sm:h-88 bg-gradient-to-r from-emerald-500/50 to-cyan-400/50'
              : state === 'thinking'
              ? 'w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-r from-cyan-500/40 to-blue-600/40'
              : state === 'speaking'
              ? 'w-72 h-72 sm:w-84 sm:h-84 bg-gradient-to-r from-emerald-400/50 to-teal-500/50'
              : 'w-56 h-56 sm:w-68 sm:h-68 bg-gradient-to-r from-emerald-600/30 to-cyan-600/30'
          }`}
        />

        {/* Gyroscopic Cyber Rings for thinking / listening */}
        <div
          className={`absolute inset-[-14px] sm:inset-[-18px] rounded-full border border-dashed border-cyan-400/30 transition-transform duration-1000 pointer-events-none ${
            state === 'thinking' ? 'animate-spin' : state === 'listening' ? 'rotate-45' : 'rotate-12'
          }`}
        />
        <div
          className={`absolute inset-[-28px] sm:inset-[-34px] rounded-full border border-dotted border-emerald-400/20 transition-transform duration-1000 pointer-events-none ${
            state === 'thinking' ? 'animate-[spin_4s_linear_infinite_reverse]' : ''
          }`}
        />

        {/* Interactive Orb Sphere Button */}
        <button
          onClick={onClick}
          type="button"
          aria-label={helperText}
          className={`relative ${sizeClasses} rounded-full cursor-pointer focus:outline-none transition-transform duration-300 active:scale-95 flex items-center justify-center ${stateAnimationClass}`}
        >
          {/* Base Sphere Gradient (Layer 1) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#021319] via-[#063e3b] to-[#047857] shadow-[inset_0_0_40px_rgba(6,182,212,0.6),inset_0_0_20px_rgba(16,185,129,0.8)] border border-cyan-300/40 overflow-hidden">
            {/* Plasma swirl highlight */}
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-gradient-to-br from-cyan-300/60 to-transparent rounded-full filter blur-md" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-gradient-to-tl from-emerald-400/60 to-transparent rounded-full filter blur-md" />

            {/* Inner dynamic cyber grid or fluid texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(52,211,153,0.3),transparent_70%)]" />
          </div>

          {/* Core Energy Center (Layer 2) */}
          <div className="relative z-10 flex flex-col items-center justify-center text-white">
            {state === 'idle' && (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-black/40 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.6)]">
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300" />
                </div>
                <span className="text-[11px] font-mono tracking-widest text-cyan-200/90 uppercase font-semibold">
                  NOVA
                </span>
              </div>
            )}

            {state === 'listening' && (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3.5 rounded-full bg-cyan-950/70 border border-cyan-400 shadow-[0_0_25px_#06b6d4]">
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 animate-pulse" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-3 bg-emerald-400 rounded-full sound-bar-1" />
                  <span className="w-1.5 h-6 bg-cyan-300 rounded-full sound-bar-3" />
                  <span className="w-1.5 h-4 bg-emerald-400 rounded-full sound-bar-2" />
                  <span className="w-1.5 h-7 bg-cyan-300 rounded-full sound-bar-4" />
                  <span className="w-1.5 h-3 bg-emerald-400 rounded-full sound-bar-5" />
                </div>
              </div>
            )}

            {state === 'thinking' && (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3.5 rounded-full bg-purple-950/70 border border-purple-400 shadow-[0_0_25px_#a855f7]">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-300 animate-spin" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-purple-200 uppercase font-bold animate-pulse">
                  NEURAL LINK
                </span>
              </div>
            )}

            {state === 'speaking' && (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3.5 rounded-full bg-emerald-950/70 border border-emerald-400 shadow-[0_0_25px_#10b981]">
                  <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 h-6">
                  <span className="w-1 bg-emerald-300 rounded-full sound-bar-1" />
                  <span className="w-1 bg-cyan-300 rounded-full sound-bar-3" />
                  <span className="w-1 bg-emerald-400 rounded-full sound-bar-2" />
                  <span className="w-1 bg-cyan-200 rounded-full sound-bar-4" />
                  <span className="w-1 bg-emerald-300 rounded-full sound-bar-5" />
                </div>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Status Text & Instruction under the orb */}
      <div className="mt-4 flex flex-col items-center text-center px-4 max-w-xs">
        <p
          className={`text-sm font-semibold tracking-wide transition-colors ${
            state === 'listening'
              ? 'text-cyan-300 font-bold'
              : state === 'speaking'
              ? 'text-emerald-300 font-bold'
              : state === 'thinking'
              ? 'text-purple-300 font-bold'
              : 'text-slate-300'
          }`}
        >
          {helperText}
        </p>
        <span className="text-[11px] text-slate-400 mt-0.5">
          {state === 'speaking'
            ? 'Tap orb to stop speaking'
            : state === 'listening'
            ? 'Tap orb when done'
            : 'Hindi (हिंदी) या English बोलें'}
        </span>
      </div>
    </div>
  );
};
