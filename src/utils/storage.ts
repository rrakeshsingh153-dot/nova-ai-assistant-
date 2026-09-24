import { ConversationSession, UserPreferences, ChatMessage } from '../types/index.ts';

const PREFERENCES_KEY = 'nova_ai_preferences_v1';
const SESSIONS_KEY = 'nova_ai_sessions_v1';
const ACTIVE_SESSION_ID_KEY = 'nova_ai_active_session_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  userName: 'Rakesh',
  language: 'auto',
  autoSpeak: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  soundEffects: true,
  hapticFeedback: true,
  memories: [
    'Language preference: Understands Hindi and English fluently',
    'User loves smart tech and voice assistants',
    'Prefers short, direct voice answers',
  ],
  orbTheme: 'neon-emerald',
  phoneFrameMode: false,
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (e) {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

export function loadSessions(): ConversationSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveSessions(sessions: ConversationSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
}

export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
  } catch {}
}

export function createNewSession(firstMessage?: ChatMessage): ConversationSession {
  const id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = Date.now();
  const session: ConversationSession = {
    id,
    title: firstMessage ? firstMessage.text.slice(0, 30) + '...' : 'New Conversation',
    createdAt: now,
    updatedAt: now,
    messages: firstMessage ? [firstMessage] : [],
  };
  return session;
}
