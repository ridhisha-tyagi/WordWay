import { DifficultyLevel, normalizeDifficulty } from '../data/wordBank';

export interface FriendChallenge {
  seed: number;
  difficulty: DifficultyLevel;
  challengerName: string;
  targetScore: number;
  realmBadge: string;
  createdAt: number;
}

/**
 * Deterministic 32-bit PRNG (Mulberry32) so two players on the same challenge link
 * get the exact same Speed Arena question sequence and shuffled choices.
 */
export function createSeededRng(seed: number): () => number {
  let state = (Math.floor(seed) >>> 0) || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateArenaSeed(): number {
  return Math.floor(100000 + Math.random() * 899999999);
}

function toBase64Url(json: string): string {
  const utf8 = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(token: string): string {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/');
  const mod = padded.length % 4;
  const normalized = mod ? padded + '='.repeat(4 - mod) : padded;
  const bin = atob(normalized);
  const pct = Array.from(bin)
    .map((ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, '0')}`)
    .join('');
  return decodeURIComponent(pct);
}

export function encodeChallengeToken(challenge: FriendChallenge): string {
  const compact = {
    s: Math.floor(challenge.seed) >>> 0,
    d: challenge.difficulty,
    n: challenge.challengerName.trim().slice(0, 36) || 'WordWay Challenger',
    t: Math.max(0, Math.round(challenge.targetScore)),
    b: challenge.realmBadge.trim().slice(0, 24) || 'SSC',
    c: challenge.createdAt || Date.now(),
  };
  return toBase64Url(JSON.stringify(compact));
}

export function decodeChallengeToken(token: string): FriendChallenge | null {
  try {
    if (!token || token.length > 600) return null;
    const raw = JSON.parse(fromBase64Url(token)) as Record<string, unknown>;
    if (typeof raw.s !== 'number' || !Number.isFinite(raw.s)) return null;
    if (typeof raw.t !== 'number' || !Number.isFinite(raw.t) || raw.t < 0) return null;
    return {
      seed: Math.floor(raw.s) >>> 0,
      difficulty: normalizeDifficulty(
        typeof raw.d === 'string' ? raw.d : 'ssc_chsl'
      ),
      challengerName:
        typeof raw.n === 'string' && raw.n.trim()
          ? raw.n.trim().slice(0, 36)
          : 'WordWay Challenger',
      targetScore: Math.round(raw.t),
      realmBadge:
        typeof raw.b === 'string' && raw.b.trim()
          ? raw.b.trim().slice(0, 24)
          : 'SSC',
      createdAt:
        typeof raw.c === 'number' && Number.isFinite(raw.c) ? raw.c : Date.now(),
    };
  } catch {
    return null;
  }
}

export function buildChallengeUrl(challenge: FriendChallenge): string {
  const token = encodeChallengeToken(challenge);
  if (typeof window === 'undefined') {
    return `?challenge=${token}`;
  }
  const url = new URL(window.location.href);
  url.searchParams.set('challenge', token);
  return url.toString();
}

export function readChallengeFromUrl(): FriendChallenge | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('challenge');
    if (!token) return null;
    return decodeChallengeToken(token);
  } catch {
    return null;
  }
}

export function clearChallengeFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('challenge')) {
      url.searchParams.delete('challenge');
      window.history.replaceState({}, '', url.toString());
    }
  } catch {
    // Ignore history API errors
  }
}
