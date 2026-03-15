/**
 * Shared mock setup for page rendering tests.
 * Import this file at the top of each page test file BEFORE page imports.
 * vi.mock calls are hoisted by vitest, so import order doesn't matter.
 */
import { vi } from "vitest";
import React from "react";

// Mock secureEntity to pass through in tests
vi.mock("@/lib/secureEntity", () => ({
  createSecureEntity: (entity) => entity,
}));

// Mock AuthContext (useCurrentUser depends on useAuth)
vi.mock("@/lib/AuthContext", () => ({
  useAuth: () => ({
    user: { email: "test@test.com", full_name: "Test User", display_name: "Test User", language: "english", level: 1, xp: 0, streak_days: 0 },
    isAuthenticated: true,
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null,
    navigateToLogin: vi.fn(),
    logout: vi.fn(),
    checkAppState: vi.fn(),
  }),
  AuthProvider: ({ children }) => children,
  FallbackAuthProvider: ({ children }) => children,
}));

// Mock all entities
vi.mock("@/entities/Book", () => ({ Book: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/Page", () => ({ Page: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/Character", () => ({ Character: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/Community", () => ({ Community: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/Comment", () => ({ Comment: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/StoryIdea", () => ({ StoryIdea: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/Feedback", () => ({ Feedback: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/UserBadge", () => ({ UserBadge: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/Collaboration", () => ({ Collaboration: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/Follow", () => ({ Follow: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/Notification", () => ({ Notification: { create: vi.fn().mockResolvedValue({ id: "test-id" }), filter: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), list: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/entities/User", () => ({
  User: {
    me: vi.fn().mockResolvedValue({ email: "test@test.com", full_name: "Test User", language: "english" }),
    updateMyUserData: vi.fn().mockResolvedValue({}),
    logout: vi.fn().mockResolvedValue({}),
  },
}));

// Mock integrations
vi.mock("@/integrations/Core", () => ({
  InvokeLLM: vi.fn().mockResolvedValue({ title: "Test Prompt", description: "A test description" }),
  GenerateImage: vi.fn().mockResolvedValue({ url: "https://example.com/test.png" }),
}));

// Mock hooks
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    user: { email: "test@test.com", full_name: "Test User", display_name: "Test User", language: "english", level: 1, xp: 0, next_level_xp: 200, streak_days: 0 },
    loading: false,
  }),
  default: () => ({
    user: { email: "test@test.com", full_name: "Test User", display_name: "Test User", language: "english", level: 1, xp: 0, next_level_xp: 200, streak_days: 0 },
    loading: false,
  }),
}));

vi.mock("@/hooks/useGamification", () => ({
  default: () => ({
    awardXP: vi.fn(),
    checkBadges: vi.fn(),
    badges: [],
    level: 1,
    xp: 0,
    streak: 0,
  }),
  BADGE_DEFINITIONS: [],
  getLevelFromXP: (xp) => Math.floor(xp / 200) + 1,
  getNextLevelXP: (level) => level * 200,
  XP_EVENTS: {},
  LEVEL_THRESHOLDS: [],
}));

vi.mock("@/hooks/useCharacterSelector", () => ({
  default: () => ({
    savedCharacters: [],
    isLoading: false,
    reload: vi.fn(),
    entityToSelection: vi.fn(),
    templateToSelection: vi.fn(),
  }),
}));

// Mock i18n provider
vi.mock("@/components/i18n/i18nProvider", async () => {
  const en = await vi.importActual("@/components/i18n/locales/en");
  const translations = en.default;

  const t = (key, replacements = {}) => {
    if (!key) return "";
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key;
      }
    }
    if (typeof value === "string" && Object.keys(replacements).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, match) =>
        replacements[match] !== undefined ? replacements[match] : `{{${match}}}`
      );
    }
    return typeof value === "string" ? value : key;
  };

  return {
    useI18n: () => ({
      t,
      language: "english",
      direction: "ltr",
      isRTL: false,
      changeLanguage: vi.fn(),
      loading: false,
      isReady: true,
      languages: { english: { code: "en", name: "English", direction: "ltr" } },
    }),
    I18nContext: { Provider: ({ children }) => children, Consumer: ({ children }) => children({}) },
    I18nProvider: ({ children }) => children,
    LANGUAGES: { english: { code: "en", name: "English", direction: "ltr" } },
  };
});

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/", search: "", state: null }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) =>
      React.forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, whileInView, custom, variants, layout, layoutId, ...props }, ref) => {
        const Tag = typeof tag === "string" ? tag : "div";
        return React.createElement(Tag, { ref, ...props }, children);
      }),
  }),
  AnimatePresence: ({ children }) => children,
  useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
  useTransform: () => ({ set: vi.fn(), get: () => 0 }),
  useSpring: () => ({ set: vi.fn(), get: () => 0 }),
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView: () => true,
}));

// Mock UI components
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }) => React.createElement("div", { className, "data-testid": "skeleton" }),
}));

// Mock sub-components
vi.mock("@/components/gamification/GamificationOverlay", () => ({
  default: () => React.createElement("div", { "data-testid": "gamification-overlay" }),
}));

vi.mock("@/components/onboarding/OnboardingWizard", () => ({
  default: () => React.createElement("div", { "data-testid": "onboarding-wizard" }),
}));

vi.mock("@/components/home/UserWelcomeCard", () => ({
  default: ({ userData }) => React.createElement("div", { "data-testid": "user-welcome-card" }, userData?.full_name || "Guest"),
}));

vi.mock("@/components/home/DailyPromptCard", () => ({
  default: () => React.createElement("div", { "data-testid": "daily-prompt-card" }),
}));

vi.mock("@/components/home/DraftBooksSection", () => ({
  default: () => React.createElement("div", { "data-testid": "draft-books-section" }),
}));

vi.mock("@/components/home/FeaturedBooksSection", () => ({
  default: () => React.createElement("div", { "data-testid": "featured-books-section" }),
}));

vi.mock("@/components/library/BookCard", () => ({
  default: (props) => React.createElement("div", { "data-testid": "book-card" }, props.book?.title || "Book"),
}));

vi.mock("@/components/library/EmptyState", () => ({
  default: () => React.createElement("div", { "data-testid": "empty-state" }, "No books yet"),
}));

vi.mock("@/components/community/CommunityPost", () => ({
  default: (props) => React.createElement("div", { "data-testid": "community-post" }, props.post?.title || "Post"),
}));

vi.mock("@/components/community/FeaturedStory", () => ({
  default: () => React.createElement("div", { "data-testid": "featured-story" }),
}));

vi.mock("@/components/community/ShareBookModal", () => ({
  default: () => React.createElement("div", { "data-testid": "share-book-modal" }),
}));

vi.mock("@/components/storyIdeas/IdeaGenerator", () => ({
  default: () => React.createElement("div", { "data-testid": "idea-generator" }),
}));

vi.mock("@/components/storyIdeas/SavedIdeas", () => ({
  default: () => React.createElement("div", { "data-testid": "saved-ideas" }),
}));

vi.mock("@/components/storyIdeas/DailyPrompt", () => ({
  default: () => React.createElement("div", { "data-testid": "daily-prompt" }),
}));

vi.mock("@/components/gamification/BadgeDisplay", () => ({
  default: () => React.createElement("div", { "data-testid": "badge-display" }),
}));

vi.mock("@/components/profile/AvatarSelector", () => ({
  default: () => React.createElement("div", { "data-testid": "avatar-selector" }),
}));

vi.mock("@/components/profile/UserStats", () => ({
  default: () => React.createElement("div", { "data-testid": "user-stats" }),
}));

vi.mock("@/components/profile/AchievementList", () => ({
  default: () => React.createElement("div", { "data-testid": "achievement-list" }),
}));

vi.mock("@/components/profile/RecentActivity", () => ({
  default: () => React.createElement("div", { "data-testid": "recent-activity" }),
}));

vi.mock("@/components/profile/MyBooksSection", () => ({
  default: () => React.createElement("div", { "data-testid": "my-books-section" }),
}));

vi.mock("@/components/social/FollowButton", () => ({
  default: () => React.createElement("button", { "data-testid": "follow-button" }, "Follow"),
}));

vi.mock("@/components/ai/AIStudio", () => ({
  default: () => React.createElement("div", { "data-testid": "ai-studio" }),
}));

vi.mock("@/components/settings/ParentalControls", () => ({
  default: () => React.createElement("div", { "data-testid": "parental-controls" }),
}));

vi.mock("@/components/feedback/FeedbackList", () => ({
  default: () => React.createElement("div", { "data-testid": "feedback-list" }),
}));

vi.mock("@/components/feedback/FeedbackForm", () => ({
  default: () => React.createElement("div", { "data-testid": "feedback-form" }),
}));

vi.mock("@/components/feedback/FeedbackStats", () => ({
  default: () => React.createElement("div", { "data-testid": "feedback-stats" }),
}));

vi.mock("@/components/feedback/FeedbackContext", () => ({
  default: () => React.createElement("div", { "data-testid": "feedback-context" }),
}));

vi.mock("@/components/blog/BlogCard", () => ({
  default: (props) => React.createElement("div", { "data-testid": "blog-card" }, props.post?.title || "Blog Post"),
}));

vi.mock("@/components/blog/BlogHeader", () => ({
  default: () => React.createElement("div", { "data-testid": "blog-header" }, "Blog Header"),
}));

vi.mock("@/components/blog/BlogSidebar", () => ({
  default: () => React.createElement("div", { "data-testid": "blog-sidebar" }),
}));

// Mock sanity hooks
vi.mock("@/hooks/useSanityContent", () => ({
  useBlogPosts: () => ({ data: null, isLoading: false, error: null }),
  useBlogPostBySlug: () => ({ data: null, isLoading: false, error: null }),
  useFeaturedBlogPosts: () => ({ data: null, isLoading: false, error: null }),
  useLandingPage: () => ({ data: null, isLoading: false, error: null }),
}));

// Mock SEO utilities
vi.mock("@/lib/seo", () => ({
  updateMeta: vi.fn(),
  resetMeta: vi.fn(),
}));

// Mock content moderation
vi.mock("@/utils/content-moderation", () => ({
  moderateInput: vi.fn().mockReturnValue({ blocked: false, sanitized: "test" }),
  checkContentSafety: vi.fn().mockReturnValue({ isClean: true, blockedTerms: [] }),
  buildSafetyPromptPrefix: vi.fn().mockReturnValue(""),
  verifyParentalPin: vi.fn().mockResolvedValue(true),
  isPinSet: vi.fn().mockReturnValue(false),
  checkAgeAppropriateLanguage: vi.fn().mockReturnValue({ isAppropriate: true, flags: [], suggestions: [] }),
  getParentalControls: vi.fn().mockReturnValue({ contentFilterLevel: "strict", allowCommunitySharing: true, requireApprovalBeforePublish: false }),
  saveParentalControls: vi.fn(),
  DEFAULT_PARENTAL_CONTROLS: {},
}));

// Mock utils
vi.mock("@/utils", () => ({
  createPageUrl: (pageName) => "/" + pageName.toLowerCase().replace(/ /g, "-"),
}));

// Mock notifications hook
vi.mock("@/hooks/useNotifications", () => ({
  default: () => ({ notifications: [], unreadCount: 0, markAsRead: vi.fn(), loadNotifications: vi.fn() }),
  useNotifications: () => ({ notifications: [], unreadCount: 0, markAsRead: vi.fn(), loadNotifications: vi.fn() }),
}));

// Mock follow hook
vi.mock("@/hooks/useFollow", () => ({
  default: () => ({ isFollowing: false, toggleFollow: vi.fn(), followerCount: 0, followingCount: 0 }),
  useFollow: () => ({ isFollowing: false, toggleFollow: vi.fn(), followerCount: 0, followingCount: 0 }),
}));
