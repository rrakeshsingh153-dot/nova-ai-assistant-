import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Sparkles, Globe, Radio } from 'lucide-react';
import { AssistantState, ChatMessage, LanguageMode } from '../types/index.ts';

interface VoiceTabProps {
  state: AssistantState;
  interimTranscript: string;
  lastUserVoice: string;
  lastAssistantReply: ChatMessage | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onReplaySpeech: (text: string) => void;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
}

export const VoiceTab: React.FC<VoiceTabProps> = ({
  state,
  interimTranscript,
  lastUserVoice,
  lastAssistantReply,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onReplaySpeech,
  language,
  onLanguageChange,
}) => {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';

  const toggleMic = () => {
    if (isListening) {
      onStopListening();
    } else if (isSpeaking) {
      onStopSpeaking();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 max-w-md mx-auto w-full select-none overflow-y-auto">
      {/* Top Header Mode Indicator */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Radio className={`w-3.5 h-3.5 ${isListening ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
            <span>{isListening ? 'LIVE AUDIO INPUT' : 'VOICE MODE'}</span>
          </div>
        </div>

        {/* Quick Language Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-slate-800 text-xs">
          <button
            onClick={() => onLanguageChange('hi')}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              language === 'hi'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              language === 'en'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('auto')}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              language === 'auto' || language === 'hinglish'
                ? 'bg-teal-500 text-black font-bold shadow-[0_0_10px_rgba(20,184,166,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auto
          </button>
        </div>
      </div>

      {/* Spoken Dialog Box */}
      <div className="w-full my-4 flex-1 flex flex-col justify-center gap-3 max-h-56 overflow-y-auto px-1">
        {/* User spoken bubble */}
        {(interimTranscript || lastUserVoice) && (
          <div className="self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border border-cyan-400/40 p-3 shadow-md animate-fade-in">
            <span className="text-[10px] font-mono uppercase text-cyan-300 block mb-1">
              You Spoke:
            </span>
            <p className="text-sm font-medium text-white leading-relaxed">
              {interimTranscript || lastUserVoice}
              {isListening && (
                <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
              )}
            </p>
          </div>
        )}

        {/* NOVA spoken response bubble */}
        {lastAssistantReply && (
          <div className="self-start max-w-[88%] rounded-2xl rounded-tl-sm bg-[#091629] border border-cyan-500/30 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                NOVA Answer:
              </span>
              <button
                onClick={() => onReplaySpeech(lastAssistantReply.text)}
                className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30"
              >
                <Volume2 className="w-3 h-3" />
                <span>Hear Voice</span>
              </button>
            </div>
            <p className="text-sm text-slate-100 leading-relaxed">
              {lastAssistantReply.text}
            </p>
          </div>
        )}

        {/* When empty */}
        {!interimTranscript && !lastUserVoice && !lastAssistantReply && (
          <div className="text-center py-6 px-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3 text-cyan-400">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">
              {language === 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Tap the Large Mic to Speak'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Ask anything in Hindi or English. NOVA will transcribe your voice, understand the context, and speak back.
            </p>
          </div>
        )}
      </div>

      {/* Visualizer Waveform Bar */}
      <div className="h-10 flex items-center justify-center gap-1.5 px-4 mb-2">
        {Array.from({ length: 15 }).map((_, i) => {
          const isActive = isListening || isSpeaking;
          const heightClasses = [
            'h-2', 'h-5', 'h-8', 'h-4', 'h-9', 'h-6', 'h-10', 'h-7',
            'h-10', 'h-6', 'h-8', 'h-4', 'h-7', 'h-3', 'h-2'
          ];
          return (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-t from-emerald-400 to-cyan-300 ${heightClasses[i % heightClasses.length]} ${
                      i % 2 === 0 ? 'sound-bar-2' : 'sound-bar-4'
                    }`
                  : 'h-1 bg-slate-800'
              }`}
            />
          );
        })}
      </div>

      {/* GIANT Voice Button in the Center */}
      <div className="relative my-3 flex flex-col items-center">
        {/* Ripple rings */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ripple pointer-events-none" />
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ripple-delay pointer-events-none" />
          </>
        )}

        <button
          onClick={toggleMic}
          aria-label="Toggle Microphone"
          className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-pointer flex flex-col items-center justify-center transition-all duration-300 active:scale-95 shadow-2xl ${
            isListening
              ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.8)] scale-105'
              : isSpeaking
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.7)]'
              : isThinking
              ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-[0_0_35px_rgba(147,51,234,0.6)]'
              : 'bg-gradient-to-tr from-[#031d27] via-[#054b42] to-[#059669] border-2 border-cyan-400/60 text-cyan-200 shadow-[0_0_35px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)]'
          }`}
        >
          {isListening ? (
            <>
              <Mic className="w-10 h-10 animate-bounce" />
              <span className="text-[10px] font-mono font-bold tracking-widest mt-1 uppercase">
                LISTENING
              </span>
            </>
          ) : isSpeaking ? (
            <>
              <Volume2 className="w-10 h-10 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest mt-1 uppercase">
                SPEAKING
              </span>
            </>
          ) : isThinking ? (
            <>
              <Sparkles className="w-10 h-10 animate-spin" />
              <span className="text-[10px] font-mono font-bold tracking-widest mt-1 uppercase">
                THINKING
              </span>
            </>
          ) : (
            <>
              <Mic className="w-10 h-10 text-cyan-300" />
              <span className="text-[10px] font-mono font-bold tracking-widest mt-1 uppercase text-emerald-300">
                TAP TO TALK
              </span>
            </>
          )}
        </button>

        {/* Quick hint beneath mic */}
        <p className="mt-3 text-xs font-semibold text-slate-300">
          {isListening
            ? 'Speaking now... Tap again to finish'
            : isSpeaking
            ? 'Tap to pause/mute speech'
            : 'Hindi or English - Speak your question'}
        </p>
      </div>

      {/* Suggested voice commands */}
      <div className="w-full mt-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block text-center mb-1.5">
          Try saying aloud:
        </span>
        <div className="flex flex-wrap justify-center gap-1.5">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            "NOVA, what is the time?"
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            "आज का मुख्य समाचार क्या है?"
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            "Translate 'Good Morning' to Hindi"
          </span>
        </div>
      </div>
    </div>
  );
};
