import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { SENTENCE_JIGSAW_PUZZLES, SentenceJigsawLevel } from '../../data/puzzleBank';
import { sound } from '../../services/sound';
import { GameStorage } from '../../services/gameState';

interface SentenceJigsawPuzzleProps {
  onBack: () => void;
  onFinish: (results: { score: number; total: number; xpEarned: number }) => void;
  roundSize?: number;
}

export const SentenceJigsawPuzzle: React.FC<SentenceJigsawPuzzleProps> = ({
  onBack,
  onFinish,
  roundSize = 5,
}) => {
  const sessionDeck = useMemo(() => {
    const copy = [...SENTENCE_JIGSAW_PUZZLES];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(roundSize, copy.length));
  }, [roundSize]);

  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel: SentenceJigsawLevel = sessionDeck[levelIdx % sessionDeck.length];

  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [placedBlocks, setPlacedBlocks] = useState<string[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [wrongOrderHint, setWrongOrderHint] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    if (!currentLevel) return;
    setAvailableBlocks([...currentLevel.jumbledBlocks]);
    setPlacedBlocks([]);
    setIsSolved(false);
    setWrongOrderHint(false);
  }, [levelIdx, currentLevel]);

  const handlePlaceBlock = (block: string, availIdx: number) => {
    if (isSolved) return;
    sound.playTap();
    setWrongOrderHint(false);

    const nextPlaced = [...placedBlocks, block];
    setPlacedBlocks(nextPlaced);
    setAvailableBlocks((prev) => prev.filter((_, i) => i !== availIdx));

    // Check if all blocks placed
    if (nextPlaced.length === currentLevel.correctBlocks.length) {
      const isCorrectOrder = nextPlaced.every(
        (b, i) => b === currentLevel.correctBlocks[i]
      );

      if (isCorrectOrder) {
        sound.playVictory();
        setIsSolved(true);
        setScore((prev) => prev + 120);
        setXpEarned((prev) => prev + 80);
        GameStorage.addXp(80);
      } else {
        sound.playWrong();
        setWrongOrderHint(true);
      }
    }
  };

  const handleRemoveBlock = (block: string, placedIdx: number) => {
    if (isSolved) return;
    sound.playTap();
    setWrongOrderHint(false);

    setPlacedBlocks((prev) => prev.filter((_, i) => i !== placedIdx));
    setAvailableBlocks((prev) => [...prev, block]);
  };

  const handleReset = () => {
    sound.playTap();
    setAvailableBlocks([...currentLevel.jumbledBlocks]);
    setPlacedBlocks([]);
    setIsSolved(false);
    setWrongOrderHint(false);
  };

  const handleNextLevel = () => {
    if (levelIdx + 1 < sessionDeck.length) {
      setLevelIdx((prev) => prev + 1);
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
          <span className="text-xs font-bold text-teal-400">
            Jigsaw Puzzle {levelIdx + 1} of {sessionDeck.length}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300">
            {currentLevel.category}
          </span>
        </div>

        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Reset Blocks"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Jigsaw Arena */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Syntax Jigsaw Builder</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            Assemble the Sentence!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Tap the scrambled phrase fragments below in grammatical order to assemble the complete thought.
          </p>
        </div>

        {/* Assembly Area (Placed Blocks) */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-xl mb-6 min-h-[140px] flex flex-col justify-center items-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            {isSolved ? '🎉 Perfectly Assembled Sentence' : 'Your Sentence Assembly'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {placedBlocks.length === 0 ? (
              <span className="text-xs italic text-slate-600">
                (Tap blocks below to place them here...)
              </span>
            ) : (
              placedBlocks.map((block, idx) => (
                <button
                  key={`${block}_${idx}`}
                  onClick={() => handleRemoveBlock(block, idx)}
                  disabled={isSolved}
                  className={`py-2 px-3.5 rounded-xl font-bold text-sm sm:text-base border transition-all duration-150 border-b-4 ${
                    isSolved
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 border-b-emerald-800 shadow-md'
                      : wrongOrderHint
                      ? 'bg-rose-950/80 border-rose-500/80 text-rose-200 border-b-rose-900 active:scale-95'
                      : 'bg-indigo-950/80 border-indigo-500/70 text-indigo-200 border-b-indigo-900 active:scale-95'
                  }`}
                >
                  <span>{block}</span>
                </button>
              ))
            )}
          </div>

          {wrongOrderHint && !isSolved && (
            <p className="mt-3 text-xs font-bold text-rose-400">
              Not quite the right syntax order — tap a phrase to remove it or tap Reset.
            </p>
          )}
        </div>

        {/* Available Scrambled Blocks */}
        {!isSolved && (
          <div className="space-y-3 max-w-lg mx-auto w-full">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              Available Jigsaw Fragments:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableBlocks.map((block, idx) => (
                <button
                  key={`${block}_${idx}`}
                  onClick={() => handlePlaceBlock(block, idx)}
                  className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700/90 border-2 border-slate-700 text-slate-100 font-bold text-sm text-center border-b-4 border-b-slate-950 active:translate-y-1 active:border-b-2 shadow-sm transition-all"
                >
                  {block}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Solved Success Banner */}
        {isSolved && (
          <div className="animate-in zoom-in-95 duration-200 max-w-md mx-auto w-full text-center">
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 mb-4 shadow-xl">
              <Sparkles className="w-7 h-7 mx-auto mb-1 text-emerald-400 animate-bounce" />
              <p className="font-extrabold text-lg text-white">Grammatical Precision!</p>
              <p className="text-xs text-emerald-300">+120 XP Jigsaw Bonus</p>
            </div>

            <button
              onClick={handleNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{levelIdx + 1 < sessionDeck.length ? 'Next Jigsaw Puzzle' : 'Finish Challenge'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Control Hint Line */}
      <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
        Interactive Jigsaw Assembly · Tap in order · Zero studying required!
      </div>
    </div>
  );
};
