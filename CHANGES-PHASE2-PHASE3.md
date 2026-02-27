# Master Plan - Detailed Changes Report
## Phase 2: Unified Creation Flow + Phase 3: Magical Book Reader
### Date: February 27, 2026

---

## Phase 2: Unified Creation Flow

### 2.1 Sidebar Rename & Reorder

**File: `src/Layout.jsx`**

| Change | Before | After |
|--------|--------|-------|
| Primary create link | CreativeStoryStudio → "Create Book" | BookWizard → "Create Book" |
| Secondary create link | BookWizard → "Quick Create" | CreativeStoryStudio → "Story Studio" |
| Hebrew label (primary) | "יצירת ספר" (on CSS) | "יצירת ספר" (on BookWizard) |
| Hebrew label (secondary) | "יצירה מהירה" (on BookWizard) | "סטודיו סיפורים" (on CSS) |
| Translation key | `common.quickCreate` | `common.storyStudio` |
| Hebrew page name map | BookWizard = "יצירה מהירה" | BookWizard = "יצירת ספר" |

**Lines changed:** ~15 lines across translations and navItems objects

---

### 2.2 TopicStep Enhancement — "My Own Idea" + "Use Saved Idea"

**File: `src/components/wizard/TopicStep.jsx`**

**New imports:**
- `useState, useEffect` from React
- `AnimatePresence` from framer-motion
- `PenLine, Lightbulb` from lucide-react
- `Textarea` from `@/components/ui/textarea`
- `Button` from `@/components/ui/button`
- `StoryIdea` from `@/entities/StoryIdea`

**New props:**
- `customIdea` (string) — text content for custom idea
- `onCustomIdeaChange` (function) — callback to update custom idea

**New state:**
- `showCustomIdea` (boolean) — toggles custom idea text input
- `showSavedIdeas` (boolean) — toggles saved ideas list
- `savedIdeas` (array) — loaded StoryIdea entities
- `isLoadingIdeas` (boolean) — loading state for ideas

**New functions:**
- `loadSavedIdeas()` — fetches `StoryIdea.list("-created_date", 10)` from entity
- `handleSelectCustomIdea()` — sets topic to "custom", shows text input
- `handleSelectSavedIdea(idea)` — fills custom idea from saved idea

**New UI elements:**
1. **"My Own Idea" card** — Added as 13th card in topic grid, dashed border, PenLine icon, purple gradient
2. **Custom idea textarea** — Animated collapse/expand, 500 char limit, placeholder text in HE/EN
3. **"Use Saved Idea" button** — Ghost button centered below grid, Lightbulb icon
4. **Saved ideas panel** — Animated collapse, scrollable list (max 60vh), loading spinner, empty state text

**Lines added:** ~120 lines

---

### 2.3 PreviewEditStep Enhancement — Language Selector + Advanced Toggle

**File: `src/components/wizard/PreviewEditStep.jsx`**

**New imports:**
- `useState` from React
- `AnimatePresence` from framer-motion
- `Globe, ChevronDown, Settings2` from lucide-react

**New state:**
- `showAdvanced` (boolean) — toggles advanced settings panel

**New UI elements:**
1. **Language selector card** — Globe icon + Select dropdown (English/עברית/יידיש), placed between description and art style
2. **Advanced Settings toggle** — Ghost button with Settings2 icon + rotating ChevronDown
3. **Advanced panel (collapsible):**
   - **Tone selector** — Exciting/Calm/Funny/Educational/Mysterious (HE/EN labels)
   - **Age range selector** — 3-5/5-7/7-10/10-12 with HE/EN labels and context (Preschool/Kindergarten/etc.)
   - **Detailed moral textarea** — 300 char limit, optional, for expanded moral message

**Lines added:** ~90 lines

---

### 2.4 SaveStep Cleanup — Remove Placeholders + Add Progress

**File: `src/components/wizard/SaveStep.jsx`**

**Removed:**
- `Download, Share2` icon imports
- 3 disabled placeholder cards ("Download coming soon", "Share coming soon", "Library coming soon")
- `grid grid-cols-1 sm:grid-cols-3` layout wrapping all buttons

**Added:**
- `Loader2` icon import
- `creationProgress` prop (object: `{ label, percent, step }`)
- Spinner icon on CTA button during creation
- **Progress bar card** — Appears during creation, shows:
  - Label text (current step)
  - Percentage
  - Animated gradient progress bar
  - Step indicator text

**Lines changed:** ~40 removed, ~50 added

---

### 2.5 Parallel Page Generation

**File: `src/pages/BookWizard.jsx`**

**New imports:**
- `Page` from `@/entities/Page`

**New state:**
- `customIdea` (string) — passed to TopicStep
- `creationProgress` (object) — passed to SaveStep

**Updated `canGoNext()` validation:**
- Step 0: `custom` topic requires `customIdea.trim()` to have content

**Updated TopicStep rendering:**
- Now passes `customIdea` and `onCustomIdeaChange={setCustomIdea}` props

**Updated SaveStep rendering:**
- Now passes `creationProgress` prop

**Rewritten `createBook()` function (was ~55 lines, now ~120 lines):**

| Step | Before | After |
|------|--------|-------|
| 1 | Generate cover → Create book → Navigate to BookCreation | Content moderation check |
| 2 | — | Outline + cover in parallel (`Promise.all`) |
| 3 | — | Create book entity (status: "generating") |
| 4 | — | ALL page texts in parallel (N `InvokeLLM` calls) |
| 5 | — | ALL illustrations in parallel (N `GenerateImage` calls) |
| 6 | — | ALL pages saved in parallel (N `Page.create` calls) |
| 7 | — | Book status → "complete" |
| 8 | Navigate to BookCreation (edit mode) | Navigate to BookView (read mode) |

**Progress updates at each stage:**
- 5%: "Checking content..."
- 10%: "Creating story & cover..."
- 25%: "Saving book..."
- 35%: "Writing the story..."
- 60%: "Drawing illustrations..."
- 85%: "Saving pages..."
- 100%: "Book ready!"

---

### 2.6 CreativeStoryStudio Deprecation Banner

**File: `src/pages/CreativeStoryStudio.jsx`**

**New imports:**
- `Link` from react-router-dom
- `ArrowRight, ArrowLeft` from lucide-react

**New UI element:**
- Gradient banner at top of page (purple-to-indigo)
- Links to BookWizard
- RTL-aware arrow direction
- Hebrew text: "שדרגנו! נסה את יצירת הספר החדשה"
- English text: "We've upgraded! Try our new Create Book wizard"
- Subtitle: "A simpler, smarter experience in 4 steps"

**Lines added:** ~25 lines

---

## Phase 3: Magical Book Reader

### 3.1 PageFlip Component (NEW FILE)

**File: `src/components/bookReader/PageFlip.jsx`**

- Framer Motion `AnimatePresence` with 3D `rotateY` animation
- Spring physics: `stiffness: 200, damping: 30`
- `perspective: 1200px` for depth
- Direction-aware (RTL flips direction)
- Props: `pageKey`, `direction`, `isRTL`, `children`

**Lines:** 55

---

### 3.2 useTTS Hook (NEW FILE)

**File: `src/hooks/useTTS.js`**

- Wraps `window.speechSynthesis` Web Speech API
- Language-aware voice selection with fallback chain:
  - Hebrew: `he` → `he-IL` → `iw`
  - Yiddish: `yi` → `he` → `he-IL`
  - English: `en` → `en-US` → `en-GB`
- Word-by-word highlighting via `onboundary` events
- `currentWordIndex` state for highlight sync
- Speed control: 0.5x to 2x (default 1x)
- Auto-cleanup on unmount
- Returns: `{ speak, stop, pause, resume, isSpeaking, isPaused, currentWordIndex, rate, setRate }`

**Lines:** 110

---

### 3.3 TTSControls Component (NEW FILE)

**File: `src/components/bookReader/TTSControls.jsx`**

- Play/Pause/Resume toggle button
- Stop button (visible only while speaking)
- Speed control: `-` / label / `+` buttons
- Speed labels: "Slow"/"Normal"/"Fast" (HE: "איטי"/"רגיל"/"מהיר")
- RTL-aware layout
- All buttons have aria-labels in HE/EN

**Lines:** 100

---

### 3.4 PDF Exporter (NEW FILE)

**File: `src/utils/pdfExporter.js`**

- Uses `jsPDF` (already in `package.json`)
- `exportBookToPDF(book, pages, options)`:
  - **Cover page:** Purple gradient background, centered cover image, title, subtitle
  - **Content pages:** Illustration (scaled to max 40% height), text below, page number
  - **Image loading:** `crossOrigin: 'anonymous'`, fallback on error
  - **Formats:** A4 (210x297mm) or Letter (215.9x279.4mm)
  - **Margins:** 15mm all sides
  - **Progress callback:** Reports 0-100% for UI progress bar
  - **Filename:** Generated from title, Hebrew-safe, spaces to dashes

**Lines:** 120

---

### 3.5 BookView Full Rewrite

**File: `src/pages/BookView.jsx`** (complete rewrite, 226 → 330 lines)

**New imports:**
- `useCallback, useRef` from React
- `User` entity (for language detection)
- `Maximize, Minimize, Moon, Sun, ZoomIn, ZoomOut, Loader2, Download` from lucide-react
- `PageFlip` component
- `TTSControls` component
- `useTTS` hook
- `exportBookToPDF` utility

**Removed imports:**
- `Bookmark, Share2, MessageSquare` (unused)

**New state:**
| State | Type | Purpose |
|-------|------|---------|
| `direction` | number | Page flip animation direction (1/-1) |
| `currentLanguage` | string | User language for i18n |
| `isFullscreen` | boolean | Fullscreen mode |
| `nightMode` | boolean | Night reading mode |
| `zoomLevel` | number | 0.75 - 2.0 |
| `isExportingPDF` | boolean | PDF export in progress |
| `pdfProgress` | number | PDF export progress 0-100 |

**New features in detail:**

| Feature | Implementation |
|---------|---------------|
| **Page flip animation** | `PageFlip` wraps book content, `direction` state tracks nav direction |
| **TTS narration** | `useTTS` hook + `TTSControls` in header, word highlighting in text |
| **Keyboard nav** | `useEffect` with `keydown` listener, ArrowLeft/Right (RTL-aware), Escape |
| **Swipe gestures** | `onTouchStart`/`onTouchEnd` handlers, 50px threshold, RTL-aware |
| **Reading progress** | `localStorage.getItem/setItem` with key `book_{id}_page` |
| **Fullscreen** | `requestFullscreen()`/`exitFullscreen()`, synced with `fullscreenchange` event |
| **Night mode** | Independent dark theme with amber tints, toggled via Moon/Sun icon |
| **Zoom** | CSS `transform: scale()` on book container, 0.75x-2x range |
| **Progress bar** | Gradient bar below header, width = `currentPage / (total-1) * 100%` |
| **PDF export** | `exportBookToPDF()` with progress bar in header |
| **Word highlighting** | `renderHighlightedText()` splits text, wraps current word in yellow bg |
| **RTL support** | All nav buttons, arrows, swipe, layout direction-aware |
| **Hebrew labels** | All UI text bilingual |
| **Parallel data loading** | Book + Pages loaded with `Promise.all` |
| **User language detection** | Loads `User.me()` language, falls back to book language |

---

## Summary Statistics

| Metric | Phase 2 | Phase 3 | Total |
|--------|---------|---------|-------|
| Files modified | 6 | 1 | 7 |
| Files created | 0 | 4 | 4 |
| Files deleted | 0 | 0 | 0 |
| Lines added (est.) | ~350 | ~715 | ~1065 |
| Lines removed (est.) | ~60 | ~150 | ~210 |
| Tests passing | 201 | 201 | 201 |
| Build status | Clean | Clean | Clean |

### Files Changed (Complete List)

**Phase 2:**
1. `src/Layout.jsx` — Sidebar nav reorder + translation keys
2. `src/components/wizard/TopicStep.jsx` — "My Own Idea" + "Use Saved Idea"
3. `src/components/wizard/PreviewEditStep.jsx` — Language selector + advanced toggle
4. `src/components/wizard/SaveStep.jsx` — Remove placeholders + progress bar
5. `src/pages/BookWizard.jsx` — Parallel generation + navigate to BookView
6. `src/pages/CreativeStoryStudio.jsx` — Deprecation banner

**Phase 3:**
7. `src/pages/BookView.jsx` — Full rewrite with rich reader
8. `src/hooks/useTTS.js` — NEW: Text-to-Speech hook
9. `src/utils/pdfExporter.js` — NEW: PDF export utility
10. `src/components/bookReader/PageFlip.jsx` — NEW: Page flip animation
11. `src/components/bookReader/TTSControls.jsx` — NEW: TTS controls
