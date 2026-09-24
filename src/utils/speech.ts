/**
 * NOVA AI - Speech Recognition & Speech Synthesis Utility
 * Optimized for Android and modern web browsers with bilingual Hindi & English support.
 */

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    webkitAudioContext?: typeof AudioContext;
  }
}

// Audio context singleton for clean sound effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Play futuristic UI sound effects
export function playSound(type: 'start' | 'stop' | 'success' | 'alert') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.05, now);

    if (type === 'start') {
      // Ascending futuristic chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'stop') {
      // Descending soft chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'success') {
      // Pleasant dual tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

// Trigger Android haptic vibration
export function triggerHaptic(pattern: number | number[] = 25) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

// Check if Speech Recognition is supported
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export interface RecognitionOptions {
  language: 'auto' | 'hi' | 'en' | 'hinglish';
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

let activeRecognition: any = null;

// Start voice listening
export function startVoiceRecognition(options: RecognitionOptions): { stop: () => void } {
  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    options.onError?.('Speech Recognition is not supported on this browser. Try Chrome or Android WebView.');
    return { stop: () => {} };
  }

  // Stop any ongoing recognition
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch {}
    activeRecognition = null;
  }

  try {
    const recognition = new SpeechRecognitionClass();
    activeRecognition = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Set recognition language
    if (options.language === 'hi') {
      recognition.lang = 'hi-IN';
    } else if (options.language === 'hinglish') {
      recognition.lang = 'en-IN'; // en-IN handles Indian accent and Hinglish best
    } else if (options.language === 'en') {
      recognition.lang = 'en-US';
    } else {
      // Auto: Default to en-IN / browser locale which captures both English & Hindi on Indian Androids
      const browserLang = navigator.language || 'en-IN';
      recognition.lang = browserLang.startsWith('hi') ? 'hi-IN' : 'en-IN';
    }

    recognition.onstart = () => {
      options.onStart?.();
    };

    let finalCollected = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalCollected += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim && options.onInterimResult) {
        options.onInterimResult(interim);
      }
      if (finalCollected && options.onFinalResult) {
        options.onFinalResult(finalCollected.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[NOVA AI] Speech error:', event.error);
      let message = 'Speech recognition error';
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        message = 'Microphone permission denied. Please allow mic access in your browser settings.';
      } else if (event.error === 'no-speech') {
        message = 'No speech detected. Please speak closer to the microphone.';
      } else if (event.error === 'network') {
        message = 'Network error during speech recognition.';
      }
      options.onError?.(message);
    };

    recognition.onend = () => {
      activeRecognition = null;
      options.onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {}
      },
    };
  } catch (err: any) {
    options.onError?.(err?.message || 'Could not start speech recognition');
    return { stop: () => {} };
  }
}

export function stopVoiceRecognition() {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {}
    activeRecognition = null;
  }
}

// ----------------- Text-to-Speech (TTS) -----------------

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function isCurrentlySpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}

// Detect language of text: Hindi or English
export function detectLanguage(text: string): 'hi' | 'en' {
  // Check for Devanagari Unicode block (Hindi script)
  const devanagariRegex = /[\u0900-\u097F]/;
  return devanagariRegex.test(text) ? 'hi' : 'en';
}

// Clean text for speech synthesis (remove asterisks, markdown, emojis that sound weird when read)
export function sanitizeTextForSpeech(text: string): string {
  return text
    .replace(/\*+/g, '') // remove markdown bold/italics
    .replace(/#+/g, '') // headers
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, 'code block omitted')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links
    .replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // common emojis
    .replace(/\s+/g, ' ')
    .trim();
}

// Get available voices from browser
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      return resolve([]);
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      return resolve(voices);
    }
    // Wait for voiceschanged event if not loaded yet
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    // Fallback timeout
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 500);
  });
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  forceLanguage?: 'hi' | 'en';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// Speak text using Web Speech API with automatic voice matching
export async function speakText(text: string, options: SpeakOptions = {}): Promise<void> {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.('Speech Synthesis not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) {
    options.onEnd?.();
    return;
  }

  const detected = options.forceLanguage || detectLanguage(cleanText);
  const utterance = new SpeechSynthesisUtterance(cleanText);

  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;

  // Find best matched voice
  const voices = await getAvailableVoices();

  if (detected === 'hi') {
    utterance.lang = 'hi-IN';
    // Find Hindi voice
    const hindiVoice = voices.find(
      (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('lekha')
    );
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    } else {
      // Fallback to Indian English voice if pure Hindi not installed
      const indianVoice = voices.find((v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india'));
      if (indianVoice) utterance.voice = indianVoice;
    }
  } else {
    utterance.lang = 'en-US';
    // Prefer pleasant natural English voice
    const naturalVoice = voices.find(
      (v) => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    // Interrupted is common when stopping
    if (e.error !== 'interrupted') {
      console.warn('[NOVA AI] Speech error:', e);
      options.onError?.(e);
    }
  };

  window.speechSynthesis.speak(utterance);
}
