# Master Plan - Detailed Changes Report
## Phase 5: Polish & Community
### Date: February 27, 2026

---

## 5.1 OnboardingWizard (NEW FILE)

**File: `src/components/onboarding/OnboardingWizard.jsx`** (220 lines)

**Props:**
- `onComplete` — callback when onboarding finishes
- `userName` — optional pre-filled name

**Steps:**

| Step | ID | Content |
|------|----|---------|
| 0 | welcome | Animated welcome screen with purple gradient icon |
| 1 | profile | Name input + age range selector (2-4, 5-7, 8-10, 11-13) |
| 2 | language | Language picker (English, Hebrew, Yiddish) with radio cards |
| 3 | topics | Topic selector (12 topics) — badge-style toggles |

**Topics available:**
adventure, fantasy, animals, science, fairy_tale, family, friendship, nature, humor, bedtime, sports, magic

**Features:**
- Progress bar (4 segments)
- Framer Motion slide transitions between steps
- RTL-aware (switches direction when Hebrew/Yiddish selected)
- Skip button on optional steps
- Saves to: `User.updateMyProfile()` + localStorage (`appLanguage`, `onboarding_complete`, `preferredAgeRange`, `favoriteTopics`)
- Backdrop blur overlay (z-50)
- Full EN/HE translations

**Triggered by:** `localStorage.getItem("onboarding_complete")` being falsy → shown on Home page

---

## 5.2 Community Improvements

### 5.2a N+1 Query Fix — `src/pages/Community.jsx`

**Removed:** Two `Promise.all(posts.map(async post => { Book.get(); User.get(); Comment.filter() }))` blocks that made 3 API calls per post.

**Added:** `batchEnhancePosts(posts)` function:
1. Collects unique `book_id` and `user_id` sets
2. Fetches all books, users, and comments in 3 parallel batches
3. Builds lookup maps (`bookMap`, `userMap`)
4. Maps posts with enriched data in O(n)

**Impact:** Reduced from 3N API calls to 3 batched calls (N books + N users + N comments, but in parallel).

### 5.2b Like Button Visual Fix — `src/components/community/CommunityPost.jsx`

**Before:** `<Heart className={post.likes > 0 ? 'fill-red-500' : ''}` — showed red heart if ANY user liked the post.

**After:** `<Heart className={isLiked ? 'fill-red-500' : ''}` — shows red heart only if CURRENT user liked the post.

**New prop:** `isLiked` (boolean) — passed from Community.jsx based on `likedPosts.includes(post.id)`.

### 5.2c Report Button — `src/components/community/CommunityPost.jsx`

**Before:** DropdownMenu only showed for `isOwner` (Edit/Delete).

**After:** DropdownMenu always visible:
- Owner: Edit Post + Delete Post
- Non-owner: Report (with Flag icon, orange text)

**New prop:** `onReport(postId)` — callback that saves to `localStorage.reportedPosts` array and shows toast.

---

## 5.3 Home Page Overhaul — `src/pages/Home.jsx`

### 5.3a Removed AI Hero Image

**Removed:**
- `import { GenerateImage }` — no longer imported
- `isHeroLoading` state
- `heroImage` state
- `generateHeroImage()` function (~30 lines) — made expensive `GenerateImage` API call on every load (with 24h cache)
- Unsplash fallback URL
- `await Promise.all([generateHeroImage(), generateDailyPrompt()])` → now just `await generateDailyPrompt()`

**Replaced with:** Static gradient hero with decorative CSS elements:
- `bg-gradient-to-br from-purple-700 via-indigo-600 to-violet-800`
- Decorative circles (`bg-white/5`) and faded icons (Sparkles, BookOpen, Star)
- Same CTA buttons (Create Book + View Library)
- Reduced height: 500px → 320px max

**Impact:** Saves 1 `GenerateImage` API call per home page load (expensive operation).

### 5.3b "Continue Where You Left Off" Section

**New state:** `draftBooks` — books with `status !== "complete"`

**Updated `loadUserData()`:**
- Now fetches 10 books instead of 6
- Separates drafts from completed books
- `setDraftBooks(drafts.slice(0, 3))`
- `setRecentBooks(completedBooks.slice(0, 6))`

**New section:** Rendered between Progress card and Tabs, only when `draftBooks.length > 0`:
- Orange-themed cards with Clock icon header
- Each card shows: book cover thumbnail, title, status badge (Draft/Generating...)
- "Continue" button → links to `BookCreation?id={bookId}`
- Full EN/HE translations for new keys

### 5.3c First-Time Onboarding

**New import:** `OnboardingWizard` from `@/components/onboarding/OnboardingWizard`

**New state:** `showOnboarding` — initialized from `!localStorage.getItem("onboarding_complete")`

**Render:** `<OnboardingWizard>` shown as overlay when `showOnboarding` is true, dismissed on complete.

---

## 5.4 Performance

### 5.4a LazyImage Component (NEW FILE)

**File: `src/components/shared/LazyImage.jsx`** (60 lines)

**Props:**
- `src` — image URL
- `alt` — alt text
- `className` — container class
- `placeholderClassName` — loading placeholder class
- `fallback` — JSX when no src
- `rootMargin` — IntersectionObserver margin (default "200px")

**Features:**
- Uses `IntersectionObserver` to detect viewport entry
- Only loads image when in view (200px margin for pre-loading)
- Fade-in transition (opacity 0→1, 200ms)
- Pulse placeholder while loading
- Graceful fallback when IntersectionObserver not available
- Native `loading="lazy"` attribute as additional optimization

### 5.4b React.memo on CommunityPost

**File: `src/components/community/CommunityPost.jsx`**

**Changed:** `export default function CommunityPost` → `function CommunityPost` + `export default memo(CommunityPost)`

**Impact:** Prevents re-renders when parent re-renders but post data hasn't changed (common with list updates).

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Files created | 2 |
| Files modified | 3 |
| Files deleted | 0 |
| Lines added (est.) | ~350 |
| Lines removed (est.) | ~60 |
| Tests passing | 201 |
| Build status | Clean |

### Files Changed (Complete List)

**New files:**
1. `src/components/onboarding/OnboardingWizard.jsx` — First-time user wizard
2. `src/components/shared/LazyImage.jsx` — IntersectionObserver lazy image

**Modified files:**
3. `src/pages/Home.jsx` — Removed AI hero, added static gradient + drafts section + onboarding
4. `src/pages/Community.jsx` — N+1 batch fix, pass isLiked/onReport to posts
5. `src/components/community/CommunityPost.jsx` — Like visual fix, report button, React.memo
