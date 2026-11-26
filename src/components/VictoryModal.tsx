import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, RotateCcw, Home, Award, Tv, CheckCircle2, ArrowRight, Globe2, Swords, Share2, Check } from 'lucide-react';
import { calculateLevel } from '../services/gameState';
import { RewardedAdModal } from './AdUnits';

interface VictoryModalProps {
  modeTitle: string;
  score: number;
  total: number;
  xpEarned: number;
  totalXp: number;
  isHighScore?: boolean;
  adFree?: boolean;
  nextStageLabel?: string;
  challengeResult?: {
    challengerName: string;
    targetScore: number;
  };
  onNextStage?: () => void;
  onViewLeaderboard?: () => void;
  onCopyChallengeLink?: () => Promise<boolean> | boolean;
  onClaimDoubleXp?: (bonusXp: number) => void;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  modeTitle,
  score,
  xpEarned,
  totalXp,
  isHighScore,
  adFree = false,
  nextStageLabel,
  challengeResult,
  onNextStage,
  onViewLeaderboard,
  onCopyChallengeLink,
  onClaimDoubleXp,
  onPlayAgain,
  onHome,
}) => {
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [hasDoubledXp, setHasDoubledXp] = useState(false);
  const [copiedChallenge, setCopiedChallenge] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#7c3aed', '#fbbf24', '#34d399', '#f43f5e'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const displayedXp = hasDoubledXp ? xpEarned * 2 : xpEarned;
  const { level, title, currentLevelXp, nextLevelXp } = calculateLevel(totalXp);
  const progressPercent = Math.min(Math.round((currentLevelXp / nextLevelXp) * 100), 100);
  const wonDuel = challengeResult ? score > challengeResult.targetScore : false;
  const tiedDuel = challengeResult ? score === challengeResult.targetScore : false;

  const handleShareChallenge = async () => {
    if (!onCopyChallengeLink) return;
    const ok = await onCopyChallengeLink();
    if (ok) {
      setCopiedChallenge(true);
      setTimeout(() => setCopiedChallenge(false), 2600);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-7 shadow-2xl text-center text-slate-100">
          {/* Top Trophy Emblem */}
          <div className="w-20 h-20 mx-auto -mt-10 mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-xl shadow-amber-500/25">
            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>
          </div>

          <h3 className="text-2xl font-black font-heading text-white">Quest Complete!</h3>
          <p className="text-xs text-indigo-400 font-semibold mb-4">{modeTitle}</p>

          {challengeResult && (
            <div
              className={`mb-4 p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 ${
                wonDuel
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : tiedDuel
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Swords className="w-4 h-4 shrink-0" />
                <span>
                  {wonDuel
                    ? `Beat ${challengeResult.challengerName}!`
                    : tiedDuel
                    ? `Tied ${challengeResult.challengerName}!`
                    : `${challengeResult.challengerName} leads`}
                </span>
              </span>
              <span className="font-mono tabular-nums shrink-0">
                {score.toLocaleString()} vs {challengeResult.targetScore.toLocaleString()}
              </span>
            </div>
          )}

          {isHighScore && (
            <div className="mb-4 py-1.5 px-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black inline-flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>NEW HIGH SCORE!</span>
            </div>
          )}

          {/* Score & Rewards Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 font-semibold block">Round Score</span>
              <span className="text-2xl font-black text-amber-400 tabular-nums">{score}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 font-semibold block">XP Earned</span>
              <span className="text-2xl font-black text-emerald-400 tabular-nums">+{displayedXp}</span>
            </div>
          </div>

          {/* Level Progression Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-5 text-left">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold text-white">Level {level}</span>
                <span className="text-indigo-400 font-medium">· {title}</span>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {currentLevelXp}/{nextLevelXp} XP
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            {onClaimDoubleXp && !adFree && !hasDoubledXp && (
              <button
                onClick={() => setShowRewardedAd(true)}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Tv className="w-4 h-4" />
                <span>Watch Short Ad · Claim 2× XP (+{xpEarned})</span>
              </button>
            )}

            {hasDoubledXp && (
              <div className="py-2 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>2× XP Bonus Claimed!</span>
              </div>
            )}

            {onNextStage && nextStageLabel && (
              <button
                onClick={onNextStage}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <span>Next Stage · {nextStageLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onCopyChallengeLink && (
              <button
                onClick={handleShareChallenge}
                className="w-full py-2.5 px-5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedChallenge ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Challenge Link Copied! Send to a Friend</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Challenge a Friend to Beat {score.toLocaleString()} pts</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onPlayAgain}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            {onViewLeaderboard && (
              <button
                onClick={onViewLeaderboard}
                className="w-full py-2.5 px-5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>View Global Top 100</span>
              </button>
            )}

            <button
              onClick={onHome}
              className="w-full py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Hub</span>
            </button>
          </div>
        </div>
      </div>

      {showRewardedAd && (
        <RewardedAdModal
          rewardLabel={`2× XP (+${xpEarned} Bonus XP)`}
          onCancel={() => setShowRewardedAd(false)}
          onClaimReward={() => {
            setShowRewardedAd(false);
            setHasDoubledXp(true);
            onClaimDoubleXp?.(xpEarned);
            try {
              confetti({
                particleCount: 60,
                spread: 60,
                origin: { y: 0.55 },
              });
            } catch {
              // Confetti fallback
            }
          }}
        />
      )}
    </>
  );
};

