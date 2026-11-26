import React, { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { ODD_ONE_OUT_PUZZLES, OddOneOutLevel } from '../../data/puzzleBank';
import { sound } from '../../services/sound';
import { GameStorage } from '../../services/gameState';

interface OddOneOutPuzzleProps {
  onBack: () => void;
  onFinish: (results: { score: number; total: number; xpEarned: number }) => void;
  roundSize?: number;
}

export const OddOneOutPuzzle: React.FC<OddOneOutPuzzleProps> = ({
  onBack,
  onFinish,
  roundSize = 5,
}) => {
  const sessionDeck = useMemo(() => {
    const copy = [...ODD_ONE_OUT_PUZZLES];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(roundSize, copy.length));
  }, [roundSize]);

  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel: OddOneOutLevel = sessionDeck[levelIdx % sessionDeck.length];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const handleSelectWord = (idx: number) => {
    if (isAnswered) return;

    sound.playTap();
    setSelectedIndex(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentLevel.oddIndex;
    if (isCorrect) {
      sound.playCorrect(levelIdx + 1);
      setScore((prev) => prev + 100);
      setXpEarned((prev) => prev + 70);
      GameStorage.addXp(70);
    } else {
      sound.playWrong();
    }
  };

  const handleNextLevel = () => {
    if (levelIdx + 1 < sessionDeck.length) {
      setLevelIdx((prev) => prev + 1);
      setSelectedIndex(null);
      setIsAnswered(false);
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
          <span className="text-xs font-bold text-violet-400">
            Intruder Puzzle {levelIdx + 1} of {sessionDeck.length}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-violet-950 border border-violet-800 text-violet-300">
            {currentLevel.category}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Score</span>
          <span className="text-sm font-black text-amber-400 tabular-nums">{score}</span>
        </div>
      </div>

      {/* Main Arena */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-black uppercase tracking-wider mb-2">
            <Eye className="w-4 h-4 text-violet-400" />
            <span>Spot the Intruder</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            Which Word Does NOT Belong?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Three words share an underlying meaning family. Tap the single outsider!
          </p>
        </div>

        {/* 4 Word Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto w-full mb-6">
          {currentLevel.words.map((word, idx) => {
            const isOdd = idx === currentLevel.oddIndex;
            const isSelected = selectedIndex === idx;

            let cardStyle =
              'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-white border-b-4 border-b-slate-950 active:translate-y-1 active:border-b-2';

            if (isAnswered) {
              if (isOdd) {
                cardStyle =
                  'bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 border-b-4 border-b-emerald-900 shadow-lg';
              } else if (isSelected) {
                cardStyle =
                  'bg-rose-950/90 border-2 border-rose-500 text-rose-200 border-b-4 border-b-rose-900 shadow-md';
              } else {
                cardStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-50';
              }
            }

            return (
              <button
                key={word}
                onClick={() => handleSelectWord(idx)}
                disabled={isAnswered}
                className={`py-5 px-4 rounded-2xl font-black text-lg sm:text-xl text-center border transition-all duration-150 shadow-sm ${cardStyle}`}
              >
                <span>{word}</span>
              </button>
            );
          })}
        </div>

        {/* Revealed Reason Card */}
        {isAnswered && (
          <div className="animate-in zoom-in-95 duration-200 max-w-md mx-auto w-full text-center">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 mb-4 shadow-xl text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-extrabold text-sm text-white">Intruder Spotted!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentLevel.explanation}
              </p>
            </div>

            <button
              onClick={handleNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{levelIdx + 1 < sessionDeck.length ? 'Next Intruder Puzzle' : 'Finish Challenge'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Control Hint Line */}
      <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
        Spot the Intruder · Pure word logic puzzle · Zero studying required!
      </div>
    </div>
  );
};
