import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  BookOpen,
  Bookmark,
  Calendar,
  CheckCircle2,
  Compass,
  Crown,
  Flame,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  AchievementCategory,
  AchievementDefinition,
  EvaluatedAchievement,
  evaluateAchievements,
} from '../data/achievements';
import { UserStats } from '../services/gameState';
import { sound } from '../services/sound';
import { ThemeId, THEMES } from '../services/theme';

interface AchievementsProps {
  stats: UserStats;
  theme: ThemeId;
  onClaimAchievement: (achievementId: string, xpReward: number) => void;
  onLaunchArena?: () => void;
}

type StatusFilter = 'all' | 'unlocked' | 'locked';
type CategoryFilter = 'all' | AchievementCategory;

const CATEGORY_LABELS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All Tracks' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'streaks', label: 'Streaks & Daily' },
  { id: 'arena', label: 'Speed Arena' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'vault', label: 'Word Vault' },
];

const CATEGORY_TEXT: Record<AchievementCategory, string> = {
  vocabulary: 'Vocabulary',
  streaks: 'Streaks & Daily',
  arena: 'Speed Arena',
  campaign: 'Campaign',
  vault: 'Word Vault',
};

function renderBadgeIcon(iconKey: AchievementDefinition['iconKey'], className: string) {
  switch (iconKey) {
    case 'book':
      return <BookOpen className={className} />;
    case 'graduation':
      return <GraduationCap className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'calendar':
      return <Calendar className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'trophy':
      return <Trophy className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'bookmark':
      return <Bookmark className={className} />;
    case 'sparkles':
    default:
      return <Sparkles className={className} />;
  }
}

export const Achievements: React.FC<AchievementsProps> = ({
  stats,
  theme,
  onClaimAchievement,
  onLaunchArena,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const currentTheme = THEMES[theme] || THEMES.midnight;
  const isLight = theme === 'clean_light' || theme === 'parchment';

  const evaluated = useMemo(() => evaluateAchievements(stats), [stats]);

  const unlockedCount = evaluated.filter((a) => a.isUnlocked).length;
  const unclaimed = evaluated.filter((a) => a.isUnlocked && !a.isClaimed);
  const totalUnclaimedXp = unclaimed.reduce((sum, a) => sum + a.xpReward, 0);
  const overallPercent = Math.round((unlockedCount / evaluated.length) * 100);

  const filteredAchievements = useMemo(() => {
    return evaluated.filter((item) => {
      if (statusFilter === 'unlocked' && !item.isUnlocked) return false;
      if (statusFilter === 'locked' && item.isUnlocked) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [evaluated, statusFilter, categoryFilter]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#fbbf24', '#34d399', '#6366f1'],
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleClaim = (item: EvaluatedAchievement) => {
    if (!item.isUnlocked || item.isClaimed) return;
    sound.playVictory();
    onClaimAchievement(item.id, item.xpReward);
    triggerConfetti();
  };

  const handleClaimAll = () => {
    if (unclaimed.length === 0) return;
    sound.playVictory();
    unclaimed.forEach((item) => {
      onClaimAchievement(item.id, item.xpReward);
    });
    triggerConfetti();
  };

  const surfaceCard = isLight
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-slate-900/90 border-slate-800 shadow-lg';

  const subtleSurface = isLight
    ? 'bg-slate-100 border-slate-200'
    : 'bg-slate-950/70 border-slate-800';

  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <section className={`space-y-6 ${currentTheme.textPrimary}`}>
      {/* Header & Trophy Overview */}
      <div className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${surfaceCard}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-b-4 border-amber-700 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-heading">
                Achievements & Milestones
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 tabular-nums ${mutedText}`}>
                {unlockedCount} of {evaluated.length} badges unlocked · {overallPercent}% complete
              </p>
            </div>
          </div>

          {unclaimed.length > 0 && (
            <button
              onClick={handleClaimAll}
              className="tactile-btn px-4 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-b-4 border-amber-700 font-black text-xs sm:text-sm whitespace-nowrap shrink-0 flex items-center justify-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim {unclaimed.length} Ready (+{totalUnclaimedXp} XP)</span>
            </button>
          )}
        </div>

        {/* Overall Collection Meter */}
        <div className="space-y-2">
          <div
            className={`w-full h-2.5 rounded-full overflow-hidden ${
              isLight ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1`}>
            <div className={`p-3 rounded-xl border ${subtleSurface}`}>
              <div className="text-lg font-black font-mono tabular-nums">
                {(stats.wordsLearnedCount ?? stats.wordsMasteredCount ?? 0).toLocaleString()}
              </div>
              <div className={`text-xs mt-0.5 ${mutedText}`}>Words Learned</div>
            </div>
            <div className={`p-3 rounded-xl border ${subtleSurface}`}>
              <div className="text-lg font-black font-mono tabular-nums">
                {Math.max(stats.longestStreak ?? 0, stats.streak ?? 0)}d
              </div>
              <div className={`text-xs mt-0.5 ${mutedText}`}>Best Streak</div>
            </div>
            <div className={`p-3 rounded-xl border ${subtleSurface}`}>
              <div className="text-lg font-black font-mono tabular-nums">
                {(stats.speedArenaHighScore ?? 0).toLocaleString()}
              </div>
              <div className={`text-xs mt-0.5 ${mutedText}`}>Arena Record</div>
            </div>
            <div className={`p-3 rounded-xl border ${subtleSurface}`}>
              <div className="text-lg font-black font-mono tabular-nums">
                {unlockedCount}/{evaluated.length}
              </div>
              <div className={`text-xs mt-0.5 ${mutedText}`}>Badges Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div
          className={`inline-flex items-center gap-1 p-1 rounded-xl border self-start ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          {(
            [
              { id: 'all', label: `All (${evaluated.length})` },
              { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
              { id: 'locked', label: `In Progress (${evaluated.length - unlockedCount})` },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playTap();
                  setStatusFilter(tab.id);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition ${
                  active
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {CATEGORY_LABELS.map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playTap();
                  setCategoryFilter(cat.id);
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap shrink-0 transition ${
                  active
                    ? 'bg-amber-500 border-amber-400 text-slate-950'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges Grid */}
      {filteredAchievements.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${surfaceCard}`}>
          <Award className={`w-8 h-8 mx-auto mb-2 ${mutedText}`} />
          <p className="text-sm font-bold">No badges match this filter yet</p>
          <p className={`text-xs mt-1 ${mutedText}`}>
            Switch back to All Tracks or keep completing sessions to unlock more milestones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((badge) => {
            const remaining = Math.max(0, badge.target - badge.current);

            return (
              <article
                key={badge.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition ${
                  badge.isUnlocked
                    ? isLight
                      ? 'bg-white border-amber-300 shadow-sm'
                      : 'bg-slate-900 border-amber-500/50 shadow-lg'
                    : isLight
                    ? 'bg-white/90 border-slate-200'
                    : 'bg-slate-900/75 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-b-4 ${
                      badge.isUnlocked
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-700 text-slate-950 shadow-md'
                        : isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-400'
                        : 'bg-slate-800 border-slate-950 text-slate-500'
                    }`}
                  >
                    {renderBadgeIcon(badge.iconKey, 'w-6 h-6')}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-semibold flex items-center gap-1.5 flex-wrap ${mutedText}`}>
                      <span>{CATEGORY_TEXT[badge.category]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-500 font-bold tabular-nums">
                        +{badge.xpReward} XP
                      </span>
                    </div>

                    <h2 className="text-base font-black font-heading mt-0.5 truncate">
                      {badge.title}
                    </h2>

                    <p className={`text-xs leading-relaxed mt-1 ${mutedText}`}>
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Explicit Status / Claim Control */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                    <span className={badge.isUnlocked ? 'text-emerald-500' : mutedText}>
                      {badge.current.toLocaleString()} / {badge.target.toLocaleString()} {badge.unitLabel}
                    </span>
                    <span className={badge.isUnlocked ? 'text-emerald-500' : mutedText}>
                      {badge.progressPercent}%
                    </span>
                  </div>

                  <div
                    className={`w-full h-2 rounded-full overflow-hidden ${
                      isLight ? 'bg-slate-200' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.isUnlocked
                          ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${badge.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    {badge.isUnlocked ? (
                      badge.isClaimed ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Unlocked · Reward Claimed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaim(badge)}
                          className="tactile-btn w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-b-4 border-amber-700 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Unlocked · Claim +{badge.xpReward} XP</span>
                        </button>
                      )
                    ) : (
                      <div className="w-full flex items-center justify-between gap-2">
                        <div className={`flex items-center gap-1.5 text-xs font-semibold tabular-nums ${mutedText}`}>
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Locked · {remaining.toLocaleString()} {badge.unitLabel} to go
                          </span>
                        </div>

                        {badge.category === 'arena' && onLaunchArena && (
                          <button
                            onClick={() => {
                              sound.playTap();
                              onLaunchArena();
                            }}
                            className="text-xs font-bold text-indigo-500 hover:text-indigo-400 whitespace-nowrap shrink-0"
                          >
                            Play Blitz
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
