import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  ArrowLeft,
  Check,
  Crown,
  Globe2,
  LogIn,
  LogOut,
  Medal,
  RefreshCw,
  Search,
  Timer,
  Trophy,
  UploadCloud,
  UserCheck,
  Calendar,
  Share2,
} from 'lucide-react';
import { DifficultyLevel } from '../data/wordBank';
import {
  auth,
  signInWithGoogle,
  signOutPlayer,
} from '../services/firebase';
import {
  fetchTop100Leaderboard,
  fetchWeeklyTop100Leaderboard,
  getCurrentSeasonId,
  getSavedPlayerAlias,
  getSavedWeeklyArenaBest,
  getSeasonResetCountdown,
  LeaderboardEntry,
  savePlayerAlias,
  subscribeTop100Leaderboard,
  subscribeWeeklyTop100Leaderboard,
  syncMyLeaderboardScore,
  syncMyWeeklyLeaderboardScore,
} from '../services/leaderboard';
import { buildChallengeUrl, generateArenaSeed } from '../services/challenge';
import { calculateLevel, UserStats } from '../services/gameState';
import { sound } from '../services/sound';
import { ThemeId, THEMES } from '../services/theme';

interface GlobalLeaderboardProps {
  stats: UserStats;
  difficulty: DifficultyLevel;
  realmBadge: string;
  theme: ThemeId;
  onBack: () => void;
  onLaunchArena: () => void;
}

type ScopeFilter = 'top100' | 'top10' | 'realm';
type BoardMode = 'weekly' | 'alltime';

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  stats,
  difficulty,
  realmBadge,
  theme,
  onBack,
  onLaunchArena,
}) => {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [boardMode, setBoardMode] = useState<BoardMode>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState<ScopeFilter>('top100');
  const [aliasInput, setAliasInput] = useState<string>(() =>
    getSavedPlayerAlias(auth.currentUser?.displayName)
  );

  const currentSeasonId = getCurrentSeasonId();
  const seasonCountdown = getSeasonResetCountdown();
  const weeklyLocalBest = getSavedWeeklyArenaBest(currentSeasonId);

  const currentTheme = THEMES[theme] || THEMES.midnight;
  const isLight = theme === 'clean_light' || theme === 'parchment';
  const { level } = calculateLevel(stats.xp);
  const wordsLearned = stats.wordsLearnedCount ?? stats.wordsMasteredCount ?? 0;

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setAliasInput(getSavedPlayerAlias(firebaseUser.displayName));
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time All-Time or Weekly Top 100 leaderboard
  useEffect(() => {
    setIsLoading(true);
    setErrorMsg(null);
    const unsub =
      boardMode === 'weekly'
        ? subscribeWeeklyTop100Leaderboard(
            currentSeasonId,
            (liveEntries) => {
              setEntries(liveEntries);
              setIsLoading(false);
            },
            (err) => {
              setErrorMsg(err.message || 'Unable to load weekly rankings.');
              setIsLoading(false);
            }
          )
        : subscribeTop100Leaderboard(
            (liveEntries) => {
              setEntries(liveEntries);
              setIsLoading(false);
            },
            (err) => {
              setErrorMsg(err.message || 'Unable to load leaderboard records.');
              setIsLoading(false);
            }
          );
    return () => unsub();
  }, [boardMode, currentSeasonId]);

  // Auto-sync verified signed-in user's Speed Arena best when viewing leaderboard
  useEffect(() => {
    if (!user || !user.emailVerified) return;
    let cancelled = false;
    const tasks: Promise<unknown>[] = [];
    if (stats.speedArenaHighScore > 0) {
      tasks.push(
        syncMyLeaderboardScore({
          displayName: getSavedPlayerAlias(user.displayName),
          realmBadge,
          level,
          highScore: stats.speedArenaHighScore,
          wordsLearned,
        })
      );
    }
    if (weeklyLocalBest > 0) {
      tasks.push(
        syncMyWeeklyLeaderboardScore({
          seasonId: currentSeasonId,
          displayName: getSavedPlayerAlias(user.displayName),
          realmBadge,
          level,
          highScore: weeklyLocalBest,
          wordsLearned,
        })
      );
    }
    if (tasks.length > 0) {
      Promise.all(tasks).catch(() => {
        if (!cancelled) {
          // Manual sync button remains available
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [
    user,
    stats.speedArenaHighScore,
    weeklyLocalBest,
    currentSeasonId,
    realmBadge,
    level,
    wordsLearned,
  ]);

  const handleManualRefresh = async () => {
    sound.playTap();
    setIsRefreshing(true);
    setErrorMsg(null);
    try {
      const fresh =
        boardMode === 'weekly'
          ? await fetchWeeklyTop100Leaderboard(currentSeasonId)
          : await fetchTop100Leaderboard();
      setEntries(fresh);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Could not refresh leaderboard.'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    sound.playTap();
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const loggedIn = await signInWithGoogle();
      const chosenAlias = getSavedPlayerAlias(loggedIn.displayName);
      savePlayerAlias(chosenAlias);
      setAliasInput(chosenAlias);
      if (loggedIn.emailVerified) {
        await syncMyLeaderboardScore({
          displayName: chosenAlias,
          realmBadge,
          level,
          highScore: stats.speedArenaHighScore,
          wordsLearned,
        });
        if (weeklyLocalBest > 0) {
          await syncMyWeeklyLeaderboardScore({
            seasonId: currentSeasonId,
            displayName: chosenAlias,
            realmBadge,
            level,
            highScore: weeklyLocalBest,
            wordsLearned,
          });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in cancelled.';
      if (!msg.includes('popup-closed-by-user')) {
        setErrorMsg('Google sign-in failed. Please allow popups and try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSyncProfileAndScore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    sound.playTap();
    setIsSyncing(true);
    setSyncDone(false);
    setErrorMsg(null);
    try {
      const cleanAlias = savePlayerAlias(aliasInput);
      setAliasInput(cleanAlias);
      await syncMyLeaderboardScore({
        displayName: cleanAlias,
        realmBadge,
        level,
        highScore: stats.speedArenaHighScore,
        wordsLearned,
      });
      if (weeklyLocalBest > 0) {
        await syncMyWeeklyLeaderboardScore({
          seasonId: currentSeasonId,
          displayName: cleanAlias,
          realmBadge,
          level,
          highScore: weeklyLocalBest,
          wordsLearned,
        });
      }
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 2500);
    } catch {
      setErrorMsg('Failed to publish score. Check your connection and try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    sound.playTap();
    await signOutPlayer();
  };

  const handleCopyChallengeLink = async () => {
    sound.playTap();
    const url = buildChallengeUrl({
      seed: generateArenaSeed(),
      difficulty,
      challengerName: getSavedPlayerAlias(user?.displayName),
      targetScore:
        boardMode === 'weekly'
          ? weeklyLocalBest || stats.speedArenaHighScore
          : stats.speedArenaHighScore,
      realmBadge,
      createdAt: Date.now(),
    });
    try {
      await navigator.clipboard.writeText(url);
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 2600);
    } catch {
      // Fallback copy via temporary input
      const temp = document.createElement('input');
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 2600);
    }
  };

  // Compute global rank comparison
  const rankAnalysis = useMemo(() => {
    const myBest =
      boardMode === 'weekly'
        ? weeklyLocalBest
        : stats.speedArenaHighScore ?? 0;
    const liveIndex = user ? entries.findIndex((e) => e.uid === user.uid) : -1;
    const effectiveScore =
      liveIndex >= 0 ? Math.max(myBest, entries[liveIndex].highScore) : myBest;

    const projectedIdx = entries.findIndex((e) => effectiveScore >= e.highScore);
    const cutoffScore = entries.length >= 100 ? entries[99].highScore : 0;

    return {
      isPublishedInTop100: liveIndex >= 0,
      publishedRank: liveIndex >= 0 ? liveIndex + 1 : null,
      projectedRank:
        projectedIdx >= 0
          ? projectedIdx + 1
          : entries.length < 100
          ? entries.length + 1
          : null,
      effectiveScore,
      cutoffScore,
      pointsToTop100:
        entries.length >= 100 && effectiveScore < cutoffScore
          ? cutoffScore - effectiveScore + 1
          : 0,
    };
  }, [entries, user, stats.speedArenaHighScore, boardMode, weeklyLocalBest]);

  const filteredEntries = useMemo(() => {
    const ranked = entries.map((entry, idx) => ({
      ...entry,
      globalRank: idx + 1,
    }));

    return ranked.filter((item) => {
      if (scope === 'top10' && item.globalRank > 10) return false;
      if (
        scope === 'realm' &&
        !item.realmBadge.toLowerCase().includes(realmBadge.split(':')[0].toLowerCase())
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          item.displayName.toLowerCase().includes(q) ||
          item.realmBadge.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, scope, realmBadge, searchQuery]);

  const topThree = entries.slice(0, 3);

  const surfaceCard = isLight
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-slate-900/90 border-slate-800 shadow-lg';

  const subtleSurface = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-slate-950/70 border-slate-800';

  const mutedText = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto min-h-screen flex flex-col px-4 sm:px-6 py-5 pb-12 ${currentTheme.textPrimary} select-none`}
    >
      {/* Top Bar */}
      <header
        className={`flex items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              sound.playTap();
              onBack();
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black font-heading flex items-center gap-2 truncate">
              <Globe2 className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="truncate">Global Speed Arena Top 100</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`p-2.5 rounded-xl border transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Refresh Top 100"
            aria-label="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onLaunchArena();
            }}
            className="tactile-btn px-3.5 py-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-b-4 border-amber-700 font-black text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Timer className="w-4 h-4" />
            <span>Play Blitz</span>
          </button>
        </div>
      </header>

      <div className="flex-1 pt-5 space-y-6">
        {/* Season Mode Switcher (All-Time vs Weekly Season) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            className={`inline-flex items-center gap-1 p-1 rounded-xl border self-start ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              onClick={() => {
                sound.playTap();
                setBoardMode('alltime');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition ${
                boardMode === 'alltime'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>All-Time Top 100</span>
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setBoardMode('weekly');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition ${
                boardMode === 'weekly'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Season ({currentSeasonId})</span>
            </button>
          </div>

          <div className={`text-xs font-bold flex items-center gap-2 ${mutedText}`}>
            {boardMode === 'weekly' && (
              <span className="text-amber-500 font-black">{seasonCountdown}</span>
            )}
            <button
              onClick={handleCopyChallengeLink}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                isLight
                  ? 'bg-white border-slate-200 text-indigo-600 hover:bg-indigo-50'
                  : 'bg-slate-900 border-slate-800 text-indigo-400 hover:bg-indigo-950/60'
              }`}
            >
              {challengeCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Challenge Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Challenge a Friend</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Player Global Rank Comparison & Account Sync Card */}
        <section className={`rounded-2xl border p-5 space-y-4 ${surfaceCard}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                {boardMode === 'weekly'
                  ? `Weekly Season Standing · ${currentSeasonId}`
                  : 'Your All-Time Standing'}
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-amber-500">
                  {rankAnalysis.isPublishedInTop100
                    ? `#${rankAnalysis.publishedRank}`
                    : rankAnalysis.projectedRank
                    ? `Est. #${rankAnalysis.projectedRank}`
                    : 'Outside Top 100'}
                </span>
                <span className={`text-xs sm:text-sm font-semibold tabular-nums ${mutedText}`}>
                  {boardMode === 'weekly' ? 'Season Best:' : 'Best Score:'}{' '}
                  {rankAnalysis.effectiveScore.toLocaleString()} pts · Lv.{level} · {realmBadge}
                </span>
              </div>
              <p className={`text-xs ${mutedText}`}>
                {boardMode === 'weekly' && rankAnalysis.effectiveScore === 0
                  ? 'Play a 60s Puzzle Blitz round this week to enter the Weekly Season rankings!'
                  : rankAnalysis.isPublishedInTop100
                  ? `Your Speed Arena record is live on the ${
                      boardMode === 'weekly' ? 'Weekly Season' : 'Global Top 100'
                    }.`
                  : rankAnalysis.pointsToTop100 > 0
                  ? `Top 100 cutoff is ${rankAnalysis.cutoffScore.toLocaleString()} pts — earn +${rankAnalysis.pointsToTop100.toLocaleString()} more pts in Puzzle Blitz to enter.`
                  : user
                  ? 'Press Save & Sync Score to publish your personal best to the Top 100.'
                  : 'Sign in with Google to publish your Speed Arena score and claim your official rank.'}
              </p>
            </div>

            {!user ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="tactile-btn px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  <span>Connected</span>
                </span>
                <button
                  onClick={handleSignOut}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {user && (
            <form
              onSubmit={handleSyncProfileAndScore}
              className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center gap-3 ${
                isLight ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="leaderboard-alias"
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${mutedText}`}
                >
                  Public Leaderboard Name
                </label>
                <input
                  id="leaderboard-alias"
                  type="text"
                  maxLength={40}
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="Enter display name (max 40 chars)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:border-indigo-500 transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSyncing}
                className="sm:self-end px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition"
              >
                {syncDone ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Score Synced</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>{isSyncing ? 'Syncing...' : 'Save & Sync Score'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-400 flex items-center justify-between gap-3 text-xs">
            <span>Unable to connect to global rankings right now. Please retry.</span>
            <button
              onClick={handleManualRefresh}
              className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Top 3 Podium */}
        {!isLoading && topThree.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {topThree.map((entry, idx) => {
              const rank = idx + 1;
              const isMe = Boolean(user && entry.uid === user.uid);
              const medalStyle =
                rank === 1
                  ? 'from-amber-400 to-orange-500 text-slate-950 border-amber-700'
                  : rank === 2
                  ? 'from-slate-300 to-slate-400 text-slate-950 border-slate-600'
                  : 'from-amber-600 to-amber-700 text-white border-amber-900';

              return (
                <div
                  key={entry.uid}
                  className={`rounded-2xl border p-4 flex items-center gap-3.5 ${
                    isMe
                      ? isLight
                        ? 'bg-indigo-50 border-indigo-400'
                        : 'bg-indigo-950/60 border-indigo-500/60'
                      : surfaceCard
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br border-b-4 flex items-center justify-center font-black shrink-0 ${medalStyle}`}
                  >
                    {rank === 1 ? <Crown className="w-5 h-5" /> : <Medal className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-bold tabular-nums ${mutedText}`}>
                      Rank #{rank} · {entry.realmBadge}
                    </div>
                    <div className="text-sm font-black truncate">
                      {entry.displayName} {isMe && '(You)'}
                    </div>
                    <div className="text-base font-black font-mono tabular-nums text-amber-500 mt-0.5">
                      {entry.highScore.toLocaleString()} pts
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            className={`inline-flex items-center gap-1 p-1 rounded-xl border self-start ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            {(
              [
                { id: 'top100', label: `Top 100 (${entries.length})` },
                { id: 'top10', label: 'Top 10' },
                { id: 'realm', label: 'My Realm' },
              ] as const
            ).map((tab) => {
              const active = scope === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playTap();
                    setScope(tab.id);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition ${
                    active
                      ? isLight
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-indigo-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players or realms..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Rankings Table */}
        <section className={`rounded-2xl border overflow-hidden ${surfaceCard}`}>
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-12 rounded-xl animate-pulse ${
                    isLight ? 'bg-slate-100' : 'bg-slate-800/60'
                  }`}
                />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Trophy className={`w-9 h-9 mx-auto ${mutedText}`} />
              <div>
                <h2 className="text-base font-black">
                  {entries.length === 0
                    ? 'No Global Scores Posted Yet'
                    : 'No Matching Players Found'}
                </h2>
                <p className={`text-xs mt-1 max-w-sm mx-auto ${mutedText}`}>
                  {entries.length === 0
                    ? 'Play a 60-second Speed Arena blitz and sign in with Google to claim Rank #1 globally.'
                    : 'Try clearing your search or switching back to Top 100.'}
                </p>
              </div>
              {entries.length === 0 && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onLaunchArena();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs inline-flex items-center gap-1.5"
                >
                  <Timer className="w-4 h-4" />
                  <span>Start Speed Arena</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <th className="py-3 px-4 w-16">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Realm</th>
                    <th className="py-3 px-4 hidden md:table-cell text-right">Words</th>
                    <th className="py-3 px-4 text-right">Speed Score</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y text-sm ${
                    isLight ? 'divide-slate-100' : 'divide-slate-800/80'
                  }`}
                >
                  {filteredEntries.map((entry) => {
                    const isMe = Boolean(user && entry.uid === user.uid);
                    return (
                      <tr
                        key={entry.uid}
                        className={
                          isMe
                            ? isLight
                              ? 'bg-indigo-50/90 font-semibold'
                              : 'bg-indigo-950/50 font-semibold'
                            : isLight
                            ? 'hover:bg-slate-50/80'
                            : 'hover:bg-slate-800/40'
                        }
                      >
                        <td className="py-3.5 px-4 font-mono font-black tabular-nums">
                          <span
                            className={
                              entry.globalRank === 1
                                ? 'text-amber-500'
                                : entry.globalRank <= 3
                                ? 'text-indigo-500'
                                : mutedText
                            }
                          >
                            #{entry.globalRank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold truncate max-w-[170px] sm:max-w-[240px]">
                              {entry.displayName}
                            </span>
                            {isMe && (
                              <span className="text-xs font-black text-indigo-500 shrink-0">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className={`text-xs sm:hidden ${mutedText}`}>
                            {entry.realmBadge} · Lv.{entry.level}
                          </div>
                        </td>
                        <td className={`py-3.5 px-4 hidden sm:table-cell text-xs font-semibold ${mutedText}`}>
                          {entry.realmBadge} · Lv.{entry.level}
                        </td>
                        <td className={`py-3.5 px-4 hidden md:table-cell text-right font-mono text-xs tabular-nums ${mutedText}`}>
                          {entry.wordsLearned.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black tabular-nums text-amber-500">
                          {entry.highScore.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
