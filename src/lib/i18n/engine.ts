/**
 * LANTIAI - Multilingual Engine
 * 
 * Lantiai is "Natively Multilingual" — not just translation.
 * This engine handles:
 * 1. Language switching with cultural context
 * 2. Lip-sync re-rendering metadata for video assets
 * 3. Culturally adaptive asset selection
 * 4. RTL/LTR layout switching
 */

export interface Locale {
    code: string;
    name: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
    region: string;
    flag: string;
}

export interface LipSyncConfig {
    sourceLocale: string;
    targetLocale: string;
    videoUrl: string;
    // Phoneme mapping for lip-sync re-rendering
    phonemeMap?: Record<string, string[]>;
}

export interface LipSyncResult {
    processedVideoUrl: string;
    status: 'processing' | 'complete' | 'error';
    estimatedDuration?: number; // seconds to process
}

/**
 * Supported locales with full cultural metadata
 */
export const SUPPORTED_LOCALES: Locale[] = [
    { code: 'en-US', name: 'English (US)', nativeName: 'English', direction: 'ltr', region: 'North America', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', nativeName: 'English', direction: 'ltr', region: 'Europe', flag: '🇬🇧' },
    { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', region: 'South Asia', flag: '🇮🇳' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文', direction: 'ltr', region: 'East Asia', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', region: 'Middle East', flag: '🇸🇦' },
    { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español', direction: 'ltr', region: 'Latin America', flag: '🇲🇽' },
    { code: 'fr-FR', name: 'French', nativeName: 'Français', direction: 'ltr', region: 'Europe', flag: '🇫🇷' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', direction: 'ltr', region: 'Latin America', flag: '🇧🇷' },
    { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', region: 'East Africa', flag: '🇰🇪' },
    { code: 'yo-NG', name: 'Yoruba', nativeName: 'Yorùbá', direction: 'ltr', region: 'West Africa', flag: '🇳🇬' },
];

/**
 * Phoneme mappings for lip-sync re-rendering.
 * Maps English phonemes to target language phonemes for mouth movement adaptation.
 */
const PHONEME_MAPS: Record<string, Record<string, string[]>> = {
    'hi-IN': {
        'AH': ['अ', 'आ'],
        'EH': ['ए', 'ऐ'],
        'IH': ['इ', 'ई'],
        'OH': ['ओ', 'औ'],
        'UH': ['उ', 'ऊ'],
        'M': ['म'],
        'N': ['न', 'ण'],
        'P': ['प', 'फ'],
        'B': ['ब', 'भ'],
    },
    'ar-SA': {
        'AH': ['ا', 'أ'],
        'EH': ['ي'],
        'IH': ['ي'],
        'OH': ['و'],
        'UH': ['و'],
        'TH': ['ث', 'ذ'],
        'KH': ['خ', 'ح'],
    },
    'zh-CN': {
        'AH': ['a', 'ā'],
        'EH': ['e', 'ē'],
        'IH': ['i', 'ī'],
        'OH': ['o', 'ō'],
        'UH': ['u', 'ū'],
        'SH': ['sh', 'x'],
        'ZH': ['zh', 'j'],
    },
};

/**
 * Initiates lip-sync re-rendering for a video asset.
 * In production: calls a lip-sync API (e.g., D-ID, HeyGen, or custom model).
 */
export async function requestLipSync(config: LipSyncConfig): Promise<LipSyncResult> {
    const phonemeMap = PHONEME_MAPS[config.targetLocale];

    if (!phonemeMap) {
        // For locales without phoneme maps, use subtitle overlay instead
        return {
            processedVideoUrl: `${config.videoUrl}?subtitles=${config.targetLocale}`,
            status: 'complete',
        };
    }

    // In production: POST to lip-sync API
    // const response = await fetch('/api/lipsync', {
    //   method: 'POST',
    //   body: JSON.stringify({ videoUrl: config.videoUrl, targetLocale: config.targetLocale, phonemeMap }),
    // });

    // Mock response for development
    return {
        processedVideoUrl: `/api/lipsync/processed?video=${encodeURIComponent(config.videoUrl)}&locale=${config.targetLocale}`,
        status: 'processing',
        estimatedDuration: 30,
    };
}

/**
 * Returns culturally appropriate asset variants for a given concept.
 * This is the "Asset Library" that changes based on locale.
 */
export function getCulturalAssets(concept: string, locale: string): {
    primaryImage: string;
    examples: string[];
    culturalNote: string;
} {
    const assetLibrary: Record<string, Record<string, { primaryImage: string; examples: string[]; culturalNote: string }>> = {
        breakfast: {
            'en-US': { primaryImage: '/assets/breakfast/pancakes.svg', examples: ['Pancakes', 'Scrambled eggs', 'Toast'], culturalNote: 'American breakfast' },
            'hi-IN': { primaryImage: '/assets/breakfast/idli.svg', examples: ['Idli', 'Dosa', 'Paratha', 'Poha'], culturalNote: 'South/North Indian breakfast' },
            'zh-CN': { primaryImage: '/assets/breakfast/congee.svg', examples: ['Congee', 'Dim sum', 'Baozi', 'Youtiao'], culturalNote: 'Chinese breakfast' },
            'ar-SA': { primaryImage: '/assets/breakfast/foul.svg', examples: ['Foul medames', 'Shakshuka', 'Flatbread'], culturalNote: 'Middle Eastern breakfast' },
            'es-MX': { primaryImage: '/assets/breakfast/tamales.svg', examples: ['Tamales', 'Chilaquiles', 'Atole'], culturalNote: 'Mexican breakfast' },
            'sw-KE': { primaryImage: '/assets/breakfast/mandazi.svg', examples: ['Mandazi', 'Uji', 'Chapati'], culturalNote: 'East African breakfast' },
        },
        family: {
            'en-US': { primaryImage: '/assets/family/nuclear.svg', examples: ['Mom', 'Dad', 'Children'], culturalNote: 'Nuclear family' },
            'hi-IN': { primaryImage: '/assets/family/joint.svg', examples: ['Parents', 'Grandparents', 'Aunts', 'Uncles'], culturalNote: 'Joint family system' },
            'zh-CN': { primaryImage: '/assets/family/extended.svg', examples: ['Parents', 'Grandparents', 'Relatives'], culturalNote: 'Extended family' },
        },
        market: {
            'en-US': { primaryImage: '/assets/market/supermarket.svg', examples: ['Supermarket', 'Grocery store'], culturalNote: 'American retail' },
            'hi-IN': { primaryImage: '/assets/market/bazaar.svg', examples: ['Bazaar', 'Sabzi mandi', 'Kirana store'], culturalNote: 'Indian market' },
            'ar-SA': { primaryImage: '/assets/market/souk.svg', examples: ['Souk', 'Traditional market'], culturalNote: 'Arabian souk' },
        },
    };

    const conceptKey = Object.keys(assetLibrary).find(k => concept.toLowerCase().includes(k));
    if (!conceptKey) {
        return {
            primaryImage: '/assets/generic/concept.svg',
            examples: [concept],
            culturalNote: `Generic representation for ${locale}`,
        };
    }

    const localeAssets = assetLibrary[conceptKey][locale] || assetLibrary[conceptKey]['en-US'];
    return localeAssets;
}

/**
 * Gets the text direction for a locale (for RTL support).
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
    const localeData = SUPPORTED_LOCALES.find(l => l.code === locale);
    return localeData?.direction || 'ltr';
}

/**
 * Formats a locale display name with flag.
 */
export function formatLocaleDisplay(locale: string): string {
    const localeData = SUPPORTED_LOCALES.find(l => l.code === locale);
    if (!localeData) return locale;
    return `${localeData.flag} ${localeData.nativeName}`;
}
