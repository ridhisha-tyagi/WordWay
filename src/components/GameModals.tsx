import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Star,
  Crown,
  Check,
  Palette,
  Home,
  Swords,
  ShieldCheck,
  Cloud,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { DifficultyLevel, EXAM_TIERS } from '../data/wordBank';
import { TierLevelStage } from '../data/tierLevels';
import { ThemeId, THEMES } from '../services/theme';
import { CloudSyncStatus } from '../services/cloudSync';
import { sound } from '../services/sound';
import { PWAInstallButton } from './PWAInstallButton';

const MODE_LABELS: Record<string, string> = {
  spell: 'Tile Scramble',
  word_match: 'Word Match',
  bug_zap: 'Bug Zap',
  jigsaw: 'Sentence Jigsaw',
  odd_one: 'Spot the Intruder',
  vocab: 'Vocab & OWS Duel',
  grammar: 'Error Spotting Lab',
  arena: 'Puzzle Blitz (60s)',
};

/* ============================================================================
 * 1. Realm & Difficulty Picker Modal
 * ============================================================================ */
interface RealmModalProps {
  difficulty: DifficultyLevel;
  selectedSubLevelId: string;
  onSelectRealmAndSubLevel: (difficulty: DifficultyLevel, subLevelId: string) => void;
  onClose: () => void;
  theme: ThemeId;
}

export const RealmModal: React.FC<RealmModalProps> = ({
  difficulty,
  selectedSubLevelId,
  onSelectRealmAndSubLevel,
  onClose,
  theme,
}) => {
  const isLight = theme === 'clean_light' || theme === 'parchment';
  const activeTier =
    EXAM_TIERS.find(
      (t) =>
        t.id === difficulty ||
        t.subLevels?.some((s) => s.targetDifficulty === difficulty)
    ) || EXAM_TIERS[1];

  const [previewTierId, setPreviewTierId] = React.useState<DifficultyLevel>(activeTier.id);
  const previewTier = EXAM_TIERS.find((t) => t.id === previewTierId) || activeTier;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-700/80 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-heading">Select Realm & Difficulty</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Pick your target exam track and skill stage
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className={`p-2 rounded-xl transition ${
              isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Step A: 8 Realms */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2.5">
              1. Choose Preparation Realm (8 Realms)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {EXAM_TIERS.map((tier) => {
                const isSelected = previewTier.id === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => {
                      sound.playTap();
                      setPreviewTierId(tier.id);
                    }}
                    className={`tactile-btn p-3 rounded-2xl border border-b-4 text-left transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 border-b-indigo-900 text-white shadow-md'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 border-b-slate-300 text-slate-800 hover:bg-slate-100'
                        : 'bg-slate-800/80 border-slate-700 border-b-slate-950 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-black truncate">{tier.badge}</div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected
                          ? 'text-indigo-100'
                          : isLight
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {tier.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step B: Sub-levels inside selected Realm */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                2. Select Stage Focus ({previewTier.name})
              </span>
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {previewTier.examTargets}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {previewTier.subLevels.map((sub) => {
                const isCurrent =
                  selectedSubLevelId === sub.id && previewTier.id === activeTier.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      sound.playTap();
                      onSelectRealmAndSubLevel(sub.targetDifficulty, sub.id);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start justify-between gap-2 ${
                      isCurrent
                        ? isLight
                          ? 'bg-amber-50 border-amber-500 text-slate-900'
                          : 'bg-amber-500/15 border-amber-500 text-white'
                        : isLight
                        ? 'bg-white border-slate-200 hover:border-indigo-400'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-indigo-500/70'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-black">
                        {sub.name} · <span className="text-amber-500">{sub.badge}</span>
                      </div>
                      <div
                        className={`text-xs font-semibold mt-0.5 ${
                          isLight ? 'text-indigo-600' : 'text-indigo-300'
                        }`}
                      >
                        {sub.examFocus}
                      </div>
                      <p
                        className={`text-[11px] leading-snug mt-1 ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {sub.desc}
                      </p>
                    </div>

                    {isCurrent && (
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. System Settings Modal (Theme, Audio, PWA Install, Return to Start Screen)
 * ============================================================================ */
interface SettingsModalProps {
  theme: ThemeId;
  onSetTheme: (t: ThemeId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  adFreePass: boolean;
  onToggleAdFree: () => void;
  cloudUser?: User | null;
  cloudSyncStatus?: CloudSyncStatus;
  lastSyncedAt?: number | null;
  cloudSyncError?: string | null;
  onCloudSignIn?: () => void;
  onCloudSyncNow?: () => void;
  onCloudSignOut?: () => void;
  onReturnToTitle?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  theme,
  onSetTheme,
  isMuted,
  onToggleMute,
  adFreePass,
  onToggleAdFree,
  cloudUser,
  cloudSyncStatus = 'idle',
  lastSyncedAt,
  cloudSyncError,
  onCloudSignIn,
  onCloudSyncNow,
  onCloudSignOut,
  onReturnToTitle,
  onClose,
}) => {
  const isLight = theme === 'clean_light' || theme === 'parchment';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div
        className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl space-y-4 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-700/80 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black font-heading">Game Settings</h2>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className={`p-2 rounded-xl transition ${
              isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Visual Theme</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['midnight', 'parchment', 'clean_light'] as ThemeId[]).map((t) => {
              const active = theme === t;
              return (
                <button
                  key={t}
                  onClick={() => {
                    sound.playTap();
                    onSetTheme(t);
                  }}
                  className={`p-2.5 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1 transition ${
                    active
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-500'
                      : isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300'
                  }`}
                >
                  <span className="text-base">{THEMES[t].icon}</span>
                  <span>{THEMES[t].name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound Effects Toggle */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-rose-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-indigo-500" />
            )}
            <div>
              <div className="text-sm font-bold">Sound & Voice FX</div>
              <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isMuted ? 'Audio is muted' : 'Tactile taps & pronunciation'}
              </div>
            </div>
          </div>
          <button
            onClick={onToggleMute}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
              isMuted
                ? 'bg-rose-500/20 text-rose-500'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {isMuted ? 'Off' : 'On'}
          </button>
        </div>

        {/* Ad-Free Pass / Ad Preferences Toggle */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              className={`w-5 h-5 ${
                adFreePass ? 'text-emerald-500' : 'text-amber-500'
              }`}
            />
            <div>
              <div className="text-sm font-bold">Ad-Free Pass</div>
              <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {adFreePass ? 'Banners & breaks disabled' : 'Ads support free play'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onToggleAdFree();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
              adFreePass
                ? 'bg-emerald-500 text-slate-950'
                : isLight
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {adFreePass ? 'Active' : 'Enable'}
          </button>
        </div>

        {/* Cloud Progress Sync */}
        {(onCloudSignIn || onCloudSyncNow) && (
          <div
            className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {cloudUser ? (
                  <Cloud
                    className={`w-5 h-5 shrink-0 ${
                      cloudSyncStatus === 'error' ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  />
                ) : (
                  <CloudOff className="w-5 h-5 shrink-0 text-slate-400" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate">Cloud Progress Sync</div>
                  <div className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {cloudUser
                      ? cloudSyncStatus === 'syncing'
                        ? 'Syncing save across devices...'
                        : cloudSyncStatus === 'synced' && lastSyncedAt
                        ? `${cloudUser.displayName || cloudUser.email || 'Signed in'} · Synced`
                        : cloudUser.displayName || cloudUser.email || 'Signed in'
                      : 'Local device only · Backup with Google'}
                  </div>
                </div>
              </div>

              {!cloudUser && onCloudSignIn && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onCloudSignIn();
                  }}
                  disabled={cloudSyncStatus === 'syncing'}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-black flex items-center gap-1 shrink-0 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{cloudSyncStatus === 'syncing' ? 'Wait...' : 'Sign In'}</span>
                </button>
              )}
            </div>

            {cloudUser && (
              <div className="flex items-center gap-2">
                {onCloudSyncNow && (
                  <button
                    onClick={() => {
                      sound.playTap();
                      onCloudSyncNow();
                    }}
                    disabled={cloudSyncStatus === 'syncing'}
                    className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        cloudSyncStatus === 'syncing' ? 'animate-spin text-indigo-500' : ''
                      }`}
                    />
                    <span>{cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                )}
                {onCloudSignOut && (
                  <button
                    onClick={() => {
                      sound.playTap();
                      onCloudSignOut();
                    }}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition ${
                      isLight
                        ? 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50'
                        : 'bg-slate-900 border-slate-700 text-rose-400 hover:bg-rose-950/40'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}

            {cloudSyncError && (
              <div className="text-[11px] font-medium text-rose-500 leading-snug">
                {cloudSyncError}
              </div>
            )}
          </div>
        )}

        {/* Mobile App Install + Title Screen Navigation */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Offline Mobile App
            </span>
            <PWAInstallButton />
          </div>

          {onReturnToTitle && (
            <button
              onClick={() => {
                sound.playTap();
                onClose();
                onReturnToTitle();
              }}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Title Screen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. Pre-Game Level Briefing Modal (Triggered from Saga Quest Map Nodes)
 * ============================================================================ */
interface LevelBriefingModalProps {
  stage: TierLevelStage;
  tierName: string;
  isCompleted: boolean;
  onStartStage: () => void;
  onClose: () => void;
  theme: ThemeId;
}

export const LevelBriefingModal: React.FC<LevelBriefingModalProps> = ({
  stage,
  tierName,
  isCompleted,
  onStartStage,
  onClose,
  theme,
}) => {
  const isLight = theme === 'clean_light' || theme === 'parchment';
  const isBoss = stage.levelNumber === 16;
  const modeName = MODE_LABELS[stage.puzzleMode] || 'Puzzle';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in zoom-in-95 duration-150 select-none">
      <div
        className={`relative w-full max-w-md rounded-3xl border-2 p-6 shadow-2xl text-center space-y-5 ${
          isBoss
            ? isLight
              ? 'bg-gradient-to-b from-amber-50 to-white border-amber-400 text-slate-900'
              : 'bg-gradient-to-b from-amber-950/50 to-slate-900 border-amber-500 text-slate-100'
            : isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-indigo-500/40 text-slate-100'
        }`}
      >
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-xl transition ${
            isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          aria-label="Close Briefing"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stage Emblem */}
        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl border-b-4 flex items-center justify-center text-2xl font-black shadow-lg mb-3 ${
              isBoss
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-700 text-slate-950'
                : 'bg-gradient-to-br from-indigo-500 to-violet-600 border-indigo-900 text-white'
            }`}
          >
            {isBoss ? <Crown className="w-8 h-8" /> : stage.levelNumber}
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-indigo-500">
            {tierName} · Stage {stage.levelNumber} of 16
          </div>
          <h2 className="text-2xl font-black font-heading mt-1">{stage.title}</h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {stage.subtitle}
          </p>
        </div>

        {/* Difficulty Stars */}
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={`w-5 h-5 ${
                idx < stage.difficultyStars
                  ? 'fill-amber-400 text-amber-400'
                  : isLight
                  ? 'fill-slate-200 text-slate-200'
                  : 'fill-slate-800 text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Briefing Details */}
        <div
          className={`p-4 rounded-2xl border text-left space-y-2 text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Puzzle Mode</span>
            <span className="font-black text-indigo-500">{modeName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Difficulty</span>
            <span className="font-bold">{stage.difficultyTag}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Focus</span>
            <span className="font-semibold text-right truncate">{stage.focus}</span>
          </div>
          {isCompleted && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/30">
              <span className="text-emerald-500 font-bold">Status</span>
              <span className="text-emerald-500 font-black">Completed ★</span>
            </div>
          )}
        </div>

        {/* Primary Play CTA */}
        <button
          onClick={() => {
            sound.playTap();
            onStartStage();
          }}
          className={`tactile-btn w-full py-3.5 rounded-2xl border-b-4 font-black text-base flex items-center justify-center gap-2 shadow-lg ${
            isBoss
              ? 'bg-gradient-to-b from-amber-400 to-amber-500 border-amber-700 text-slate-950'
              : 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-900 text-white'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{isCompleted ? 'Replay Stage' : 'Start Stage'}</span>
        </button>
      </div>
    </div>
  );
};
