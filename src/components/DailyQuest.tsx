import React, { useState, useEffect } from 'react';
import { Calendar, Flame, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Volume2 } from 'lucide-react';
import { SPELLING_BANK, VOCAB_BANK, GRAMMAR_BANK, DifficultyLevel } from '../data/wordBank';
import { sound } from '../services/sound';
import { GameStorage, getTodayString } from '../services/gameState';

interface DailyQuestProps {
  difficulty: DifficultyLevel;
  onFinish: (results: { score: number; total: number; xpEarned: number }) => void;
  onExit: () => void;
}

type DailyQuestion =
  | { type: 'spelling'; word: string; sentence: string; options: string[]; correctIdx: number; hint: string }
  | { type: 'vocab'; word: string; sentence: string; options: string[]; correctIdx: number; hint: string }
  | { type: 'grammar'; prompt: string; sentence: string; options: string[]; correctIdx: number; explanation: string };

export const DailyQuest: React.FC<DailyQuestProps> = ({ difficulty, onFinish, onExit }) => {
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Deterministic daily question picker tuned to active difficulty
  useEffect(() => {
    const today = `${getTodayString()}_${difficulty}`;
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const matchesDifficulty = (itemDiff: DifficultyLevel) => {
      if (itemDiff === difficulty) return true;
      if (difficulty === 'ssc_exams') {
        return itemDiff === 'ssc_chsl' || itemDiff === 'ssc_cgl' || itemDiff === 'ssc_exams';
      }
      if (difficulty === 'college_placement' || difficulty === 'college_entry') {
        return itemDiff === 'college_placement' || itemDiff === 'college_entry';
      }
      return false;
    };

    const spPool = SPELLING_BANK.filter((i) => matchesDifficulty(i.difficulty));
    const voPool = VOCAB_BANK.filter((i) => matchesDifficulty(i.difficulty));
    const grPool = GRAMMAR_BANK.filter((i) => matchesDifficulty(i.difficulty));

    const spActive = spPool.length >= 2 ? spPool : [...spPool, ...SPELLING_BANK];
    const voActive = voPool.length >= 2 ? voPool : [...voPool, ...VOCAB_BANK];
    const grActive = grPool.length >= 1 ? grPool : GRAMMAR_BANK;

    // Pick 2 distinct spellings, 2 distinct vocabs, 1 grammar
    const sp1 = spActive[seed % spActive.length];
    const sp2 = spActive[(seed + 1 + Math.floor(spActive.length / 2)) % spActive.length];
    const vo1 = voActive[(seed + 1) % voActive.length];
    const vo2 = voActive[(seed + 2 + Math.floor(voActive.length / 2)) % voActive.length];
    const gr1 = grActive[(seed + 2) % grActive.length];

    const makeSp = (item: typeof sp1): DailyQuestion => {
      const opts = [item.word, ...item.distractors.slice(0, 3)];
      opts.sort();
      return {
        type: 'spelling',
        word: item.word,
        sentence: item.exampleSentence,
        options: opts,
        correctIdx: opts.indexOf(item.word),
        hint: item.definition,
      };
    };

    const makeVo = (item: typeof vo1): DailyQuestion => ({
      type: 'vocab',
      word: item.word,
      sentence: item.contextSentence,
      options: item.options,
      correctIdx: item.correctOptionIndex,
      hint: item.definition,
    });

    const makeGr = (item: typeof gr1): DailyQuestion => ({
      type: 'grammar',
      prompt: item.prompt,
      sentence: item.sentence,
      options: item.options,
      correctIdx: item.correctOptionIndex,
      explanation: item.explanation,
    });

    setQuestions([makeSp(sp1), makeVo(vo1), makeSp(sp2), makeVo(vo2), makeGr(gr1)]);
  }, [difficulty]);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    setSelectedOpt(null);
    setIsAnswered(false);
    if (currentQ && currentQ.type !== 'grammar' && 'word' in currentQ) {
      sound.speak(currentQ.word, 0.88);
    }
  }, [currentIdx, currentQ]);

  const handleSelect = (idx: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIdx;
    if (isCorrect) {
      sound.playCorrect(correctCount + 1);
      setScore((prev) => prev + 200);
      setCorrectCount((prev) => prev + 1);
    } else {
      sound.playWrong();
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Mark daily quest completed in stats
      GameStorage.recordDailyQuestCompleted();

      const xpEarned = score + 100; // Big daily bonus!
      GameStorage.addXp(xpEarned);
      sound.playVictory();
      onFinish({
        score,
        total: questions.length,
        xpEarned,
      });
    }
  };

  if (!currentQ) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col min-h-[82vh] justify-between p-4 pb-8 text-slate-100 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onExit}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
        >
          ← Exit
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Quest · Round {currentIdx + 1} of 5</span>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Score</span>
          <div className="text-sm font-black text-amber-400 tabular-nums">{score}</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex flex-col justify-center my-4">
        <div className="text-center mb-4">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            {currentQ.type} Quest
          </span>

          {currentQ.type === 'spelling' && (
            <div>
              <h2 className="text-2xl font-black font-heading text-white mb-1">
                Which spelling is correct?
              </h2>
              <p className="text-xs text-slate-400 italic mb-2">"{currentQ.sentence}"</p>
              <button
                onClick={() => sound.speak(currentQ.word, 0.85)}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen to pronunciation</span>
              </button>
            </div>
          )}

          {currentQ.type === 'vocab' && (
            <div>
              <h2 className="text-3xl font-black font-heading text-white mb-2">
                {currentQ.word}
              </h2>
              <p className="text-sm text-slate-300 italic mb-1">
                "{currentQ.sentence.replace('___', '______')}"
              </p>
            </div>
          )}

          {currentQ.type === 'grammar' && (
            <div>
              <h2 className="text-xl font-black font-heading text-white mb-2">
                {currentQ.prompt}
              </h2>
              <p className="text-base text-slate-200 font-medium mb-1">
                "{currentQ.sentence}"
              </p>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOpt === idx;
            const isCorrect = idx === currentQ.correctIdx;

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
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between shadow-sm ${btnStyle}`}
              >
                <span className="text-sm sm:text-base leading-snug">{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />}
                {isAnswered && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="animate-in fade-in duration-200">
            {currentQ.type === 'grammar' && 'explanation' in currentQ && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-4">
                💡 {currentQ.explanation}
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <span>{currentIdx + 1 < questions.length ? 'Next Daily Question' : 'Claim Daily Reward'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
        Daily Quests refresh every midnight · Keep your streak flame alive!
      </div>
    </div>
  );
};
