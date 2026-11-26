import React, { useState } from 'react';
import {
  Zap,
  Timer,
  Puzzle,
  Link2,
  Layers,
  Eye,
  Play,
  Star,
  Award,
  CheckCircle2,
  Compass,
  BookMarked,
  Gamepad2,
  Flame,
  Crown,
  Trophy,
  Settings,
  ChevronDown,
  User,
  Check,
  Swords,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  SlidersHorizontal,
  Gift,
  Tv,
  Globe2,
  Cloud,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  DifficultyLevel,
  EXAM_TIERS,
  SPELLING_BANK,
  VOCAB_BANK,
  GRAMMAR_BANK,
} from '../data/wordBank';
import {
  WORD_MATCH_PUZZLES,
  BUG_ZAP_PUZZLES,
  SENTENCE_JIGSAW_PUZZLES,
  ODD_ONE_OUT_PUZZLES,
} from '../data/puzzleBank';
import { TIER_LEVELS, TierLevelStage } from '../data/tierLevels';
import { UserStats, calculateLevel } from '../services/gameState';
import { CloudSyncStatus } from '../services/cloudSync';
import { sound } from '../services/sound';
import { ThemeId, THEMES } from '../services/theme';
import { WordVault } from './WordVault';
import { Achievements } from './Achievements';
import { LevelBriefingModal } from './GameModals';
import { AdBanner, RewardedAdModal } from './AdUnits';
import { evaluateAchievements } from '../data/achievements';

export type GameModeKey =
  | 'spell'
  | 'vocab'
  | 'grammar'
  | 'arena'
  | 'daily'
  | 'vault'
  | 'word_match'
  | 'bug_zap'
  | 'jigsaw'
  | 'odd_one';

export type HubTab = 'roadmap' | 'arcade' | 'vault' | 'awards' | 'profile';
export type RoundSizeOption = 5 | 10 | 15;
export type TopicFilterOption = 'all' | 'vocab' | 'ows_idioms' | 'grammar';

interface TitleHubProps {
  stats: UserStats;
  difficulty: DifficultyLevel;
  selectedSubLevelId: string;
  activeTab: HubTab;
  onTabChange: (tab: HubTab) => void;
  roundSize: RoundSizeOption;
  onSetRoundSize: (size: RoundSizeOption) => void;
  topicFilter: TopicFilterOption;
  onSetTopicFilter: (topic: TopicFilterOption) => void;
  onOpenRealmPicker: () => void;
  onOpenSettings: () => void;
  onReturnToTitle: () => void;
  onClaimRewardedChest: () => void;
  onClaimAchievement: (achievementId: string, xpReward: number) => void;
  onOpenLeaderboard: () => void;
  onSelectMode: (mode: GameModeKey, stageContext?: { tierId: string; stage: TierLevelStage }) => void;
  theme: ThemeId;
  cloudUser?: FirebaseUser | null;
  cloudSyncStatus?: CloudSyncStatus;
  lastSyncedAt?: number | null;
  cloudSyncError?: string | null;
  onCloudSignIn?: () => void;
  onCloudSyncNow?: () => void;
  onCloudSignOut?: () => void;
}

const MODE_LABELS: Record<string, string> = {
  spell: 'Tile Scramble',
  word_match: 'Word Match',
  bug_zap: 'Bug Zap',
  jigsaw: 'Sentence Jigsaw',
  odd_one: 'Spot the Intruder',
  vocab: 'Vocab & OWS Duel',
  grammar: 'Error Spotting Lab',
  arena: 'Puzzle Blitz',
};

export const TitleHub: React.FC<TitleHubProps> = ({
  stats,
  difficulty,
  selectedSubLevelId,
  activeTab,
  onTabChange,
  roundSize,
  onSetRoundSize,
  topicFilter,
  onSetTopicFilter,
  onOpenRealmPicker,
  onOpenSettings,
  onReturnToTitle,
  onClaimRewardedChest,
  onClaimAchievement,
  onOpenLeaderboard,
  onSelectMode,
  theme,
  cloudUser,
  cloudSyncStatus = 'idle',
  lastSyncedAt,
  cloudSyncError,
  onCloudSignIn,
  onCloudSyncNow,
  onCloudSignOut,
}) => {
  const [briefingStage, setBriefingStage] = useState<TierLevelStage | null>(null);
  const [showChestAd, setShowChestAd] = useState(false);

  const currentTheme = THEMES[theme] || THEMES.midnight;
  const isLight = theme === 'clean_light' || theme === 'parchment';
  const { level, title, currentLevelXp, nextLevelXp } = calculateLevel(stats.xp);
  const progressPercent = Math.min(Math.round((currentLevelXp / nextLevelXp) * 100), 100);

  const activeTier =
    EXAM_TIERS.find(
      (t) =>
        t.id === difficulty ||
        t.subLevels?.some((s) => s.targetDifficulty === difficulty)
    ) || EXAM_TIERS[1];

  const currentSubLevel =
    activeTier.subLevels?.find((s) => s.id === selectedSubLevelId) ||
    activeTier.subLevels?.find((s) => s.targetDifficulty === difficulty) ||
    activeTier.subLevels?.[0];

  const stages =
    TIER_LEVELS[difficulty] || TIER_LEVELS[activeTier.id] || TIER_LEVELS.ssc_exams;

  const completedInTier = stats.completedStages?.[activeTier.id] || [];
  const totalStagesInTier = stages.length || 16;
  const nextStageNumber = Math.min(
    stages.find((s) => !completedInTier.includes(s.levelNumber))?.levelNumber || totalStagesInTier,
    totalStagesInTier
  );

  const totalClearedStages = Object.values(stats.completedStages || {}).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const totalPuzzleBankSize =
    WORD_MATCH_PUZZLES.length +
    BUG_ZAP_PUZZLES.length +
    SENTENCE_JIGSAW_PUZZLES.length +
    ODD_ONE_OUT_PUZZLES.length;

  const surfaceCard = isLight
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-slate-900/90 border-slate-800 shadow-lg';

  const subtleSurface = isLight
    ? 'bg-slate-100 border-slate-200'
    : 'bg-slate-950/70 border-slate-800';

  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';

  const puzzleModes: {
    key: GameModeKey;
    title: string;
    desc: string;
    icon: React.ReactNode;
    cardStyle: string;
    iconStyle: string;
    titleHover: string;
    meta?: string;
  }[] = [
    {
      key: 'spell',
      title: 'Tile Scramble',
      desc: 'Snap letter tiles into place using live voice phonetics.',
      icon: <Puzzle className="w-5 h-5" />,
      cardStyle: isLight
        ? 'bg-white border-slate-200 border-b-indigo-200 hover:border-indigo-400'
        : 'bg-slate-900/95 border-slate-800 border-b-indigo-950 hover:border-indigo-500/70',
      iconStyle: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md',
      titleHover: 'group-hover:text-indigo-500',
    },
    {
      key: 'word_match',
      title: 'Word Match',
      desc: 'Link exam words to exact definitions, roots & idioms.',
      icon: <Link2 className="w-5 h-5" />,
      cardStyle: isLight
        ? 'bg-white border-slate-200 border-b-emerald-200 hover:border-emerald-400'
        : 'bg-slate-900/95 border-slate-800 border-b-emerald-950 hover:border-emerald-500/70',
      iconStyle: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md',
      titleHover: 'group-hover:text-emerald-500',
    },
    {
      key: 'bug_zap',
      title: 'Bug Zap',
      desc: 'Hunt down hidden grammar glitches & zap them clean.',
      icon: <Zap className="w-5 h-5" />,
      cardStyle: isLight
        ? 'bg-white border-slate-200 border-b-amber-200 hover:border-amber-400'
        : 'bg-slate-900/95 border-slate-800 border-b-amber-950 hover:border-amber-500/70',
      iconStyle: 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md',
      titleHover: 'group-hover:text-amber-500',
    },
    {
      key: 'jigsaw',
      title: 'Sentence Jigsaw',
      desc: 'Snap scattered phrase blocks into flawless syntax.',
      icon: <Layers className="w-5 h-5" />,
      cardStyle: isLight
        ? 'bg-white border-slate-200 border-b-violet-200 hover:border-violet-400'
        : 'bg-slate-900/95 border-slate-800 border-b-violet-950 hover:border-violet-500/70',
      iconStyle: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-md',
      titleHover: 'group-hover:text-purple-500',
    },
    {
      key: 'odd_one',
      title: 'Spot the Intruder',
      desc: 'Eliminate the word that breaks root or tone logic.',
      icon: <Eye className="w-5 h-5" />,
      cardStyle: isLight
        ? 'bg-white border-slate-200 border-b-cyan-200 hover:border-cyan-400'
        : 'bg-slate-900/95 border-slate-800 border-b-cyan-950 hover:border-cyan-500/70',
      iconStyle: 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-md',
      titleHover: 'group-hover:text-cyan-500',
    },
    {
      key: 'vocab',
      title: 'Vocab & OWS Duel',
      desc: 'Synonyms, one-word substitutions & high-yield exam idioms.',
      icon: <BookOpen className="w-5 h-5" />,
      cardStyle: isLight
        ? 'bg-white border-slate-200 border-b-sky-200 hover:border-sky-400'
        : 'bg-slate-900/95 border-slate-800 border-b-sky-950 hover:border-sky-500/70',
      iconStyle: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md',
      titleHover: 'group-hover:text-sky-500',
      meta: topicFilter === 'ows_idioms' ? 'OWS Focus' : `${VOCAB_BANK.length} Qs`,
    },
    {
      key: 'grammar',
      title: 'Error Spotting Lab',
      desc: 'Diagnose PYQ grammar traps & master instant rule fixes.',
      icon: <ShieldCheck className="w-5 h-5" />,
      cardStyle: isLight
        ? 'bg-white border-slate-200 border-b-teal-200 hover:border-teal-400'
        : 'bg-slate-900/95 border-slate-800 border-b-teal-950 hover:border-teal-500/70',
      iconStyle: 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md',
      titleHover: 'group-hover:text-teal-500',
      meta: `${GRAMMAR_BANK.length} Rules`,
    },
    {
      key: 'arena',
      title: 'Puzzle Blitz (60s)',
      desc: '60-second adrenaline sprint with streak multipliers.',
      icon: <Timer className="w-5 h-5" />,
      cardStyle: isLight
        ? 'bg-white border-slate-200 border-b-rose-200 hover:border-rose-400'
        : 'bg-slate-900/95 border-slate-800 border-b-rose-950 hover:border-rose-500/70',
      iconStyle: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md',
      titleHover: 'group-hover:text-rose-500',
      meta:
        stats.speedArenaHighScore > 0
          ? `Best ${stats.speedArenaHighScore}`
          : undefined,
    },
  ];

  const evaluatedAchievements = evaluateAchievements(stats);
  const unlockedBadgesCount = evaluatedAchievements.filter((a) => a.isUnlocked).length;
  const unclaimedBadgesCount = evaluatedAchievements.filter(
    (a) => a.isUnlocked && !a.isClaimed
  ).length;

  const navItems: { id: HubTab; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
    { id: 'roadmap', label: 'Quest Map', mobileLabel: 'Quest', icon: <Compass className="w-4 h-4" /> },
    { id: 'arcade', label: 'Arcade', mobileLabel: 'Arcade', icon: <Gamepad2 className="w-4 h-4" /> },
    {
      id: 'vault',
      label: `Vault (${stats.vaultItems.length})`,
      mobileLabel: 'Vault',
      icon: <BookMarked className="w-4 h-4" />,
    },
    {
      id: 'awards',
      label: unclaimedBadgesCount > 0 ? `Awards (${unclaimedBadgesCount} New)` : `Awards (${unlockedBadgesCount}/${evaluatedAchievements.length})`,
      mobileLabel: 'Awards',
      icon: <Award className="w-4 h-4" />,
    },
    { id: 'profile', label: 'Profile', mobileLabel: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto flex flex-col min-h-screen px-4 sm:px-6 pb-20 md:pb-10 ${currentTheme.textPrimary} select-none`}
    >
      {/* Layer 1: Persistent Game HUD + Navigation Header */}
      <header
        className={`flex items-center justify-between gap-4 py-3.5 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}
      >
        {/* Left: Brand + Active Realm Switcher Button */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              sound.playTap();
              onReturnToTitle();
            }}
            className={`text-lg sm:text-xl font-black tracking-tight whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              theme === 'parchment' ? 'font-serif-academic' : 'font-heading'
            }`}
            title="Return to Title Screen"
          >
            <span>
              Word<span className="text-amber-500">Way</span>
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenRealmPicker();
            }}
            className={`px-2.5 py-1.5 rounded-xl border border-b-2 text-xs font-bold flex items-center gap-1.5 transition truncate max-w-[175px] sm:max-w-[230px] active:translate-y-0.5 ${
              isLight
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60'
            }`}
            title="Change Exam Realm & Difficulty"
          >
            <Swords className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="truncate">
              {activeTier.badge}
              {currentSubLevel ? ` · ${currentSubLevel.badge}` : ''}
            </span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-75" />
          </button>
        </div>

        {/* Center: Primary 4-Segment Nav (Desktop) */}
        <nav
          className="hidden md:flex items-center gap-6 text-sm font-bold"
          aria-label="Game Hub Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playTap();
                  onTabChange(item.id);
                }}
                className={`py-1.5 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  isActive
                    ? 'border-amber-500 text-amber-500'
                    : isLight
                    ? 'border-transparent text-slate-600 hover:text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: RPG HUD (Level + Streak) & Settings Gear */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playTap();
              onTabChange('profile');
            }}
            className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold tabular-nums transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
            title={`${title} · ${currentLevelXp}/${nextLevelXp} XP`}
          >
            <span className="text-indigo-500 font-black">Lv.{level}</span>
            <span className="flex items-center gap-0.5 text-amber-500">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{stats.streak}d</span>
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenLeaderboard();
            }}
            className={`p-2 rounded-xl border border-b-2 transition shrink-0 active:translate-y-0.5 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            title="Global Speed Arena Top 100"
            aria-label="Open Global Leaderboard"
          >
            <Globe2 className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenSettings();
            }}
            className={`p-2 rounded-xl border border-b-2 transition shrink-0 active:translate-y-0.5 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            title="Game Settings"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 pt-5 sm:pt-7 space-y-6">
        {/* =================================================================
         * SEGMENT 1: QUEST MAP (Saga Progression + Daily Quest)
         * ================================================================= */}
        {activeTab === 'roadmap' && (
          <section className="space-y-6">
            {/* Daily Quest Featured Event Card */}
            <div
              className={`rounded-2xl border-2 border-b-4 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isLight
                  ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-300 border-b-amber-500'
                  : 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/10 border-amber-500/40 border-b-amber-700/80'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-b-4 border-amber-700 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black font-heading">
                      Daily WordWay Quest
                    </h2>
                    <span className="text-xs font-black text-amber-500">
                      · +100 Bonus XP
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm mt-0.5 ${mutedText}`}>
                    5-round arcade mix tuned to <strong className={currentTheme.textPrimary}>{activeTier.name}</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  onSelectMode('daily');
                }}
                className="tactile-btn px-5 py-3 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-b-4 border-amber-700 font-black text-sm shadow-md whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Daily</span>
              </button>
            </div>

            {/* Active Realm Map Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                  Campaign Map · {completedInTier.length} / {totalStagesInTier} Cleared
                </div>
                <h1 className="text-2xl font-black font-heading mt-0.5">
                  {activeTier.name}
                  {currentSubLevel ? ` — ${currentSubLevel.name}` : ''}
                </h1>
                <p className={`text-xs sm:text-sm mt-0.5 ${mutedText}`}>
                  Tap any stage node to inspect the mission briefing and launch.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  onOpenRealmPicker();
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition ${
                  isLight
                    ? 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50'
                    : 'bg-slate-900 border-slate-800 text-indigo-400 hover:bg-slate-800'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Switch Realm</span>
              </button>
            </div>

            {/* Connected 16-Stage Winding Saga Path */}
            <div className="relative pl-4 sm:pl-6 space-y-3">
              <div
                className={`absolute left-[31px] sm:left-[39px] top-6 bottom-6 w-0.5 ${
                  isLight ? 'bg-indigo-200' : 'bg-indigo-500/25'
                }`}
                aria-hidden="true"
              />

              {stages.map((stage) => {
                const isBoss = stage.levelNumber === totalStagesInTier;
                const isCompleted = completedInTier.includes(stage.levelNumber);
                const isCurrent = stage.levelNumber === nextStageNumber && !isCompleted;
                const modeName = MODE_LABELS[stage.puzzleMode] || 'Puzzle';

                return (
                  <button
                    key={stage.levelNumber}
                    onClick={() => {
                      sound.playTap();
                      setBriefingStage(stage);
                    }}
                    className={`relative w-full text-left p-4 rounded-2xl border-2 border-b-4 flex items-center justify-between gap-4 transition hover:-translate-y-0.5 active:translate-y-0.5 ${
                      isCurrent
                        ? isLight
                          ? 'bg-indigo-50/90 border-indigo-500 border-b-indigo-700 shadow-md'
                          : 'bg-indigo-950/60 border-indigo-400 border-b-indigo-800 shadow-lg'
                        : isBoss
                        ? isLight
                          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 border-b-amber-600'
                          : 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-500/60 border-b-amber-800'
                        : isLight
                        ? 'bg-white border-slate-200 border-b-slate-300 hover:border-indigo-300'
                        : 'bg-slate-900/95 border-slate-800 border-b-slate-950 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`relative z-10 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black tabular-nums shrink-0 border-b-4 ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-700 text-slate-950'
                            : isBoss
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-700 text-slate-950'
                            : isCurrent
                            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 border-indigo-900 text-white ring-4 ring-indigo-500/25'
                            : 'bg-gradient-to-br from-indigo-500 to-violet-600 border-indigo-900 text-white'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : isBoss ? (
                          <Crown className="w-5 h-5" />
                        ) : (
                          String(stage.levelNumber).padStart(2, '0')
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-black truncate">
                            {stage.title}
                            {isBoss && ' · Tier Boss'}
                          </h3>
                          {isCurrent && (
                            <span className="text-[11px] font-black text-indigo-500 uppercase tracking-wider">
                              · Up Next
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${mutedText}`}>
                          {stage.difficultyTag} · {modeName} · {stage.focus}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className="hidden sm:flex items-center gap-0.5"
                        title={`Difficulty ${stage.difficultyStars}/5`}
                      >
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star
                            key={sIdx}
                            className={`w-3.5 h-3.5 ${
                              sIdx < stage.difficultyStars
                                ? 'fill-amber-400 text-amber-400'
                                : isLight
                                ? 'fill-slate-200 text-slate-200'
                                : 'fill-slate-800 text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      <span
                        className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1 ${
                          isCompleted
                            ? isLight
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-emerald-500/20 text-emerald-300'
                            : isBoss
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? 'Replay' : 'Briefing'}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* =================================================================
         * SEGMENT 2: ARCADE (8 Free-Play Modes + Custom Practice Lab)
         * ================================================================= */}
        {activeTab === 'arcade' && (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black font-heading">Arcade & Practice Lab</h1>
                <p className={`text-sm mt-0.5 ${mutedText}`}>
                  Configure round length or topic focus, then launch any of 8 puzzle & exam modes tuned to {activeTier.name}.
                </p>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenRealmPicker();
                }}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Change Realm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom Practice Lab Configurator */}
            <div className={`rounded-2xl border p-4 space-y-3.5 ${surfaceCard}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-500">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Custom Practice Setup</span>
                </div>
                <span className={`text-xs font-medium ${mutedText}`}>
                  Shuffled fresh deck every run
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Round Length Control */}
                <div className="space-y-1.5">
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>
                    Session Length
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { val: 5, label: '5 Quick' },
                        { val: 10, label: '10 Standard' },
                        { val: 15, label: '15 Marathon' },
                      ] as const
                    ).map((opt) => {
                      const active = roundSize === opt.val;
                      return (
                        <button
                          key={opt.val}
                          onClick={() => {
                            sound.playTap();
                            onSetRoundSize(opt.val);
                          }}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-extrabold transition ${
                            active
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Focus Topic Filter */}
                <div className="space-y-1.5">
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>
                    Focus Syllabus
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'all', label: 'All Topics' },
                        { id: 'vocab', label: 'Vocabulary' },
                        { id: 'ows_idioms', label: 'OWS & Idioms' },
                        { id: 'grammar', label: 'Grammar' },
                      ] as const
                    ).map((topic) => {
                      const active = topicFilter === topic.id;
                      return (
                        <button
                          key={topic.id}
                          onClick={() => {
                            sound.playTap();
                            onSetTopicFilter(topic.id);
                          }}
                          className={`py-2 px-2 rounded-xl border text-xs font-extrabold truncate transition ${
                            active
                              ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-sm'
                              : isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {topic.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {puzzleModes.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => {
                    sound.playTap();
                    onSelectMode(mode.key);
                  }}
                  className={`group p-5 rounded-2xl border-2 border-b-4 text-left transition-all duration-150 hover:-translate-y-1 active:translate-y-0.5 flex flex-col justify-between gap-4 shadow-md ${mode.cardStyle}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${mode.iconStyle}`}
                    >
                      {mode.icon}
                    </div>
                    {mode.meta ? (
                      <span className="text-xs font-mono font-black text-amber-500 tabular-nums">
                        {mode.meta}
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${mode.titleHover}`}
                      >
                        <span>Play</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h3
                      className={`text-base font-black font-heading transition-colors ${mode.titleHover}`}
                    >
                      {mode.title}
                    </h3>
                    <p className={`text-xs leading-relaxed mt-1 ${mutedText}`}>
                      {mode.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${surfaceCard}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/35 text-indigo-500 flex items-center justify-center shrink-0">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black font-heading">
                    Global Speed Arena Leaderboard · Top 100
                  </h3>
                  <p className={`text-xs mt-0.5 tabular-nums ${mutedText}`}>
                    {stats.speedArenaHighScore > 0
                      ? `Your best 60s Blitz score is ${stats.speedArenaHighScore.toLocaleString()} pts — see where you stand worldwide.`
                      : 'Play Puzzle Blitz (60s) and compare your score against players globally.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  onOpenLeaderboard();
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition"
              >
                <Trophy className="w-4 h-4" />
                <span>View Top 100</span>
              </button>
            </div>

            {!stats.adFreePass && (
              <div
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${surfaceCard}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-500 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black font-heading">
                      Rewarded Supply Chest · Balance: {stats.hintCoins ?? 3} Hints
                    </h3>
                    <p className={`text-xs mt-0.5 ${mutedText}`}>
                      Watch a short 5s sponsor spot to collect +3 Hint Coins & +50 Bonus XP.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playTap();
                    setShowChestAd(true);
                  }}
                  className="tactile-btn px-4 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-b-4 border-amber-700 font-black text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Tv className="w-4 h-4" />
                  <span>Watch Short Ad</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* =================================================================
         * SEGMENT 3: VAULT (Personal Collection & Flashcards)
         * ================================================================= */}
        {activeTab === 'vault' && (
          <WordVault
            embedded
            theme={theme}
            onBack={() => onTabChange('roadmap')}
          />
        )}

        {/* =================================================================
         * SEGMENT 4: AWARDS (Unlockable Milestone Achievements)
         * ================================================================= */}
        {activeTab === 'awards' && (
          <Achievements
            stats={stats}
            theme={theme}
            onClaimAchievement={onClaimAchievement}
            onLaunchArena={() => onSelectMode('arena')}
          />
        )}

        {/* =================================================================
         * SEGMENT 5: PROFILE (Player Stats, Rank & Exam Syllabus)
         * ================================================================= */}
        {activeTab === 'profile' && (
          <section className="space-y-6">
            {/* Player Rank Card */}
            <div className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${surfaceCard}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 border-b-4 border-indigo-900 text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
                    {level}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                      Current Rank
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black font-heading">{title}</h1>
                    <p className={`text-xs tabular-nums mt-0.5 ${mutedText}`}>
                      {stats.xp} Total XP · {currentLevelXp}/{nextLevelXp} XP to Level {level + 1}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-500 font-black text-sm tabular-nums self-start sm:self-auto">
                  <Flame className="w-5 h-5 fill-amber-500" />
                  <span>{stats.streak} Day Streak</span>
                </div>
              </div>

              {/* XP Bar */}
              <div
                className={`w-full h-3 rounded-full overflow-hidden ${
                  isLight ? 'bg-slate-200' : 'bg-slate-800'
                }`}
              >
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* 4 Stat Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${subtleSurface}`}>
                  <div className="text-xl font-black font-mono tabular-nums">
                    {totalClearedStages}
                  </div>
                  <div className={`text-xs mt-0.5 ${mutedText}`}>Stages Cleared</div>
                </div>
                <div className={`p-3.5 rounded-xl border ${subtleSurface}`}>
                  <div className="text-xl font-black font-mono tabular-nums">
                    {(stats.wordsLearnedCount ?? stats.wordsMasteredCount).toLocaleString()}
                  </div>
                  <div className={`text-xs mt-0.5 ${mutedText}`}>Words Learned</div>
                </div>
                <div className={`p-3.5 rounded-xl border ${subtleSurface}`}>
                  <div className="text-xl font-black font-mono tabular-nums">
                    {stats.speedArenaHighScore}
                  </div>
                  <div className={`text-xs mt-0.5 ${mutedText}`}>Best 60s Blitz</div>
                </div>
                <div className={`p-3.5 rounded-xl border ${subtleSurface}`}>
                  <div className="text-xl font-black font-mono tabular-nums">
                    {unlockedBadgesCount}/{evaluatedAchievements.length}
                  </div>
                  <div className={`text-xs mt-0.5 ${mutedText}`}>Badges Earned</div>
                </div>
              </div>
            </div>

            {/* Cross-Device Cloud Save Card */}
            {(onCloudSignIn || onCloudSyncNow) && (
              <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${surfaceCard}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                        cloudUser
                          ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-500'
                          : 'bg-slate-500/15 border-slate-500/30 text-slate-400'
                      }`}
                    >
                      {cloudUser ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-black font-heading">
                          Cross-Device Cloud Save
                        </h2>
                        <span
                          className={`text-[11px] font-black uppercase tracking-wider ${
                            cloudUser
                              ? cloudSyncStatus === 'error'
                                ? 'text-rose-500'
                                : 'text-emerald-500'
                              : mutedText
                          }`}
                        >
                          ·{' '}
                          {cloudUser
                            ? cloudSyncStatus === 'syncing'
                              ? 'Syncing...'
                              : cloudSyncStatus === 'error'
                              ? 'Sync Retry Needed'
                              : 'Synced to Cloud'
                            : 'Local Device Only'}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${mutedText}`}>
                        {cloudUser
                          ? `Signed in as ${
                              cloudUser.displayName || cloudUser.email || 'Google Account'
                            }${
                              lastSyncedAt
                                ? ` · Last synced ${new Date(lastSyncedAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}`
                                : ''
                            }.`
                          : 'Quest Map stages, XP, streaks, Word Vault flashcards & Achievements sync across devices.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!cloudUser && onCloudSignIn && (
                      <button
                        onClick={() => {
                          sound.playTap();
                          onCloudSignIn();
                        }}
                        disabled={cloudSyncStatus === 'syncing'}
                        className="tactile-btn px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white border-b-4 border-indigo-900 font-black text-xs flex items-center gap-1.5 transition"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{cloudSyncStatus === 'syncing' ? 'Connecting...' : 'Sign in with Google'}</span>
                      </button>
                    )}

                    {cloudUser && onCloudSyncNow && (
                      <button
                        onClick={() => {
                          sound.playTap();
                          onCloudSyncNow();
                        }}
                        disabled={cloudSyncStatus === 'syncing'}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            cloudSyncStatus === 'syncing' ? 'animate-spin text-indigo-500' : ''
                          }`}
                        />
                        <span>{cloudSyncStatus === 'syncing' ? 'Syncing' : 'Sync Now'}</span>
                      </button>
                    )}

                    {cloudUser && onCloudSignOut && (
                      <button
                        onClick={() => {
                          sound.playTap();
                          onCloudSignOut();
                        }}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                          isLight
                            ? 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50'
                            : 'bg-slate-900 border-slate-700 text-rose-400 hover:bg-rose-950/40'
                        }`}
                        title="Sign out of cloud backup (keeps local device progress)"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>

                {cloudSyncError && (
                  <div className="text-xs font-medium text-rose-500 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3 py-2">
                    {cloudSyncError}
                  </div>
                )}
              </div>
            )}

            {/* Achievements & Leaderboard Teaser Strips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-4 ${surfaceCard}`}>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-500 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black font-heading">
                      Badges · {unlockedBadgesCount}/{evaluatedAchievements.length} Unlocked
                    </h2>
                    <p className={`text-xs mt-0.5 ${mutedText}`}>
                      {unclaimedBadgesCount > 0
                        ? `${unclaimedBadgesCount} unlocked reward${unclaimedBadgesCount > 1 ? 's' : ''} ready to claim.`
                        : 'Track streaks & 1,000-word milestones.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playTap();
                    onTabChange('awards');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition"
                >
                  <span>View Achievements</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-4 ${surfaceCard}`}>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/35 text-indigo-500 flex items-center justify-center shrink-0">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black font-heading">
                      Global Top 100 Rankings
                    </h2>
                    <p className={`text-xs mt-0.5 tabular-nums ${mutedText}`}>
                      Best Speed Arena: {stats.speedArenaHighScore.toLocaleString()} pts
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenLeaderboard();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition"
                >
                  <span>Compare Global Rank</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Curriculum & Exam Alignment Section */}
            <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${surfaceCard}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 font-black text-base font-heading">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Exam Syllabus & Curriculum Validity</span>
                </div>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Offline Ready</span>
                </span>
              </div>

              <div className={`space-y-2.5 text-xs sm:text-sm leading-relaxed ${mutedText}`}>
                <p>
                  <strong className={currentTheme.textPrimary}>Word Smithy (Foundations):</strong> Core spelling phonetics, syllable breaking, and Wren & Martin grammar fundamentals.
                </p>
                <p>
                  <strong className={currentTheme.textPrimary}>Campus & Career (Campus League):</strong> Campus recruitment drives (TCS NQT, Infosys, Wipro, Accenture), CUET UG/PG verbal ability, and SAT/ACT syntax cohesion.
                </p>
                <p>
                  <strong className={currentTheme.textPrimary}>The Bureau (Officers Guild — SSC):</strong> Unified SSC MTS, CHSL, CPO & CGL Tier-1/Tier-2 English aligned with TCS shifts (2018–2024 PYQs), SP Bakshi & Neetu Singh Vol. 1.
                </p>
                <p>
                  <strong className={currentTheme.textPrimary}>Editorial Guild (High Finance):</strong> SBI/IBPS PO, RBI Grade B & CLAT vocabulary drawn from <em>The Hindu</em>, <em>The Indian Express</em> & <em>Word Power Made Easy</em>.
                </p>
                <p>
                  <strong className={currentTheme.textPrimary}>Logic Lab (GATE Aptitude):</strong> Official IIT GATE General Aptitude verbal questions covering conjunction redundancy, prepositions & deductions.
                </p>
                <p>
                  <strong className={currentTheme.textPrimary}>Vanguard Corps (Defence & CDS):</strong> Officer-cadre English for UPSC CDS, AFCAT, NDA & CAPF AC — S1–S6 sequencing, command idioms & active/passive voice.
                </p>
                <p>
                  <strong className={currentTheme.textPrimary}>Chancery & Global (IELTS & Law):</strong> CLAT/AILET Latin legal maxims, IELTS Academic Band 8+ lexical collocations, hedging precision & rhetorical logic.
                </p>
                <p>
                  <strong className={currentTheme.textPrimary}>The Apex (Grandmaster):</strong> ETS GRE 333 High-Frequency words, GMAC GMAT Sentence Correction, CAT VARC & UPSC CSAT.
                </p>
              </div>

              <div className={`pt-3 border-t text-xs font-semibold tabular-nums flex flex-wrap gap-4 ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-300'}`}>
                <span>{SPELLING_BANK.length}+ Spellings</span>
                <span>·</span>
                <span>{VOCAB_BANK.length}+ Vocab & Idioms</span>
                <span>·</span>
                <span>{GRAMMAR_BANK.length}+ Grammar Rules</span>
                <span>·</span>
                <span>{totalPuzzleBankSize}+ Interactive Puzzles</span>
              </div>
            </div>
          </section>
        )}

        {/* Subtle Non-Intrusive Bottom Ad Banner (Respects Ad-Free Pass) */}
        <div className="pt-2">
          <AdBanner
            adFree={Boolean(stats.adFreePass)}
            theme={theme}
            placementKey={activeTab}
            onOpenAdFreeSettings={onOpenSettings}
          />
        </div>
      </div>

      {/* Rewarded Supply Chest Ad Overlay */}
      {showChestAd && (
        <RewardedAdModal
          rewardLabel="+3 Hint Coins & +50 XP"
          onCancel={() => setShowChestAd(false)}
          onClaimReward={() => {
            setShowChestAd(false);
            onClaimRewardedChest();
          }}
        />
      )}

      {/* Layer 2: Pre-Game Level Briefing Overlay */}
      {briefingStage && (
        <LevelBriefingModal
          stage={briefingStage}
          tierName={activeTier.name}
          isCompleted={completedInTier.includes(briefingStage.levelNumber)}
          theme={theme}
          onClose={() => setBriefingStage(null)}
          onStartStage={() => {
            const targetStage = briefingStage;
            setBriefingStage(null);
            onSelectMode(targetStage.puzzleMode, {
              tierId: activeTier.id,
              stage: targetStage,
            });
          }}
        />
      )}

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t px-1.5 py-1.5 grid grid-cols-5 gap-1 backdrop-blur-md ${
          isLight
            ? 'bg-white/95 border-slate-200'
            : 'bg-slate-950/95 border-slate-800'
        }`}
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playTap();
                onTabChange(item.id);
              }}
              className={`py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition ${
                isActive
                  ? 'text-amber-500'
                  : isLight
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span className="truncate max-w-full">{item.mobileLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
