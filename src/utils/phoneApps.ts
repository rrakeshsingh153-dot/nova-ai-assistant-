// Phone Apps & System Tools Registry for NOVA AI Assistant
// Supports launching, simulation, and voice commands in Hindi & English

export interface PhoneApp {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  category: 'daily' | 'google' | 'social' | 'tools' | 'entertainment';
  iconName: string; // key to icon component
  bgGradient: string;
  accentColor: string;
  badge?: string;
  actionUrl?: string; // external or web uri
  deepLinkAndroid?: string;
  voiceTriggersHindi: string[];
  voiceTriggersEnglish: string[];
  description: string;
  defaultAction: 'open_url' | 'internal_modal' | 'dialer' | 'camera' | 'calculator' | 'notes';
}

export const PHONE_APPS: PhoneApp[] = [
  // 1. Phone / Dialer
  {
    id: 'phone',
    nameHindi: 'फोन / डायलर',
    nameEnglish: 'Phone / Dialer',
    category: 'daily',
    iconName: 'Phone',
    bgGradient: 'from-emerald-500 to-green-600',
    accentColor: '#10B981',
    badge: 'Call',
    actionUrl: 'tel:',
    deepLinkAndroid: 'tel:',
    voiceTriggersHindi: ['फोन लगाओ', 'कॉल करो', 'डायलर खोलो', 'फोन खोलो'],
    voiceTriggersEnglish: ['call', 'phone', 'dialer', 'make a call', 'open phone'],
    description: 'Call any contact or phone number directly',
    defaultAction: 'dialer',
  },
  // 2. WhatsApp
  {
    id: 'whatsapp',
    nameHindi: 'व्हाट्सएप',
    nameEnglish: 'WhatsApp',
    category: 'social',
    iconName: 'MessageCircle',
    bgGradient: 'from-emerald-600 to-green-700',
    accentColor: '#25D366',
    badge: 'Chat',
    actionUrl: 'https://web.whatsapp.com/',
    deepLinkAndroid: 'whatsapp://send',
    voiceTriggersHindi: ['व्हाट्सएप खोलो', 'व्हाट्सएप पर मैसेज करो', 'whatsapp kholo'],
    voiceTriggersEnglish: ['open whatsapp', 'whatsapp', 'send whatsapp message'],
    description: 'Instant messaging, voice & video calls',
    defaultAction: 'open_url',
  },
  // 3. YouTube
  {
    id: 'youtube',
    nameHindi: 'यूट्यूब',
    nameEnglish: 'YouTube',
    category: 'entertainment',
    iconName: 'Youtube',
    bgGradient: 'from-red-600 to-rose-700',
    accentColor: '#EF4444',
    badge: 'Videos',
    actionUrl: 'https://youtube.com',
    deepLinkAndroid: 'vnd.youtube:',
    voiceTriggersHindi: ['यूट्यूब खोलो', 'यूट्यूब पर गाने चलाओ', 'youtube kholo'],
    voiceTriggersEnglish: ['open youtube', 'play youtube', 'youtube'],
    description: 'Watch trending videos, Hindi songs, bhajan & podcasts',
    defaultAction: 'open_url',
  },
  // 4. Google Maps
  {
    id: 'maps',
    nameHindi: 'गूगल मैप्स',
    nameEnglish: 'Google Maps',
    category: 'google',
    iconName: 'MapPin',
    bgGradient: 'from-blue-600 to-emerald-500',
    accentColor: '#3B82F6',
    badge: 'GPS',
    actionUrl: 'https://maps.google.com',
    deepLinkAndroid: 'geo:0,0?q=',
    voiceTriggersHindi: ['मैप्स खोलो', 'रास्ता दिखाओ', 'नेविगेशन शुरू करो', 'maps kholo', 'rasta dikhao'],
    voiceTriggersEnglish: ['open maps', 'google maps', 'show directions', 'navigation', 'navigate'],
    description: 'Live traffic, GPS navigation & route finder',
    defaultAction: 'open_url',
  },
  // 5. Camera
  {
    id: 'camera',
    nameHindi: 'कैमरा',
    nameEnglish: 'Camera',
    category: 'tools',
    iconName: 'Camera',
    bgGradient: 'from-purple-600 to-pink-600',
    accentColor: '#A855F7',
    badge: 'Photo',
    actionUrl: '',
    deepLinkAndroid: 'android.media.action.IMAGE_CAPTURE',
    voiceTriggersHindi: ['कैमरा खोलो', 'फोटो खींचो', 'camera kholo', 'photo khicho'],
    voiceTriggersEnglish: ['open camera', 'take photo', 'camera'],
    description: 'Capture photos and selfie with live camera viewfinder',
    defaultAction: 'camera',
  },
  // 6. Calculator
  {
    id: 'calculator',
    nameHindi: 'कैलकुलेटर',
    nameEnglish: 'Calculator',
    category: 'tools',
    iconName: 'Calculator',
    bgGradient: 'from-amber-500 to-orange-600',
    accentColor: '#F59E0B',
    badge: 'Math',
    actionUrl: '',
    deepLinkAndroid: 'calculator:',
    voiceTriggersHindi: ['कैलकुलेटर खोलो', 'हिसाब करो', 'calculator kholo'],
    voiceTriggersEnglish: ['open calculator', 'calculator', 'calculate', 'do math'],
    description: 'Instant mathematical & financial calculations',
    defaultAction: 'calculator',
  },
  // 7. Messages / SMS
  {
    id: 'messages',
    nameHindi: 'मैसेज / एसएमएस',
    nameEnglish: 'Messages / SMS',
    category: 'daily',
    iconName: 'Mail',
    bgGradient: 'from-cyan-500 to-blue-600',
    accentColor: '#06B6D4',
    badge: 'SMS',
    actionUrl: 'sms:',
    deepLinkAndroid: 'sms:',
    voiceTriggersHindi: ['मैसेज खोलो', 'एसएमएस भेजो', 'message kholo'],
    voiceTriggersEnglish: ['open messages', 'sms', 'send text message'],
    description: 'Send and read SMS text messages',
    defaultAction: 'open_url',
  },
  // 8. Gmail
  {
    id: 'gmail',
    nameHindi: 'जीमेल',
    nameEnglish: 'Gmail',
    category: 'google',
    iconName: 'Inbox',
    bgGradient: 'from-red-500 to-amber-600',
    accentColor: '#EA4335',
    badge: 'Email',
    actionUrl: 'mailto:',
    deepLinkAndroid: 'mailto:',
    voiceTriggersHindi: ['जीमेल खोलो', 'ईमेल भेजो', 'gmail kholo', 'email check karo'],
    voiceTriggersEnglish: ['open gmail', 'gmail', 'send email', 'check emails'],
    description: 'Compose and read emails securely',
    defaultAction: 'open_url',
  },
  // 9. Chrome / Browser
  {
    id: 'chrome',
    nameHindi: 'गूगल क्रोम',
    nameEnglish: 'Google Chrome',
    category: 'google',
    iconName: 'Globe',
    bgGradient: 'from-amber-400 via-red-500 to-green-500',
    accentColor: '#4285F4',
    badge: 'Web',
    actionUrl: 'https://google.com',
    deepLinkAndroid: 'https://google.com',
    voiceTriggersHindi: ['क्रोम खोलो', 'ब्राउजर खोलो', 'chrome kholo', 'internet kholo'],
    voiceTriggersEnglish: ['open chrome', 'chrome', 'browser', 'open web browser'],
    description: 'Browse the internet with Google Search',
    defaultAction: 'open_url',
  },
  // 10. Clock / Alarm / Timer
  {
    id: 'clock',
    nameHindi: 'घड़ी और अलार्म',
    nameEnglish: 'Clock & Alarm',
    category: 'daily',
    iconName: 'Clock',
    bgGradient: 'from-indigo-500 to-purple-700',
    accentColor: '#6366F1',
    badge: 'Alarm',
    actionUrl: '',
    deepLinkAndroid: 'android.intent.action.SET_ALARM',
    voiceTriggersHindi: ['अलार्म लगाओ', 'घड़ी खोलो', 'टाइमर लगाओ', 'alarm lagao', 'ghadi kholo'],
    voiceTriggersEnglish: ['open clock', 'set alarm', 'clock', 'set timer'],
    description: 'Live clock, stopwatch, timer & alarm setting',
    defaultAction: 'internal_modal',
  },
  // 11. Notes / Keep
  {
    id: 'notes',
    nameHindi: 'नोट्स / डायरी',
    nameEnglish: 'Notes & Keep',
    category: 'tools',
    iconName: 'FileText',
    bgGradient: 'from-yellow-400 to-amber-600',
    accentColor: '#FBBF24',
    badge: 'Notes',
    actionUrl: '',
    deepLinkAndroid: '',
    voiceTriggersHindi: ['नोट लिखो', 'डायरी खोलो', 'notes kholo', 'kuch note karo'],
    voiceTriggersEnglish: ['open notes', 'take note', 'notes', 'keep notes'],
    description: 'Quick thoughts, grocery lists and memos saved to memory',
    defaultAction: 'notes',
  },
  // 12. Weather
  {
    id: 'weather',
    nameHindi: 'मौसम समाचार',
    nameEnglish: 'Live Weather',
    category: 'daily',
    iconName: 'CloudSun',
    bgGradient: 'from-sky-400 to-blue-600',
    accentColor: '#38BDF8',
    badge: 'Forecast',
    actionUrl: 'https://weather.com',
    deepLinkAndroid: '',
    voiceTriggersHindi: ['मौसम कैसा है', 'मौसम बताओ', 'aaj ka mausam', 'weather kaisa hai'],
    voiceTriggersEnglish: ['weather', 'what is the weather', 'weather forecast'],
    description: 'Current temperature, rain forecast and air quality',
    defaultAction: 'internal_modal',
  },
  // 13. Play Store
  {
    id: 'playstore',
    nameHindi: 'गूगल प्ले स्टोर',
    nameEnglish: 'Google Play Store',
    category: 'google',
    iconName: 'ShoppingBag',
    bgGradient: 'from-teal-400 to-cyan-600',
    accentColor: '#00875F',
    badge: 'Apps',
    actionUrl: 'https://play.google.com/store',
    deepLinkAndroid: 'market://',
    voiceTriggersHindi: ['प्ले स्टोर खोलो', 'ऐप्स डाउनलोड करो', 'play store kholo'],
    voiceTriggersEnglish: ['open play store', 'play store', 'download apps'],
    description: 'Install and discover trending Android apps & games',
    defaultAction: 'open_url',
  },
  // 14. Gallery / Photos
  {
    id: 'photos',
    nameHindi: 'फोटो गैलरी',
    nameEnglish: 'Photos Gallery',
    category: 'entertainment',
    iconName: 'Image',
    bgGradient: 'from-pink-500 via-rose-500 to-yellow-400',
    accentColor: '#EC4899',
    badge: 'Gallery',
    actionUrl: 'https://photos.google.com',
    deepLinkAndroid: 'content://media/internal/images/media',
    voiceTriggersHindi: ['गैलरी खोलो', 'मेरी फोटो दिखाओ', 'gallery kholo', 'photos kholo'],
    voiceTriggersEnglish: ['open gallery', 'photos', 'open photos', 'gallery'],
    description: 'View saved pictures, screenshots and memories',
    defaultAction: 'internal_modal',
  },
  // 15. Flashlight / Torch
  {
    id: 'flashlight',
    nameHindi: 'टॉर्च / फ्लैशलाइट',
    nameEnglish: 'Flashlight / Torch',
    category: 'tools',
    iconName: 'Zap',
    bgGradient: 'from-amber-400 to-yellow-500',
    accentColor: '#FACC15',
    badge: 'Light',
    actionUrl: '',
    deepLinkAndroid: '',
    voiceTriggersHindi: ['टॉर्च जलाओ', 'टॉर्च चालू करो', 'flashlight on karo', 'torch jalao'],
    voiceTriggersEnglish: ['turn on flashlight', 'flashlight', 'torch', 'turn on torch'],
    description: 'High-power screen and hardware torch toggle',
    defaultAction: 'internal_modal',
  },
  // 16. Settings
  {
    id: 'settings',
    nameHindi: 'फोन सेटिंग्स',
    nameEnglish: 'System Settings',
    category: 'tools',
    iconName: 'Settings',
    bgGradient: 'from-slate-600 to-slate-800',
    accentColor: '#94A3B8',
    badge: 'System',
    actionUrl: '',
    deepLinkAndroid: 'android.settings.SETTINGS',
    voiceTriggersHindi: ['सेटिंग्स खोलो', 'phone settings kholo'],
    voiceTriggersEnglish: ['open settings', 'settings', 'system settings'],
    description: 'Configure Wi-Fi, Bluetooth, sound, voice and security',
    defaultAction: 'internal_modal',
  },
];

export interface AppIntentResult {
  isAppIntent: boolean;
  app: PhoneApp | null;
  targetDetail?: string;
  replyHindi: string;
  replyEnglish: string;
}

/**
 * Detects if a user utterance is an instruction to open or control a phone app
 * e.g. "कॉल करो", "व्हाट्सएप खोलो", "कैमरा चालू करो", "रास्ता दिखाओ", "कैलकुलेटर खोलो"
 */
export function detectAppIntent(text: string): AppIntentResult {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Check all apps and their triggers
  for (const app of PHONE_APPS) {
    // English trigger match
    const matchedEn = app.voiceTriggersEnglish.some((trigger) =>
      lower.includes(trigger) || lower === trigger
    );
    // Hindi trigger match
    const matchedHi = app.voiceTriggersHindi.some((trigger) =>
      clean.includes(trigger) || lower.includes(trigger)
    );

    if (matchedEn || matchedHi) {
      // Check for detail e.g. "call 9876543210" or "maps directions to Mumbai"
      let detail = '';
      if (app.id === 'phone') {
        const phoneMatch = clean.match(/(\+?\d[\d\s-]{6,14}\d)/);
        if (phoneMatch) detail = phoneMatch[0].replace(/\s+/g, '');
      } else if (app.id === 'maps') {
        detail = clean
          .replace(/^(?:maps|navigation|navigate|direction|raasta|rasta)\s+(?:to|dikhao|le jao)?/gi, '')
          .replace(/(?:खोलो|दिखाओ|जाना है|ले जाओ)/gi, '')
          .trim();
      }

      return {
        isAppIntent: true,
        app,
        targetDetail: detail || undefined,
        replyHindi: `हाँ बिल्कुल! मैं ${app.nameHindi} खोल रहा हूँ।`,
        replyEnglish: `Sure! Opening ${app.nameEnglish}.`,
      };
    }
  }

  // Generic "all apps" / "apps dikhao" intent
  if (
    lower.includes('all apps') ||
    lower.includes('phone apps') ||
    lower.includes('apps dikhao') ||
    lower.includes('ऐप्स खोलो') ||
    lower.includes('सभी ऐप्स')
  ) {
    return {
      isAppIntent: true,
      app: null,
      replyHindi: 'यहाँ आपके फोन के सभी मुख्य ऐप्स उपलब्ध हैं।',
      replyEnglish: 'Here are all the installed mobile phone apps.',
    };
  }

  return {
    isAppIntent: false,
    app: null,
    replyHindi: '',
    replyEnglish: '',
  };
}
