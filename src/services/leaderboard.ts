import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  Unsubscribe,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';

const COLLECTION_PATH = 'leaderboard_entries';
const ALIAS_STORAGE_KEY = 'wordforge_leaderboard_alias';

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  realmBadge: string;
  level: number;
  highScore: number;
  wordsLearned: number;
  updatedAtMs?: number;
}

export function getSavedPlayerAlias(fallback?: string | null): string {
  try {
    const saved = localStorage.getItem(ALIAS_STORAGE_KEY);
    if (saved && saved.trim().length > 0) {
      return saved.trim().slice(0, 40);
    }
  } catch {
    // localStorage fallback
  }
  if (fallback && fallback.trim().length > 0) {
    return fallback.trim().slice(0, 40);
  }
  return 'WordWay Player';
}

export function savePlayerAlias(alias: string): string {
  const clean = alias.trim().slice(0, 40) || 'WordWay Player';
  try {
    localStorage.setItem(ALIAS_STORAGE_KEY, clean);
  } catch {
    // localStorage fallback
  }
  return clean;
}

function mapDocToEntry(id: string, data: Record<string, unknown>): LeaderboardEntry {
  const ts = data.updatedAt as { toMillis?: () => number } | undefined;
  return {
    uid: typeof data.uid === 'string' ? data.uid : id,
    displayName:
      typeof data.displayName === 'string' && data.displayName.trim()
        ? data.displayName
        : 'WordWay Player',
    realmBadge:
      typeof data.realmBadge === 'string' && data.realmBadge.trim()
        ? data.realmBadge
        : 'SSC',
    level: typeof data.level === 'number' ? data.level : 1,
    highScore: typeof data.highScore === 'number' ? data.highScore : 0,
    wordsLearned: typeof data.wordsLearned === 'number' ? data.wordsLearned : 0,
    updatedAtMs: ts && typeof ts.toMillis === 'function' ? ts.toMillis() : undefined,
  };
}

export function subscribeTop100Leaderboard(
  onEntries: (entries: LeaderboardEntry[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION_PATH),
    orderBy('highScore', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((d) =>
        mapDocToEntry(d.id, d.data() as Record<string, unknown>)
      );
      onEntries(entries);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_PATH);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function fetchTop100Leaderboard(): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, COLLECTION_PATH),
    orderBy('highScore', 'desc'),
    limit(100)
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) =>
      mapDocToEntry(d.id, d.data() as Record<string, unknown>)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_PATH);
  }
}

export async function syncMyLeaderboardScore(params: {
  displayName?: string;
  realmBadge: string;
  level: number;
  highScore: number;
  wordsLearned: number;
}): Promise<LeaderboardEntry | null> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return null;
  }

  const docPath = `${COLLECTION_PATH}/${user.uid}`;
  const docRef = doc(db, COLLECTION_PATH, user.uid);

  const safeName = (
    params.displayName?.trim() ||
    getSavedPlayerAlias(user.displayName)
  ).slice(0, 40) || 'WordWay Player';
  const safeBadge = params.realmBadge.trim().slice(0, 24) || 'SSC';
  const safeLevel = Math.min(Math.max(Math.round(params.level), 1), 500);
  const safeScore = Math.min(Math.max(Math.round(params.highScore), 0), 1000000);
  const safeWords = Math.min(Math.max(Math.round(params.wordsLearned), 0), 10000000);

  let existingSnap;
  try {
    existingSnap = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  if (!existingSnap.exists()) {
    const payload = {
      uid: user.uid,
      displayName: safeName,
      realmBadge: safeBadge,
      level: safeLevel,
      highScore: safeScore,
      wordsLearned: safeWords,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
    return {
      uid: user.uid,
      displayName: safeName,
      realmBadge: safeBadge,
      level: safeLevel,
      highScore: safeScore,
      wordsLearned: safeWords,
    };
  }

  const existingData = existingSnap.data() as Record<string, unknown>;
  const existingScore =
    typeof existingData.highScore === 'number' ? existingData.highScore : 0;
  const bestScore = Math.max(existingScore, safeScore);
  const existingWords =
    typeof existingData.wordsLearned === 'number' ? existingData.wordsLearned : 0;
  const bestWords = Math.max(existingWords, safeWords);

  try {
    await updateDoc(docRef, {
      displayName: safeName,
      realmBadge: safeBadge,
      level: safeLevel,
      highScore: bestScore,
      wordsLearned: bestWords,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }

  return {
    uid: user.uid,
    displayName: safeName,
    realmBadge: safeBadge,
    level: safeLevel,
    highScore: bestScore,
    wordsLearned: bestWords,
  };
}

const WEEKLY_STORAGE_KEY = 'wordforge_weekly_arena_best';

export function getCurrentSeasonId(now = new Date()): string {
  const utcDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getSeasonResetCountdown(now = new Date()): string {
  const day = now.getUTCDay();
  const daysUntilNextMon = day === 0 ? 1 : 8 - day;
  const nextReset = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilNextMon,
    0,
    0,
    0
  );
  const diffMs = Math.max(0, nextReset - now.getTime());
  const totalHours = Math.floor(diffMs / 3600000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `Resets in ${days}d ${hours}h`;
  return `Resets in ${Math.max(1, hours)}h`;
}

export function getSavedWeeklyArenaBest(seasonId = getCurrentSeasonId()): number {
  try {
    const raw = localStorage.getItem(WEEKLY_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { seasonId?: string; highScore?: number };
    if (parsed.seasonId === seasonId && typeof parsed.highScore === 'number') {
      return Math.max(0, Math.round(parsed.highScore));
    }
  } catch {
    // localStorage fallback
  }
  return 0;
}

export function recordWeeklyArenaScore(
  score: number,
  seasonId = getCurrentSeasonId()
): number {
  const cleanScore = Math.max(0, Math.round(score));
  const prev = getSavedWeeklyArenaBest(seasonId);
  const nextBest = Math.max(prev, cleanScore);
  try {
    localStorage.setItem(
      WEEKLY_STORAGE_KEY,
      JSON.stringify({ seasonId, highScore: nextBest })
    );
  } catch {
    // localStorage fallback
  }
  return nextBest;
}

export function subscribeWeeklyTop100Leaderboard(
  seasonId: string,
  onEntries: (entries: LeaderboardEntry[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const colPath = `weekly_seasons/${seasonId}/entries`;
  const q = query(
    collection(db, 'weekly_seasons', seasonId, 'entries'),
    orderBy('highScore', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((d) =>
        mapDocToEntry(d.id, d.data() as Record<string, unknown>)
      );
      onEntries(entries);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, colPath);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function fetchWeeklyTop100Leaderboard(
  seasonId = getCurrentSeasonId()
): Promise<LeaderboardEntry[]> {
  const colPath = `weekly_seasons/${seasonId}/entries`;
  const q = query(
    collection(db, 'weekly_seasons', seasonId, 'entries'),
    orderBy('highScore', 'desc'),
    limit(100)
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) =>
      mapDocToEntry(d.id, d.data() as Record<string, unknown>)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
  }
}

export async function syncMyWeeklyLeaderboardScore(params: {
  seasonId?: string;
  displayName?: string;
  realmBadge: string;
  level: number;
  highScore: number;
  wordsLearned: number;
}): Promise<LeaderboardEntry | null> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return null;
  }

  const seasonId = params.seasonId || getCurrentSeasonId();
  const docPath = `weekly_seasons/${seasonId}/entries/${user.uid}`;
  const docRef = doc(db, 'weekly_seasons', seasonId, 'entries', user.uid);

  const safeName =
    (
      params.displayName?.trim() || getSavedPlayerAlias(user.displayName)
    ).slice(0, 40) || 'WordWay Player';
  const safeBadge = params.realmBadge.trim().slice(0, 24) || 'SSC';
  const safeLevel = Math.min(Math.max(Math.round(params.level), 1), 500);
  const safeScore = Math.min(Math.max(Math.round(params.highScore), 0), 1000000);
  const safeWords = Math.min(
    Math.max(Math.round(params.wordsLearned), 0),
    10000000
  );

  let existingSnap;
  try {
    existingSnap = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  if (!existingSnap.exists()) {
    const payload = {
      uid: user.uid,
      seasonId,
      displayName: safeName,
      realmBadge: safeBadge,
      level: safeLevel,
      highScore: safeScore,
      wordsLearned: safeWords,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(docRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
    return {
      uid: user.uid,
      displayName: safeName,
      realmBadge: safeBadge,
      level: safeLevel,
      highScore: safeScore,
      wordsLearned: safeWords,
    };
  }

  const existingData = existingSnap.data() as Record<string, unknown>;
  const existingScore =
    typeof existingData.highScore === 'number' ? existingData.highScore : 0;
  const bestScore = Math.max(existingScore, safeScore);
  const existingWords =
    typeof existingData.wordsLearned === 'number' ? existingData.wordsLearned : 0;
  const bestWords = Math.max(existingWords, safeWords);

  try {
    await updateDoc(docRef, {
      displayName: safeName,
      realmBadge: safeBadge,
      level: safeLevel,
      highScore: bestScore,
      wordsLearned: bestWords,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }

  return {
    uid: user.uid,
    displayName: safeName,
    realmBadge: safeBadge,
    level: safeLevel,
    highScore: bestScore,
    wordsLearned: bestWords,
  };
}
