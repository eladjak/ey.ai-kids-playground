# Sipurai (סיפוראי)

**Create, Share & Print Personalized Children's Books with AI**

## Overview

Sipurai is an interactive platform where children and parents create personalized storybooks from scratch using AI. The platform guides users through every step - from brainstorming story ideas to generating illustrations, and finally exporting print-ready books.

### Key Features

- **Creative Story Studio** - Guided multi-step book creation with AI assistance
- **AI-Powered Illustrations** - Generate custom artwork for every page
- **Character Designer** - Create and save reusable characters with AI avatars
- **Story Builder** - Scene-by-scene story structuring with drag-and-drop
- **AI Story Tools** - Pacing analyzer, theme checker, dialogue enhancer, story doctor
- **Multi-language** - Full Hebrew, English & Yiddish support with RTL
- **Gamification** - Levels, XP, badges, daily streaks, leaderboards
- **Community** - Share books, collaborate, comment, and discover stories
- **Export & Print** - PDF, ePub, and direct print integration (coming soon)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| UI | Radix UI + shadcn/ui + Tailwind CSS |
| Backend | Base44 SDK (BaaS) |
| AI | LLM (text) + Image Generation (illustrations) |
| Animation | Framer Motion |
| State | React Query v5 |
| Routing | React Router v6 |
| Icons | Lucide React |
| 3D | Three.js |
| PDF | jsPDF + html2canvas |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
  api/                  Base44 client, entities & AI integrations
  components/
    ai/                 AI Studio, Image Generator, Character Designer
    bookCreation/       Book writing & illustration flow
    characters/         Character cards & image generation
    collaborate/        Collaborative editing
    community/          Social features & sharing
    createBook/         Book creation wizard steps
    feedback/           Feedback system
    gamification/       Achievements, badges, rewards
    i18n/               Internationalization (HE/EN/YI)
    interactive/        Interactive story elements
    storyBuilder/       Scene-based story structure builder
    storyIdeas/         Idea generator & saved ideas
    ui/                 shadcn/ui primitives
  hooks/                Custom React hooks
  lib/                  Auth, utils, navigation
  pages/                19 route pages
  utils/                Utility functions
```

## User Flow

```
Home Page
  |
  +--> Creative Story Studio (main creation flow)
  |      1. Choose starting point (new idea / saved idea / direct)
  |      2. Generate/select story idea with AI
  |      3. Refine story (characters, plot, moral)
  |      4. Choose art style
  |      5. Preview & create book
  |
  +--> Book Creation (writing & illustration)
  |      - AI generates story text page by page
  |      - AI generates illustrations per page
  |      - Scene editing, pacing analysis, dialogue enhancement
  |
  +--> Book View (read completed book)
  |
  +--> Library (browse all your books)
  |
  +--> Characters (manage character library)
  |
  +--> Community (share & discover)
  |
  +--> Profile (achievements, stats, leaderboard)
```

## Development Status

See the in-app Documentation page for the full work plan and roadmap.

**Current Phase:** Story Structure Builder Integration
**Next:** ShareHub (export/print) + AI Studio (multi-model)
