// YouTube Intent Detection & Media Helpers for NOVA AI Voice Assistant

export interface CuratedYouTubeItem {
  id: string;
  title: string;
  artistOrChannel: string;
  category: 'music' | 'lofi' | 'devotional' | 'tech' | 'trending';
  videoId: string;
  thumbnailUrl: string;
  duration?: string;
}

export const CURATED_YOUTUBE_ITEMS: CuratedYouTubeItem[] = [
  {
    id: 'yt_kesariya',
    title: 'Kesariya - Brahmāstra',
    artistOrChannel: 'Arijit Singh, Pritam',
    category: 'music',
    videoId: 'BddP6PYo2gs',
    thumbnailUrl: 'https://img.youtube.com/vi/BddP6PYo2gs/mqdefault.jpg',
    duration: '4:28',
  },
  {
    id: 'yt_hanuman',
    title: 'Shree Hanuman Chalisa',
    artistOrChannel: 'Hariharan, Gulshan Kumar',
    category: 'devotional',
    videoId: 'AETFvQonfV8',
    thumbnailUrl: 'https://img.youtube.com/vi/AETFvQonfV8/mqdefault.jpg',
    duration: '9:42',
  },
  {
    id: 'yt_tumhiho',
    title: 'Tum Hi Ho - Aashiqui 2',
    artistOrChannel: 'Arijit Singh, Mithoon',
    category: 'music',
    videoId: 'Umqb9KENgmk',
    thumbnailUrl: 'https://img.youtube.com/vi/Umqb9KENgmk/mqdefault.jpg',
    duration: '4:22',
  },
  {
    id: 'yt_lofi',
    title: 'Lofi Beats to Relax & Study',
    artistOrChannel: 'Lofi Girl / ChilledCow',
    category: 'lofi',
    videoId: 'jfKfPfyJRdk',
    thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
    duration: 'Live / 24x7',
  },
  {
    id: 'yt_cokestudio',
    title: 'Khalasi - Coke Studio Bharat',
    artistOrChannel: 'Aditya Gadhvi, Achint',
    category: 'trending',
    videoId: 't7wSjy9bvTU',
    thumbnailUrl: 'https://img.youtube.com/vi/t7wSjy9bvTU/mqdefault.jpg',
    duration: '4:15',
  },
  {
    id: 'yt_tech_ai',
    title: 'How Artificial Intelligence Works',
    artistOrChannel: 'Fireship / Tech Explainer',
    category: 'tech',
    videoId: '2eWuYf-aZE4',
    thumbnailUrl: 'https://img.youtube.com/vi/2eWuYf-aZE4/mqdefault.jpg',
    duration: '11:20',
  },
  {
    id: 'yt_shreya',
    title: 'Sun Raha Hai Na Tu - Female Version',
    artistOrChannel: 'Shreya Ghoshal',
    category: 'music',
    videoId: 'inEu2qQuGZ8',
    thumbnailUrl: 'https://img.youtube.com/vi/inEu2qQuGZ8/mqdefault.jpg',
    duration: '5:14',
  },
  {
    id: 'yt_python',
    title: 'Python for Beginners Full Course',
    artistOrChannel: 'Programming with Mosh',
    category: 'tech',
    videoId: '_uQrJ0TkZlc',
    thumbnailUrl: 'https://img.youtube.com/vi/_uQrJ0TkZlc/mqdefault.jpg',
    duration: '1:00:00',
  },
];

export interface YouTubeIntentResult {
  isYouTubeIntent: boolean;
  query: string;
  title: string;
  matchedVideoId?: string;
  replyHindi: string;
  replyEnglish: string;
}

/**
 * Detects if user utterance or message contains a YouTube intent
 * e.g. "YouTube par Arijit Singh ke gaane chalao"
 * "Play Kesariya on YouTube"
 * "YouTube kholo"
 * "YouTube search machine learning"
 */
export function detectYouTubeIntent(text: string): YouTubeIntentResult {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  const isExplicitYouTube =
    lower.includes('youtube') ||
    lower.includes('यू ट्यूब') ||
    lower.includes('यूट्यूब') ||
    lower.includes('yt');

  const isSongPlayRequest =
    (lower.startsWith('play ') || lower.startsWith('गाना') || lower.includes('chalao') || lower.includes('चलाओ') || lower.includes('sunao') || lower.includes('सुनाओ')) &&
    (lower.includes('song') || lower.includes('music') || lower.includes('gaana') || lower.includes('गाने') || isExplicitYouTube);

  if (!isExplicitYouTube && !isSongPlayRequest) {
    return {
      isYouTubeIntent: false,
      query: '',
      title: '',
      replyHindi: '',
      replyEnglish: '',
    };
  }

  // Extract clean search query
  let extractedQuery = clean
    .replace(/(?:please\s+)?(?:play|search|open|find)\s+/gi, '')
    .replace(/\b(?:on|in|from|pe|par|me|mein)\s+(?:youtube|यू ट्यूब|यूट्यूब|yt)\b/gi, '')
    .replace(/\b(?:youtube|यू ट्यूब|यूट्यूब|yt)\s+(?:par|pe|me|mein|par se|se)?\b/gi, '')
    .replace(/(?:chalao|chala do|baja do|bajao|sunao|kholo|dikhao|play karo)\b/gi, '')
    .replace(/(?:चलाओ|चला दो|बजाओ|बजा दो|सुनाओ|खोलो|दिखाओ)\b/gi, '')
    .replace(/(?:ke gaane|ke songs|ka song|songs|music)\b/gi, '')
    .trim();

  if (!extractedQuery || extractedQuery.length < 2) {
    extractedQuery = 'Trending Hindi Songs';
  }

  // Check if query matches any curated item directly
  const queryLower = extractedQuery.toLowerCase();
  const matchedItem = CURATED_YOUTUBE_ITEMS.find(
    (item) =>
      item.title.toLowerCase().includes(queryLower) ||
      item.artistOrChannel.toLowerCase().includes(queryLower) ||
      queryLower.includes(item.title.toLowerCase().split(' ')[0])
  );

  const finalVideoId = matchedItem ? matchedItem.videoId : undefined;
  const displayTitle = matchedItem ? matchedItem.title : extractedQuery;

  return {
    isYouTubeIntent: true,
    query: extractedQuery,
    title: displayTitle,
    matchedVideoId: finalVideoId,
    replyHindi: `हाँ बिल्कुल! मैं YouTube पर "${displayTitle}" खोल रहा हूँ।`,
    replyEnglish: `Sure! Playing "${displayTitle}" on YouTube.`,
  };
}

/**
 * Returns safe YouTube iframe embed URL
 */
export function getYouTubeEmbedUrl(videoId?: string, query?: string, autoPlay: boolean = true): string {
  const autoPlayParam = autoPlay ? '1' : '0';
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlayParam}&rel=0&modestbranding=1&enablejsapi=1`;
  }
  const safeQuery = encodeURIComponent(query || 'Trending Songs');
  return `https://www.youtube.com/embed?listType=search&list=${safeQuery}&autoplay=${autoPlayParam}&modestbranding=1`;
}

/**
 * Returns external YouTube direct link
 */
export function getYouTubeWatchUrl(videoId?: string, query?: string): string {
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  const safeQuery = encodeURIComponent(query || 'Trending');
  return `https://www.youtube.com/results?search_query=${safeQuery}`;
}
