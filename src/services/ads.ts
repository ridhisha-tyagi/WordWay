export interface AdCreative {
  id: string;
  advertiser: string;
  headline: string;
  body: string;
  cta: string;
  accentColor: string;
  badgeText: string;
}

const AD_SESSION_KEY = 'wordforge_ad_session_v1';

export const INTERSTITIAL_FREQUENCY = 2; // Show natural break every 2 completed rounds

export const HOUSE_SPONSOR_ADS: AdCreative[] = [
  {
    id: 'ad_lexicon_audio',
    advertiser: 'AudioLex Pro',
    headline: 'Listen & Retain 2,000+ Academic Roots on Commutes',
    body: 'Bite-sized 3-minute etymology audio cards crafted for GRE, CAT & competitive verbal mastery.',
    cta: 'Explore Audio Packs',
    accentColor: 'from-indigo-600 to-violet-600',
    badgeText: 'Sponsored',
  },
  {
    id: 'ad_focus_timer',
    advertiser: 'DeepRead Timer',
    headline: 'Pomodoro Study Timer Built for Exam Aspirants',
    body: 'Track daily reading comprehension streaks with zero distractions and gentle chime intervals.',
    cta: 'Try Timer Free',
    accentColor: 'from-emerald-600 to-teal-600',
    badgeText: 'Sponsored',
  },
  {
    id: 'ad_news_digest',
    advertiser: 'Editorial Brief',
    headline: 'Daily 5-Minute Editorial Summaries & Tone Notes',
    body: 'Sharpen inference speed with annotated opinion pieces and vocabulary glossaries every morning.',
    cta: 'Read Today',
    accentColor: 'from-amber-500 to-orange-600',
    badgeText: 'Sponsored',
  },
  {
    id: 'ad_flashcards',
    advertiser: 'MemoDeck',
    headline: 'Spaced-Repetition Flashcards for Legal & Idiom Mastery',
    body: 'Turn tricky one-word substitutions and phrasal verbs into permanent recall in 5 minutes a day.',
    cta: 'Start Deck',
    accentColor: 'from-sky-600 to-blue-600',
    badgeText: 'Sponsored',
  },
];

export interface AdEnvConfig {
  clientId: string;
  bannerSlot: string;
  interstitialSlot: string;
  hasLiveAdSense: boolean;
}

export function getAdConfig(): AdEnvConfig {
  const clientId = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined) || '';
  const bannerSlot = (import.meta.env.VITE_ADSENSE_BANNER_SLOT as string | undefined) || '';
  const interstitialSlot =
    (import.meta.env.VITE_ADSENSE_INTERSTITIAL_SLOT as string | undefined) || '';

  return {
    clientId: clientId.trim(),
    bannerSlot: bannerSlot.trim(),
    interstitialSlot: interstitialSlot.trim(),
    hasLiveAdSense: Boolean(clientId.trim() && bannerSlot.trim()),
  };
}

let adScriptInjected = false;

export function ensureAdSenseScript(): void {
  const { clientId } = getAdConfig();
  if (!clientId || adScriptInjected || typeof document === 'undefined') return;

  const existing = document.querySelector('script[data-wordforge-adsense="true"]');
  if (existing) {
    adScriptInjected = true;
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
    clientId
  )}`;
  script.crossOrigin = 'anonymous';
  script.dataset.wordforgeAdsense = 'true';
  document.head.appendChild(script);
  adScriptInjected = true;
}

interface AdSessionState {
  roundsSinceInterstitial: number;
  rewardedAdsWatched: number;
}

function loadSession(): AdSessionState {
  try {
    const raw = sessionStorage.getItem(AD_SESSION_KEY);
    if (!raw) return { roundsSinceInterstitial: 0, rewardedAdsWatched: 0 };
    return JSON.parse(raw);
  } catch {
    return { roundsSinceInterstitial: 0, rewardedAdsWatched: 0 };
  }
}

function saveSession(state: AdSessionState) {
  try {
    sessionStorage.setItem(AD_SESSION_KEY, JSON.stringify(state));
  } catch {
    // Ignore sessionStorage restrictions
  }
}

export const AdService = {
  recordRoundCompleted(isAdFree: boolean): boolean {
    const state = loadSession();
    state.roundsSinceInterstitial += 1;
    saveSession(state);

    if (isAdFree) return false;
    return state.roundsSinceInterstitial >= INTERSTITIAL_FREQUENCY;
  },

  markInterstitialShown(): void {
    const state = loadSession();
    state.roundsSinceInterstitial = 0;
    saveSession(state);
  },

  recordRewardedWatched(): void {
    const state = loadSession();
    state.rewardedAdsWatched += 1;
    saveSession(state);
  },

  getNextCreative(offset = 0): AdCreative {
    const idx = Math.abs(offset) % HOUSE_SPONSOR_ADS.length;
    return HOUSE_SPONSOR_ADS[idx];
  },
};
