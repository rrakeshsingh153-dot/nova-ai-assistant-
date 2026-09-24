export type LanguageMode = 'auto' | 'hi' | 'en' | 'hinglish';

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type TabType = 'home' | 'chat' | 'apps' | 'voice' | 'youtube' | 'history' | 'settings';

export interface AppLauncherData {
  appId: string;
  appName: string;
  category?: string;
  actionUrl?: string;
  detail?: string;
}

export interface YouTubeVideoData {
  videoId?: string;
  query: string;
  title: string;
  channel?: string;
  isDirectEmbed?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isVoiceInput?: boolean;
  language?: 'hi' | 'en' | 'hinglish';
  isFallback?: boolean;
  sources?: Array<{ web?: { uri?: string; title?: string } }>;
  youtube?: YouTubeVideoData;
  appLauncher?: AppLauncherData;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface UserPreferences {
  userName: string;
  language: LanguageMode;
  autoSpeak: boolean;
  speechRate: number; // 0.8 to 1.3
  speechPitch: number; // 0.8 to 1.2
  soundEffects: boolean;
  hapticFeedback: boolean;
  memories: string[];
  orbTheme: 'neon-emerald' | 'cyber-cyan' | 'deep-electric';
  phoneFrameMode: boolean;
}
