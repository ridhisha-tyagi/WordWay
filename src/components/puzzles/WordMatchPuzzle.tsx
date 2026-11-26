import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Sparkles, CheckCircle2, Link2, ArrowRight } from 'lucide-react';
import { WORD_MATCH_PUZZLES, WordMatchLevel } from '../../data/puzzleBank';
import { sound } from '../../services/sound';
import { GameStorage } from '../../services/gameState';

interface WordMatchPuzzleProps {
  onBack: () => void;
  onFinish: (results: { score: number; total: number; xpEarned: number }) => void;
  roundSize?: number;
}

export const WordMatchPuzzle: React.FC<WordMatchPuzzleProps> = ({
  onBack,
  onFinish,
  roundSize = 5,
}) => {
  const sessionDeck = useMemo(() => {
    const copy = [...WORD_MATCH_PUZZLES];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(roundSize, copy.length));
  }, [roundSize]);

  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel: WordMatchLevel = sessionDeck[levelIdx % sessionDeck.length];

  const [leftWords, setLeftWords] = useState<string[]>([]);
  const [rightMatches, setRightMatches] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // list of matched left words
  const [wrongFlash, setWrongFlash] = useState<boolean>(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Initialize and shuffle level
  useEffect(() => {
    if (!currentLevel) return;
    const words = currentLevel.pairs.map((p) => p.word);
    const matches = currentLevel.pairs.map((p) => p.match);

    // Shuffle right column
    const shuffledMatches = [...matches];
    for (let i = shuffledMatches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledMatches[i], shuffledMatches[j]] = [shuffledMatches[j], shuffledMatches[i]];
    }

    setLeftWords(words);
    setRightMatches(shuffledMatches);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
  }, [levelIdx, currentLevel]);

  // Check matching logic
  const handleSelectLeft = (word: string) => {
    if (matchedPairs.includes(word) || wrongFlash) return;
    sound.playTap();
    setSelectedLeft(word);

    if (selectedRight) {
      evaluatePair(word, selectedRight);
    }
  };

  const handleSelectRight = (match: string) => {
    if (wrongFlash) return;
    // Check if this right match belongs to an already matched pair
    const isAlreadyMatched = currentLevel.pairs.some(
      (p) => p.match === match && matchedPairs.includes(p.word)
    );
    if (isAlreadyMatched) return;

    sound.playTap();
    setSelectedRight(match);

    if (selectedLeft) {
      evaluatePair(selectedLeft, match);
    }
  };

  const evaluatePair = (left: string, right: string) => {
    const isCorrect = currentLevel.pairs.some((p) => p.word === left && p.match === right);

    if (isCorrect) {
      sound.playCorrect(matchedPairs.length + 1);
      const nextMatched = [...matchedPairs, left];
      setMatchedPairs(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      setScore((prev) => prev + 50);

      if (nextMatched.length === currentLevel.pairs.length) {
        sound.playStreak();
        setScore((prev) => prev + 100);
        setXpEarned((prev) => prev + 100);
        GameStorage.addXp(100);
      }
    } else {
      sound.playWrong();
      setWrongFlash(true);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongFlash(false);
      }, 400);
    }
  };

  const isLevelCompleted = matchedPairs.length === currentLevel.pairs.length;

  const handleNextLevel = () => {
    if (levelIdx + 1 < sessionDeck.length) {
      setLevelIdx((prev) => prev + 1);
    } else {
      const completionBonus = 50;
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
          <span className="text-xs font-bold text-indigo-400">
            Link Puzzle {levelIdx + 1} of {sessionDeck.length}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
            {currentLevel.theme}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Pairs</span>
          <span className="text-sm font-black text-amber-400 tabular-nums">
            {matchedPairs.length} / {currentLevel.pairs.length}
          </span>
        </div>
      </div>

      {/* Main Puzzle Arena */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white flex items-center justify-center gap-2">
            <Link2 className="w-6 h-6 text-indigo-400" />
            <span>Connect the Matching Pairs!</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tap a word tile on the left, then tap its matching meaning on the right.
          </p>
        </div>

        {/* 2-Column Matching Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto w-full">
          {/* Left Column: Words */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-1">
              Word Tiles
            </p>
            {leftWords.map((word) => {
              const isMatched = matchedPairs.includes(word);
              const isSelected = selectedLeft === word;

              return (
                <button
                  key={word}
                  onClick={() => handleSelectLeft(word)}
                  disabled={isMatched}
                  className={`w-full py-4 px-3 sm:px-4 rounded-2xl font-black text-sm sm:text-base text-center transition-all duration-150 border-b-4 ${
                    isMatched
                      ? 'bg-emerald-950/60 border-2 border-emerald-500/80 text-emerald-300 border-b-emerald-900 opacity-90 scale-[0.98]'
                      : wrongFlash && isSelected
                      ? 'bg-rose-900 border-2 border-rose-500 text-rose-200 border-b-rose-950 animate-shake'
                      : isSelected
                      ? 'bg-indigo-600 border-2 border-indigo-400 text-white border-b-indigo-900 scale-105 shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800/90 hover:bg-slate-700/90 border-2 border-slate-700 text-white border-b-slate-950 active:translate-y-1 active:border-b-2 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    <span>{word}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Scrambled Meanings */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-1">
              Meanings
            </p>
            {rightMatches.map((match) => {
              // Check if matched
              const isMatched = currentLevel.pairs.some(
                (p) => p.match === match && matchedPairs.includes(p.word)
              );
              const isSelected = selectedRight === match;

              return (
                <button
                  key={match}
                  onClick={() => handleSelectRight(match)}
                  disabled={isMatched}
                  className={`w-full py-4 px-3 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm text-center transition-all duration-150 border-b-4 flex items-center justify-center min-h-[58px] ${
                    isMatched
                      ? 'bg-emerald-950/60 border-2 border-emerald-500/80 text-emerald-300 border-b-emerald-900 opacity-90 scale-[0.98]'
                      : wrongFlash && isSelected
                      ? 'bg-rose-900 border-2 border-rose-500 text-rose-200 border-b-rose-950 animate-shake'
                      : isSelected
                      ? 'bg-indigo-600 border-2 border-indigo-400 text-white border-b-indigo-900 scale-105 shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800/90 hover:bg-slate-700/90 border-2 border-slate-700 text-slate-200 border-b-slate-950 active:translate-y-1 active:border-b-2 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <span className="leading-snug">{match}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level Complete Banner & Next Button */}
        {isLevelCompleted && (
          <div className="mt-8 text-center animate-in zoom-in-95 duration-200 max-w-sm mx-auto w-full">
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 mb-4 shadow-xl">
              <Sparkles className="w-7 h-7 mx-auto mb-1 text-emerald-400 animate-bounce" />
              <p className="font-extrabold text-lg text-white">All Pairs Connected!</p>
              <p className="text-xs text-emerald-300">+100 XP Mastery Bonus</p>
            </div>

            <button
              onClick={handleNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{levelIdx + 1 < sessionDeck.length ? 'Next Link Puzzle' : 'Finish Challenge'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Control Hint Line */}
      <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
        Interactive Match Puzzle · Zero studying required · Learn purely through play!
      </div>
    </div>
  );
};
