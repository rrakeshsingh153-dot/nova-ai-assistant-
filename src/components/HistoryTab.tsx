import React, { useState } from 'react';
import { ConversationSession } from '../types/index.ts';
import {
  Clock,
  MessageSquare,
  Trash2,
  Search,
  ArrowRight,
  Calendar,
  PlusCircle,
  Mic,
  FileText,
  Volume2,
} from 'lucide-react';

interface HistoryTabProps {
  sessions: ConversationSession[];
  activeSessionId: string | null;
  onSelectSession: (session: ConversationSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
  onNewChat: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onClearAllSessions,
  onNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'voice' | 'text'>('all');

  const filteredSessions = sessions.filter((s) => {
    // Voice vs text-only criteria
    const hasVoice = s.messages.some((m) => m.isVoiceInput);
    if (filterMode === 'voice' && !hasVoice) return false;
    if (filterMode === 'text' && hasVoice) return false;

    // Search query criteria
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(q);
    const messageMatch = s.messages.some((m) => m.text.toLowerCase().includes(q));
    return titleMatch || messageMatch;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalVoiceSessions = sessions.filter((s) => s.messages.some((m) => m.isVoiceInput)).length;
  const totalTextOnlySessions = sessions.length - totalVoiceSessions;

  return (
    <div className="flex-1 flex flex-col h-full max-w-lg mx-auto w-full p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Chat History
          </h2>
          <p className="text-xs text-slate-400">
            {sessions.length} saved {sessions.length === 1 ? 'session' : 'sessions'}
            {sessions.length > 0 && ` (${totalVoiceSessions} voice, ${totalTextOnlySessions} text)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all conversation history?')) {
                  onClearAllSessions();
                }
              }}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
              title="Clear All History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      {sessions.length > 0 && (
        <div className="my-3 space-y-2">
          <div className="flex items-center gap-1.5 p-1 bg-[#091122] border border-cyan-500/15 rounded-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                filterMode === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-70">({sessions.length})</span>
            </button>

            <button
              onClick={() => setFilterMode('voice')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                filterMode === 'voice'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voice</span>
              <span className="text-[10px] opacity-70">({totalVoiceSessions})</span>
            </button>

            <button
              onClick={() => setFilterMode('text')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                filterMode === 'text'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Text Only</span>
              <span className="text-[10px] opacity-70">({totalTextOnlySessions})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past conversations..."
              className="w-full bg-[#0b1324] border border-cyan-500/20 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      )}

      {/* Session List */}
      <div className="space-y-2.5 mt-2 flex-1">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-medium">
              {sessions.length === 0
                ? 'No conversation history yet'
                : 'No matching sessions found'}
            </p>
            <p className="text-xs text-slate-500">
              {sessions.length === 0
                ? 'Your chats and voice queries with NOVA will be saved here automatically.'
                : 'Try adjusting your search filter or start a new conversation.'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const lastMsg = session.messages[session.messages.length - 1];
            const voiceCount = session.messages.filter((m) => m.isVoiceInput).length;
            const hasVoice = voiceCount > 0;

            return (
              <div
                key={session.id}
                className={`group relative rounded-2xl p-3.5 border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#0c1830] border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-[#091122] border-cyan-500/10 hover:border-cyan-500/30 hover:bg-[#0c152a]'
                }`}
                onClick={() => onSelectSession(session)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        hasVoice
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                      }`}
                      title={hasVoice ? `${voiceCount} voice interaction(s)` : 'Text-only session'}
                    >
                      {hasVoice ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-200 transition-colors max-w-[200px]">
                          {session.title || 'Conversation'}
                        </h4>

                        {/* Visual Badge: Voice vs Text-Only */}
                        {hasVoice ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-medium text-emerald-300">
                            <Mic className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Voice ({voiceCount})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[9px] font-medium text-slate-400">
                            <FileText className="w-2.5 h-2.5 text-slate-400" />
                            <span>Text Only</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(session.updatedAt || session.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{session.messages.length} msgs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors opacity-70 group-hover:opacity-100"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {lastMsg && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 pl-11">
                    {lastMsg.isVoiceInput && (
                      <span title="Voice Query">
                        <Volume2 className="w-3 h-3 text-emerald-400 shrink-0 inline" />
                      </span>
                    )}
                    <p className="line-clamp-1 italic text-slate-400 border-l border-cyan-500/20 pl-2">
                      "{lastMsg.text}"
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
