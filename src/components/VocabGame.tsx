import React, { useState, useEffect } from 'react';
import { Volume2, Bookmark, CheckCircle2, AlertCircle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { VocabItem, DifficultyLevel } from '../data/wordBank';
import { sound } from '../services/sound';
import { GameStorage } from '../services/gameState';

interface VocabGameProps {
  items: VocabItem[];
  difficulty: DifficultyLevel;
  onFinish: (results: { score: number; total: number; xpEarned: number }) => void;
  onExit: () => void;
}

export const VocabGame: React.FC<VocabGameProps> = ({ items, onFinish, onExit }) => {
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
    if (currentItem) {
      sound.speak(currentItem.word, 0.88);
    }
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
        type: 'vocab',
        title: currentItem.word,
        subtitle: currentItem.partOfSpeech,
        detail: currentItem.definition,
      });
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    GameStorage.addVaultItem({
      id: currentItem.id,
      type: 'vocab',
      title: currentItem.word,
      subtitle: currentItem.partOfSpeech,
      detail: currentItem.definition,
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
          <span className="text-xs font-bold text-violet-400 tabular-nums">
            Question {currentIndex + 1} of {items.length}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Score</span>
          <div className="text-sm font-black text-amber-400 tabular-nums">{Math.round(score)}</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex flex-col justify-center my-4">
        {/* Word Display Header */}
        <div className="text-center mb-5">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-3 h-3" />
              <span>{currentItem.categoryType || 'Vocab'}</span>
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              {currentItem.partOfSpeech}
            </span>
            {currentItem.examNote && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <span>🎯 {currentItem.examNote}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-wide text-white">
              {currentItem.word}
            </h2>
            <button
              onClick={() => sound.speak(currentItem.word, 0.85)}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white transition shadow"
              title="Pronounce word"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Context Sentence */}
        <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 mb-6 shadow-md text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Context Sentence</p>
          <p className="text-base sm:text-lg text-slate-200 font-medium italic">
            "{currentItem.contextSentence.replace('___', isAnswered ? currentItem.word.toUpperCase() : '______')}"
          </p>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3 mb-6">
          {currentItem.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentItem.correctOptionIndex;

            let btnStyle = 'bg-slate-900 hover:bg-slate-800/90 border-slate-700/80 text-slate-200 border-b-4 border-b-slate-950 active:border-b-2 active:translate-y-0.5';
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

        {/* Revealed Insights on Answer */}
        {isAnswered && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200 mb-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Word Intel & Nuance</span>
                <button
                  onClick={handleToggleBookmark}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isBookmarked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isBookmarked ? 'Saved' : 'Save to Vault'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
                {currentItem.synonyms.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-emerald-400 font-bold block mb-1">Synonyms:</span>
                    <span className="text-slate-300">{currentItem.synonyms.join(', ')}</span>
                  </div>
                )}
                {currentItem.antonyms.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-rose-400 font-bold block mb-1">Antonyms:</span>
                    <span className="text-slate-300">{currentItem.antonyms.join(', ')}</span>
                  </div>
                )}
              </div>

              {currentItem.etymologyTip && (
                <p className="mt-2 text-xs text-indigo-300 italic pt-2 border-t border-slate-800">
                  📜 {currentItem.etymologyTip}
                </p>
              )}
              {currentItem.examNote && (
                <p className="mt-1.5 text-xs text-amber-300 font-medium">
                  🎯 <span className="font-bold">Exam Note:</span> {currentItem.examNote}
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{currentIndex + 1 < items.length ? 'Next Word' : 'Complete Voyage'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
        Press 1-4 or A-D to select · Space or Enter to continue
      </div>
    </div>
  );
};
