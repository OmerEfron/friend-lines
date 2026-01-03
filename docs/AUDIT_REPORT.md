# Friendlines App Audit Report

**Date:** January 3, 2026  
**Scope:** Frontend/Backend data mismatches, logical bugs, and optimization opportunities

---

## Executive Summary

This audit identifies **critical logical bugs** and **architecture mismatches** between the frontend React Native app and the backend Lambda APIs. The most significant finding is a bug where users cannot see their own posts in the main feed due to redundant client-side filtering.

| Priority | Category | Count |
|----------|----------|-------|
| High | Critical Bugs | 1 |
| Medium | Architecture Mismatches | 3 |
| Low | Performance Improvements | 2 |

---

## Critical Bugs (High Priority)

### BUG-001: User's Own Posts Hidden from Main Feed

**Location:** `src/screens/MainFeedScreen.tsx` (lines 13-33)

**Description:**  
The main feed screen applies a client-side filter that only shows posts from friends. However, the backend already returns filtered content including the user's own posts. This causes the user's posts to be excluded from their feed.

**Root Cause:**

```typescript
// MainFeedScreen.tsx lines 13-17
const friendIds = useMemo(() => {
  return friendships
    .filter(f => f.userId === currentUser.id)
    .map(f => f.friendId);
}, [friendships, currentUser.id]);
```

The `friendIds` array does not include `currentUser.id`, so when filtering:

```typescript
// MainFeedScreen.tsx lines 19-20
const friendNewsflashes = useMemo(() => {
  const filtered = newsflashes.filter(n => friendIds.includes(n.userId));
```

...the user's own posts are excluded.

**Backend Behavior:**  
The backend (`backend/src/handlers/feeds.ts` lines 84-96) correctly includes the user's own posts:

```typescript
// Include user's own newsflashes
const relevantUserIds = [userId, ...friendIds];

const feedNewsflashes = allNewsflashes
  .filter((n) => relevantUserIds.includes(n.userId))
```

**Impact:** Users cannot see their own newsflashes in the main feed, creating confusion and poor UX.

**Fix:**  
Remove the redundant client-side filtering or include `currentUser.id` in the filter:

```typescript
const friendIds = useMemo(() => {
  const ids = friendships
    .filter(f => f.userId === currentUser.id)
    .map(f => f.friendId);
  return [currentUser.id, ...ids]; // Include self
}, [friendships, currentUser.id]);
```

---

## Architecture Mismatches (Medium Priority)

### ARCH-001: Unused Enriched User Data from API

**Location:** `src/components/FeedList.tsx` + `src/services/api.ts`

**Description:**  
The backend enriches newsflash responses with full user objects, but the frontend ignores this data and performs separate lookups.

**Backend Response:**

```typescript
// backend/src/handlers/feeds.ts lines 103-106
const enrichedNewsflashes = feedNewsflashes.map((newsflash) => ({
  ...newsflash,
  user: usersMap.get(newsflash.userId),
}));
```

**Frontend Behavior:**

```typescript
// FeedList.tsx lines 15-17
const getUserById = (userId: string): User | undefined => {
  return users.find(u => u.id === userId);
};
```

**Impact:** Wasted bandwidth fetching all users; O(n) lookup per newsflash instead of O(1).

---

### ARCH-002: Friends Data Conversion Waste

**Location:** `src/context/DataContext.tsx` (lines 95-100)

**Description:**  
The `fetchFriends()` API returns full `User[]` objects, but the DataContext converts them to simple ID pairs and discards the user data.

```typescript
// DataContext.tsx lines 95-100
const friendshipsData = friendsData.map((friend) => ({
  userId: currentUser.id,
  friendId: friend.id,
}));
setFriendships(friendshipsData);
```

The `FriendsListScreen.tsx` then re-derives friends by filtering the global `users` array:

```typescript
// FriendsListScreen.tsx lines 11-17
const friendsList = useMemo(() => {
  const friendIds = friendships
    .filter(f => f.userId === currentUser.id)
    .map(f => f.friendId);
  
  return users.filter(u => friendIds.includes(u.id));
}, [users, friendships, currentUser.id]);
```

**Impact:** Fetches all users unnecessarily; discards already-fetched friend data.

---

### ARCH-003: Mock Data Fallback in DataContext

**Location:** `src/context/DataContext.tsx` (lines 8-14, 51-68)

**Description:**  
The DataContext maintains dual-mode support (mock vs API) with `useApi` flag. While `App.js` sets `USE_API = true`, the mock data imports remain in the codebase:

```typescript
import {
  users as initialUsers,
  newsflashes as initialNewsflashes,
  groups as initialGroups,
  friendships as initialFriendships,
  currentUser as initialCurrentUser,
} from '../data/mock';
```

And fallback initialization:

```typescript
const [users, setUsers] = useState<User[]>(useApi ? [] : initialUsers);
```

**Impact:**  
- Increases bundle size with unused mock data
- Risk of accidentally disabling API mode
- Confusing dual-mode logic in a single context

---

## Performance Improvements (Low Priority)

### PERF-001: Fetch All Users on Every Load

**Location:** `src/context/DataContext.tsx` (line 86)

**Description:**  
`loadDataFromApi()` calls `fetchUsers()` which fetches ALL users in the system. This does not scale.

```typescript
const [usersData, feedNewsflashes, friendsData, groupsData] = await Promise.all([
  fetchUsers(),  // Fetches ALL users
  fetchMainFeed(),
  fetchFriends(),
  fetchGroups(),
]);
```

**Recommendation:**  
- Use the enriched user data from feed responses
- Only fetch specific users when needed (e.g., for search)
- Remove the global `fetchUsers()` call from initial load

---

### PERF-002: No Pagination on Feed Endpoints

**Location:** `backend/src/handlers/feeds.ts`

**Description:**  
The `handleMainFeed` and `handleGroupFeed` functions fetch all newsflashes via `scanTable()` and filter in memory:

```typescript
const allNewsflashes = (await scanTable(NEWSFLASHES_TABLE)) as Newsflash[];
```

**Impact:** As the newsflash count grows, response times will degrade significantly.

**Recommendation:**  
Implement cursor-based pagination using DynamoDB's `LastEvaluatedKey`.

---

## Summary Table

| ID | Type | Location | Severity | Status |
|----|------|----------|----------|--------|
| BUG-001 | Bug | MainFeedScreen.tsx | High | **Resolved** |
| ARCH-001 | Mismatch | FeedList.tsx | Medium | **Resolved** |
| ARCH-002 | Mismatch | DataContext.tsx | Medium | **Resolved** |
| ARCH-003 | Mismatch | DataContext.tsx | Medium | **Resolved** |
| PERF-001 | Performance | DataContext.tsx | Low | **Resolved** |
| PERF-002 | Performance | feeds.ts | Low | **Resolved** |

---

## Next Steps

1. **Fix BUG-001** - Include `currentUser.id` in the friend filter or remove redundant client-side filtering
2. **Refactor ARCH-001** - Use the `user` object from enriched newsflash responses
3. **Refactor ARCH-002** - Store friends directly from `fetchFriends()` response
4. **Clean up ARCH-003** - Remove mock data imports and dual-mode logic (consider separate mock provider for testing)
5. **Implement PERF-001** - Remove global `fetchUsers()` call
6. **Implement PERF-002** - Add pagination to feed endpoints

---

## Appendix: Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Current Flow                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  App Start                                                      │
│     │                                                           │
│     ▼                                                           │
│  DataContext.loadDataFromApi()                                  │
│     │                                                           │
│     ├──► fetchUsers()      ──► GET /users      ──► All Users    │
│     ├──► fetchMainFeed()   ──► GET /feeds/main ──► Feed + User  │
│     ├──► fetchFriends()    ──► GET /friends    ──► Friend Users │
│     └──► fetchGroups()     ──► GET /groups     ──► User Groups  │
│                                                                 │
│  Issues:                                                        │
│  • fetchMainFeed returns enriched data (ignored)                │
│  • fetchFriends returns User[] (converted to IDs)               │
│  • fetchUsers loads ALL users (doesn't scale)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Recommended Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  App Start                                                      │
│     │                                                           │
│     ▼                                                           │
│  DataContext.loadDataFromApi()                                  │
│     │                                                           │
│     ├──► fetchMainFeed()   ──► Use embedded user objects        │
│     ├──► fetchFriends()    ──► Store User[] directly            │
│     └──► fetchGroups()     ──► GET /groups                      │
│                                                                 │
│  Benefits:                                                      │
│  • No global fetchUsers() call                                  │
│  • O(1) user lookups from embedded data                         │
│  • Friends list ready without re-filtering                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

