import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Youtube,
  MapPin,
  Camera,
  Calculator,
  Mail,
  Inbox,
  Globe,
  Clock,
  FileText,
  CloudSun,
  ShoppingBag,
  Image,
  Zap,
  Settings,
  Search,
  Mic,
  ExternalLink,
  Sparkles,
  X,
  Play,
  Share2,
  Check,
  ChevronRight,
  Send,
  Delete,
  Volume2
} from 'lucide-react';
import { PHONE_APPS, PhoneApp } from '../utils/phoneApps.ts';
import { AssistantState } from '../types/index.ts';

// Map icon string name to Lucide component
const ICON_MAP: Record<string, React.ElementType> = {
  Phone,
  MessageCircle,
  Youtube,
  MapPin,
  Camera,
  Calculator,
  Mail,
  Inbox,
  Globe,
  Clock,
  FileText,
  CloudSun,
  ShoppingBag,
  Image,
  Zap,
  Settings,
};

interface PhoneAppsTabProps {
  onStartListening: () => void;
  onStopListening: () => void;
  assistantState: AssistantState;
  onLaunchYouTube?: () => void;
  onLaunchSettings?: () => void;
  initialAppId?: string;
}

export const PhoneAppsTab: React.FC<PhoneAppsTabProps> = ({
  onStartListening,
  onStopListening,
  assistantState,
  onLaunchYouTube,
  onLaunchSettings,
  initialAppId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeModalApp, setActiveModalApp] = useState<string | null>(initialAppId || null);

  // Mini App States
  // 1. Dialer state
  const [dialerNumber, setDialerNumber] = useState('');
  // 2. Calculator state
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');
  // 3. Notes state
  const [notesList, setNotesList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nova_phone_notes');
      return saved ? JSON.parse(saved) : ['दूध और फल लाना है', 'Call Rakesh at 5 PM', 'Meeting with team on Friday'];
    } catch {
      return ['दूध और फल लाना है', 'Call Rakesh at 5 PM'];
    }
  });
  const [newNote, setNewNote] = useState('');
  // 4. Torch state
  const [isTorchOn, setIsTorchOn] = useState(false);
  // 5. Clock / Stopwatch state
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  // Stopwatch timer
  useEffect(() => {
    let interval: any = null;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  // Save notes
  useEffect(() => {
    try {
      localStorage.setItem('nova_phone_notes', JSON.stringify(notesList));
    } catch {}
  }, [notesList]);

  const categories = [
    { id: 'all', label: 'All Apps' },
    { id: 'daily', label: 'Daily Calls & SMS' },
    { id: 'google', label: 'Google Suite' },
    { id: 'tools', label: 'Utilities & Tools' },
    { id: 'entertainment', label: 'Media & Games' },
    { id: 'social', label: 'Social & Chat' },
  ];

  const filteredApps = PHONE_APPS.filter((app) => {
    if (activeCategory !== 'all' && app.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.nameEnglish.toLowerCase().includes(q) ||
        app.nameHindi.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.voiceTriggersEnglish.some((t) => t.includes(q))
      );
    }
    return true;
  });

  const handleOpenApp = (app: PhoneApp) => {
    if (app.id === 'youtube' && onLaunchYouTube) {
      onLaunchYouTube();
      return;
    }
    if (app.id === 'settings' && onLaunchSettings) {
      onLaunchSettings();
      return;
    }

    if (app.defaultAction === 'open_url') {
      if (app.actionUrl?.startsWith('tel:') || app.actionUrl?.startsWith('sms:') || app.actionUrl?.startsWith('mailto:')) {
        window.open(app.actionUrl, '_self');
      } else if (app.actionUrl) {
        window.open(app.actionUrl, '_blank');
      }
    } else {
      setActiveModalApp(app.id);
    }
  };

  const handleCalcPress = (char: string) => {
    if (char === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else if (char === '=') {
      try {
        // Safe evaluation of simple math
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcResult(String(res));
      } catch {
        setCalcResult('Error');
      }
    } else {
      setCalcInput((prev) => prev + char);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#030712] text-slate-100 p-3 sm:p-4 space-y-4">
      {/* Screen Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 tracking-wide flex items-center gap-2">
              <span>Mobile Phone Apps</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                16 Apps Ready
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              फोन के सभी ऐप्स: कॉल, व्हाट्सएप, मैप्स, कैमरा, कैलकुलेटर और टूल्स
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px]">System Online</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phone apps, dialer, camera, notes..."
            className="w-full bg-[#091122] border border-cyan-500/20 focus:border-cyan-400 rounded-xl pl-9.5 pr-8 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
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

        {/* Voice mic search */}
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
              : 'bg-[#091122] border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/50'
          }`}
          title="Voice command to open app"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#081020] border border-cyan-500/20 text-slate-300 hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Quick Voice Trigger Assistant Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0d1e38] via-[#09152b] to-[#0d1628] border border-cyan-500/30 space-y-1.5">
        <div className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>बोलकर कोई भी ऐप खोलें (Voice Commands):</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {[
            'कॉल करो / डायलर खोलो',
            'व्हाट्सएप खोलो',
            'कैमरा चालू करो',
            'रास्ता दिखाओ (मैप्स)',
            'कैलकुलेटर खोलो',
            'नोट्स लिखो',
            'टॉर्च जलाओ',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                if (prompt.includes('डायलर')) setActiveModalApp('phone');
                else if (prompt.includes('कैमरा')) setActiveModalApp('camera');
                else if (prompt.includes('कैलकुलेटर')) setActiveModalApp('calculator');
                else if (prompt.includes('नोट्स')) setActiveModalApp('notes');
                else if (prompt.includes('टॉर्च')) setActiveModalApp('flashlight');
                else if (prompt.includes('व्हाट्सएप')) window.open('https://web.whatsapp.com', '_blank');
                else if (prompt.includes('मैप्स')) window.open('https://maps.google.com', '_blank');
              }}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-cyan-500/20 text-slate-200 hover:text-white hover:border-cyan-400 transition-all text-left"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 16 Installed Phone Apps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {filteredApps.map((app) => {
          const IconComp = ICON_MAP[app.iconName] || Globe;
          return (
            <div
              key={app.id}
              onClick={() => handleOpenApp(app)}
              className="relative flex flex-col items-center text-center p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#0a1326] to-[#060c18] border border-cyan-500/20 hover:border-cyan-400/60 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 group"
            >
              {/* Badge if any */}
              {app.badge && (
                <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  {app.badge}
                </span>
              )}

              {/* App Icon Tile */}
              <div
                className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br ${app.bgGradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200`}
              >
                <IconComp className="w-6 h-6" />
              </div>

              {/* App Name */}
              <div className="mt-2.5">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors leading-tight">
                  {app.nameEnglish}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                  {app.nameHindi}
                </p>
              </div>

              {/* Description */}
              <p className="text-[9px] text-slate-500 line-clamp-2 mt-1 leading-snug px-1">
                {app.description}
              </p>

              <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-cyan-400 group-hover:text-cyan-300">
                <span>Open</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE IN-APP MINI UTILITIES (MODALS / FULL VIEW SCREENS)            */}
      {/* ========================================================================= */}

      {/* 1. Phone / Dialer Modal */}
      {activeModalApp === 'phone' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#091122] border border-cyan-500/40 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Phone Dialer</h3>
                  <p className="text-[10px] text-slate-400">कॉल डायलर</p>
                </div>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display screen */}
            <div className="bg-[#030712] rounded-2xl p-4 text-center border border-white/5">
              <div className="text-xl font-mono font-bold text-emerald-400 tracking-wider h-8 truncate">
                {dialerNumber || 'Enter Number'}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => setDialerNumber((prev) => prev + digit)}
                  className="py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-lg font-bold text-white border border-white/5 active:scale-95 transition-all"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setDialerNumber((prev) => prev.slice(0, -1))}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs active:scale-95"
              >
                Clear
              </button>
              <a
                href={`tel:${dialerNumber || ''}`}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Calculator Modal */}
      {activeModalApp === 'calculator' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#091122] border border-amber-500/40 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Calculator</h3>
                  <p className="text-[10px] text-slate-400">कैलकुलेटर</p>
                </div>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display */}
            <div className="bg-[#030712] rounded-2xl p-4 text-right border border-white/5 space-y-1">
              <div className="text-xs font-mono text-slate-400 h-4 truncate">
                {calcInput || '0'}
              </div>
              <div className="text-2xl font-mono font-bold text-amber-400 truncate">
                {calcResult || calcInput || '0'}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2">
              {['C', '/', '*', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0', '.'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcPress(btn)}
                  className={`py-3 rounded-xl text-base font-bold active:scale-95 transition-all ${
                    btn === '='
                      ? 'bg-amber-500 text-black col-span-1 shadow-lg shadow-amber-500/30'
                      : btn === 'C'
                      ? 'bg-rose-900/50 text-rose-300 border border-rose-500/30'
                      : ['/', '*', '-', '+'].includes(btn)
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-900/90 text-white hover:bg-slate-800 border border-white/5'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Camera Modal */}
      {activeModalApp === 'camera' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#091122] border border-purple-500/40 p-5 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm text-white">Camera Viewfinder</h3>
                  <p className="text-[10px] text-slate-400">लाइव कैमरा</p>
                </div>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Viewfinder */}
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center">
              <div className="absolute inset-4 border border-dashed border-cyan-400/40 rounded-xl pointer-events-none" />
              <div className="text-center space-y-2 p-4">
                <Camera className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
                <p className="text-xs text-slate-300 font-medium">Ready to capture photo</p>
                <p className="text-[10px] text-slate-500">Android camera intent will open native camera on mobile</p>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Photo snapshot simulated! On your mobile phone, this opens the native Camera application.');
                setActiveModalApp(null);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 active:scale-95"
            >
              <div className="w-4 h-4 rounded-full border-2 border-white bg-purple-200" />
              <span>Capture Photo / सेल्फी लें</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Notes & Keep Modal */}
      {activeModalApp === 'notes' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#091122] border border-amber-400/40 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Notes & Keep</h3>
                  <p className="text-[10px] text-slate-400">नोट्स और डायरी</p>
                </div>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add note input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a new note (e.g. Milk, meeting)..."
                className="flex-1 bg-[#030712] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => {
                  if (newNote.trim()) {
                    setNotesList([newNote.trim(), ...notesList]);
                    setNewNote('');
                  }
                }}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl"
              >
                Add
              </button>
            </div>

            {/* Notes List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {notesList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">No notes saved.</div>
              ) : (
                notesList.map((note, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#030712] border border-white/5 text-xs text-slate-200"
                  >
                    <span className="truncate pr-2">• {note}</span>
                    <button
                      onClick={() => setNotesList(notesList.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Clock / Stopwatch Modal */}
      {activeModalApp === 'clock' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#091122] border border-indigo-500/40 p-5 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm text-white">Clock & Stopwatch</h3>
                  <p className="text-[10px] text-slate-400">घड़ी और स्टॉपवॉच</p>
                </div>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Digital Timer */}
            <div className="bg-[#030712] rounded-2xl p-5 border border-white/5">
              <div className="text-3xl font-mono font-bold text-indigo-400">
                {String(Math.floor(stopwatchSeconds / 60)).padStart(2, '0')}:
                {String(stopwatchSeconds % 60).padStart(2, '0')}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Live Stopwatch</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white ${
                  isStopwatchRunning ? 'bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isStopwatchRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => {
                  setIsStopwatchRunning(false);
                  setStopwatchSeconds(0);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Torch / Flashlight Modal */}
      {activeModalApp === 'flashlight' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-6 text-center transition-all ${
              isTorchOn ? 'bg-amber-100 text-slate-900 shadow-[0_0_50px_rgba(250,204,21,0.8)]' : 'bg-[#091122] text-white border border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${isTorchOn ? 'bg-amber-400 text-slate-900' : 'bg-amber-500/20 text-amber-400'}`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm">Flashlight / Torch</h3>
                  <p className="text-[10px] opacity-70">टॉर्च और स्क्रीन लाइट</p>
                </div>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="p-1 opacity-70 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6">
              <button
                onClick={() => setIsTorchOn(!isTorchOn)}
                className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-xl transition-transform active:scale-95 ${
                  isTorchOn
                    ? 'bg-amber-400 text-slate-900 shadow-amber-400/80 scale-110'
                    : 'bg-slate-800 text-amber-400 border border-amber-500/40'
                }`}
              >
                <Zap className="w-10 h-10" />
              </button>
              <p className="text-xs font-semibold mt-4">
                {isTorchOn ? 'TORCH IS ON (SCREEN FULL BRIGHT)' : 'TORCH IS OFF'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Weather Modal */}
      {activeModalApp === 'weather' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#091122] border border-sky-500/40 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Live Weather</h3>
                  <p className="text-[10px] text-slate-400">मौसम समाचार</p>
                </div>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-sky-950/80 to-blue-900/60 rounded-2xl p-4 border border-sky-500/20 text-center space-y-2">
              <CloudSun className="w-12 h-12 text-sky-400 mx-auto animate-bounce" />
              <div className="text-3xl font-bold text-white">28°C</div>
              <p className="text-xs text-sky-200">Mostly Sunny / साफ धूप</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px] text-slate-300">
                <div>Humidity: 62%</div>
                <div>Wind: 14 km/h</div>
              </div>
            </div>

            <a
              href="https://weather.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Full 7-Day Forecast on Weather.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* 8. Gallery / Photos Modal */}
      {activeModalApp === 'photos' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#091122] border border-pink-500/40 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Photos & Gallery</h3>
                  <p className="text-[10px] text-slate-400">फोटो गैलरी</p>
                </div>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery grid mock */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="aspect-square rounded-xl bg-gradient-to-br from-indigo-900 to-slate-950 border border-white/10 flex items-center justify-center">
                  <Image className="w-6 h-6 text-pink-400/60" />
                </div>
              ))}
            </div>

            <a
              href="https://photos.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Open Google Photos</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
