import React, { useState } from 'react';
import { UserPreferences, LanguageMode } from '../types/index.ts';
import {
  Settings,
  Brain,
  Plus,
  Trash2,
  Volume2,
  Globe,
  Sliders,
  Smartphone,
  Vibrate,
  Bell,
  RefreshCw,
  Check,
  User,
  Info,
  Download,
  Code2,
  Terminal
} from 'lucide-react';
import { speakText, playSound } from '../utils/speech.ts';

interface SettingsTabProps {
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
  onResetDefaults: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  preferences,
  onUpdatePreferences,
  onResetDefaults,
}) => {
  const [newMemory, setNewMemory] = useState('');
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const showToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleLanguageChange = (lang: LanguageMode) => {
    onUpdatePreferences({ ...preferences, language: lang });
    showToast();
  };

  const handleNameChange = (name: string) => {
    onUpdatePreferences({ ...preferences, userName: name });
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;
    const updated = [...preferences.memories, newMemory.trim()];
    onUpdatePreferences({ ...preferences, memories: updated });
    setNewMemory('');
    playSound('success');
    showToast();
  };

  const handleRemoveMemory = (index: number) => {
    const updated = preferences.memories.filter((_, i) => i !== index);
    onUpdatePreferences({ ...preferences, memories: updated });
    showToast();
  };

  const testVoicePlayback = async () => {
    setIsTestingVoice(true);
    const testText = preferences.language === 'hi'
      ? 'नमस्ते! मैं NOVA AI हूँ। आपकी आवाज़ बहुत अच्छी आ रही है।'
      : preferences.language === 'hinglish'
      ? 'Namaste! Main NOVA AI hoon. Aapki voice settings ready hain.'
      : 'Hello! I am NOVA AI. Your voice and audio settings are working perfectly.';

    await speakText(testText, {
      rate: preferences.speechRate,
      pitch: preferences.speechPitch,
      onEnd: () => setIsTestingVoice(false),
      onError: () => setIsTestingVoice(false),
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-lg mx-auto w-full p-4 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            NOVA Settings
          </h2>
          <p className="text-xs text-slate-400">
            Configure bilingual voice, memory, and Android preferences
          </p>
        </div>

        {saveToast && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      {/* 1. User Profile & Name */}
      <div className="bg-[#081021] rounded-2xl p-4 border border-cyan-500/15 space-y-3">
        <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
          <User className="w-4 h-4 text-emerald-400" />
          <span>User Profile</span>
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1">
            Your Name (Used in personalized greetings):
          </label>
          <input
            type="text"
            value={preferences.userName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Rakesh, Priya, Alex"
            className="w-full bg-[#0d1830] border border-cyan-500/25 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* 2. Language Preference */}
      <div className="bg-[#081021] rounded-2xl p-4 border border-cyan-500/15 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Voice & Chat Language</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            Bilingual
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Choose the language NOVA should prioritize when answering you:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'auto' as LanguageMode, label: 'Auto Detect', desc: 'Hindi / English Smart' },
            { id: 'hi' as LanguageMode, label: 'हिन्दी (Hindi)', desc: 'Pure Hindi voice' },
            { id: 'en' as LanguageMode, label: 'English', desc: 'Clear English voice' },
            { id: 'hinglish' as LanguageMode, label: 'Hinglish', desc: 'Hindi + English mix' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleLanguageChange(item.id)}
              className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
                preferences.language === item.id
                  ? 'bg-gradient-to-br from-emerald-950/80 to-cyan-950/80 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-[#0d1830] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold">{item.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. NOVA Memory (Preferences stored for user) */}
      <div className="bg-[#081021] rounded-2xl p-4 border border-cyan-500/15 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
            <Brain className="w-4 h-4 text-emerald-400" />
            <span>NOVA Memory Bank</span>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {preferences.memories.length} facts remembered
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Things you want NOVA to always remember about you during answers and conversations:
        </p>

        {/* Add Memory Input */}
        <form onSubmit={handleAddMemory} className="flex gap-2">
          <input
            type="text"
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="e.g. My favorite food is Biryani, I live in Mumbai..."
            className="flex-1 bg-[#0d1830] border border-cyan-500/25 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!newMemory.trim()}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-40 flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Memory List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
          {preferences.memories.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2 text-center">
              No memories added yet. Add preferences above or say "Remember that..." to NOVA!
            </p>
          ) : (
            preferences.memories.map((mem, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0c1830] border border-cyan-500/10 text-xs text-slate-200 group"
              >
                <span className="flex-1 mr-2 leading-relaxed">💡 {mem}</span>
                <button
                  onClick={() => handleRemoveMemory(idx)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  title="Remove memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Speech Synthesis & Audio Controls */}
      <div className="bg-[#081021] rounded-2xl p-4 border border-cyan-500/15 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Voice Synthesis Settings</span>
          </div>

          <button
            onClick={testVoicePlayback}
            disabled={isTestingVoice}
            className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs hover:bg-cyan-900/60 transition-colors flex items-center gap-1"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isTestingVoice ? 'animate-bounce' : ''}`} />
            <span>{isTestingVoice ? 'Testing...' : 'Test Voice'}</span>
          </button>
        </div>

        {/* Auto Speak Toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-medium text-slate-200">Auto-Speak Answers</div>
            <div className="text-[11px] text-slate-400">
              Automatically read answers aloud via voice
            </div>
          </div>
          <button
            onClick={() =>
              onUpdatePreferences({ ...preferences, autoSpeak: !preferences.autoSpeak })
            }
            className={`w-11 h-6 rounded-full transition-colors relative ${
              preferences.autoSpeak ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                preferences.autoSpeak ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Speech Speed (Rate)</span>
            <span className="font-mono text-cyan-400">{preferences.speechRate}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.3"
            step="0.05"
            value={preferences.speechRate}
            onChange={(e) =>
              onUpdatePreferences({
                ...preferences,
                speechRate: parseFloat(e.target.value),
              })
            }
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Pitch Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Voice Pitch</span>
            <span className="font-mono text-cyan-400">{preferences.speechPitch}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.05"
            value={preferences.speechPitch}
            onChange={(e) =>
              onUpdatePreferences({
                ...preferences,
                speechPitch: parseFloat(e.target.value),
              })
            }
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* 5. Android Phone Aesthetics & Haptics */}
      <div className="bg-[#081021] rounded-2xl p-4 border border-cyan-500/15 space-y-3">
        <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Android Mobile Experience</span>
        </div>

        {/* Sound FX Toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-medium text-slate-200">Futuristic Sound Effects</div>
            <div className="text-[11px] text-slate-400">Play chimes on mic start & stop</div>
          </div>
          <button
            onClick={() => {
              const updated = !preferences.soundEffects;
              onUpdatePreferences({ ...preferences, soundEffects: updated });
              if (updated) playSound('success');
            }}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              preferences.soundEffects ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                preferences.soundEffects ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Phone Frame Toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-medium text-slate-200">Android Phone Bezel Frame</div>
            <div className="text-[11px] text-slate-400">
              Wrap UI inside a realistic smartphone mockup
            </div>
          </div>
          <button
            onClick={() =>
              onUpdatePreferences({
                ...preferences,
                phoneFrameMode: !preferences.phoneFrameMode,
              })
            }
            className={`w-11 h-6 rounded-full transition-colors relative ${
              preferences.phoneFrameMode ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                preferences.phoneFrameMode ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Native Android Project Info Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1830] to-[#081020] border border-cyan-500/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Native Android App Ready</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Kotlin + Compose
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Production source tree generated in <code className="text-cyan-300">/android-app</code>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed bg-black/30 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
            <Terminal className="w-3.5 h-3.5" />
            <span>Building APK / AAB Commands:</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300 space-y-1">
            <div className="bg-slate-900/90 px-2 py-1 rounded text-emerald-300">
              # Debug APK<br />./gradlew assembleDebug
            </div>
            <div className="bg-slate-900/90 px-2 py-1 rounded text-cyan-300">
              # Release Signed APK & Play Store AAB<br />./gradlew assembleRelease bundleRelease
            </div>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (window.confirm('Reset all NOVA settings and memory to defaults?')) {
              onResetDefaults();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Settings to Default</span>
        </button>
      </div>
    </div>
  );
};
