# EY.AI Kids - Development Roadmap

## Project Vision: AI Story Director
Transform the app from simple story creation to a complete "AI Story Director" experience where users direct their stories with AI as their creative production team.

## Core Principles
1. **AI-First, User-Control Always** - Excellent automatic suggestions, but complete user control
2. **Rich Visualization** - Every element gets visual representation
3. **Community Sharing** - Share characters, environments, soundtracks, even voice clones
4. **Deep Gamification** - Achievement system integrated throughout

## CRITICAL INFRASTRUCTURE TASKS (High Priority - Before Launch)
### A. Backend Architecture & API Design
- **Current State:** Basic entity operations only
- **Required:** 
  - Comprehensive API layer for all operations
  - Advanced querying and filtering
  - Real-time collaboration support
  - File upload and management system
  - User permissions and access control
  - Performance optimization and caching
  - Error handling and logging

### B. Code Refactoring & Architecture
- **Current State:** Large files with hundreds of lines, mixed responsibilities
- **Required:**
  - Break down large components into focused, single-responsibility components
  - Implement consistent design patterns
  - Create reusable hooks and utilities
  - Standardize error handling
  - Optimize performance and bundle size
  - Implement proper TypeScript types
  - Code documentation and testing

## Current Development: Story Structure Builder

### Phase 1: Story Structure Builder Integration 🚧 IN PROGRESS
**Current Status:** Basic framework created, now integrating with existing flow

**What we're building RIGHT NOW:**
1. ✅ Basic StoryStructureBuilder component created
2. 🔄 **NEXT:** Integration with CreativeStoryStudio flow
3. 🔄 **NEXT:** Full Hebrew RTL support and translations
4. 🔄 **NEXT:** Scene visual generation that reflects actual story content
5. 🔄 **NEXT:** Complete user control over all elements

**Integration Points:**
- Replace/enhance the current story refinement step
- Connect with existing character system
- Maintain all existing bookData structure
- Preserve user's previous work

**Immediate Tasks (Next 3 steps):**
1. **Connect to CreativeStoryStudio:** Replace StoryRefinementStep with StoryStructureBuilder
2. **Complete Hebrew Support:** All UI elements, proper RTL alignment
3. **Visual Integration:** Scene sketches that actually reflect story content with characters

## Core Components (Full Vision)

### A. Narrative Engine (מנוע הנרטיב)
**Story Structure Builder:** ✅ Framework Ready, 🔄 Integration in Progress
- Story arcs selection (Hero's Journey, Three Acts, Mystery Solving)
- Scene Cards with visual sketches
- Interactive flow diagram
- Pacing control (fast action, slow emotional moments)
- Environment generator with visual cards

**Features Status:**
- ✅ Scene Cards UI with modern design
- 🔄 Scene sketches that reflect actual story content
- 🔄 Drag-and-drop scene reordering (basic version ready)
- 🔄 Environment cards with background images and color palettes
- 🔄 Granular control - edit any scene in detail panel

### B. Full Character Generator (גנרטור הדמויות המלא)
**Status:** 🔄 Character integration with scenes needed

### C. Advanced Story Settings (תיבת הגדרות הסיפור המתקדמת)
**Status:** 🔄 Planned for Phase 2

### D. Voice Cloning Integration
**ElevenLabs Integration:** 🔄 Planned for Phase 3

### E. Deep Gamification System
**Status:** 🔄 Planned for Phase 2

## Development Phases

### Phase 1: Story Structure Builder + Integration ⏳ CURRENT FOCUS
**Goals:**
- ✅ Build Scene Cards UI with modern design
- 🔄 Full integration with existing CreativeStoryStudio flow
- 🔄 Complete Hebrew RTL support
- 🔄 Scene sketches that reflect actual story elements
- 🔄 Full user control over all scene elements
- 🔄 Character integration with scenes

**Current Step-by-Step Plan:**
1. **Step 1:** Connect StoryStructureBuilder to CreativeStoryStudio (replace existing step)
2. **Step 2:** Implement complete Hebrew translations and RTL support
3. **Step 3:** Enhance scene generation to use actual story data (characters, plot, etc.)
4. **Step 4:** Add scene editing capabilities
5. **Step 5:** Character-scene integration with visual consistency

### Phase 2: Character Integration + Community Prep
**Goals:**
- Connect characters to scenes with visualization
- Basic sharing system (share character button)
- Character tagging system

### Phase 3: Advanced Features
**Goals:**
- Full community sharing system
- Voice cloning integration
- Advanced gamification
- Environment and soundtrack sharing

## Technical Architecture

### Current File Structure Status:
```
components/
├── storyBuilder/           ✅ NEW - Created
│   ├── StoryStructureBuilder.jsx  ✅ Basic version ready
│   ├── SceneCard.jsx       🔄 Needs enhancement
│   ├── SceneEditor.jsx     ❌ TODO
│   └── EnvironmentGenerator.jsx   ❌ TODO
├── createBook/             ⚠️ NEEDS REFACTORING
│   └── StoryRefinementStep.jsx    🔄 Being replaced/enhanced
└── ...
```

### New Entities Needed:
- Scene (scene data with environment, characters, actions)
- Environment (shareable environment templates)
- SharedResource (community shared items)
- VoiceProfile (user voice clones)
- Achievement (gamification achievements)

## IMMEDIATE NEXT ACTIONS:

### TODAY'S DEVELOPMENT PLAN:
1. **🔄 WORKING ON:** Connect StoryStructureBuilder to main CreativeStoryStudio flow
2. **🔄 NEXT:** Complete Hebrew RTL support
3. **🔄 NEXT:** Enhance scene generation with actual story data

### WHAT I'M DOING RIGHT NOW:
- Integrating the new StoryStructureBuilder into the main CreativeStoryStudio flow
- Ensuring no existing functionality is broken
- Maintaining all existing bookData structure and user progress

---
*Last Updated: Current Session*
*Current Focus: Phase 1 - Story Structure Builder Integration*
*Next Step: Connect to main flow without breaking existing code*