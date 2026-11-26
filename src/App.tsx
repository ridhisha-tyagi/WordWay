import React, { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  DifficultyLevel,
  EXAM_TIERS,
  SPELLING_BANK,
  VOCAB_BANK,
  GRAMMAR_BANK,
} from './data/wordBank';
import { TIER_LEVELS, TierLevelStage } from './data/tierLevels';
import { GameStorage, UserStats, calculateLevel } from './services/gameState';
import {
  CloudSyncStatus,
  pullAndMergeCloudProfile,
  pushCloudProfile,
} from './services/cloudSync';
import { AdService } from './services/ads';
import { sound } from './services/sound';
import { auth, signInWithGoogle, signOutPlayer } from './services/firebase';
import {
  getCurrentSeasonId,
  getSavedPlayerAlias,
  recordWeeklyArenaScore,
  syncMyLeaderboardScore,
  syncMyWeeklyLeaderboardScore,
} from './services/leaderboard';
import {
  buildChallengeUrl,
  clearChallengeFromUrl,
  FriendChallenge,
  generateArenaSeed,
  readChallengeFromUrl,
} from './services/challenge';
import { ThemeId, THEMES, getSavedTheme, saveTheme } from './services/theme';
import { StartScreen } from './components/StartScreen';
import {
  TitleHub,
  GameModeKey,
  HubTab,
  RoundSizeOption,
  TopicFilterOption,
} from './components/TitleHub';
import { RealmModal, SettingsModal } from './components/GameModals';
import { SpellGame } from './components/SpellGame';
import { VocabGame } from './components/VocabGame';
import { GrammarGame } from './components/GrammarGame';
import { SpeedArena } from './components/SpeedArena';
import { DailyQuest } from './components/DailyQuest';
import { WordVault } from './components/WordVault';
import { VictoryModal } from './components/VictoryModal';
import { InterstitialAdModal } from './components/AdUnits';
import { OfflineIndicator } from './components/OfflineIndicator';
import { WordMatchPuzzle } from './components/puzzles/WordMatchPuzzle';
import { BugZapPuzzle } from './components/puzzles/BugZapPuzzle';
import { SentenceJigsawPuzzle } from './components/puzzles/SentenceJigsawPuzzle';
import { OddOneOutPuzzle } from './components/puzzles/OddOneOutPuzzle';
import { GlobalLeaderboard } from './components/GlobalLeaderboard';

type ActiveScreen =
  | 'start'
  | 'hub'
  | 'leaderboard'
  | 'spell'
  | 'vocab'
  | 'grammar'
  | 'arena'
  | 'daily'
  | 'vault'
  | 'word_match'
  | 'bug_zap'
  | 'jigsaw'
  | 'odd_one';

interface VictoryState {
  modeTitle: string;
  score: number;
  total: number;
  xpEarned: number;
  isHighScore?: boolean;
  arenaSeed?: number;
  challengeResult?: {
    challengerName: string;
    targetScore: number;
  };
}

export default function App() {
  const [stats, setStats] = useState<UserStats>(GameStorage.load());
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    stats.savedDifficulty || 'ssc_chsl'
  );
  const [selectedSubLevelId, setSelectedSubLevelId] = useState<string>(() => {
    const initialTier =
      EXAM_TIERS.find(
        (t) =>
          t.id === (stats.savedDifficulty || 'ssc_chsl') ||
          t.subLevels?.some((s) => s.targetDifficulty === (stats.savedDifficulty || 'ssc_chsl'))
      ) || EXAM_TIERS[2];
    if (
      stats.savedSubLevelId &&
      initialTier.subLevels?.some((s) => s.id === stats.savedSubLevelId)
    ) {
      return stats.savedSubLevelId;
    }
    const sub = initialTier.subLevels?.find(
      (s) => s.targetDifficulty === (stats.savedDifficulty || 'ssc_chsl')
    );
    return sub?.id || initialTier.subLevels?.[0]?.id || '';
  });

  const [theme, setTheme] = useState<ThemeId>(getSavedTheme());
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('start');
  const [hubTab, setHubTab] = useState<HubTab>('roadmap');
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [victoryState, setVictoryState] = useState<VictoryState | null>(null);
  const [showRealmModal, setShowRealmModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [roundSize, setRoundSize] = useState<RoundSizeOption>(5);
  const [topicFilter, setTopicFilter] = useState<TopicFilterOption>('all');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [pendingInterstitial, setPendingInterstitial] = useState(false);
  const [interstitialAction, setInterstitialAction] = useState<(() => void) | null>(null);
  const [activeStageContext, setActiveStageContext] = useState<{
    tierId: string;
    stage: TierLevelStage;
  } | null>(null);
  const [lastStageContext, setLastStageContext] = useState<{
    tierId: string;
    stage: TierLevelStage;
  } | null>(null);
  const [cloudUser, setCloudUser] = useState<User | null>(() => auth.currentUser);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [pendingChallenge, setPendingChallenge] = useState<FriendChallenge | null>(() =>
    readChallengeFromUrl()
  );
  const [activeChallenge, setActiveChallenge] = useState<FriendChallenge | null>(null);

  const applyMergedStats = (merged: UserStats) => {
    setStats(merged);
    if (merged.savedDifficulty) {
      setDifficulty(merged.savedDifficulty);
      const tier = EXAM_TIERS.find(
        (t) =>
          t.id === merged.savedDifficulty ||
          t.subLevels?.some((s) => s.targetDifficulty === merged.savedDifficulty)
      );
      if (tier) {
        const matchedSub =
          tier.subLevels?.find((s) => s.id === merged.savedSubLevelId) ||
          tier.subLevels?.find((s) => s.targetDifficulty === merged.savedDifficulty) ||
          tier.subLevels?.[0];
        if (matchedSub) setSelectedSubLevelId(matchedSub.id);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;
      setCloudUser(firebaseUser);
      if (firebaseUser && firebaseUser.emailVerified) {
        setCloudSyncStatus('syncing');
        setCloudSyncError(null);
        try {
          const merged = await pullAndMergeCloudProfile();
          if (!cancelled && merged) {
            applyMergedStats(merged);
            setCloudSyncStatus('synced');
            setLastSyncedAt(Date.now());
          }
        } catch (err) {
          if (!cancelled) {
            setCloudSyncStatus('error');
            setCloudSyncError(
              err instanceof Error
                ? 'Cloud sync temporarily unavailable. Progress is safe locally.'
                : 'Unable to sync cloud save.'
            );
          }
        }
      } else {
        setCloudSyncStatus('idle');
        setLastSyncedAt(null);
        setCloudSyncError(null);
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const handleCloudSignIn = async () => {
    setCloudSyncError(null);
    setCloudSyncStatus('syncing');
    try {
      const user = await signInWithGoogle();
      setCloudUser(user);
      if (user.emailVerified) {
        const merged = await pullAndMergeCloudProfile();
        if (merged) {
          applyMergedStats(merged);
        }
        setCloudSyncStatus('synced');
        setLastSyncedAt(Date.now());
      } else {
        setCloudSyncStatus('error');
        setCloudSyncError('Verified Google email is required for cloud sync.');
      }
    } catch {
      setCloudSyncStatus('error');
      setCloudSyncError('Google sign-in was cancelled or blocked.');
    }
  };

  const handleManualCloudSync = async () => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) return;
    setCloudSyncStatus('syncing');
    setCloudSyncError(null);
    try {
      const merged = await pullAndMergeCloudProfile();
      if (merged) {
        applyMergedStats(merged);
      } else {
        await pushCloudProfile(GameStorage.load());
      }
      setCloudSyncStatus('synced');
      setLastSyncedAt(Date.now());
    } catch {
      setCloudSyncStatus('error');
      setCloudSyncError('Cloud sync failed. Your progress remains saved on this device.');
    }
  };

  const handleCloudSignOut = async () => {
    try {
      await signOutPlayer();
      setCloudUser(null);
      setCloudSyncStatus('idle');
      setLastSyncedAt(null);
      setCloudSyncError(null);
    } catch {
      setCloudSyncError('Unable to sign out right now.');
    }
  };

  const handleSetTheme = (newTheme: ThemeId) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const handleSetRealmAndSubLevel = (d: DifficultyLevel, subId: string) => {
    setDifficulty(d);
    setSelectedSubLevelId(subId);
    const updated = { ...stats, savedDifficulty: d, savedSubLevelId: subId };
    setStats(updated);
    GameStorage.save(updated);
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const refreshStats = () => {
    setStats(GameStorage.load());
  };

  const completeActiveStageIfAny = () => {
    if (activeStageContext) {
      GameStorage.markStageCompleted(
        activeStageContext.tierId,
        activeStageContext.stage.levelNumber
      );
      setLastStageContext(activeStageContext);
      setActiveStageContext(null);
    } else {
      setLastStageContext(null);
    }
    refreshStats();
  };

  const shuffleDeck = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const isItemMatchingDifficulty = (
    itemDifficulty: DifficultyLevel,
    target: DifficultyLevel
  ): boolean => {
    if (itemDifficulty === target) return true;
    if (target === 'ssc_exams') {
      return (
        itemDifficulty === 'ssc_chsl' ||
        itemDifficulty === 'ssc_cgl' ||
        itemDifficulty === 'ssc_exams'
      );
    }
    if (target === 'college_placement' || target === 'college_entry') {
      return (
        itemDifficulty === 'college_placement' ||
        itemDifficulty === 'college_entry'
      );
    }
    if (target === 'gate_aptitude') {
      return itemDifficulty === 'gate_aptitude' || itemDifficulty === 'ssc_cgl';
    }
    if (target === 'defence_cds') {
      return itemDifficulty === 'defence_cds' || itemDifficulty === 'ssc_cgl';
    }
    if (target === 'ielts_clat') {
      return itemDifficulty === 'ielts_clat' || itemDifficulty === 'cat_upsc';
    }
    return false;
  };

  const spellingItems = useMemo(() => {
    const exact = shuffleDeck(
      SPELLING_BANK.filter((item) =>
        isItemMatchingDifficulty(item.difficulty, difficulty)
      )
    );
    const others = shuffleDeck(
      SPELLING_BANK.filter(
        (item) => !isItemMatchingDifficulty(item.difficulty, difficulty)
      )
    );
    return [...exact, ...others].slice(0, roundSize);
  }, [difficulty, roundSize, shuffleSeed]);

  const vocabItems = useMemo(() => {
    const matchesTopic = (item: (typeof VOCAB_BANK)[number]) => {
      if (topicFilter === 'ows_idioms') {
        return (
          item.categoryType === 'One Word Substitution' ||
          item.categoryType === 'Idiom & Phrase'
        );
      }
      if (topicFilter === 'vocab') {
        return !item.categoryType || item.categoryType === 'Vocab';
      }
      return true;
    };

    const topicFiltered = VOCAB_BANK.filter(matchesTopic);
    const exact = shuffleDeck(
      topicFiltered.filter((item) =>
        isItemMatchingDifficulty(item.difficulty, difficulty)
      )
    );
    const sameTopicOthers = shuffleDeck(
      topicFiltered.filter(
        (item) => !isItemMatchingDifficulty(item.difficulty, difficulty)
      )
    );
    const remaining = shuffleDeck(
      VOCAB_BANK.filter((item) => !matchesTopic(item))
    );
    return [...exact, ...sameTopicOthers, ...remaining].slice(0, roundSize);
  }, [difficulty, roundSize, topicFilter, shuffleSeed]);

  const grammarItems = useMemo(() => {
    const exact = shuffleDeck(
      GRAMMAR_BANK.filter((item) =>
        isItemMatchingDifficulty(item.difficulty, difficulty)
      )
    );
    const others = shuffleDeck(
      GRAMMAR_BANK.filter(
        (item) => !isItemMatchingDifficulty(item.difficulty, difficulty)
      )
    );
    return [...exact, ...others].slice(0, roundSize);
  }, [difficulty, roundSize, shuffleSeed]);

  const currentTierBadge = useMemo(() => {
    const tier = EXAM_TIERS.find(
      (t) =>
        t.id === difficulty ||
        t.subLevels?.some((s) => s.targetDifficulty === difficulty)
    );
    const sub = tier?.subLevels?.find((s) => s.targetDifficulty === difficulty);
    return sub ? `${tier?.badge}: ${sub.badge}` : tier?.badge || 'SSC';
  }, [difficulty]);

  const handleSelectMode = (
    mode: GameModeKey,
    stageContext?: { tierId: string; stage: TierLevelStage }
  ) => {
    setLastStageContext(null);
    setActiveStageContext(stageContext || null);
    setShuffleSeed((s) => s + 1);
    setActiveScreen(mode);
  };

  const recordRoundCompletion = (victory: VictoryState, wordsCount?: number) => {
    GameStorage.recordSessionWords(wordsCount ?? victory.total);
    completeActiveStageIfAny();
    const shouldShowBreak = AdService.recordRoundCompleted(Boolean(stats.adFreePass));
    setPendingInterstitial(shouldShowBreak);
    setVictoryState(victory);
  };

  const handleFinishSpell = (res: {
    score: number;
    total: number;
    xpEarned: number;
  }) => {
    recordRoundCompletion({
      modeTitle: `Tile Scramble (${currentTierBadge})`,
      score: res.score,
      total: res.total,
      xpEarned: res.xpEarned,
    });
  };

  const handleFinishVocab = (res: {
    score: number;
    total: number;
    xpEarned: number;
  }) => {
    recordRoundCompletion({
      modeTitle: `Vocab & OWS (${currentTierBadge})`,
      score: res.score,
      total: res.total,
      xpEarned: res.xpEarned,
    });
  };

  const handleFinishGrammar = (res: {
    score: number;
    total: number;
    xpEarned: number;
  }) => {
    recordRoundCompletion({
      modeTitle: `Error Spotting (${currentTierBadge})`,
      score: res.score,
      total: res.total,
      xpEarned: res.xpEarned,
    });
  };

  const handleFinishArena = (res: {
    score: number;
    total: number;
    xpEarned: number;
    isHighScore: boolean;
    seed: number;
  }) => {
    const seasonId = getCurrentSeasonId();
    const weeklyBest = recordWeeklyArenaScore(res.score, seasonId);
    const completedChallenge = activeChallenge;
    setActiveChallenge(null);

    recordRoundCompletion({
      modeTitle: completedChallenge
        ? `Friend Duel (${completedChallenge.realmBadge})`
        : `Puzzle Blitz (60s)`,
      score: res.score,
      total: res.total,
      xpEarned: res.xpEarned,
      isHighScore: res.isHighScore,
      arenaSeed: res.seed,
      challengeResult: completedChallenge
        ? {
            challengerName: completedChallenge.challengerName,
            targetScore: completedChallenge.targetScore,
          }
        : undefined,
    });

    if (auth.currentUser?.emailVerified) {
      const latestStats = GameStorage.load();
      const { level } = calculateLevel(latestStats.xp);
      const displayName = getSavedPlayerAlias(auth.currentUser.displayName);
      const wordsLearned =
        latestStats.wordsLearnedCount ?? latestStats.wordsMasteredCount ?? 0;

      void syncMyLeaderboardScore({
        displayName,
        realmBadge: currentTierBadge,
        level,
        highScore: Math.max(latestStats.speedArenaHighScore, res.score),
        wordsLearned,
      }).catch(() => {
        // Non-blocking background sync
      });

      void syncMyWeeklyLeaderboardScore({
        seasonId,
        displayName,
        realmBadge: currentTierBadge,
        level,
        highScore: weeklyBest,
        wordsLearned,
      }).catch(() => {
        // Non-blocking background sync
      });
    }
  };

  const handleFinishDaily = (res: {
    score: number;
    total: number;
    xpEarned: number;
  }) => {
    recordRoundCompletion({
      modeTitle: `Daily WordWay Quest`,
      score: res.score,
      total: res.total,
      xpEarned: res.xpEarned,
    });
  };

  const handleFinishWordMatch = (res: {
    score: number;
    total: number;
    xpEarned: number;
  }) => {
    recordRoundCompletion(
      {
        modeTitle: `Word Match Solved!`,
        score: res.score,
        total: res.total,
        xpEarned: res.xpEarned,
      },
      res.total * 4
    );
  };

  const handleFinishBugZap = (res: {
    score: number;
    total: number;
    xpEarned: number;
  }) => {
    recordRoundCompletion({
      modeTitle: `Bug Zap Solved!`,
      score: res.score,
      total: res.total,
      xpEarned: res.xpEarned,
    });
  };

  const handleFinishJigsaw = (res: {
    score: number;
    total: number;
    xpEarned: number;
  }) => {
    recordRoundCompletion({
      modeTitle: `Sentence Jigsaw Solved!`,
      score: res.score,
      total: res.total,
      xpEarned: res.xpEarned,
    });
  };

  const handleFinishOddOne = (res: {
    score: number;
    total: number;
    xpEarned: number;
  }) => {
    recordRoundCompletion({
      modeTitle: `Intruder Spotted!`,
      score: res.score,
      total: res.total,
      xpEarned: res.xpEarned,
    });
  };

  const nextStageOption = useMemo(() => {
    if (!lastStageContext) return null;
    const stages =
      TIER_LEVELS[difficulty] ||
      TIER_LEVELS[lastStageContext.tierId as DifficultyLevel] ||
      TIER_LEVELS.ssc_exams;
    const nextNum = lastStageContext.stage.levelNumber + 1;
    const nextStage = stages.find((s) => s.levelNumber === nextNum);
    if (!nextStage) return null;
    return {
      tierId: lastStageContext.tierId,
      stage: nextStage,
    };
  }, [lastStageContext, difficulty]);

  const runWithOptionalInterstitial = (nextAction: () => void) => {
    if (pendingInterstitial && !stats.adFreePass) {
      setPendingInterstitial(false);
      setVictoryState(null);
      setInterstitialAction(() => nextAction);
    } else {
      nextAction();
    }
  };

  const handleReplayCurrentMode = () => {
    runWithOptionalInterstitial(() => {
      setVictoryState(null);
      if (lastStageContext) {
        setActiveStageContext(lastStageContext);
      }
      setShuffleSeed((s) => s + 1);
    });
  };

  const handleNextStage = () => {
    if (!nextStageOption) return;
    runWithOptionalInterstitial(() => {
      setVictoryState(null);
      setLastStageContext(null);
      setActiveStageContext(nextStageOption);
      setShuffleSeed((s) => s + 1);
      setActiveScreen(nextStageOption.stage.puzzleMode);
    });
  };

  const handleGoHomeFromVictory = () => {
    runWithOptionalInterstitial(() => {
      setVictoryState(null);
      setActiveStageContext(null);
      setLastStageContext(null);
      setActiveScreen('hub');
      refreshStats();
    });
  };

  const handleGoHome = () => {
    setVictoryState(null);
    setActiveStageContext(null);
    setLastStageContext(null);
    setActiveScreen('hub');
    refreshStats();
  };

  const currentTheme = THEMES[theme] || THEMES.midnight;
  const usesUserTheme =
    activeScreen === 'start' ||
    activeScreen === 'hub' ||
    activeScreen === 'leaderboard' ||
    activeScreen === 'vault';

  return (
    <main
      className={`min-h-screen ${
        usesUserTheme
          ? `${currentTheme.bgClass} ${currentTheme.textPrimary}`
          : 'bg-[#060b13] text-slate-100'
      } flex flex-col justify-between antialiased transition-colors duration-200 selection:bg-indigo-500 selection:text-white`}
    >
      {/* Background ambient gradient glow */}
      {(theme === 'midnight' || !usesUserTheme) && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[350px] bg-teal-600/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Screen Router */}
      <div className="w-full flex-1 flex flex-col justify-start">
        {activeScreen === 'start' && (
          <StartScreen
            stats={stats}
            difficulty={difficulty}
            selectedSubLevelId={selectedSubLevelId}
            theme={theme}
            isMuted={isMuted}
            pendingChallenge={pendingChallenge}
            onAcceptChallenge={() => {
              if (!pendingChallenge) return;
              const target = pendingChallenge;
              setPendingChallenge(null);
              clearChallengeFromUrl();
              setActiveChallenge(target);
              setShuffleSeed((s) => s + 1);
              setActiveScreen('arena');
            }}
            onDismissChallenge={() => {
              setPendingChallenge(null);
              clearChallengeFromUrl();
            }}
            onToggleMute={handleToggleMute}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenRealmPicker={() => setShowRealmModal(true)}
            onStartHub={(tab = 'roadmap') => {
              setHubTab(tab);
              setActiveScreen('hub');
            }}
            onQuickPlayDaily={() => {
              setHubTab('roadmap');
              handleSelectMode('daily');
            }}
            onOpenLeaderboard={() => setActiveScreen('leaderboard')}
          />
        )}

        {activeScreen === 'hub' && (
          <TitleHub
            stats={stats}
            difficulty={difficulty}
            selectedSubLevelId={selectedSubLevelId}
            activeTab={hubTab}
            onTabChange={setHubTab}
            roundSize={roundSize}
            onSetRoundSize={setRoundSize}
            topicFilter={topicFilter}
            onSetTopicFilter={setTopicFilter}
            onOpenRealmPicker={() => setShowRealmModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onReturnToTitle={() => setActiveScreen('start')}
            onClaimRewardedChest={() => {
              GameStorage.addHintCoins(3);
              GameStorage.addXp(50);
              refreshStats();
            }}
            onClaimAchievement={(achievementId, xpReward) => {
              GameStorage.claimAchievement(achievementId, xpReward);
              refreshStats();
            }}
            onOpenLeaderboard={() => setActiveScreen('leaderboard')}
            onSelectMode={handleSelectMode}
            theme={theme}
            cloudUser={cloudUser}
            cloudSyncStatus={cloudSyncStatus}
            lastSyncedAt={lastSyncedAt}
            cloudSyncError={cloudSyncError}
            onCloudSignIn={handleCloudSignIn}
            onCloudSyncNow={handleManualCloudSync}
            onCloudSignOut={handleCloudSignOut}
          />
        )}

        {activeScreen === 'leaderboard' && (
          <GlobalLeaderboard
            stats={stats}
            difficulty={difficulty}
            realmBadge={currentTierBadge}
            theme={theme}
            onBack={() => setActiveScreen('hub')}
            onLaunchArena={() => handleSelectMode('arena')}
          />
        )}

        {activeScreen === 'spell' && (
          <SpellGame
            key={`spell_${shuffleSeed}`}
            items={spellingItems}
            difficulty={difficulty}
            onFinish={handleFinishSpell}
            onExit={handleGoHome}
          />
        )}

        {activeScreen === 'word_match' && (
          <WordMatchPuzzle
            key={`word_match_${shuffleSeed}`}
            onBack={handleGoHome}
            onFinish={handleFinishWordMatch}
            roundSize={roundSize}
          />
        )}

        {activeScreen === 'bug_zap' && (
          <BugZapPuzzle
            key={`bug_zap_${shuffleSeed}`}
            onBack={handleGoHome}
            onFinish={handleFinishBugZap}
            roundSize={roundSize}
          />
        )}

        {activeScreen === 'jigsaw' && (
          <SentenceJigsawPuzzle
            key={`jigsaw_${shuffleSeed}`}
            onBack={handleGoHome}
            onFinish={handleFinishJigsaw}
            roundSize={roundSize}
          />
        )}

        {activeScreen === 'odd_one' && (
          <OddOneOutPuzzle
            key={`odd_one_${shuffleSeed}`}
            onBack={handleGoHome}
            onFinish={handleFinishOddOne}
            roundSize={roundSize}
          />
        )}

        {activeScreen === 'vocab' && (
          <VocabGame
            key={`vocab_${shuffleSeed}`}
            items={vocabItems}
            difficulty={difficulty}
            onFinish={handleFinishVocab}
            onExit={handleGoHome}
          />
        )}

        {activeScreen === 'grammar' && (
          <GrammarGame
            key={`grammar_${shuffleSeed}`}
            items={grammarItems}
            difficulty={difficulty}
            onFinish={handleFinishGrammar}
            onExit={handleGoHome}
          />
        )}

        {activeScreen === 'arena' && (
          <SpeedArena
            key={`arena_${shuffleSeed}`}
            difficulty={difficulty}
            challenge={activeChallenge}
            onFinish={handleFinishArena}
            onExit={() => {
              setActiveChallenge(null);
              handleGoHome();
            }}
          />
        )}

        {activeScreen === 'daily' && (
          <DailyQuest
            key={`daily_${shuffleSeed}`}
            difficulty={difficulty}
            onFinish={handleFinishDaily}
            onExit={handleGoHome}
          />
        )}

        {activeScreen === 'vault' && (
          <WordVault onBack={handleGoHome} theme={theme} />
        )}
      </div>

      {/* Global Overlays: Realm Picker & System Settings */}
      {showRealmModal && (
        <RealmModal
          difficulty={difficulty}
          selectedSubLevelId={selectedSubLevelId}
          onSelectRealmAndSubLevel={handleSetRealmAndSubLevel}
          onClose={() => setShowRealmModal(false)}
          theme={theme}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          theme={theme}
          onSetTheme={handleSetTheme}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          adFreePass={Boolean(stats.adFreePass)}
          onToggleAdFree={() => {
            GameStorage.setAdFreePass(!stats.adFreePass);
            refreshStats();
          }}
          cloudUser={cloudUser}
          cloudSyncStatus={cloudSyncStatus}
          lastSyncedAt={lastSyncedAt}
          cloudSyncError={cloudSyncError}
          onCloudSignIn={handleCloudSignIn}
          onCloudSyncNow={handleManualCloudSync}
          onCloudSignOut={handleCloudSignOut}
          onReturnToTitle={
            activeScreen !== 'start'
              ? () => setActiveScreen('start')
              : undefined
          }
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Layer 4: Victory / Round Summary Modal */}
      {victoryState && (
        <VictoryModal
          modeTitle={victoryState.modeTitle}
          score={victoryState.score}
          total={victoryState.total}
          xpEarned={victoryState.xpEarned}
          totalXp={stats.xp}
          isHighScore={victoryState.isHighScore}
          adFree={Boolean(stats.adFreePass)}
          nextStageLabel={
            nextStageOption
              ? `Stage ${nextStageOption.stage.levelNumber}: ${nextStageOption.stage.title}`
              : undefined
          }
          challengeResult={victoryState.challengeResult}
          onNextStage={nextStageOption ? handleNextStage : undefined}
          onViewLeaderboard={
            victoryState.modeTitle.includes('Puzzle Blitz') ||
            victoryState.modeTitle.includes('Friend Duel')
              ? () => {
                  runWithOptionalInterstitial(() => {
                    setVictoryState(null);
                    setActiveScreen('leaderboard');
                  });
                }
              : undefined
          }
          onCopyChallengeLink={
            victoryState.arenaSeed !== undefined
              ? async () => {
                  const url = buildChallengeUrl({
                    seed: victoryState.arenaSeed ?? generateArenaSeed(),
                    difficulty,
                    challengerName: getSavedPlayerAlias(cloudUser?.displayName),
                    targetScore: victoryState.score,
                    realmBadge: currentTierBadge,
                    createdAt: Date.now(),
                  });
                  try {
                    await navigator.clipboard.writeText(url);
                    return true;
                  } catch {
                    try {
                      const temp = document.createElement('input');
                      temp.value = url;
                      document.body.appendChild(temp);
                      temp.select();
                      document.execCommand('copy');
                      document.body.removeChild(temp);
                      return true;
                    } catch {
                      return false;
                    }
                  }
                }
              : undefined
          }
          onClaimDoubleXp={(bonusXp) => {
            GameStorage.addXp(bonusXp);
            refreshStats();
          }}
          onPlayAgain={handleReplayCurrentMode}
          onHome={handleGoHomeFromVictory}
        />
      )}

      {/* Natural Break Interstitial Ad (Every 2 Completed Rounds) */}
      {interstitialAction && (
        <InterstitialAdModal
          onContinue={() => {
            const action = interstitialAction;
            setInterstitialAction(null);
            action();
          }}
          onGoAdFree={() => {
            const action = interstitialAction;
            setInterstitialAction(null);
            action();
            setShowSettingsModal(true);
          }}
        />
      )}

      {/* Non-intrusive Offline Indicator */}
      <OfflineIndicator />
    </main>
  );
}
