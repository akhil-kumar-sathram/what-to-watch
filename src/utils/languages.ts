/**
 * Official TMDB ISO 639-1 Language Codes & Localization Utilities
 *
 * CRITICAL RULE:
 * English is NOT the default movie language.
 * When "Any Language" is chosen, with_original_language MUST BE OMITTED completely from TMDB queries.
 * When a specific language is chosen, with_original_language must be strictly set to that ISO code.
 */

export interface LanguageOption {
  code: string;
  name: string;
  nativeName?: string;
  region?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'any', name: 'Any Language', region: 'Global' },
  { code: 'en', name: 'English', nativeName: 'English', region: 'Hollywood & Global' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'Bollywood' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Kollywood' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Tollywood' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Mollywood' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Sandalwood' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Tollywood (Bengal)' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Marathi Cinema' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Pollywood' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Dhollywood' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'South Asia' },
  { code: 'any-indian', name: 'Any Indian Language', region: 'Pan-India' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'K-Cinema' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Japanese Cinema & Anime' },
  { code: 'zh', name: 'Chinese / Mandarin', nativeName: '中文', region: 'Greater China' },
  { code: 'cn', name: 'Cantonese', nativeName: '粵語', region: 'Hong Kong' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Spain & Latin America' },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'France & Francophone' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Germany & DACH' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'Italy' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'Brazil & Portugal' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Eastern Europe' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'Middle East & North Africa' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'Turkey' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', region: 'Thailand' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Indonesia' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Vietnam' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'Nordic' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'Netherlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'Poland' },
  { code: 'fa', name: 'Persian / Farsi', nativeName: 'فارسی', region: 'Iran' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Ollywood' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', region: 'Jollywood' },
];

export const INDIAN_LANG_PIPE = 'hi|ta|te|ml|kn|bn|mr|pa|gu|ur|or|as';

// Case-insensitive lookup map
const NAME_TO_CODE_MAP: Record<string, string> = {
  // English
  english: 'en',
  en: 'en',

  // Indian Languages
  hindi: 'hi',
  hi: 'hi',
  tamil: 'ta',
  ta: 'ta',
  telugu: 'te',
  te: 'te',
  malayalam: 'ml',
  ml: 'ml',
  kannada: 'kn',
  kn: 'kn',
  bengali: 'bn',
  bn: 'bn',
  bangla: 'bn',
  marathi: 'mr',
  mr: 'mr',
  punjabi: 'pa',
  pa: 'pa',
  gujarati: 'gu',
  gu: 'gu',
  urdu: 'ur',
  ur: 'ur',
  odia: 'or',
  or: 'or',
  oriya: 'or',
  assamese: 'as',
  as: 'as',
  'any indian language': INDIAN_LANG_PIPE,
  'indian': INDIAN_LANG_PIPE,
  'pan-indian': INDIAN_LANG_PIPE,

  // East Asian
  korean: 'ko',
  ko: 'ko',
  japanese: 'ja',
  ja: 'ja',
  chinese: 'zh',
  mandarin: 'zh',
  zh: 'zh',
  cantonese: 'cn',
  cn: 'cn',

  // European & Global
  spanish: 'es',
  es: 'es',
  french: 'fr',
  fr: 'fr',
  german: 'de',
  de: 'de',
  italian: 'it',
  it: 'it',
  portuguese: 'pt',
  pt: 'pt',
  russian: 'ru',
  ru: 'ru',
  arabic: 'ar',
  ar: 'ar',
  turkish: 'tr',
  tr: 'tr',
  thai: 'th',
  th: 'th',
  indonesian: 'id',
  id: 'id',
  vietnamese: 'vi',
  vi: 'vi',
  swedish: 'sv',
  sv: 'sv',
  dutch: 'nl',
  nl: 'nl',
  polish: 'pl',
  pl: 'pl',
  persian: 'fa',
  farsi: 'fa',
  fa: 'fa',
};

export const CODE_TO_NAME_MAP: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  bn: 'Bengali',
  mr: 'Marathi',
  pa: 'Punjabi',
  gu: 'Gujarati',
  ur: 'Urdu',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese',
  cn: 'Cantonese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
  tr: 'Turkish',
  th: 'Thai',
  id: 'Indonesian',
  vi: 'Vietnamese',
  sv: 'Swedish',
  nl: 'Dutch',
  pl: 'Polish',
  fa: 'Persian',
  da: 'Danish',
  no: 'Norwegian',
  fi: 'Finnish',
  el: 'Greek',
  he: 'Hebrew',
  hu: 'Hungarian',
  cs: 'Czech',
  ro: 'Romanian',
  uk: 'Ukrainian',
  tl: 'Tagalog',
};

/**
 * Parses user input or survey option into a verified TMDB with_original_language string.
 * Returns null if the user wants "Any Language", meaning NO language filter should be applied to TMDB.
 */
export function toTmdbLanguageCode(input?: string | null): string | null {
  if (!input) return null;
  const clean = input.trim().toLowerCase();

  // If user selected "Any Language" or open to anything, OMIT filter completely
  if (
    clean === 'any' ||
    clean === 'all' ||
    clean === 'all languages' ||
    clean === 'any language' ||
    clean.includes('open to anything') ||
    clean.includes('unrestricted') ||
    clean.includes('international')
  ) {
    return null;
  }

  // Exact match in dictionary
  if (NAME_TO_CODE_MAP[clean]) {
    return NAME_TO_CODE_MAP[clean];
  }

  // Substring checks for partial strings (e.g., "Hindi cinema", "Korean thrillers")
  for (const [key, code] of Object.entries(NAME_TO_CODE_MAP)) {
    if (key.length > 2 && clean.includes(key)) {
      return code;
    }
  }

  // If it looks like a valid 2-letter ISO code
  if (/^[a-z]{2}$/.test(clean)) {
    return clean;
  }

  return null;
}

/**
 * Returns human-readable display name for an ISO 639-1 language code.
 * NEVER assumes or defaults to 'English'.
 */
export function getLanguageDisplayName(code?: string | null): string {
  if (!code) return 'International';
  const clean = code.trim().toLowerCase();
  if (clean === 'any' || clean === 'all') return 'Any Language';
  if (clean === INDIAN_LANG_PIPE) return 'Pan-Indian';
  return CODE_TO_NAME_MAP[clean] || code.toUpperCase();
}

/**
 * Checks if a movie's original_language matches the target filter.
 * If targetLangCode is null or empty, it matches any language.
 */
export function matchesLanguageFilter(
  movieOriginalLanguage: string | undefined | null,
  targetLangCode: string | null | undefined
): boolean {
  if (!targetLangCode || targetLangCode === 'any' || targetLangCode === 'all') {
    return true; // No filter active
  }
  if (!movieOriginalLanguage) return false;

  const movieLang = movieOriginalLanguage.trim().toLowerCase();
  const allowed = targetLangCode.toLowerCase().split('|');
  return allowed.includes(movieLang);
}

/**
 * Checks whether a language code or name represents an Indian regional or national language.
 */
export function isIndianLanguage(lang?: string | null): boolean {
  if (!lang) return false;
  const clean = lang.trim().toLowerCase();
  if (clean === 'any-indian' || clean === INDIAN_LANG_PIPE) return true;
  const code = toTmdbLanguageCode(clean);
  if (!code) return false;
  const indianCodes = INDIAN_LANG_PIPE.split('|');
  return indianCodes.includes(code);
}
