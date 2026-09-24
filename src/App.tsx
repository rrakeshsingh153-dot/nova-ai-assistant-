import React, { useState, useEffect, useRef } from 'react';
import {
  TabType,
  AssistantState,
  ChatMessage,
  ConversationSession,
  UserPreferences,
  LanguageMode,
} from './types/index.ts';
import {
  loadPreferences,
  savePreferences,
  loadSessions,
  saveSessions,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
  DEFAULT_PREFERENCES,
} from './utils/storage.ts';
import {
  startVoiceRecognition,
  stopVoiceRecognition,
  speakText,
  stopSpeaking,
  playSound,
  triggerHaptic,
  isSpeechRecognitionSupported,
} from './utils/speech.ts';

import { AndroidHeader } from './components/AndroidHeader.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { HomeTab } from './components/HomeTab.tsx';
import { VoiceTab } from './components/VoiceTab.tsx';
import { ChatTab } from './components/ChatTab.tsx';
import { HistoryTab } from './components/HistoryTab.tsx';
import { SettingsTab } from './components/SettingsTab.tsx';
import { BeginnerGuideModal } from './components/BeginnerGuideModal.tsx';
import { YouTubeTab } from './components/YouTubeTab.tsx';
import { PhoneAppsTab } from './components/PhoneAppsTab.tsx';
import { AlertCircle } from 'lucide-react';
import { detectMemoryIntent } from './utils/memoryIntent.ts';
import { detectYouTubeIntent } from './utils/youtube.ts';
import { detectAppIntent } from './utils/phoneApps.ts';

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [sessions, setSessions] = useState<ConversationSession[]>(loadSessions);
  const [activeSessionId, setCurrentSessionId] = useState<string | null>(getActiveSessionId);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [lastUserVoice, setLastUserVoice] = useState<string>('');
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeYouTubeQuery, setActiveYouTubeQuery] = useState<string | undefined>();
  const [activeYouTubeVideoId, setActiveYouTubeVideoId] = useState<string | undefined>();
  const [activeAppId, setActiveAppId] = useState<string | undefined>();

  const activeRecognitionController = useRef<{ stop: () => void } | null>(null);

  // Initialize or retrieve current session
  useEffect(() => {
    if (sessions.length === 0) {
      const initialSession = createNewSession();
      setSessions([initialSession]);
      setCurrentSessionId(initialSession.id);
      setActiveSessionId(initialSession.id);
      saveSessions([initialSession]);
    } else if (!activeSessionId || !sessions.find((s) => s.id === activeSessionId)) {
      setCurrentSessionId(sessions[0].id);
      setActiveSessionId(sessions[0].id);
    }
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastAssistantReply = [...messages].reverse().find((m) => m.role === 'assistant') || null;

  // Persist preferences
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const handleResetDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  };

  // Add message to active session
  const appendMessage = (msg: ChatMessage) => {
    setSessions((prevSessions) => {
      const targetId = activeSessionId || (prevSessions[0] ? prevSessions[0].id : null);
      if (!targetId) {
        const newSess = createNewSession(msg);
        setCurrentSessionId(newSess.id);
        setActiveSessionId(newSess.id);
        const updated = [newSess];
        saveSessions(updated);
        return updated;
      }

      const updated = prevSessions.map((sess) => {
        if (sess.id === targetId) {
          const newMessages = [...sess.messages, msg];
          const newTitle =
            sess.messages.length === 0 ? msg.text.slice(0, 30) + '...' : sess.title;
          return {
            ...sess,
            title: newTitle,
            updatedAt: Date.now(),
            messages: newMessages,
          };
        }
        return sess;
      });

      saveSessions(updated);
      return updated;
    });
  };

  // Check if query asks to remember something and extract memory
  const checkAndStoreMemory = (query: string) => {
    const memoryIntent = detectMemoryIntent(query);

    if (memoryIntent.isMemoryIntent) {
      if (memoryIntent.type === 'name' && memoryIntent.extractedName) {
        const newName = memoryIntent.extractedName;
        const memoryEntry = `User's Name: ${newName}`;
        const updatedMemories = preferences.memories.includes(memoryEntry)
          ? preferences.memories
          : [memoryEntry, ...preferences.memories.filter((m) => !m.startsWith("User's Name:"))];
        
        handleUpdatePreferences({
          ...preferences,
          userName: newName,
          memories: updatedMemories,
        });
        return;
      }

      if (memoryIntent.memoryItem) {
        if (!preferences.memories.includes(memoryIntent.memoryItem)) {
          const updated = [...preferences.memories, memoryIntent.memoryItem];
          handleUpdatePreferences({ ...preferences, memories: updated });
        }
        return;
      }
    }

    const lower = query.toLowerCase();
    const isMemoryPrompt =
      lower.includes('remember that') ||
      lower.includes('remember this') ||
      lower.includes('yaad rakhna') ||
      lower.includes('yaad rakho') ||
      lower.includes('mera naam') ||
      lower.includes('my name is') ||
      lower.includes('i live in') ||
      lower.includes('i like');

    if (isMemoryPrompt) {
      // Async extract clean memory fact
      fetch('/api/remember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.memoryItem && !preferences.memories.includes(data.memoryItem)) {
            const updated = [...preferences.memories, data.memoryItem];
            handleUpdatePreferences({ ...preferences, memories: updated });
          }
        })
        .catch(() => {});
    }
  };

  // Send message to AI backend
  const handleSendMessage = async (text: string, isVoiceInput: boolean = false) => {
    if (!text.trim()) return;

    if (preferences.soundEffects) {
      playSound('stop');
    }
    if (preferences.hapticFeedback) {
      triggerHaptic(20);
    }

    setErrorMessage(null);
    setAssistantState('thinking');
    setInterimTranscript('');
    setLastUserVoice(text);

    // Create user message
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
      isVoiceInput,
    };
    appendMessage(userMsg);

    // Client-side instant memory intent detection
    const memoryIntent = detectMemoryIntent(text);
    if (memoryIntent.isMemoryIntent && memoryIntent.type === 'name' && memoryIntent.extractedName) {
      const extractedName = memoryIntent.extractedName;
      const memoryEntry = `User's Name: ${extractedName}`;
      const updatedMemories = preferences.memories.includes(memoryEntry)
        ? preferences.memories
        : [memoryEntry, ...preferences.memories.filter((m) => !m.startsWith("User's Name:"))];

      handleUpdatePreferences({
        ...preferences,
        userName: extractedName,
        memories: updatedMemories,
      });

      // Confirm in Hindi as required: "ठीक है, मैंने याद रख लिया कि आपका नाम Rakesh है।"
      const replyText = memoryIntent.confirmationHindi!;
      const assistantMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        text: replyText,
        timestamp: Date.now(),
      };
      appendMessage(assistantMsg);

      if (preferences.autoSpeak) {
        handleSpeakText(replyText);
      } else {
        setAssistantState('idle');
      }
      return;
    }

    // Client-side instant YouTube intent detection
    const ytIntent = detectYouTubeIntent(text);
    if (ytIntent.isYouTubeIntent) {
      const lower = text.toLowerCase();
      // Check if user just wants to open the YouTube Hub
      if (
        lower === 'youtube' ||
        lower === 'open youtube' ||
        lower === 'youtube kholo' ||
        lower === 'यूट्यूब' ||
        lower === 'यूट्यूब खोलो'
      ) {
        setActiveTab('youtube');
        const replyText =
          preferences.language === 'hi'
            ? 'मैंने आपके लिए NOVA YouTube Hub खोल दिया है।'
            : 'I have opened the NOVA YouTube Hub for you.';
        const assistantMsg: ChatMessage = {
          id: 'msg_ai_' + Date.now(),
          role: 'assistant',
          text: replyText,
          timestamp: Date.now(),
        };
        appendMessage(assistantMsg);
        if (preferences.autoSpeak) {
          handleSpeakText(replyText);
        } else {
          setAssistantState('idle');
        }
        return;
      }

      // User requested a song or topic on YouTube
      const replyText =
        preferences.language === 'hi' ? ytIntent.replyHindi : ytIntent.replyEnglish;
      const assistantMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        text: replyText,
        timestamp: Date.now(),
        youtube: {
          videoId: ytIntent.matchedVideoId,
          query: ytIntent.query,
          title: ytIntent.title,
        },
      };
      appendMessage(assistantMsg);

      if (preferences.autoSpeak) {
        handleSpeakText(replyText);
      } else {
        setAssistantState('idle');
      }
      return;
    }

    // Client-side phone app intent detection
    const appIntent = detectAppIntent(text);
    if (appIntent.isAppIntent) {
      if (!appIntent.app) {
        // "Show all apps" intent
        setActiveTab('apps');
        const replyText =
          preferences.language === 'hi' ? appIntent.replyHindi : appIntent.replyEnglish;
        const assistantMsg: ChatMessage = {
          id: 'msg_ai_' + Date.now(),
          role: 'assistant',
          text: replyText,
          timestamp: Date.now(),
        };
        appendMessage(assistantMsg);
        if (preferences.autoSpeak) {
          handleSpeakText(replyText);
        } else {
          setAssistantState('idle');
        }
        return;
      }

      // Specific app intent (e.g. Phone/Dialer, WhatsApp, Camera, Maps, Notes, Calculator)
      const targetApp = appIntent.app;
      const replyText =
        preferences.language === 'hi' ? appIntent.replyHindi : appIntent.replyEnglish;

      const assistantMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        text: replyText,
        timestamp: Date.now(),
        appLauncher: {
          appId: targetApp.id,
          appName: preferences.language === 'hi' ? targetApp.nameHindi : targetApp.nameEnglish,
          category: targetApp.category,
          actionUrl: targetApp.actionUrl,
          detail: appIntent.targetDetail || targetApp.description,
        },
      };
      appendMessage(assistantMsg);

      // Auto trigger action if appropriate
      if (targetApp.id === 'youtube') {
        setActiveTab('youtube');
      } else if (targetApp.defaultAction !== 'open_url') {
        setActiveAppId(targetApp.id);
        setActiveTab('apps');
      } else if (targetApp.actionUrl) {
        // If web URL or tel/sms URI
        if (targetApp.actionUrl.startsWith('tel:') && appIntent.targetDetail) {
          window.open(`tel:${appIntent.targetDetail}`, '_self');
        } else if (targetApp.actionUrl.startsWith('sms:') || targetApp.actionUrl.startsWith('mailto:')) {
          window.open(targetApp.actionUrl, '_self');
        }
      }

      if (preferences.autoSpeak) {
        handleSpeakText(replyText);
      } else {
        setAssistantState('idle');
      }
      return;
    }

    // Check if statement should be remembered
    checkAndStoreMemory(text);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-8).map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.text,
          })),
          language: preferences.language,
          memory: preferences.memories,
          userName: preferences.userName,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'I heard you, but could not formulate a reply.';

      const assistantMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        text: replyText,
        timestamp: Date.now(),
        isFallback: data.isFallback,
        sources: data.sources,
        youtube: data.youtube,
      };

      appendMessage(assistantMsg);

      // Auto-speak response if enabled
      if (preferences.autoSpeak) {
        handleSpeakText(replyText);
      } else {
        setAssistantState('idle');
      }
    } catch (err: any) {
      console.error('[NOVA AI] Failed to fetch response:', err);
      const fallbackMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        text:
          preferences.language === 'hi'
            ? 'नमस्ते! मुझे आपसे जुड़ने में थोड़ी समस्या आई। कृपया अपना इंटरनेट या प्रश्न दोबारा जांचें।'
            : 'I had trouble connecting to my neural core. Please check your connection and ask again!',
        timestamp: Date.now(),
        isFallback: true,
      };
      appendMessage(fallbackMsg);
      setAssistantState('idle');
    }
  };

  // Speak aloud helper
  const handleSpeakText = async (text: string) => {
    stopSpeaking();
    setSpeakingText(text);
    setAssistantState('speaking');

    await speakText(text, {
      rate: preferences.speechRate,
      pitch: preferences.speechPitch,
      onStart: () => {
        setAssistantState('speaking');
      },
      onEnd: () => {
        setSpeakingText(null);
        setAssistantState('idle');
      },
      onError: (err) => {
        console.warn('Speech synthesis error:', err);
        setSpeakingText(null);
        setAssistantState('idle');
      },
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setSpeakingText(null);
    setAssistantState('idle');
    if (preferences.soundEffects) playSound('stop');
  };

  // Start Voice Recognition
  const handleStartListening = () => {
    if (!isSpeechRecognitionSupported()) {
      setErrorMessage(
        'Speech Recognition is not supported in this browser. Please open on Google Chrome or an Android browser.'
      );
      return;
    }

    // Stop speaking if NOVA was reading
    stopSpeaking();
    setSpeakingText(null);
    setErrorMessage(null);
    setInterimTranscript('');

    if (preferences.soundEffects) playSound('start');
    if (preferences.hapticFeedback) triggerHaptic([30, 40]);

    setAssistantState('listening');

    const controller = startVoiceRecognition({
      language: preferences.language,
      onStart: () => {
        setAssistantState('listening');
      },
      onInterimResult: (transcript) => {
        setInterimTranscript(transcript);
      },
      onFinalResult: (finalText) => {
        setInterimTranscript('');
        handleSendMessage(finalText, true);
      },
      onError: (err) => {
        setErrorMessage(err);
        setAssistantState('idle');
        if (preferences.soundEffects) playSound('alert');
      },
      onEnd: () => {
        // If final result wasn't triggered yet, go back to idle
        if (assistantState === 'listening') {
          setAssistantState('idle');
        }
      },
    });

    activeRecognitionController.current = controller;
  };

  const handleStopListening = () => {
    stopVoiceRecognition();
    if (activeRecognitionController.current) {
      activeRecognitionController.current.stop();
      activeRecognitionController.current = null;
    }
    setAssistantState('idle');
    if (preferences.soundEffects) playSound('stop');
  };

  // History & Session handlers
  const handleSelectSession = (session: ConversationSession) => {
    setCurrentSessionId(session.id);
    setActiveSessionId(session.id);
    setActiveTab('chat');
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    saveSessions(updated);
    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
        setActiveSessionId(updated[0].id);
      } else {
        const newSess = createNewSession();
        setSessions([newSess]);
        setCurrentSessionId(newSess.id);
        setActiveSessionId(newSess.id);
        saveSessions([newSess]);
      }
    }
  };

  const handleClearAllSessions = () => {
    const newSess = createNewSession();
    setSessions([newSess]);
    setCurrentSessionId(newSess.id);
    setActiveSessionId(newSess.id);
    saveSessions([newSess]);
  };

  const handleNewChat = () => {
    const newSess = createNewSession();
    const updated = [newSess, ...sessions];
    setSessions(updated);
    setCurrentSessionId(newSess.id);
    setActiveSessionId(newSess.id);
    saveSessions(updated);
    setActiveTab('chat');
    if (preferences.soundEffects) playSound('success');
  };

  const handleClearCurrentChat = () => {
    if (!activeSessionId) return;
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s));
      saveSessions(updated);
      return updated;
    });
  };

  // Render Inner Content by Tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            state={assistantState}
            lastMessage={lastMessage}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onStopSpeaking={handleStopSpeaking}
            onReplaySpeech={handleSpeakText}
            onQuickPrompt={(prompt) => handleSendMessage(prompt, false)}
            preferences={preferences}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'voice':
        return (
          <VoiceTab
            state={assistantState}
            interimTranscript={interimTranscript}
            lastUserVoice={lastUserVoice}
            lastAssistantReply={lastAssistantReply}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onStopSpeaking={handleStopSpeaking}
            onReplaySpeech={handleSpeakText}
            language={preferences.language}
            onLanguageChange={(lang) => handleUpdatePreferences({ ...preferences, language: lang })}
          />
        );
      case 'chat':
        return (
          <ChatTab
            messages={messages}
            state={assistantState}
            onSendMessage={handleSendMessage}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onReplaySpeech={handleSpeakText}
            onClearChat={handleClearCurrentChat}
            speakingText={speakingText}
            onStopSpeaking={handleStopSpeaking}
            language={preferences.language}
            onNavigateToYouTube={(query, videoId) => {
              setActiveYouTubeQuery(query);
              setActiveYouTubeVideoId(videoId);
              setActiveTab('youtube');
            }}
            onNavigateToApps={(appId) => {
              setActiveAppId(appId);
              setActiveTab('apps');
            }}
          />
        );
      case 'apps':
        return (
          <PhoneAppsTab
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            assistantState={assistantState}
            initialAppId={activeAppId}
            onLaunchYouTube={() => setActiveTab('youtube')}
            onLaunchSettings={() => setActiveTab('settings')}
          />
        );
      case 'youtube':
        return (
          <YouTubeTab
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            assistantState={assistantState}
            initialQuery={activeYouTubeQuery}
            initialVideoId={activeYouTubeVideoId}
          />
        );
      case 'history':
        return (
          <HistoryTab
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onClearAllSessions={handleClearAllSessions}
            onNewChat={handleNewChat}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onResetDefaults={handleResetDefaults}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#03060d] text-slate-100 flex items-center justify-center p-0 sm:p-4">
      {/* Container: If phoneFrameMode is true on desktop, renders stylish smartphone mockup */}
      <div
        className={`w-full flex flex-col overflow-hidden transition-all duration-300 ${
          preferences.phoneFrameMode
            ? 'max-w-[420px] h-[890px] rounded-[48px] border-[10px] border-[#182338] shadow-[0_0_80px_rgba(6,182,212,0.25)] relative ring-1 ring-cyan-500/20 bg-[#050811]'
            : 'max-w-md sm:max-w-xl min-h-screen sm:min-h-[850px] sm:h-[850px] sm:rounded-3xl sm:border sm:border-cyan-500/20 sm:shadow-[0_0_50px_rgba(6,182,212,0.15)] bg-[#050811]'
        }`}
      >
        {/* Android Punch Hole Camera (if phone frame enabled) */}
        {preferences.phoneFrameMode && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-slate-800 z-50 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a1829]" />
          </div>
        )}

        {/* Android Header with Digital Clock, 5G, Battery, Language switch & Voice mute */}
        <AndroidHeader
          state={assistantState}
          language={preferences.language}
          onLanguageChange={(lang) => handleUpdatePreferences({ ...preferences, language: lang })}
          autoSpeak={preferences.autoSpeak}
          onToggleAutoSpeak={() =>
            handleUpdatePreferences({ ...preferences, autoSpeak: !preferences.autoSpeak })
          }
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Global Error Banner (Mic permissions, etc) */}
        {errorMessage && (
          <div className="bg-rose-950/80 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-bold underline ml-2 text-rose-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Tab View */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {renderTabContent()}
        </main>

        {/* Bottom Navigation: Home, Chat, Voice, History, Settings */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (preferences.soundEffects) playSound('stop');
          }}
          isListening={assistantState === 'listening'}
        />

        {/* Android Gesture Bar */}
        <div className="w-full flex justify-center py-1 bg-[#070c18] border-t border-cyan-500/5">
          <div className="w-32 h-1 rounded-full bg-slate-700/60" />
        </div>
      </div>

      {/* Beginner Guide Modal */}
      <BeginnerGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
