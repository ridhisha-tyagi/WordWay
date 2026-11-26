import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { normalizeDifficulty } from '../data/wordBank';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  calculateLevel,
  GameStorage,
  getTodayString,
  UserStats,
  VaultItem,
} from './gameState';

const COLLECTION_PATH = 'user_profiles';

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

function clampInt(val: unknown, min: number, max: number, fallback: number): number {
  const n = typeof val === 'number' && Number.isFinite(val) ? Math.round(val) : fallback;
  return Math.min(Math.max(n, min), max);
}

function clampStr(val: unknown, maxLen: number, fallback: string): string {
  if (typeof val !== 'string') return fallback;
  return val.trim().slice(0, maxLen) || fallback;
}

function sanitizeVaultItem(raw: VaultItem): VaultItem {
  return {
    id: clampStr(raw.id, 128, `vault_${Date.now()}`),
    type:
      raw.type === 'vocab' || raw.type === 'grammar' || raw.type === 'spelling'
        ? raw.type
        : 'spelling',
    title: clampStr(raw.title, 120, 'Word'),
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle.slice(0, 160) : '',
    detail: typeof raw.detail === 'string' ? raw.detail.slice(0, 600) : '',
    dateAdded: typeof raw.dateAdded === 'number' ? raw.dateAdded : Date.now(),
    reviewCount: clampInt(raw.reviewCount, 0, 10000, 0),
    isBookmarked: Boolean(raw.isBookmarked),
  };
}

function sanitizeCompletedStages(
  raw: Record<string, number[]> | undefined
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  if (!raw || typeof raw !== 'object') return result;
  const entries = Object.entries(raw).slice(0, 16);
  for (const [tierId, list] of entries) {
    if (!Array.isArray(list)) continue;
    const cleanKey = clampStr(tierId, 40, '');
    if (!cleanKey) continue;
    const uniqueNums = Array.from(
      new Set(
        list
          .filter((n) => typeof n === 'number' && Number.isFinite(n))
          .map((n) => Math.min(Math.max(Math.round(n), 1), 64))
      )
    ).sort((a, b) => a - b);
    result[cleanKey] = uniqueNums;
  }
  return result;
}

export function mergeUserStats(
  local: UserStats,
  cloud: Partial<UserStats>
): UserStats {
  const mergedXp = Math.max(local.xp || 0, cloud.xp || 0);
  const { level } = calculateLevel(mergedXp);

  const localDate = local.lastActiveDate || getTodayString();
  const cloudDate = cloud.lastActiveDate || localDate;
  const newestDate = localDate >= cloudDate ? localDate : cloudDate;

  let mergedStreak = local.streak || 1;
  if (localDate === cloudDate) {
    mergedStreak = Math.max(local.streak || 1, cloud.streak || 1);
  } else if (cloudDate > localDate) {
    mergedStreak = cloud.streak || 1;
  }

  const mergedStages: Record<string, number[]> = {};
  const allTiers = new Set([
    ...Object.keys(local.completedStages || {}),
    ...Object.keys(cloud.completedStages || {}),
  ]);
  for (const tier of allTiers) {
    const a = local.completedStages?.[tier] || [];
    const b = cloud.completedStages?.[tier] || [];
    mergedStages[tier] = Array.from(new Set([...a, ...b])).sort((x, y) => x - y);
  }

  const vaultMap = new Map<string, VaultItem>();
  for (const item of [...(cloud.vaultItems || []), ...(local.vaultItems || [])]) {
    const existing = vaultMap.get(item.id);
    if (!existing) {
      vaultMap.set(item.id, sanitizeVaultItem(item));
    } else {
      vaultMap.set(item.id, {
        ...existing,
        reviewCount: Math.max(existing.reviewCount, item.reviewCount),
        isBookmarked: existing.isBookmarked || item.isBookmarked,
        dateAdded: Math.min(existing.dateAdded, item.dateAdded),
      });
    }
  }
  const mergedVault = Array.from(vaultMap.values())
    .sort((a, b) => b.dateAdded - a.dateAdded)
    .slice(0, 500);

  const mergedClaims = Array.from(
    new Set([
      ...(local.claimedAchievementIds || []),
      ...(cloud.claimedAchievementIds || []),
    ])
  ).slice(0, 100);

  const mergedWordsMastered = Math.max(
    local.wordsMasteredCount || 0,
    cloud.wordsMasteredCount || 0
  );
  const mergedWordsLearned = Math.max(
    local.wordsLearnedCount ?? mergedWordsMastered,
    cloud.wordsLearnedCount ?? mergedWordsMastered
  );

  const mergedDailyLast =
    (local.dailyQuestLastCompleted || '') >= (cloud.dailyQuestLastCompleted || '')
      ? local.dailyQuestLastCompleted || ''
      : cloud.dailyQuestLastCompleted || '';

  return {
    xp: mergedXp,
    level,
    streak: mergedStreak,
    longestStreak: Math.max(
      local.longestStreak || 0,
      cloud.longestStreak || 0,
      mergedStreak
    ),
    lastActiveDate: newestDate,
    wordsMasteredCount: mergedWordsMastered,
    wordsLearnedCount: mergedWordsLearned,
    speedArenaHighScore: Math.max(
      local.speedArenaHighScore || 0,
      cloud.speedArenaHighScore || 0
    ),
    dailyQuestLastCompleted: mergedDailyLast,
    dailyQuestsCompletedCount: Math.max(
      local.dailyQuestsCompletedCount || 0,
      cloud.dailyQuestsCompletedCount || 0
    ),
    roundsCompletedCount: Math.max(
      local.roundsCompletedCount || 0,
      cloud.roundsCompletedCount || 0
    ),
    savedDifficulty: normalizeDifficulty(local.savedDifficulty || cloud.savedDifficulty),
    savedSubLevelId: local.savedSubLevelId || cloud.savedSubLevelId || 'ssc_chsl',
    hintCoins: Math.max(local.hintCoins ?? 3, cloud.hintCoins ?? 3),
    adFreePass: Boolean(local.adFreePass || cloud.adFreePass),
    completedStages: sanitizeCompletedStages(mergedStages),
    claimedAchievementIds: mergedClaims,
    vaultItems: mergedVault,
  };
}

function buildProfilePayload(uid: string, stats: UserStats) {
  const safeXp = clampInt(stats.xp, 0, 10000000, 60);
  const safeLevel = clampInt(calculateLevel(safeXp).level, 1, 500, 1);
  return {
    uid,
    xp: safeXp,
    level: safeLevel,
    streak: clampInt(stats.streak, 0, 10000, 1),
    longestStreak: clampInt(stats.longestStreak ?? stats.streak, 0, 10000, 1),
    lastActiveDate: clampStr(stats.lastActiveDate, 20, getTodayString()),
    wordsMasteredCount: clampInt(stats.wordsMasteredCount, 0, 10000000, 0),
    wordsLearnedCount: clampInt(
      stats.wordsLearnedCount ?? stats.wordsMasteredCount,
      0,
      10000000,
      0
    ),
    speedArenaHighScore: clampInt(stats.speedArenaHighScore, 0, 1000000, 0),
    dailyQuestLastCompleted:
      typeof stats.dailyQuestLastCompleted === 'string'
        ? stats.dailyQuestLastCompleted.slice(0, 20)
        : '',
    dailyQuestsCompletedCount: clampInt(stats.dailyQuestsCompletedCount, 0, 100000, 0),
    roundsCompletedCount: clampInt(stats.roundsCompletedCount, 0, 1000000, 0),
    savedDifficulty: clampStr(stats.savedDifficulty, 40, 'ssc_chsl'),
    savedSubLevelId:
      typeof stats.savedSubLevelId === 'string'
        ? stats.savedSubLevelId.slice(0, 40)
        : '',
    hintCoins: clampInt(stats.hintCoins ?? 3, 0, 100000, 3),
    adFreePass: Boolean(stats.adFreePass),
    completedStages: sanitizeCompletedStages(stats.completedStages),
    claimedAchievementIds: (stats.claimedAchievementIds || [])
      .filter((id) => typeof id === 'string' && id.length > 0)
      .slice(0, 100),
    vaultItems: (stats.vaultItems || []).slice(0, 500).map(sanitizeVaultItem),
  };
}

export async function pushCloudProfile(stats: UserStats): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  const docPath = `${COLLECTION_PATH}/${user.uid}`;
  const docRef = doc(db, COLLECTION_PATH, user.uid);
  const payload = buildProfilePayload(user.uid, stats);

  let existingSnap;
  try {
    existingSnap = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  if (!existingSnap.exists()) {
    try {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
    return;
  }

  const { uid: _omitUid, ...mutableFields } = payload;
  try {
    await updateDoc(docRef, {
      ...mutableFields,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function pullAndMergeCloudProfile(): Promise<UserStats | null> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return null;

  const docPath = `${COLLECTION_PATH}/${user.uid}`;
  const docRef = doc(db, COLLECTION_PATH, user.uid);

  let snap;
  try {
    snap = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  const localStats = GameStorage.load();
  if (!snap.exists()) {
    await pushCloudProfile(localStats);
    return localStats;
  }

  const cloudData = snap.data() as Partial<UserStats>;
  const merged = mergeUserStats(localStats, cloudData);
  GameStorage.save(merged, true);
  await pushCloudProfile(merged);
  return merged;
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleCloudProfileSync(stats: UserStats) {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushCloudProfile(stats).catch(() => {
      // Silent retry on next save / manual sync
    });
  }, 1200);
}

GameStorage.setOnSaveHook(scheduleCloudProfileSync);
