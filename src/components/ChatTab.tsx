import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  Trash2,
  ArrowDown,
  User,
  Bot,
  VolumeX,
  Globe,
  ExternalLink,
  Youtube,
  Play,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { AssistantState, ChatMessage, LanguageMode } from '../types/index.ts';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/youtube.ts';

interface ChatTabProps {
  messages: ChatMessage[];
  state: AssistantState;
  onSendMessage: (text: string, isVoice?: boolean) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onReplaySpeech: (text: string) => void;
  onClearChat: () => void;
  speakingText: string | null;
  onStopSpeaking: () => void;
  language: LanguageMode;
  onNavigateToYouTube?: (query?: string, videoId?: string) => void;
  onNavigateToApps?: (appId?: string) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  state,
  onSendMessage,
  onStartListening,
  onStopListening,
  onReplaySpeech,
  onClearChat,
  speakingText,
  onStopSpeaking,
  language,
  onNavigateToYouTube,
  onNavigateToApps,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isListening = state === 'listening';
  const isThinking = state === 'thinking';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleMicClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const sampleSuggestions = language === 'hi'
    ? ['नमस्ते! आप क्या कर सकते हैं?', 'एक मजेदार चुटकुला सुनाओ', 'सौरमंडल के बारे में बताओ']
    : ['What can you do, NOVA?', 'Tell me a funny joke', 'Translate "Hello" to Hindi', 'Daily inspiration'];

  return (
    <div className="flex-1 flex flex-col h-full max-w-lg mx-auto w-full bg-[#050811]">
      {/* Top Chat Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#080d1a] border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-semibold text-slate-200">NOVA Neural Chat</span>
          <span className="text-[10px] text-slate-400">({messages.length} messages)</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-900"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Start Talking with NOVA</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Type or speak below in Hindi or English. NOVA will reply with voice and text.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-1.5 max-w-xs">
              {sampleSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(s, false)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-cyan-500/20 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 transition-all active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isCurrentlyPlaying = speakingText === msg.text;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.4)] mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-tr-xs'
                      : 'bg-[#0a1529] border border-cyan-500/20 text-slate-100 rounded-tl-xs'
                  }`}
                >
                  {/* Voice badge if user spoke it */}
                  {isUser && msg.isVoiceInput && (
                    <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-emerald-200 mb-1 opacity-90">
                      <Mic className="w-2.5 h-2.5" />
                      <span>Spoken Question</span>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed select-text">
                    {msg.text}
                  </p>

                  {/* YouTube Embedded Video Card */}
                  {!isUser && msg.youtube && (
                    <div className="mt-2.5 rounded-xl overflow-hidden bg-black/90 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      {/* Card Top bar */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#0e172a] border-b border-red-500/20 text-[11px]">
                        <div className="flex items-center gap-1.5 font-semibold text-white truncate max-w-[70%]">
                          <span className="p-1 rounded bg-red-600 text-white">
                            <Youtube className="w-3 h-3" />
                          </span>
                          <span className="truncate">{msg.youtube.title || msg.youtube.query}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {onNavigateToYouTube && (
                            <button
                              onClick={() => onNavigateToYouTube(msg.youtube?.query, msg.youtube?.videoId)}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white transition-colors"
                            >
                              Hub
                            </button>
                          )}
                          <a
                            href={getYouTubeWatchUrl(msg.youtube.videoId, msg.youtube.query)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <span>YouTube</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      {/* 16:9 iframe video embed */}
                      <div className="relative w-full pt-[56.25%] bg-black">
                        <iframe
                          src={getYouTubeEmbedUrl(msg.youtube.videoId, msg.youtube.query, true)}
                          title={msg.youtube.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute top-0 left-0 w-full h-full border-0"
                        />
                      </div>
                    </div>
                  )}

                  {/* App Launcher Interactive Card */}
                  {!isUser && msg.appLauncher && (
                    <div className="mt-2.5 rounded-xl overflow-hidden bg-[#0a1224] border border-cyan-500/40 p-3 shadow-lg flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                          <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{msg.appLauncher.appName}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                              Ready
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {msg.appLauncher.detail || 'Click to launch directly or view controls'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onNavigateToApps) {
                            onNavigateToApps(msg.appLauncher?.appId);
                          } else if (msg.appLauncher?.actionUrl) {
                            window.open(msg.appLauncher.actionUrl, '_blank');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-cyan-500/30 active:scale-95 transition-all"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Google Search Grounding Sources */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-cyan-500/20">
                      <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold mb-1">
                        <Globe className="w-3 h-3 text-cyan-400" />
                        <span>Google Search Grounded Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => {
                          const title = src.web?.title || 'Source ' + (i + 1);
                          const uri = src.web?.uri;
                          if (!uri) return null;
                          return (
                            <a
                              key={i}
                              href={uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300 hover:text-cyan-100 hover:border-cyan-400 transition-colors"
                            >
                              <span className="truncate max-w-[150px]">{title}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bottom bar with timestamp & voice controls */}
                  <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-white/10 text-[10px]">
                    <span className="opacity-60 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {!isUser && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (isCurrentlyPlaying) {
                              onStopSpeaking();
                            } else {
                              onReplaySpeech(msg.text);
                            }
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${
                            isCurrentlyPlaying
                              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400 animate-pulse'
                              : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60'
                          }`}
                          title="Speak aloud"
                        >
                          {isCurrentlyPlaying ? (
                            <>
                              <VolumeX className="w-3 h-3" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Speak</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-2.5 justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-[#0c1426] border border-purple-500/30 px-3.5 py-2.5 text-xs text-purple-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>NOVA is thinking & synthesizing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Big Mic + Send Button */}
      <div className="p-3 bg-[#070c18] border-t border-cyan-500/15">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Integrated Mic Button */}
          <button
            type="button"
            onClick={handleMicClick}
            title={isListening ? 'Stop Listening' : 'Speak into mic'}
            className={`p-3 rounded-xl border transition-all active:scale-95 shrink-0 ${
              isListening
                ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.7)] animate-pulse'
                : 'bg-slate-900 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60 shadow-sm'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input Field */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : language === 'hi'
                  ? 'हिंदी या English में प्रश्न पूछें...'
                  : 'Ask question in Hindi or English...'
              }
              disabled={isListening}
              className="w-full bg-[#0b1324] border border-cyan-500/25 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all active:scale-95 shrink-0"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
