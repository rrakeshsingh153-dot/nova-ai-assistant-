/**
 * Memory intent detection and name extraction utility for NOVA AI.
 * Handles both Hindi and English phrasing without interpreting keywords
 * as code/editor commands.
 */

export interface MemoryIntentResult {
  isMemoryIntent: boolean;
  type: 'name' | 'preference' | 'none';
  extractedName?: string;
  memoryItem?: string;
  confirmationHindi?: string;
  confirmationEnglish?: string;
}

/**
 * Checks if a string contains memory-saving intents and extracts the relevant detail.
 */
export function detectMemoryIntent(input: string): MemoryIntentResult {
  if (!input || typeof input !== 'string') {
    return { isMemoryIntent: false, type: 'none' };
  }

  const raw = input.trim();
  const lower = raw.toLowerCase();

  // 1. Check for Name-specific memory requests in Hindi / Hinglish / English
  // Examples:
  // - "मेरा नाम Rakesh है, इसे मेरी memory में save करो"
  // - "याद रखो कि मेरा नाम Rakesh है"
  // - "याद रखना मेरा नाम Rakesh है"
  // - "मेरा नाम Rakesh है याद रखना"
  // - "Remember that my name is Rakesh"
  // - "Remember my name is Rakesh"
  // - "Save my name Rakesh in memory"
  // - "My name is Rakesh, save it in your memory"

  // Regex for Hindi / Hinglish name capture:
  // e.g. "मेरा नाम Rakesh है...", "मेरा नाम Rakesh", "mera naam Rakesh hai"
  const hindiNameMatch = raw.match(
    /(?:mera\s+naam|मेरा\s+नाम)\s+(?:hai\s+)?([A-Za-z\u0900-\u097F]+)/i
  );

  const englishNameMatch = raw.match(
    /(?:my\s+name\s+is|call\s+me)\s+([A-Za-z\u0900-\u097F]+)/i
  );

  // Check if there is an explicit request to remember/save
  const hasMemoryKeyword =
    lower.includes('memory') ||
    lower.includes('save') ||
    lower.includes('याद') ||
    lower.includes('yaad') ||
    lower.includes('remember') ||
    lower.includes('store');

  // Check if it's a name statement
  if (hindiNameMatch && (hasMemoryKeyword || lower.includes('mera naam') || raw.includes('मेरा नाम'))) {
    const rawName = hindiNameMatch[1].trim();
    // Clean up trailing punctuation or common words like 'hai'
    const cleanName = rawName.replace(/[,.!?]/g, '').trim();

    if (cleanName && cleanName.toLowerCase() !== 'hai' && cleanName !== 'है') {
      return {
        isMemoryIntent: true,
        type: 'name',
        extractedName: cleanName,
        memoryItem: `User's Name: ${cleanName}`,
        confirmationHindi: `ठीक है, मैंने याद रख लिया कि आपका नाम ${cleanName} है।`,
        confirmationEnglish: `Got it! I have remembered that your name is ${cleanName}.`,
      };
    }
  }

  if (englishNameMatch && (hasMemoryKeyword || lower.includes('my name is'))) {
    const rawName = englishNameMatch[1].trim();
    const cleanName = rawName.replace(/[,.!?]/g, '').trim();

    if (cleanName && cleanName.toLowerCase() !== 'is') {
      return {
        isMemoryIntent: true,
        type: 'name',
        extractedName: cleanName,
        memoryItem: `User's Name: ${cleanName}`,
        confirmationHindi: `ठीक है, मैंने याद रख लिया कि आपका नाम ${cleanName} है।`,
        confirmationEnglish: `Got it! I have remembered that your name is ${cleanName}.`,
      };
    }
  }

  // 2. General Preference Memory Intent (non-name facts)
  // e.g. "याद रखो मुझे क्रिकेट पसंद है", "Remember that I like black coffee"
  const isGeneralMemoryRequest =
    hasMemoryKeyword &&
    (lower.includes('ki ') ||
      lower.includes('कि ') ||
      lower.includes('that ') ||
      lower.includes('mujhe ') ||
      lower.includes('मुझे ') ||
      lower.includes('i like') ||
      lower.includes('i love') ||
      lower.includes('i live in') ||
      lower.includes('main ') ||
      lower.includes('मैं '));

  if (isGeneralMemoryRequest) {
    // Extract what follows the memory command
    let cleanFact = raw
      .replace(/^(please\s+)?(remember\s+that|remember|save\s+to\s+memory|save\s+in\s+memory|save\s+it\s+to\s+memory)\s*/i, '')
      .replace(/^(कृपया\s+)?(याद\s+रखो\s+कि|याद\s+रखना\s+कि|याद\s+रखो|याद\s+रखना|मेरी\s+मेमोरी\s+में\s+सेव\इसे\s+मेरी\s+memory\s+में\s+save\s+करो)\s*/i, '')
      .replace(/(,?\s*इसे\s+मेरी\s+memory\s+में\s+save\s+करो.*)$/i, '')
      .replace(/(,?\s*save\s+this\s+in\s+my\s+memory.*)$/i, '')
      .replace(/(,?\s*याद\s+रखना.*)$/i, '')
      .trim();

    if (cleanFact.length > 2) {
      return {
        isMemoryIntent: true,
        type: 'preference',
        memoryItem: cleanFact,
        confirmationHindi: `ठीक है, मैंने इसे याद रख लिया: "${cleanFact}"।`,
        confirmationEnglish: `Understood! I have saved this to my memory: "${cleanFact}".`,
      };
    }
  }

  return { isMemoryIntent: false, type: 'none' };
}
