/**
 * Theme Manager for LexiQuest
 * Supports 3 distinctive aesthetic themes tailored for serious aspirants & language learners:
 * 1. 'midnight' - Deep obsidian with electric indigo & amber accents (Night Focus)
 * 2. 'parchment' - Warm cream/sepia, rich espresso typography & forest emerald (Classic Academic)
 * 3. 'clean_light' - Crisp minimalist daylight white with royal cobalt & coral (Modern Edtech)
 */

export type ThemeId = 'midnight' | 'parchment' | 'clean_light';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  icon: string;
  bgClass: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentIndigo: string;
  accentAmber: string;
  tileBg: string;
  tileBorder: string;
  tileText: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Focus',
    icon: '🌙',
    bgClass: 'bg-[#060b13]',
    cardBg: 'bg-[#0f172a]/90',
    cardBorder: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-500',
    accentIndigo: 'from-indigo-600 to-violet-600',
    accentAmber: 'text-amber-400',
    tileBg: 'bg-slate-800 hover:bg-slate-700',
    tileBorder: 'border-b-4 border-slate-950',
    tileText: 'text-white',
  },
  parchment: {
    id: 'parchment',
    name: 'Scholar Parchment',
    icon: '📜',
    bgClass: 'bg-[#f6f2e9]',
    cardBg: 'bg-[#ffffff]/95',
    cardBorder: 'border-[#e4dcce]',
    textPrimary: 'text-[#1e1b18]',
    textSecondary: 'text-[#443e38]',
    textMuted: 'text-[#7e766c]',
    accentIndigo: 'from-[#1e3a8a] to-[#2563eb]',
    accentAmber: 'text-[#b45309]',
    tileBg: 'bg-[#f3ece0] hover:bg-[#eae1d0]',
    tileBorder: 'border-b-4 border-[#d1c4b2]',
    tileText: 'text-[#1e1b18]',
  },
  clean_light: {
    id: 'clean_light',
    name: 'Daylight Minimal',
    icon: '☀️',
    bgClass: 'bg-[#f8fafc]',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200 shadow-sm',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    accentIndigo: 'from-blue-600 to-indigo-600',
    accentAmber: 'text-amber-600',
    tileBg: 'bg-slate-100 hover:bg-slate-200',
    tileBorder: 'border-b-4 border-slate-300',
    tileText: 'text-slate-900',
  },
};

const THEME_STORAGE_KEY = 'lexiquest_theme_pref';

export function getSavedTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved && THEMES[saved]) return saved;
  } catch {
    // fallback
  }
  return 'midnight';
}

export function saveTheme(theme: ThemeId) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // fallback
  }
}
