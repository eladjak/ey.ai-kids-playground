# EY.AI Kids Playground - Project Instructions

## Project Overview
**EY.AI Kids Playground** - פלטפורמה מקיפה ליצירה, שיתוף והדפסת ספרי ילדים מותאמים אישית עם AI.
הילד/ההורה בוחר דמויות, סגנון, שפה וז'אנר - וה-AI יוצר ספר שלם עם סיפור ואיורים.

## Tech Stack
- **Frontend:** React 18 + Vite (JSX, not TypeScript)
- **Backend/BaaS:** Base44 SDK (`@base44/sdk`)
- **UI:** Radix UI + shadcn/ui + Tailwind CSS
- **Animation:** Framer Motion
- **State:** React Query (TanStack Query v5)
- **Routing:** React Router DOM v6
- **Icons:** Lucide React
- **Charts:** Recharts
- **3D:** Three.js
- **i18n:** Custom (Hebrew, English, Yiddish with RTL)
- **PDF:** jsPDF + html2canvas

## Architecture
```
src/
  api/           → Base44 client, entities, integrations
  components/    → Reusable components by domain
    ai/          → AI Studio, Image Generator, Character Designer
    bookCreation/ → Book writing & illustration flow
    characters/   → Character cards & image generation
    collaborate/  → Collaborative editing
    community/    → Social features
    createBook/   → Book creation wizard steps
    feedback/     → Feedback system
    gamification/ → Achievements, badges, rewards
    home/         → Homepage components
    i18n/         → Internationalization
    interactive/  → Interactive story elements
    library/      → Book library
    profile/      → User profile & stats
    storyBuilder/ → Story structure builder
    storyIdeas/   → Idea generator
    ui/           → shadcn/ui primitives
  entities/      → (aliased from api/entities)
  hooks/         → Custom React hooks
  integrations/  → (aliased from api/integrations)
  lib/           → Auth, utils, navigation
  pages/         → Route pages (19 pages)
  utils/         → Utility functions
```

## Key Pages
| Page | Purpose |
|------|---------|
| Home | Dashboard with gamification, featured books, daily prompt |
| CreativeStoryStudio | Main book creation flow (unified) |
| BookCreation | Book writing & illustration process |
| BookView | Read/view completed books |
| Characters | Character library |
| CharacterEditor | Edit individual characters |
| Library | User's book library |
| Community | Shared books & social features |
| StoryIdeas | Story idea generator |
| Collaborate | Collaborative book editing |
| Leaderboard | Gamification rankings |
| Profile | User profile & achievements |
| Documentation | Work plan & roadmap (embedded) |

## AI Integrations (via Base44)
- `InvokeLLM` - Text generation (stories, prompts, analysis)
- `GenerateImage` - Image generation (illustrations, avatars, scene sketches)
- `UploadFile` - File uploads
- `SendEmail` / `SendSMS` - Notifications

## Current Development Phase
**Phase 1:** Story Structure Builder Integration (IN PROGRESS)
- Scene Cards UI complete
- Integration with CreativeStoryStudio needed
- Hebrew RTL support needed
- Scene sketch generation with story data needed

**Phase 2:** Character Integration + Community Prep
**Phase 3:** ShareHub (export to PDF/ePub/MP4, print integration)
**Phase 4:** AI Studio (multi-model selection)

## Development Rules
1. **Language:** Hebrew-first with English support. All UI must support RTL
2. **Child Safety:** All content must be age-appropriate. No scary/violent content
3. **Accessibility:** Large touch targets, clear fonts, high contrast
4. **Performance:** Image caching with localStorage, lazy loading
5. **Gamification:** XP, levels, badges, streaks integrated throughout
6. **AI Prompts:** Always include age range and language in AI prompts

## File Conventions
- JSX files (not TSX) - project uses JavaScript with JSConfig
- Components use default exports
- Pages are registered in `pages.config.js`
- Layout wraps all pages via `Layout.jsx`
- Shared UI from `components/ui/` (shadcn)

## Important Notes
- Base44 handles auth, DB, and AI integrations
- `requiresAuth: true` in current config (auth enabled)
- Images cached in localStorage for 24h
- Entities: `Query` (generic), `User` (auth)
- Tests configured with vitest + @testing-library/react (see vitest.config.js)
- No TypeScript strict mode (jsconfig.json)
