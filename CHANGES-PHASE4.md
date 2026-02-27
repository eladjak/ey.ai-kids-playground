# Master Plan - Detailed Changes Report
## Phase 4: Real Gamification
### Date: February 27, 2026

---

## 4.1 Gamification Engine — useGamification Hook (NEW FILE)

**File: `src/hooks/useGamification.js`** (280 lines)

**Constants exported:**

| Constant | Description |
|----------|-------------|
| `XP_EVENTS` | Object mapping event types to XP amounts |
| `LEVEL_THRESHOLDS` | Array of total XP needed per level |
| `BADGE_DEFINITIONS` | Object with 8 badge definitions |

**XP Event Amounts:**

| Event | XP |
|-------|----|
| `book_created` | 100 |
| `page_edited` | 10 |
| `character_created` | 50 |
| `community_share` | 30 |
| `streak_day` | 20 |
| `book_completed` | 50 |
| `first_login` | 10 |

**Level Thresholds:**

| Level | Total XP Required |
|-------|-------------------|
| 0 | 0 |
| 1 | 200 |
| 2 | 500 |
| 3 | 1,000 |
| 4 | 2,000 |
| 5 | 5,000 |
| 6 | 10,000 |
| 7 | 20,000 |
| 8 | 40,000 |
| 9 | 75,000 |
| 10 | 150,000 |

**Badge Definitions:**

| Badge ID | Name (EN) | Name (HE) | Condition | Max Progress | XP Reward |
|----------|-----------|-----------|-----------|-------------|-----------|
| `first_book` | First Book | הספר הראשון | 1 book created | 1 | 50 |
| `storyteller` | Storyteller | מספר סיפורים | 5 books created | 5 | 100 |
| `prolific_author` | Prolific Author | סופר פורה | 10 books created | 10 | 200 |
| `character_creator` | Character Creator | יוצר דמויות | 5 characters created | 5 | 80 |
| `community_star` | Community Star | כוכב הקהילה | 3 community shares | 3 | 100 |
| `streak_master` | Streak Master | אלוף הרצף | 7-day streak | 7 | 75 |
| `genre_explorer` | Genre Explorer | חוקר ז'אנרים | 3 unique genres | 3 | 80 |
| `multilingual` | Multilingual | רב-לשוני | 2 unique languages | 2 | 100 |

**Hook returns:**

| Property | Type | Description |
|----------|------|-------------|
| `user` | object | Current user data |
| `xp` | number | Total XP |
| `level` | number | Current level |
| `nextLevelXP` | number | XP needed for next level |
| `streakDays` | number | Current streak in days |
| `badges` | array | All badge states with earned/progress |
| `earnedBadges` | array | UserBadge entity records |
| `stats` | object | Computed user stats |
| `isLoading` | boolean | Loading state |
| `progressPercent` | number | 0-100 progress to next level |
| `pendingCelebrations` | array | Queue of celebrations to show |
| `awardXP(eventType, amount?)` | function | Award XP and check level-up/badges |
| `checkNewBadges()` | function | Check and award newly earned badges |
| `incrementStat(key, amount?)` | function | Increment a stat counter |
| `dismissCelebration()` | function | Remove first celebration from queue |
| `reload()` | function | Reload all gamification data |

**Helper functions exported:**
- `getLevelFromXP(xp)` — Returns level number for given XP
- `getNextLevelXP(level)` — Returns XP needed for next level

**Data sources:**
- `User.me()` for user XP/level/streak
- `Book.filter()` for book counts, genres, languages
- `UserBadge.filter()` for earned badge records

---

## 4.2 CelebrationModal (NEW FILE)

**File: `src/components/gamification/CelebrationModal.jsx`** (165 lines)

**Props:**
- `celebration` — object with `type: "level_up" | "badge"` and payload
- `onDismiss` — callback to close modal
- `isRTL` — boolean for RTL layout
- `isHebrew` — boolean for Hebrew labels

**Features:**
- **canvas-confetti** animation on mount (2 seconds, purple/gold/green particles from left/right)
- **Level-up display**: Gold trophy icon (spring entrance), level number (scale-in), old→new level text
- **Badge unlock display**: Purple award icon, badge name/description, XP reward pill
- Framer Motion spring animations with staggered delays
- Gradient header bar (purple → amber → indigo)
- Backdrop blur overlay, click-outside to dismiss
- Close button + "Awesome!" / "מעולה!" CTA

---

## 4.3 XPToast (NEW FILE)

**File: `src/components/gamification/XPToast.jsx`** (85 lines)

**Props:**
- `celebration` — object with `type: "xp"`, `amount`, `eventType`
- `onDismiss` — callback when toast should be dismissed
- `isHebrew` — boolean for Hebrew labels

**Features:**
- Floating notification positioned `top-20 right-4`
- Spring entrance animation (y: 40 → 0)
- Gold gradient icon with Zap
- Event label in 8 languages (EN/HE) for each XP event type
- "+X XP" text with scale-in animation
- Star icon with wiggle rotation
- Auto-dismiss after 2 seconds
- Shadow + amber border styling

**Event Labels:**

| Event | English | Hebrew |
|-------|---------|--------|
| `book_created` | Book Created | ספר נוצר |
| `page_edited` | Page Edited | עמוד נערך |
| `character_created` | Character Created | דמות נוצרה |
| `community_share` | Shared with Community | שותף עם הקהילה |
| `streak_day` | Daily Streak | רצף יומי |
| `book_completed` | Book Completed | ספר הושלם |
| `first_login` | Welcome Back | ברוך שובך |

---

## 4.4 GamificationOverlay (NEW FILE)

**File: `src/components/gamification/GamificationOverlay.jsx`** (40 lines)

**Props:**
- `pendingCelebrations` — array of celebration objects
- `onDismiss` — callback to dismiss current celebration
- `isRTL` — boolean
- `isHebrew` — boolean

**Behavior:**
- Renders the first celebration in the queue
- XP type → renders XPToast
- Level-up or badge type → renders CelebrationModal
- No celebrations → renders null

---

## 4.5 BadgeDisplay Update

**File: `src/components/gamification/BadgeDisplay.jsx`**

**Added badge icons:**

| Badge ID | Icon |
|----------|------|
| `prolific_author` | Crown |
| `character_creator` | PenTool |
| `community_star` | Star |
| `streak_master` | Zap |
| `genre_explorer` | Globe |
| `multilingual` | Globe |

**Added translations (EN + HE) for all 8 new badge IDs.**

---

## 4.6 Leaderboard Rewrite

**File: `src/pages/Leaderboard.jsx`** (573 → 420 lines)

**Removed:**
- `generateMockLeaderboardData()` — entire function with hardcoded users (Sophie K., Ethan M., etc.)
- All mock rank_change logic
- Random data shuffling for monthly/allTime views
- RankTrend component showing fake arrow trends

**Added:**
- `buildLeaderboard(user)` — aggregates real data from `Book.list()`
- Date filtering: weekly (7 days), monthly (30 days), allTime (no filter)
- Per-user aggregation by `created_by` email
- `getLevelFromXP` import from useGamification
- Loading state with Loader2 spinner
- Empty state when no storytellers found
- "Active This Week" card shows count of users with books > 0
- Current user enriched with real User entity data (avatar, streak, XP)

**Data flow:**
1. `User.me()` → current user
2. `Book.list("-created_date", 200)` → all books
3. Filter by date threshold based on time period
4. Group by `created_by` email
5. Compute books count, XP (100 per book), level (from `getLevelFromXP`)
6. Sort by selected category (XP / books / streak)
7. Mark current user entry with `isCurrentUser: true`

---

## 4.7 Profile Real Data Integration

**File: `src/pages/Profile.jsx`**

**New imports:**
- `UserBadge` from `@/entities/UserBadge`
- `useGamification, { BADGE_DEFINITIONS }` from `@/hooks/useGamification`

**Replaced `loadAchievementsData()` (was ~110 lines of hardcoded data, now ~40 lines):**
- Loads real badges from `UserBadge.filter({ user_id })`
- Computes stats (genres, languages, books, characters, shares, streak) from Book entity
- Maps BADGE_DEFINITIONS to achievement UI objects with real progress
- Each achievement has `completed`, `progress`, `max_progress`, `xp_reward`, translations

**Replaced `loadRecentActivityData()` (was ~30 lines of hardcoded data, now ~15 lines):**
- Builds activity list from real book data (last 10 books)
- Each activity has real title from book entity
- Hebrew/English labels based on language

**Updated calls:**
- `loadAchievementsData()` → `loadAchievementsData(user, allBooks)`
- `loadRecentActivityData()` → `loadRecentActivityData(allBooks)`

---

## 4.8 Home Page Integration

**File: `src/pages/Home.jsx`**

**New imports:**
- `useGamification` from `@/hooks/useGamification`
- `GamificationOverlay` from `@/components/gamification/GamificationOverlay`

**Changes:**
- Added `const gamification = useGamification();` at component top
- Removed hardcoded badges from initial userData state
- `loadUserData()` now merges real gamification data: level, xp, nextLevelXp, streakDays, earned badges
- Added `<GamificationOverlay>` before closing div for real-time celebrations

---

## 4.9 BookWizard XP Integration

**File: `src/pages/BookWizard.jsx`**

**New imports:**
- `useGamification` from `@/hooks/useGamification`
- `GamificationOverlay` from `@/components/gamification/GamificationOverlay`

**Changes:**
- Added `const gamification = useGamification();` at component top
- After `Book.update(id, { status: "complete" })`:
  - `gamification.awardXP("book_created")` — awards 100 XP
  - `gamification.incrementStat("totalBooks")` — increments book count for badge checking
- Added `<GamificationOverlay>` in render for celebrations on book creation

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Files created | 4 |
| Files modified | 5 |
| Files deleted | 0 |
| Lines added (est.) | ~570 |
| Lines removed (est.) | ~200 |
| Tests passing | 201 |
| Build status | Clean |

### Files Changed (Complete List)

**New files:**
1. `src/hooks/useGamification.js` — Central gamification engine
2. `src/components/gamification/CelebrationModal.jsx` — Confetti + level-up modal
3. `src/components/gamification/XPToast.jsx` — Floating XP notification
4. `src/components/gamification/GamificationOverlay.jsx` — Celebration queue

**Modified files:**
5. `src/components/gamification/BadgeDisplay.jsx` — Added new badge IDs + translations
6. `src/pages/Leaderboard.jsx` — Full rewrite with real entity data
7. `src/pages/Profile.jsx` — Real achievements from UserBadge
8. `src/pages/Home.jsx` — Wired gamification hook + overlay
9. `src/pages/BookWizard.jsx` — XP award on book creation + overlay
