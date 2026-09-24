import React, { useState } from 'react';
import {
  Play,
  Search,
  Mic,
  ExternalLink,
  Sparkles,
  Music,
  Tv,
  Radio,
  Flame,
  X,
  Volume2,
  Maximize2
} from 'lucide-react';
import {
  CURATED_YOUTUBE_ITEMS,
  CuratedYouTubeItem,
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl
} from '../utils/youtube.ts';
import { AssistantState } from '../types/index.ts';

interface YouTubeTabProps {
  onStartListening: () => void;
  onStopListening: () => void;
  assistantState: AssistantState;
  onVoiceSearchQuery?: (query: string) => void;
  initialVideoId?: string;
  initialQuery?: string;
}

export const YouTubeTab: React.FC<YouTubeTabProps> = ({
  onStartListening,
  onStopListening,
  assistantState,
  initialVideoId,
  initialQuery,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(initialVideoId || 'BddP6PYo2gs');
  const [activeTitle, setActiveTitle] = useState<string>('Kesariya - Brahmāstra');
  const [activeChannel, setActiveChannel] = useState<string>('Arijit Singh, Pritam');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(true);

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'lofi', label: 'Lofi Chill', icon: Radio },
    { id: 'devotional', label: 'Devotional', icon: Volume2 },
    { id: 'tech', label: 'Tech & AI', icon: Tv },
    { id: 'trending', label: 'Trending', icon: Flame },
  ];

  const filteredItems = CURATED_YOUTUBE_ITEMS.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.artistOrChannel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query matches any item
    const q = searchQuery.toLowerCase();
    const matched = CURATED_YOUTUBE_ITEMS.find(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.artistOrChannel.toLowerCase().includes(q)
    );

    if (matched) {
      setActiveVideoId(matched.videoId);
      setActiveTitle(matched.title);
      setActiveChannel(matched.artistOrChannel);
    } else {
      setActiveVideoId(null);
      setActiveTitle(searchQuery.trim());
      setActiveChannel('YouTube Search Results');
    }
    setIsPlayerOpen(true);
  };

  const handleSelectVideo = (item: CuratedYouTubeItem) => {
    setActiveVideoId(item.videoId);
    setActiveTitle(item.title);
    setActiveChannel(item.artistOrChannel);
    setIsPlayerOpen(true);
  };

  const currentEmbedUrl = getYouTubeEmbedUrl(activeVideoId || undefined, activeTitle, true);
  const currentWatchUrl = getYouTubeWatchUrl(activeVideoId || undefined, activeTitle);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#040814] text-slate-100 p-3 sm:p-4 space-y-4">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <Play className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 tracking-wide flex items-center gap-2">
              <span>NOVA YouTube Hub</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                HD Audio & Video
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Hindi music, devotional bhajan, tutorials, podcasts & lofi beats
            </p>
          </div>
        </div>

        <a
          href={currentWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs hover:bg-red-900/40 hover:text-white transition-all shadow-sm"
          title="Open in YouTube"
        >
          <span className="hidden sm:inline text-[11px]">Open in YouTube</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Embedded Video Player Box */}
      {isPlayerOpen && (
        <div className="rounded-2xl overflow-hidden bg-black/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
          <div className="flex items-center justify-between px-3 py-2 bg-[#091122] border-b border-cyan-500/20 text-xs">
            <div className="flex items-center gap-2 truncate max-w-[80%]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-slate-100 truncate">{activeTitle}</span>
              <span className="text-[10px] text-slate-400 truncate">• {activeChannel}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={currentWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                title="Watch on YouTube"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsPlayerOpen(false)}
                className="text-slate-400 hover:text-rose-400 transition-colors"
                title="Minimize player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Responsive 16:9 iframe container */}
          <div className="relative w-full pt-[56.25%] bg-black">
            <iframe
              src={currentEmbedUrl}
              title={activeTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search YouTube songs, Hanuman Chalisa, tutorials..."
            className="w-full bg-[#0a1324] border border-cyan-500/20 focus:border-cyan-400 rounded-xl pl-9.5 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Voice Search Mic */}
        <button
          type="button"
          onClick={() => {
            if (assistantState === 'listening') {
              onStopListening();
            } else {
              onStartListening();
            }
          }}
          className={`p-2.5 rounded-xl border transition-all active:scale-95 shrink-0 ${
            assistantState === 'listening'
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
              : 'bg-[#0a1324] border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/50'
          }`}
          title="Voice Search on YouTube"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Search Submit */}
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all active:scale-95 shrink-0"
        >
          Search
        </button>
      </form>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : 'bg-[#091224] border border-cyan-500/20 text-slate-300 hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Voice Play Suggestion Chips */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick Voice Prompts to Try:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {[
            'YouTube par Arijit Singh ke gaane chalao',
            'Play Hanuman Chalisa on YouTube',
            'YouTube pe Lofi Beats sunao',
            'Play Python tutorial on YouTube',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setSearchQuery(prompt);
                const intent = CURATED_YOUTUBE_ITEMS.find((it) =>
                  prompt.toLowerCase().includes(it.title.toLowerCase().split(' ')[0])
                );
                if (intent) {
                  handleSelectVideo(intent);
                } else {
                  setActiveVideoId(null);
                  setActiveTitle(prompt);
                  setActiveChannel('YouTube');
                  setIsPlayerOpen(true);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 hover:border-cyan-400 hover:text-white transition-all text-left"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Curated Grid / Video Cards */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Popular & Recommended Videos</span>
          <span className="text-[11px] text-slate-500 font-normal">
            {filteredItems.length} available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredItems.map((item) => {
            const isCurrentlyPlaying = activeVideoId === item.videoId && isPlayerOpen;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectVideo(item)}
                className={`flex gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isCurrentlyPlaying
                    ? 'bg-[#0f1d38] border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-[#081020] border-cyan-500/15 hover:border-cyan-500/40 hover:bg-[#0c1830]'
                }`}
              >
                {/* Thumbnail with duration badge */}
                <div className="relative w-28 h-18 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/5">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                  </div>
                  {item.duration && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                      {item.duration}
                    </span>
                  )}
                </div>

                {/* Title & Channel info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.artistOrChannel}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span className="capitalize text-cyan-400/80 font-medium">
                      #{item.category}
                    </span>
                    {isCurrentlyPlaying && (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        Playing
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
