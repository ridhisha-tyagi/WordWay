# Security Specification — Global Leaderboard

## 1. Data Invariants
1. A document in `/leaderboard_entries/{userId}` can only be created or updated by the verified authenticated owner whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
2. Every `LeaderboardEntry` document stores only public game fields (`uid`, `displayName`, `realmBadge`, `level`, `highScore`, `wordsLearned`, `createdAt`, `updatedAt`) with zero PII (`email`, phone, address).
3. `uid` and `createdAt` are immutable after creation; `updatedAt` must equal `request.time`.
4. `highScore` cannot decrease on update (`incoming().highScore >= existing().highScore`) and must stay within `[0, 1000000]`.
5. `list` queries on `/leaderboard_entries` are bounded (`request.query.limit <= 100`) and evaluate `resource.data.highScore >= 0`.
6. No arbitrary shadow keys or oversized strings are permitted.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated write to `/leaderboard_entries/user_1`.
2. Unverified email account (`email_verified == false`) attempting to write `/leaderboard_entries/user_1`.
3. Identity spoofing: Authenticated user `user_1` writing to `/leaderboard_entries/user_2`.
4. Payload UID mismatch: Authenticated user `user_1` writing to `/leaderboard_entries/user_1` with `uid: "user_2"`.
5. Shadow field injection: Valid payload plus `"isAdmin": true`.
6. Oversized `displayName` (> 40 chars) or empty `displayName`.
7. Oversized document ID (`userId` > 128 chars or containing invalid characters).
8. Negative or absurdly inflated `highScore` (`-50` or `999999999`).
9. Lowering existing `highScore` on update (`incoming.highScore < existing.highScore`).
10. Client-forged timestamp (`createdAt` or `updatedAt` != `request.time`).
11. Mutating immutable `createdAt` or `uid` during an update.
12. Unbounded list query (`limit > 100` or no limit).
