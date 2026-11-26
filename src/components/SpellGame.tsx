import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Volume2, Lightbulb, RotateCcw, Delete, ArrowRight, CheckCircle2, AlertCircle, Bookmark, Sparkles, Shuffle, Tv } from 'lucide-react';
import { SpellingItem, DifficultyLevel } from '../data/wordBank';
import { sound } from '../services/sound';
import { GameStorage } from '../services/gameState';
import { RewardedAdModal } from './AdUnits';

interface SpellGameProps {
  items: SpellingItem[];
  difficulty: DifficultyLevel;
  onFinish: (results: { score: number; total: number; xpEarned: number }) => void;
  onExit: () => void;
}

export const SpellGame: React.FC<SpellGameProps> = ({ items, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [scrambledBank, setScrambledBank] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [revealedHint, setRevealedHint] = useState(false);
  const [revealedPhonetic, setRevealedPhonetic] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hintCoins, setHintCoins] = useState<number>(() => GameStorage.load().hintCoins ?? 3);
  const [showHintAdModal, setShowHintAdModal] = useState(false);

  const currentWord = items[currentIndex];

  // Prepare scrambled bank when currentWord changes
  const initWord = useCallback((item: SpellingItem) => {
    if (!item) return;
    setUserLetters([]);
    setIsAnswered(false);
    setIsCorrect(false);
    setRevealedHint(false);
    setRevealedPhonetic(false);
    setIsBookmarked(false);

    // Speak automatically on word arrival
    sound.speak(item.word, 0.88);

    // Create scrambled tiles with 1-2 extra random distractor letters for juicy challenge
    const chars = item.word.toUpperCase().split('');
    const extraPool = 'EARIOTNSLCUDPMHGBFYWKVXZJQ';
    const numExtras = item.word.length <= 6 ? 2 : 1;
    const extras: string[] = [];
    for (let i = 0; i < numExtras; i++) {
      const randChar = extraPool[Math.floor(Math.random() * extraPool.length)];
      if (!chars.includes(randChar)) {
        extras.push(randChar);
      }
    }

    const allChars = [...chars, ...extras];
    // Fisher-Yates shuffle
    for (let i = allChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
    }

    setScrambledBank(allChars.map((char, index) => ({ id: `${char}_${index}`, char, used: false })));
  }, []);

  useEffect(() => {
    if (currentWord) {
      initWord(currentWord);
    }
  }, [currentIndex, currentWord, initWord]);

  // Handle hardware keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleRemoveLastLetter();
        return;
      }

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        // Find first available tile in scrambled bank
        const availableTile = scrambledBank.find((t) => !t.used && t.char === key);
        if (availableTile) {
          handleSelectTile(availableTile.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, scrambledBank, userLetters]);

  const handlePlayAudio = async (slow: boolean = false) => {
    if (!currentWord || isSpeaking) return;
    setIsSpeaking(true);
    await sound.speak(currentWord.word, slow ? 0.65 : 0.88);
    setIsSpeaking(false);
  };

  const handleSelectTile = (tileId: string) => {
    if (isAnswered) return;
    const tile = scrambledBank.find((t) => t.id === tileId);
    if (!tile || tile.used) return;

    sound.playTap();
    setScrambledBank((prev) => prev.map((t) => (t.id === tileId ? { ...t, used: true } : t)));
    setUserLetters((prev) => [...prev, tile.char]);

    // Check if word is fully formed
    const nextLetters = [...userLetters, tile.char];
    if (nextLetters.length === currentWord.word.length) {
      checkSubmission(nextLetters.join(''));
    }
  };

  const handleRemoveLetterAtIndex = (index: number) => {
    if (isAnswered || index >= userLetters.length) return;
    sound.playTap();
    const charToRemove = userLetters[index];

    // Free the first used tile matching this char
    let freed = false;
    setScrambledBank((prev) =>
      prev.map((t) => {
        if (!freed && t.used && t.char === charToRemove) {
          freed = true;
          return { ...t, used: false };
        }
        return t;
      })
    );

    setUserLetters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveLastLetter = () => {
    if (userLetters.length === 0 || isAnswered) return;
    handleRemoveLetterAtIndex(userLetters.length - 1);
  };

  const handleClearAll = () => {
    if (isAnswered) return;
    sound.playTap();
    setUserLetters([]);
    setScrambledBank((prev) => prev.map((t) => ({ ...t, used: false })));
  };

  const handleShuffle = () => {
    sound.playTap();
    setScrambledBank((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  const revealNextHintLetter = () => {
    if (isAnswered || userLetters.length >= currentWord.word.length) return;
    const nextCharNeeded = currentWord.word[userLetters.length].toUpperCase();
    const availableTile = scrambledBank.find((t) => !t.used && t.char === nextCharNeeded);
    if (availableTile) {
      handleSelectTile(availableTile.id);
    }
  };

  const handleRevealHintLetter = () => {
    if (isAnswered || userLetters.length >= currentWord.word.length) return;
    const result = GameStorage.spendHintCoin();
    if (!result.success) {
      if (GameStorage.load().adFreePass) {
        sound.playTap();
        revealNextHintLetter();
        return;
      }
      sound.playTap();
      setShowHintAdModal(true);
      return;
    }
    setHintCoins(result.remaining);
    sound.playTap();
    revealNextHintLetter();
  };

  const checkSubmission = (spelled: string) => {
    const target = currentWord.word.toUpperCase();
    const correct = spelled === target;
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      sound.playCorrect(newCombo);
      setScore((prev) => prev + 100 * (1 + newCombo * 0.2));
    } else {
      setCombo(0);
      sound.playWrong();
      // Auto add to vault on mistake
      GameStorage.addVaultItem({
        id: currentWord.id,
        type: 'spelling',
        title: currentWord.word,
        subtitle: currentWord.phonetic,
        detail: currentWord.hint || currentWord.definition,
      });
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    GameStorage.addVaultItem({
      id: currentWord.id,
      type: 'spelling',
      title: currentWord.word,
      subtitle: currentWord.phonetic,
      detail: currentWord.hint || currentWord.definition,
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all words
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

  // Mask the target word in the example sentence for context
  const maskedSentence = useMemo(() => {
    if (!currentWord) return '';
    const regex = new RegExp(`\\b${currentWord.word}\\b`, 'gi');
    return currentWord.exampleSentence.replace(regex, '________');
  }, [currentWord]);

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col min-h-[82vh] justify-between p-4 pb-8 text-slate-100 select-none">
      {/* Top Header Bar */}
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
          <span className="text-xs font-bold text-indigo-400 tabular-nums">
            Word {currentIndex + 1} of {items.length}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Score</span>
          <div className="text-sm font-black text-amber-400 tabular-nums">{Math.round(score)}</div>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        {/* Audio Prompts */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => handlePlayAudio(false)}
            className="group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 active:scale-95 transition"
            aria-label="Listen to word"
          >
            <Volume2 className="w-6 h-6 animate-pulse-gentle" />
            <span>Hear Word</span>
          </button>

          <button
            onClick={() => handlePlayAudio(true)}
            className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            title="Pronounce slowly"
          >
            Slow 0.6x
          </button>
        </div>

        {/* Word Clues: Definition & Context */}
        <div className="w-full max-w-lg rounded-2xl bg-slate-900/90 border border-slate-800 p-4 mb-6 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Definition</span>
            {currentWord.examNote && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                🎯 {currentWord.examNote}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-200 font-medium leading-snug">{currentWord.definition}</p>

          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <p className="text-xs italic text-slate-400">"{maskedSentence}"</p>
          </div>

          {/* Optional hints toggles */}
          <div className="flex items-center justify-center gap-2 mt-3 pt-2">
            {!revealedPhonetic ? (
              <button
                onClick={() => setRevealedPhonetic(true)}
                className="text-xs text-slate-400 hover:text-indigo-300 underline underline-offset-4"
              >
                Show Phonetic Hint
              </button>
            ) : (
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                {currentWord.phonetic}
              </span>
            )}

            {currentWord.hint && !revealedHint && (
              <button
                onClick={() => setRevealedHint(true)}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 ml-3"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Mnemonic Rule</span>
              </button>
            )}
          </div>

          {revealedHint && currentWord.hint && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left">
              💡 {currentWord.hint}
            </div>
          )}
        </div>

        {/* User Answer Letter Slots */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-full">
          {Array.from({ length: currentWord.word.length }).map((_, idx) => {
            const char = userLetters[idx];
            return (
              <button
                key={idx}
                onClick={() => handleRemoveLetterAtIndex(idx)}
                disabled={isAnswered || !char}
                className={`w-11 h-14 sm:w-13 sm:h-16 rounded-2xl border-2 font-black text-xl sm:text-2xl flex items-center justify-center transition-all duration-150 ${
                  char
                    ? isAnswered
                      ? isCorrect
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 scale-105 border-b-4 border-b-emerald-800 shadow-md'
                        : 'bg-rose-600/30 border-rose-500 text-rose-300 border-b-4 border-b-rose-900'
                      : 'bg-slate-800/90 border-indigo-400 text-white shadow-lg border-b-4 border-b-indigo-950 active:scale-95'
                    : 'bg-slate-900/50 border-slate-700/80 border-dashed text-transparent'
                }`}
              >
                {char || ''}
              </button>
            );
          })}
        </div>

        {/* Answer Feedback Banner */}
        {isAnswered && (
          <div
            className={`w-full max-w-md p-4 rounded-2xl mb-4 border flex items-center justify-between animate-in zoom-in-95 duration-200 shadow-xl ${
              isCorrect
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                : 'bg-rose-950/70 border-rose-500/60 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-7 h-7 text-rose-400 shrink-0" />
              )}
              <div>
                <p className="font-extrabold text-base">
                  {isCorrect ? 'Spellcraft Mastered!' : `Correct: ${currentWord.word.toUpperCase()}`}
                </p>
                <p className="text-xs text-slate-300 font-mono">{currentWord.phonetic}</p>
              </div>
            </div>

            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl transition ${
                isBookmarked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Save to Word Vault"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scrambled Letter Bank */}
        {!isAnswered ? (
          <div className="w-full max-w-md">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-5">
              {scrambledBank.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleSelectTile(tile.id)}
                  disabled={tile.used}
                  className={`w-11 h-13 sm:w-13 sm:h-15 rounded-2xl font-black text-xl sm:text-2xl transition-all duration-100 flex items-center justify-center select-none ${
                    tile.used
                      ? 'bg-slate-900/40 border border-slate-800 text-slate-700 opacity-20 cursor-not-allowed scale-95'
                      : 'bg-slate-800 hover:bg-indigo-600 border-2 border-indigo-500/40 hover:border-indigo-400 text-white shadow-md border-b-4 border-b-slate-950 active:border-b-0 active:translate-y-1'
                  }`}
                >
                  {tile.char}
                </button>
              ))}
            </div>

            {/* Quick Action Buttons: Backspace, Hint, Clear, Shuffle */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <button
                onClick={handleRemoveLastLetter}
                disabled={userLetters.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition active:scale-95 shadow-sm"
              >
                <Delete className="w-4 h-4" />
                <span>Backspace</span>
              </button>

              <button
                onClick={handleRevealHintLetter}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition active:scale-95 shadow-sm"
              >
                {hintCoins > 0 ? (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    <span>Hint ({hintCoins})</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>Free Hints (Ad)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShuffle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition active:scale-95 shadow-sm"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </button>

              <button
                onClick={handleClearAll}
                disabled={userLetters.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleNext}
            className="w-full max-w-sm py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <span>{currentIndex + 1 < items.length ? 'Next Word' : 'Complete Quest'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Control Hint Line */}
      <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
        Physical Keyboard or Touch Friendly · Tap letters or type A-Z · Backspace to erase
      </div>

      {showHintAdModal && (
        <RewardedAdModal
          rewardLabel="+3 Hint Coins"
          onCancel={() => setShowHintAdModal(false)}
          onClaimReward={() => {
            const updated = GameStorage.addHintCoins(3);
            setHintCoins(updated.hintCoins ?? 3);
            setShowHintAdModal(false);
            const spent = GameStorage.spendHintCoin();
            if (spent.success) {
              setHintCoins(spent.remaining);
              revealNextHintLetter();
            }
          }}
        />
      )}
    </div>
  );
};
