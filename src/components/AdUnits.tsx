import React, { useEffect, useState } from 'react';
import {
  X,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Gift,
} from 'lucide-react';
import {
  AdCreative,
  AdService,
  ensureAdSenseScript,
  getAdConfig,
} from '../services/ads';
import { ThemeId } from '../services/theme';
import { sound } from '../services/sound';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/* ============================================================================
 * 1. Discreet Bottom Banner Ad (Hub & Post-Game Footer — never covers tiles)
 * ============================================================================ */
interface AdBannerProps {
  adFree?: boolean;
  theme?: ThemeId;
  placementKey?: string;
  onOpenAdFreeSettings?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  adFree = false,
  theme = 'midnight',
  placementKey = 'hub_footer',
  onOpenAdFreeSettings,
}) => {
  const [creativeIdx, setCreativeIdx] = useState(0);
  const [acknowledgedId, setAcknowledgedId] = useState<string | null>(null);
  const isLight = theme === 'clean_light' || theme === 'parchment';
  const adConfig = getAdConfig();

  useEffect(() => {
    if (adFree) return;
    if (adConfig.hasLiveAdSense) {
      ensureAdSenseScript();
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // AdSense push fallback
      }
    }
    const timer = setInterval(() => {
      setCreativeIdx((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, [adFree, adConfig.hasLiveAdSense, placementKey]);

  if (adFree) return null;

  const creative = AdService.getNextCreative(creativeIdx);

  if (adConfig.hasLiveAdSense) {
    return (
      <aside
        aria-label="Sponsored Banner"
        className={`w-full rounded-xl border px-3 py-2 flex flex-col items-center justify-center ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="w-full flex items-center justify-between text-[10px] text-slate-500 mb-1">
          <span>Advertisement</span>
          {onOpenAdFreeSettings && (
            <button
              onClick={onOpenAdFreeSettings}
              className="hover:underline font-semibold"
            >
              Remove Ads
            </button>
          )}
        </div>
        <ins
          className="adsbygoogle block w-full min-h-[50px]"
          style={{ display: 'block' }}
          data-ad-client={adConfig.clientId}
          data-ad-slot={adConfig.bannerSlot}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </aside>
    );
  }

  return (
    <aside
      aria-label="Sponsored Recommendation"
      className={`w-full rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 transition ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
          : 'bg-slate-900/90 border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${creative.accentColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}
        >
          Ad
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold">{creative.advertiser}</span>
            <span aria-hidden="true">·</span>
            <span>{creative.badgeText}</span>
          </div>
          <p className="text-xs sm:text-sm font-bold truncate">
            {acknowledgedId === creative.id
              ? 'Preview sponsor slot active — connect AdSense in .env for live bids.'
              : creative.headline}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            sound.playTap();
            setAcknowledgedId(creative.id);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
            isLight
              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
          }`}
        >
          <span>{creative.cta}</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        {onOpenAdFreeSettings && (
          <button
            onClick={() => {
              sound.playTap();
              onOpenAdFreeSettings();
            }}
            className="hidden sm:inline-flex text-[11px] font-semibold text-slate-500 hover:text-indigo-500 px-1.5 py-1 transition whitespace-nowrap"
            title="Manage Ad Preferences"
          >
            No Ads
          </button>
        )}
      </div>
    </aside>
  );
};

/* ============================================================================
 * 2. Interstitial Ad Modal (Natural Break Between Rounds — Skippable after 5s)
 * ============================================================================ */
interface InterstitialAdModalProps {
  onContinue: () => void;
  onGoAdFree: () => void;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({
  onContinue,
  onGoAdFree,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [creative] = useState<AdCreative>(() =>
    AdService.getNextCreative(Math.floor(Math.random() * 4))
  );

  useEffect(() => {
    AdService.markInterstitialShown();
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const canSkip = secondsLeft === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 overflow-hidden shadow-2xl text-slate-100">
        {/* Top Disclosure Bar */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">
            Sponsored Break · Ad
          </span>

          <button
            onClick={() => {
              if (!canSkip) return;
              sound.playTap();
              onContinue();
            }}
            disabled={!canSkip}
            className={`px-3 py-1 rounded-lg font-bold tabular-nums transition flex items-center gap-1 ${
              canSkip
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                : 'bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canSkip ? (
              <>
                <span>Continue</span>
                <X className="w-3.5 h-3.5" />
              </>
            ) : (
              <span>Skip in {secondsLeft}s</span>
            )}
          </button>
        </div>

        {/* Ad Creative Showcase */}
        <div className="p-6 text-center space-y-4">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${creative.accentColor} flex items-center justify-center shadow-lg text-white font-black text-lg`}
          >
            {creative.advertiser.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-indigo-400">
              {creative.advertiser}
            </div>
            <h3 className="text-xl font-black font-heading text-white leading-snug">
              {creative.headline}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {creative.body}
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => {
                if (canSkip) {
                  sound.playTap();
                  onContinue();
                }
              }}
              disabled={!canSkip}
              className={`w-full py-3 rounded-xl font-black text-sm transition ${
                canSkip
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {canSkip ? 'Resume WordWay' : `Resuming in ${secondsLeft}s...`}
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onGoAdFree();
              }}
              className="w-full py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Want uninterrupted play? Enable Ad-Free Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. Opt-In Rewarded Video Ad Modal ("Watch Short Ad for Reward")
 * ============================================================================ */
interface RewardedAdModalProps {
  rewardLabel: string;
  onClaimReward: () => void;
  onCancel: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  rewardLabel,
  onClaimReward,
  onCancel,
}) => {
  const TOTAL_SECONDS = 5;
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [adMuted, setAdMuted] = useState(sound.getMuted());
  const [creative] = useState<AdCreative>(() =>
    AdService.getNextCreative(Math.floor(Math.random() * 4))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isCompleted = secondsLeft === 0;
  const progressPercent = Math.round(
    ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/40 overflow-hidden shadow-2xl text-slate-100">
        {/* Top Bar */}
        <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Gift className="w-4 h-4" />
            <span>Rewarded Sponsor Spot</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdMuted((m) => !m)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
              aria-label={adMuted ? 'Unmute Ad' : 'Mute Ad'}
            >
              {adMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onCancel();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Simulated Video Frame */}
        <div className="p-6 space-y-5 text-center">
          <div
            className={`relative rounded-2xl p-6 bg-gradient-to-br ${creative.accentColor} text-white shadow-inner overflow-hidden`}
          >
            <div className="flex items-center justify-center mb-3">
              {isCompleted ? (
                <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
              )}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/80 mb-1">
              {creative.advertiser}
            </div>
            <h3 className="text-lg font-black font-heading leading-snug">
              {creative.headline}
            </h3>
            <p className="text-xs text-white/85 mt-1.5">{creative.body}</p>
          </div>

          {/* Progress & Reward Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">
                Reward: <span className="text-amber-400">{rewardLabel}</span>
              </span>
              <span className="tabular-nums text-slate-400">
                {isCompleted ? 'Ready!' : `${secondsLeft}s remaining`}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!isCompleted) return;
              AdService.recordRewardedWatched();
              sound.playVictory();
              onClaimReward();
            }}
            disabled={!isCompleted}
            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition ${
              isCompleted
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isCompleted
                ? `Claim ${rewardLabel}`
                : `Wait ${secondsLeft}s to Claim...`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
