import React, { useState, useMemo } from 'react';
import { ArrowLeft, Zap, CheckCircle2, Sparkles, ArrowRight, Bug, HelpCircle } from 'lucide-react';
import { BUG_ZAP_PUZZLES, BugZapLevel } from '../../data/puzzleBank';
import { sound } from '../../services/sound';
import { GameStorage } from '../../services/gameState';

interface BugZapPuzzleProps {
  onBack: () => void;
  onFinish: (results: { score: number; total: number; xpEarned: number }) => void;
  roundSize?: number;
}

export const BugZapPuzzle: React.FC<BugZapPuzzleProps> = ({
  onBack,
  onFinish,
  roundSize = 5,
}) => {
  const sessionDeck = useMemo(() => {
    const copy = [...BUG_ZAP_PUZZLES];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(roundSize, copy.length));
  }, [roundSize]);

  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel: BugZapLevel = sessionDeck[levelIdx % sessionDeck.length];

  const [tappedIndex, setTappedIndex] = useState<number | null>(null);
  const [isZapped, setIsZapped] = useState(false);
  const [wrongWiggle, setWrongWiggle] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleTapWord = (index: number) => {
    if (isZapped) return;

    sound.playTap();
    setTappedIndex(index);

    if (index === currentLevel.bugIndex) {
      // Correct! Zapped the bug!
      sound.playCorrect(levelIdx + 1);
      setIsZapped(true);
      setScore((prev) => prev + 100);
      setXpEarned((prev) => prev + 60);
      GameStorage.addXp(60);
    } else {
      // Wrong word tapped - gentle wiggle
      sound.playWrong();
      setWrongWiggle(index);
      setTimeout(() => setWrongWiggle(null), 400);
    }
  };

  const handleNextLevel = () => {
    if (levelIdx + 1 < sessionDeck.length) {
      setLevelIdx((prev) => prev + 1);
      setIsZapped(false);
      setTappedIndex(null);
      setShowHint(false);
    } else {
      const completionBonus = 100;
      GameStorage.addXp(completionBonus);
      sound.playVictory();
      onFinish({
        score,
        total: sessionDeck.length,
        xpEarned: xpEarned + completionBonus,
      });
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col justify-between min-h-[84vh] p-4 text-slate-100 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Puzzle</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-400">
            Bug Zap {levelIdx + 1} of {sessionDeck.length}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">
            {currentLevel.category}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Score</span>
          <span className="text-sm font-black text-amber-400 tabular-nums">{score}</span>
        </div>
      </div>

      {/* Main Puzzle Area */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-wider mb-2 animate-pulse-gentle">
            <Bug className="w-4 h-4 text-rose-400" />
            <span>Grammar Bug Detective</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            Find & Tap the Broken Word!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            One of the word tiles in this sentence violates a rule. Tap it to zap it and fix the sentence!
          </p>
        </div>

        {/* Interactive Sentence Word Tiles */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl mb-6">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {currentLevel.sentenceWords.map((word, idx) => {
              const isBug = idx === currentLevel.bugIndex;
              const isTapped = tappedIndex === idx;
              const isWiggling = wrongWiggle === idx;

              let tileStyle =
                'bg-slate-800 hover:bg-slate-700/90 border-slate-700 text-slate-100 border-b-4 border-b-slate-950 active:translate-y-1 active:border-b-2';

              if (isZapped && isBug) {
                tileStyle =
                  'bg-emerald-600 border-emerald-400 text-white border-b-4 border-b-emerald-900 scale-110 shadow-lg shadow-emerald-500/30 animate-bounce';
              } else if (isWiggling) {
                tileStyle = 'bg-rose-900 border-rose-500 text-rose-200 border-b-4 border-b-rose-950 scale-95';
              }

              return (
                <button
                  key={`${word}_${idx}`}
                  onClick={() => handleTapWord(idx)}
                  disabled={isZapped}
                  className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl font-bold text-base sm:text-lg border transition-all duration-150 cursor-pointer shadow-sm ${tileStyle}`}
                >
                  <span>
                    {isZapped && isBug ? (
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span className="underline decoration-wavy decoration-emerald-300">
                          {currentLevel.correction}
                        </span>
                      </span>
                    ) : (
                      word
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hint toggle */}
        {!isZapped && (
          <div className="text-center mb-4">
            {!showHint ? (
              <button
                onClick={() => {
                  sound.playTap();
                  setShowHint(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need a Clue?</span>
              </button>
            ) : (
              <div className="inline-block p-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                💡 Look closely around: {currentLevel.category}
              </div>
            )}
          </div>
        )}

        {/* Post-Zap Success & Rule Card */}
        {isZapped && (
          <div className="animate-in zoom-in-95 duration-200 max-w-md mx-auto w-full">
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 mb-4 shadow-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-base text-white">Bug Zapped Successfully!</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {currentLevel.ruleTip}
              </p>
            </div>

            <button
              onClick={handleNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{levelIdx + 1 < sessionDeck.length ? 'Next Bug to Zap' : 'Complete Challenge'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Control Hint Line */}
      <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
        Interactive Grammar Detective · Spot the broken tile · Fix the sentence!
      </div>
    </div>
  );
};
