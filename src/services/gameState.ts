import { DifficultyLevel, normalizeDifficulty } from '../data/wordBank';

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  wordsMasteredCount: number;
  speedArenaHighScore: number;
  dailyQuestLastCompleted: string; // YYYY-MM-DD
  savedDifficulty: DifficultyLevel;
  savedSubLevelId?: string;
  vaultItems: VaultItem[];
  completedStages?: Record<string, number[]>;
  hintCoins?: number;
  adFreePass?: boolean;
  wordsLearnedCount?: number;
  longestStreak?: number;
  dailyQuestsCompletedCount?: number;
  roundsCompletedCount?: number;
  claimedAchievementIds?: string[];
}

export interface VaultItem {
  id: string;
  type: 'spelling' | 'vocab' | 'grammar';
  title: string;
  subtitle: string;
  detail: string;
  dateAdded: number;
  reviewCount: number;
  isBookmarked: boolean;
}

const STORAGE_KEY = 'lexiquest_player_profile_v2';

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function calculateLevel(xp: number): { level: number; title: string; currentLevelXp: number; nextLevelXp: number } {
  let level = 1;
  let remainingXp = xp;
  let required = 150;

  while (remainingXp >= required) {
    remainingXp -= required;
    level++;
    required = Math.round(150 * Math.pow(1.22, level - 1));
  }

  const titles = [
    'Basic English Explorer',
    'Grammar & Spell Scout',
    'SSC MTS / CHSL Aspirant',
    'Vocabulary Crusader',
    'SSC CGL / CDS Sentinel',
    'SBI / IBPS PO Contender',
    'Verbal Reasoning Strategist',
    'CAT / UPSC CSAT Scholar',
    'All India Ranker (AIR)',
    'Master Lexicographer of Bharat',
  ];
  const title = titles[Math.min(level - 1, titles.length - 1)];

  return {
    level,
    title,
    currentLevelXp: remainingXp,
    nextLevelXp: required,
  };
}

export class GameStorage {
  private static onSaveHook: ((stats: UserStats) => void) | null = null;

  public static setOnSaveHook(hook: ((stats: UserStats) => void) | null) {
    this.onSaveHook = hook;
  }

  private static defaultStats: UserStats = {
    xp: 60,
    level: 1,
    streak: 1,
    lastActiveDate: getTodayString(),
    wordsMasteredCount: 3,
    speedArenaHighScore: 0,
    dailyQuestLastCompleted: '',
    savedDifficulty: 'ssc_chsl',
    savedSubLevelId: 'ssc_chsl',
    hintCoins: 3,
    adFreePass: false,
    wordsLearnedCount: 3,
    longestStreak: 1,
    dailyQuestsCompletedCount: 0,
    roundsCompletedCount: 0,
    claimedAchievementIds: [],
    vaultItems: [
      {
        id: 'vault_demo_1',
        type: 'spelling',
        title: 'bureaucracy',
        subtitle: 'SSC CGL / UPSC Core Word',
        detail: 'Spelling rule: B-U-R-E-A-U + cracy. Notice the -eau ending from French origin.',
        dateAdded: Date.now() - 86400000,
        reviewCount: 1,
        isBookmarked: true,
      },
      {
        id: 'vault_demo_2',
        type: 'grammar',
        title: 'Scarcely ... when / No sooner ... than',
        subtitle: 'Correlative Conjunction Rule',
        detail: 'Scarcely & Hardly pair with WHEN; No Sooner pairs with THAN.',
        dateAdded: Date.now() - 43200000,
        reviewCount: 0,
        isBookmarked: false,
      },
    ],
  };

  public static load(): UserStats {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { ...this.defaultStats, lastActiveDate: getTodayString() };
      }
      const parsed = JSON.parse(data);
      parsed.savedDifficulty = normalizeDifficulty(parsed.savedDifficulty);

      const today = getTodayString();
      if (parsed.lastActiveDate !== today) {
        const last = new Date(parsed.lastActiveDate);
        const cur = new Date(today);
        const diffDays = Math.round((cur.getTime() - last.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          parsed.streak = (parsed.streak || 0) + 1;
        } else if (diffDays > 1) {
          parsed.streak = 1;
        }
        parsed.longestStreak = Math.max(parsed.longestStreak || 0, parsed.streak || 1);
        parsed.lastActiveDate = today;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      const merged: UserStats = { ...this.defaultStats, ...parsed };
      merged.longestStreak = Math.max(merged.longestStreak || 0, merged.streak || 1);
      if (parsed.wordsLearnedCount === undefined) {
        merged.wordsLearnedCount = merged.wordsMasteredCount || 3;
      }
      return merged;
    } catch {
      return this.defaultStats;
    }
  }

  public static save(stats: UserStats, skipHook: boolean = false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Storage quota or private browsing fallback
    }
    if (!skipHook && this.onSaveHook) {
      this.onSaveHook(stats);
    }
  }

  public static addXp(amount: number): UserStats {
    const stats = this.load();
    stats.xp += amount;
    const { level } = calculateLevel(stats.xp);
    stats.level = level;
    this.save(stats);
    return stats;
  }

  public static addVaultItem(item: Omit<VaultItem, 'dateAdded' | 'reviewCount' | 'isBookmarked'>) {
    const stats = this.load();
    const existingIdx = stats.vaultItems.findIndex((v) => v.id === item.id);
    if (existingIdx >= 0) {
      stats.vaultItems[existingIdx].reviewCount++;
    } else {
      stats.vaultItems.unshift({
        ...item,
        dateAdded: Date.now(),
        reviewCount: 0,
        isBookmarked: false,
      });
    }
    this.save(stats);
  }

  public static removeVaultItem(id: string) {
    const stats = this.load();
    stats.vaultItems = stats.vaultItems.filter((v) => v.id !== id);
    this.save(stats);
  }

  public static toggleBookmark(id: string) {
    const stats = this.load();
    const it = stats.vaultItems.find((v) => v.id === id);
    if (it) {
      it.isBookmarked = !it.isBookmarked;
      this.save(stats);
    }
  }

  public static recordArenaScore(score: number, xpEarned?: number): boolean {
    const stats = this.load();
    let isNewHigh = false;
    if (score > (stats.speedArenaHighScore || 0)) {
      stats.speedArenaHighScore = score;
      isNewHigh = true;
    }
    const award = xpEarned ?? Math.round(score / 4) + 60;
    stats.xp += award;
    stats.level = calculateLevel(stats.xp).level;
    this.save(stats);
    return isNewHigh;
  }

  public static markStageCompleted(tierId: string, levelNumber: number) {
    const stats = this.load();
    const currentMap = stats.completedStages || {};
    const list = currentMap[tierId] || [];
    if (!list.includes(levelNumber)) {
      currentMap[tierId] = [...list, levelNumber];
      stats.completedStages = currentMap;
      stats.wordsMasteredCount = (stats.wordsMasteredCount || 0) + 1;
      this.save(stats);
    }
  }

  public static spendHintCoin(): { success: boolean; remaining: number } {
    const stats = this.load();
    const current = stats.hintCoins ?? 3;
    if (current <= 0) {
      return { success: false, remaining: 0 };
    }
    stats.hintCoins = current - 1;
    this.save(stats);
    return { success: true, remaining: stats.hintCoins };
  }

  public static addHintCoins(amount: number): UserStats {
    const stats = this.load();
    stats.hintCoins = (stats.hintCoins ?? 3) + amount;
    this.save(stats);
    return stats;
  }

  public static setAdFreePass(enabled: boolean): UserStats {
    const stats = this.load();
    stats.adFreePass = enabled;
    this.save(stats);
    return stats;
  }

  public static recordSessionWords(wordsCount: number): UserStats {
    const stats = this.load();
    const safeWords = Math.max(0, Math.round(wordsCount));
    stats.wordsLearnedCount = (stats.wordsLearnedCount ?? stats.wordsMasteredCount ?? 0) + safeWords;
    stats.roundsCompletedCount = (stats.roundsCompletedCount ?? 0) + 1;
    stats.longestStreak = Math.max(stats.longestStreak ?? 0, stats.streak ?? 1);
    this.save(stats);
    return stats;
  }

  public static recordDailyQuestCompleted(): UserStats {
    const stats = this.load();
    const today = getTodayString();
    if (stats.dailyQuestLastCompleted !== today) {
      stats.dailyQuestsCompletedCount = (stats.dailyQuestsCompletedCount ?? 0) + 1;
    } else if (!stats.dailyQuestsCompletedCount) {
      stats.dailyQuestsCompletedCount = 1;
    }
    stats.dailyQuestLastCompleted = today;
    this.save(stats);
    return stats;
  }

  public static claimAchievement(achievementId: string, xpReward: number): { stats: UserStats; awarded: boolean } {
    const stats = this.load();
    const claimed = stats.claimedAchievementIds || [];
    if (claimed.includes(achievementId)) {
      return { stats, awarded: false };
    }
    stats.claimedAchievementIds = [...claimed, achievementId];
    stats.xp += xpReward;
    stats.level = calculateLevel(stats.xp).level;
    this.save(stats);
    return { stats, awarded: true };
  }
}
