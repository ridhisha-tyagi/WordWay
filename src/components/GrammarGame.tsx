import React, { useState, useEffect } from 'react';
import { ShieldCheck, Bookmark, CheckCircle2, AlertCircle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { GrammarItem, DifficultyLevel } from '../data/wordBank';
import { sound } from '../services/sound';
import { GameStorage } from '../services/gameState';

interface GrammarGameProps {
  items: GrammarItem[];
  difficulty: DifficultyLevel;
  onFinish: (results: { score: number; total: number; xpEarned: number }) => void;
  onExit: () => void;
}

export const GrammarGame: React.FC<GrammarGameProps> = ({ items, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const currentItem = items[currentIndex];

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsBookmarked(false);
  }, [currentIndex, currentItem]);

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentItem.correctOptionIndex;
    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      sound.playCorrect(nextCombo);
      setScore((prev) => prev + 100 * (1 + nextCombo * 0.2));
    } else {
      setCombo(0);
      sound.playWrong();
      GameStorage.addVaultItem({
        id: currentItem.id,
        type: 'grammar',
        title: currentItem.category,
        subtitle: currentItem.sentence,
        detail: currentItem.explanation,
      });
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    GameStorage.addVaultItem({
      id: currentItem.id,
      type: 'grammar',
      title: currentItem.category,
      subtitle: currentItem.sentence,
      detail: currentItem.explanation,
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const xpEarned = Math.round(score / 5) + 50;
      GameStorage.addXp(xpEarned);
      sound.playVictory();
      onFinish({
        score: Math.round(score),
        total: items.length,
        xpEarned,
      });
    }
  };

  if (!currentItem) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col min-h-[82vh] justify-between p-4 pb-8 text-slate-100 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onExit}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
        >
          ← Quit Round
        </button>

        <div className="flex items-center gap-2">
          {combo > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{combo}x Streak!</span>
            </div>
          )}
          <span className="text-xs font-bold text-teal-400 tabular-nums">
            Rule {currentIndex + 1} of {items.length}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Score</span>
          <div className="text-sm font-black text-amber-400 tabular-nums">{Math.round(score)}</div>
        </div>
      </div>

      {/* Main Challenge Area */}
      <div className="flex-1 flex flex-col justify-center my-4">
        {/* Category & Exam Tag Badges */}
        <div className="text-center mb-5">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentItem.category}</span>
            </span>
            {currentItem.examTag && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <span>🎯 {currentItem.examTag}</span>
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-200">
            {currentItem.prompt}
          </h2>
        </div>

        {/* Target Sentence Box */}
        <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 mb-6 shadow-xl text-center">
          <p className="text-lg sm:text-xl font-medium leading-relaxed text-white">
            {currentItem.sentence}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentItem.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentItem.correctOptionIndex;

            let btnStyle = 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200 border-b-4 border-b-slate-950 active:border-b-2 active:translate-y-0.5';
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold border-b-4 border-b-emerald-900 shadow-md';
              } else if (isSelected) {
                btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 border-b-4 border-b-rose-900 shadow-md';
              } else {
                btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between shadow-sm ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-base leading-snug">{option}</span>
                </div>

                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />}
                {isAnswered && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>

        {/* Grammar Rule Breakdown Card */}
        {isAnswered && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200 mb-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Grammar Rule Blueprint</span>
                </div>

                <button
                  onClick={handleToggleBookmark}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isBookmarked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isBookmarked ? 'Saved' : 'Save Rule'}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentItem.explanation}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{currentIndex + 1 < items.length ? 'Next Rule' : 'Complete Guard'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
        Master correct syntax · Eliminate common pitfalls · Free forever
      </div>
    </div>
  );
};
