import React, { useState, useEffect, useRef } from 'react';
import { Zap, Timer, Flame, Swords } from 'lucide-react';
import { SPELLING_BANK, VOCAB_BANK, GRAMMAR_BANK, DifficultyLevel } from '../data/wordBank';
import { sound } from '../services/sound';
import { GameStorage } from '../services/gameState';
import {
  createSeededRng,
  FriendChallenge,
  generateArenaSeed,
} from '../services/challenge';

interface SpeedArenaProps {
  difficulty: DifficultyLevel;
  challenge?: FriendChallenge | null;
  onFinish: (results: {
    score: number;
    total: number;
    xpEarned: number;
    isHighScore: boolean;
    seed: number;
  }) => void;
  onExit: () => void;
}

type QuestionType =
  | { type: 'spelling'; word: string; prompt: string; options: string[]; correctIdx: number; hint: string }
  | { type: 'vocab'; word: string; prompt: string; options: string[]; correctIdx: number; hint: string }
  | { type: 'grammar'; prompt: string; sentence: string; options: string[]; correctIdx: number; hint: string };

export const SpeedArena: React.FC<SpeedArenaProps> = ({
  difficulty,
  challenge,
  onFinish,
  onExit,
}) => {
  const effectiveDifficulty = challenge?.difficulty || difficulty;
  const activeSeedRef = useRef<number>(challenge?.seed ?? generateArenaSeed());
  const rngRef = useRef<() => number>(createSeededRng(activeSeedRef.current));

  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentQ, setCurrentQ] = useState<QuestionType | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFinishedRef = useRef(false);

  // Generate a deterministic or random speed question aligned to current exam tier
  const generateQuestion = (): QuestionType => {
    const rand = rngRef.current;
    const pickType = Math.floor(rand() * 3);

    if (pickType === 0) {
      const matched = SPELLING_BANK.filter((i) => i.difficulty === effectiveDifficulty);
      const pool = matched.length > 0 && rand() > 0.3 ? matched : SPELLING_BANK;
      const item = pool[Math.floor(rand() * pool.length)];
      const distractors = item.distractors.slice(0, 3);
      const allChoices = [item.word, ...distractors];
      for (let i = allChoices.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
      }
      return {
        type: 'spelling',
        word: item.word,
        prompt: `Spot the correct spelling:`,
        options: allChoices,
        correctIdx: allChoices.indexOf(item.word),
        hint: item.definition,
      };
    } else if (pickType === 1) {
      const matched = VOCAB_BANK.filter((i) => i.difficulty === effectiveDifficulty);
      const pool = matched.length > 0 && rand() > 0.3 ? matched : VOCAB_BANK;
      const item = pool[Math.floor(rand() * pool.length)];
      return {
        type: 'vocab',
        word: item.word,
        prompt:
          item.categoryType === 'One Word Substitution'
            ? `One Word for: "${item.definition}"`
            : `Meaning of "${item.word.toUpperCase()}":`,
        options: item.options,
        correctIdx: item.correctOptionIndex,
        hint: item.partOfSpeech,
      };
    } else {
      const matched = GRAMMAR_BANK.filter((i) => i.difficulty === effectiveDifficulty);
      const pool = matched.length > 0 && rand() > 0.3 ? matched : GRAMMAR_BANK;
      const item = pool[Math.floor(rand() * pool.length)];
      return {
        type: 'grammar',
        prompt: item.prompt,
        sentence: item.sentence,
        options: item.options,
        correctIdx: item.correctOptionIndex,
        hint: item.examTag || item.category,
      };
    }
  };

  useEffect(() => {
    setCurrentQ(generateQuestion());

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // When timer hits zero, finalize arena once
  useEffect(() => {
    if (timeLeft === 0 && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      const xpEarned = Math.round(score / 4) + 60;
      const isNewHigh = GameStorage.recordArenaScore(score, xpEarned);
      sound.playVictory();
      onFinish({
        score: Math.round(score),
        total: questionsAnswered,
        xpEarned,
        isHighScore: isNewHigh,
        seed: activeSeedRef.current,
      });
    }
  }, [timeLeft, score, questionsAnswered, onFinish]);

  const handleSelectOption = (idx: number) => {
    if (!currentQ || timeLeft <= 0) return;

    const isCorrect = idx === currentQ.correctIdx;
    setQuestionsAnswered((prev) => prev + 1);

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      sound.playCorrect(newCombo);
      const multiplier = Math.min(1 + newCombo * 0.25, 4.0);
      setScore((prev) => prev + Math.round(150 * multiplier));
      setFeedback('correct');
    } else {
      setCombo(0);
      sound.playWrong();
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentQ(generateQuestion());
    }, 280);
  };

  const multiplier = Math.min(1 + combo * 0.25, 4.0).toFixed(1);
  const deltaFromTarget = challenge ? score - challenge.targetScore : 0;

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col min-h-[82vh] justify-between p-4 pb-8 text-slate-100 select-none">
      {/* Top Arena Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            onClick={onExit}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
          >
            Exit
          </button>

          {/* Timer Box */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-black text-lg tabular-nums shadow-lg transition-colors ${
              timeLeft <= 10
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
            }`}
          >
            <Timer className="w-5 h-5" />
            <span>{timeLeft}s</span>
          </div>

          {/* Score & Combo */}
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{multiplier}x Multiplier</span>
            </div>
            <div className="text-xl font-black text-amber-400 tabular-nums">{score}</div>
          </div>
        </div>

        {/* Friend Challenge Live Duel Strip */}
        {challenge && (
          <div className="px-3.5 py-2 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Swords className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-slate-200 truncate">
                Duel vs {challenge.challengerName} · Target {challenge.targetScore.toLocaleString()}
              </span>
            </div>
            <span
              className={`font-black tabular-nums shrink-0 ${
                deltaFromTarget > 0
                  ? 'text-emerald-400'
                  : deltaFromTarget === 0
                  ? 'text-amber-300'
                  : 'text-rose-400'
              }`}
            >
              {deltaFromTarget > 0
                ? `+${deltaFromTarget.toLocaleString()} Ahead`
                : deltaFromTarget === 0
                ? 'Tied'
                : `${Math.abs(deltaFromTarget).toLocaleString()} to beat`}
            </span>
          </div>
        )}
      </div>

      {/* Arena Stage */}
      <div className="flex-1 flex flex-col justify-center my-4">
        {currentQ && (
          <div
            className={`transition-all duration-200 ${
              feedback === 'correct'
                ? 'scale-105'
                : feedback === 'wrong'
                ? 'scale-95'
                : ''
            }`}
          >
            {/* Header Badge */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Speed Challenge: {currentQ.type.toUpperCase()}</span>
              </span>

              <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
                {currentQ.prompt}
              </h2>

              {currentQ.type === 'grammar' && 'sentence' in currentQ && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-base font-medium">
                  "{currentQ.sentence}"
                </div>
              )}
            </div>

            {/* Rapid Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="p-4 rounded-2xl bg-slate-900/90 hover:bg-indigo-600/30 border border-slate-700/80 hover:border-indigo-400 text-left font-bold text-slate-100 transition shadow active:scale-95 flex items-center justify-between border-b-4 border-b-slate-950 active:border-b-0 active:translate-y-1"
                >
                  <span className="text-sm sm:text-base leading-snug">{opt}</span>
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0 ml-2">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
        {challenge
          ? `Seeded Duel Deck · Matched against ${challenge.challengerName}`
          : '60-Second Blitz · Rapid Fire Answers · Maximize your Combo Multiplier!'}
      </div>
    </div>
  );
};
