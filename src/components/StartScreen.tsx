import React from 'react';
import {
  Play,
  Settings,
  Volume2,
  VolumeX,
  Flame,
  Swords,
  ChevronRight,
  Zap,
  Globe2,
  X,
} from 'lucide-react';
import { DifficultyLevel, EXAM_TIERS } from '../data/wordBank';
import { UserStats, calculateLevel } from '../services/gameState';
import { FriendChallenge } from '../services/challenge';
import { ThemeId, THEMES } from '../services/theme';
import { sound } from '../services/sound';
import { PWAInstallButton } from './PWAInstallButton';

interface StartScreenProps {
  stats: UserStats;
  difficulty: DifficultyLevel;
  selectedSubLevelId: string;
  theme: ThemeId;
  isMuted: boolean;
  pendingChallenge?: FriendChallenge | null;
  onAcceptChallenge?: () => void;
  onDismissChallenge?: () => void;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenRealmPicker: () => void;
  onStartHub: (initialTab?: 'roadmap' | 'arcade') => void;
  onQuickPlayDaily: () => void;
  onOpenLeaderboard: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  stats,
  difficulty,
  selectedSubLevelId,
  theme,
  isMuted,
  pendingChallenge,
  onAcceptChallenge,
  onDismissChallenge,
  onToggleMute,
  onOpenSettings,
  onOpenRealmPicker,
  onStartHub,
  onQuickPlayDaily,
  onOpenLeaderboard,
}) => {
  const currentTheme = THEMES[theme] || THEMES.midnight;
  const isLight = theme === 'clean_light' || theme === 'parchment';
  const { level, title } = calculateLevel(stats.xp);

  const activeTier =
    EXAM_TIERS.find(
      (t) =>
        t.id === difficulty ||
        t.subLevels?.some((s) => s.targetDifficulty === difficulty)
    ) || EXAM_TIERS[1];

  const activeSub =
    activeTier.subLevels?.find((s) => s.id === selectedSubLevelId) ||
    activeTier.subLevels?.find((s) => s.targetDifficulty === difficulty) ||
    activeTier.subLevels?.[0];

  const wordTiles = ['W', 'O', 'R', 'D'];
  const wayTiles = ['W', 'A', 'Y'];

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto min-h-screen flex flex-col justify-between p-4 sm:p-6 ${currentTheme.textPrimary} select-none`}
    >
      {/* Top Bar: Minimalist Game Corner Controls */}
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold tabular-nums ${
            isLight
              ? 'bg-white border-slate-200 text-slate-700 shadow-xs'
              : 'bg-slate-900/90 border-slate-800 text-slate-200'
          }`}
        >
          <span className="text-indigo-500 font-black">Lv.{level}</span>
          <span aria-hidden="true">·</span>
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{stats.streak}d</span>
          <span aria-hidden="true">·</span>
          <span>{stats.xp} XP</span>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton compact />

          <button
            onClick={() => {
              sound.playTap();
              onOpenLeaderboard();
            }}
            className={`px-3 py-2 rounded-xl border border-b-2 text-xs font-bold flex items-center gap-1.5 transition active:translate-y-0.5 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            aria-label="Global Leaderboard"
            title="Global Speed Arena Top 100"
          >
            <Globe2 className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Top 100</span>
          </button>

          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-xl border border-b-2 transition active:translate-y-0.5 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenSettings();
            }}
            className={`p-2.5 rounded-xl border border-b-2 transition active:translate-y-0.5 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            aria-label="Open Game Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Stage: Game Title Showcase + Primary Play CTA */}
      <div className="my-auto py-8 flex flex-col items-center text-center max-w-lg mx-auto w-full space-y-6">
        {/* Floating Game Crest + 3D Tactile Letter Tiles */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {wordTiles.map((ch, idx) => (
              <div
                key={`w_${idx}`}
                className={`w-10 h-11 sm:w-12 sm:h-14 rounded-xl font-heading font-black text-xl sm:text-2xl flex items-center justify-center border-2 border-b-[5px] shadow-md transition-transform hover:-translate-y-1 ${
                  isLight
                    ? 'bg-white text-indigo-700 border-indigo-200 border-b-indigo-400'
                    : 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white border-indigo-400 border-b-indigo-900'
                }`}
              >
                {ch}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {wayTiles.map((ch, idx) => (
              <div
                key={`way_${idx}`}
                className="w-10 h-11 sm:w-12 sm:h-14 rounded-xl font-heading font-black text-xl sm:text-2xl flex items-center justify-center bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-2 border-amber-300 border-b-[5px] border-b-amber-700 shadow-lg transition-transform hover:-translate-y-1"
              >
                {ch}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-base sm:text-lg font-extrabold tracking-tight">
            Wordplay that sharpens your edge.
          </p>
          <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Foundations · Campus Placements · SSC · Banking · GATE · CDS · IELTS · GRE
          </p>
        </div>

        {/* Active Realm Card (1-Tap Realm Switcher before pressing Play) */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenRealmPicker();
          }}
          className={`w-full p-4 rounded-2xl border-2 border-b-4 text-left flex items-center justify-between gap-3 transition hover:border-indigo-500 active:translate-y-0.5 ${
            isLight
              ? 'bg-white border-slate-200 border-b-slate-300 shadow-sm'
              : 'bg-slate-900/90 border-slate-800 border-b-slate-950 shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Current Realm
              </div>
              <div className="text-sm font-black truncate">
                {activeTier.name}
                {activeSub ? ` · ${activeSub.name}` : ''}
              </div>
            </div>
          </div>

          <span className="text-xs font-bold text-indigo-500 flex items-center gap-1 shrink-0">
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </span>
        </button>

        {/* Incoming Friend Challenge Card (from ?challenge=... link) */}
        {pendingChallenge && onAcceptChallenge && (
          <div
            className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 ${
              isLight
                ? 'bg-amber-50 border-amber-400 text-slate-900'
                : 'bg-indigo-950/75 border-amber-400/70 text-slate-100'
            }`}
          >
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" />
                <span>Friend Duel Challenge · {pendingChallenge.realmBadge}</span>
              </div>
              <div className="text-sm font-black truncate mt-0.5">
                {pendingChallenge.challengerName} scored{' '}
                <span className="text-amber-500">
                  {pendingChallenge.targetScore.toLocaleString()} pts
                </span>
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Exact same 60s seeded deck — beat their score!
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  sound.playTap();
                  onAcceptChallenge();
                }}
                className="tactile-btn px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border-b-4 border-amber-700 font-black text-xs whitespace-nowrap"
              >
                Accept Duel
              </button>
              {onDismissChallenge && (
                <button
                  onClick={onDismissChallenge}
                  className={`p-1.5 rounded-lg transition ${
                    isLight ? 'text-slate-500 hover:bg-amber-100' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                  aria-label="Dismiss challenge"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Primary Play CTA + Quick Daily Action */}
        <div className="w-full space-y-3 pt-1">
          <button
            onClick={() => {
              sound.playTap();
              onStartHub('roadmap');
            }}
            className="tactile-btn w-full py-4 px-6 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-2 border-amber-300 border-b-[6px] border-b-amber-700 font-black text-lg tracking-wide shadow-xl flex items-center justify-center gap-2.5"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY QUEST</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                sound.playTap();
                onStartHub('arcade');
              }}
              className={`tactile-btn py-3 px-4 rounded-xl border-2 border-b-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                isLight
                  ? 'bg-white border-slate-200 border-b-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 border-b-slate-950 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>Arcade Modes</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onQuickPlayDaily();
              }}
              className={`tactile-btn py-3 px-4 rounded-xl border-2 border-b-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                isLight
                  ? 'bg-indigo-50 border-indigo-200 border-b-indigo-300 text-indigo-700 hover:bg-indigo-100'
                  : 'bg-indigo-950/60 border-indigo-500/40 border-b-indigo-900 text-indigo-300 hover:bg-indigo-900/60'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Daily Blitz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Footer Line */}
      <div className={`text-center text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
        Rank: {title} · 8 Exam Realms · 128 Progressive Levels · 100% Free
      </div>
    </div>
  );
};
