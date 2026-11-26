import { UserStats } from '../services/gameState';

export type AchievementCategory =
  | 'vocabulary'
  | 'streaks'
  | 'arena'
  | 'campaign'
  | 'vault';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  target: number;
  unitLabel: string;
  xpReward: number;
  iconKey:
    | 'book'
    | 'graduation'
    | 'crown'
    | 'flame'
    | 'calendar'
    | 'zap'
    | 'trophy'
    | 'compass'
    | 'shield'
    | 'bookmark'
    | 'sparkles';
  getProgress: (stats: UserStats) => number;
}

export interface EvaluatedAchievement extends AchievementDefinition {
  current: number;
  progressPercent: number;
  isUnlocked: boolean;
  isClaimed: boolean;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_spark',
    title: 'First Words Forged',
    description: 'Complete your first practice session and solve at least 5 words or clues.',
    category: 'vocabulary',
    target: 5,
    unitLabel: 'words',
    xpReward: 50,
    iconKey: 'sparkles',
    getProgress: (s) => s.wordsLearnedCount ?? s.wordsMasteredCount ?? 0,
  },
  {
    id: 'word_apprentice',
    title: 'Lexicon Apprentice',
    description: 'Learn and practice 100 words, idioms, or grammar traps across any mode.',
    category: 'vocabulary',
    target: 100,
    unitLabel: 'words',
    xpReward: 120,
    iconKey: 'book',
    getProgress: (s) => s.wordsLearnedCount ?? s.wordsMasteredCount ?? 0,
  },
  {
    id: 'word_1000',
    title: '1,000 Words Learned',
    description: 'Reach mastery over 1,000 words, spellings, and grammar rules.',
    category: 'vocabulary',
    target: 1000,
    unitLabel: 'words',
    xpReward: 500,
    iconKey: 'graduation',
    getProgress: (s) => s.wordsLearnedCount ?? s.wordsMasteredCount ?? 0,
  },
  {
    id: 'streak_3',
    title: '3-Day Spark',
    description: 'Train your English skills on 3 consecutive calendar days.',
    category: 'streaks',
    target: 3,
    unitLabel: 'days',
    xpReward: 75,
    iconKey: 'flame',
    getProgress: (s) => Math.max(s.longestStreak ?? 0, s.streak ?? 0),
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Maintain an unbroken 7-day learning streak without missing a day.',
    category: 'streaks',
    target: 7,
    unitLabel: 'days',
    xpReward: 175,
    iconKey: 'flame',
    getProgress: (s) => Math.max(s.longestStreak ?? 0, s.streak ?? 0),
  },
  {
    id: 'streak_30',
    title: '30-Day Iron Habit',
    description: 'Sustain a 30-day streak to lock in exam-ready recall.',
    category: 'streaks',
    target: 30,
    unitLabel: 'days',
    xpReward: 400,
    iconKey: 'calendar',
    getProgress: (s) => Math.max(s.longestStreak ?? 0, s.streak ?? 0),
  },
  {
    id: 'arena_contender',
    title: 'Blitz Contender',
    description: 'Score 750 or higher in a single 60-second Speed Arena run.',
    category: 'arena',
    target: 750,
    unitLabel: 'pts',
    xpReward: 100,
    iconKey: 'zap',
    getProgress: (s) => s.speedArenaHighScore ?? 0,
  },
  {
    id: 'arena_expert',
    title: 'Speed Arena Expert',
    description: 'Chain rapid combos to hit 2,000+ points in the 60s Speed Arena.',
    category: 'arena',
    target: 2000,
    unitLabel: 'pts',
    xpReward: 250,
    iconKey: 'trophy',
    getProgress: (s) => s.speedArenaHighScore ?? 0,
  },
  {
    id: 'campaign_explorer',
    title: 'Quest Pathfinder',
    description: 'Clear 10 stages across any of the 8 Exam Realms on the Quest Map.',
    category: 'campaign',
    target: 10,
    unitLabel: 'stages',
    xpReward: 150,
    iconKey: 'compass',
    getProgress: (s) =>
      Object.values(s.completedStages || {}).reduce((sum, arr) => sum + arr.length, 0),
  },
  {
    id: 'realm_boss_slayer',
    title: 'Tier Boss Conqueror',
    description: 'Defeat Stage 16 (Tier Boss) in any Exam Realm campaign.',
    category: 'campaign',
    target: 1,
    unitLabel: 'boss',
    xpReward: 300,
    iconKey: 'crown',
    getProgress: (s) =>
      Object.values(s.completedStages || {}).filter((arr) => arr.includes(16)).length,
  },
  {
    id: 'vault_curator',
    title: 'Vault Archivist',
    description: 'Save 15 tricky words or grammar blueprints inside your Word Vault.',
    category: 'vault',
    target: 15,
    unitLabel: 'cards',
    xpReward: 100,
    iconKey: 'bookmark',
    getProgress: (s) => s.vaultItems?.length ?? 0,
  },
  {
    id: 'daily_devotee',
    title: 'Daily Way Regular',
    description: 'Complete 5 Daily WordWay Quests to sharpen multi-skill accuracy.',
    category: 'streaks',
    target: 5,
    unitLabel: 'quests',
    xpReward: 200,
    iconKey: 'shield',
    getProgress: (s) => s.dailyQuestsCompletedCount ?? (s.dailyQuestLastCompleted ? 1 : 0),
  },
];

export function evaluateAchievements(stats: UserStats): EvaluatedAchievement[] {
  const claimedSet = new Set(stats.claimedAchievementIds || []);
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const raw = Math.max(0, def.getProgress(stats));
    const current = Math.min(raw, def.target);
    const progressPercent = Math.min(Math.round((current / def.target) * 100), 100);
    const isUnlocked = raw >= def.target;
    const isClaimed = claimedSet.has(def.id);
    return {
      ...def,
      current,
      progressPercent,
      isUnlocked,
      isClaimed,
    };
  });
}
