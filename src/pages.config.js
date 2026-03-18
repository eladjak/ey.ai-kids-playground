import { lazy } from 'react';
import Home from './pages/Home';
import __Layout from './Layout.jsx';

// Lazy-loaded pages for code splitting
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const BookCreation = lazy(() => import('./pages/BookCreation'));
const BookView = lazy(() => import('./pages/BookView'));
const BookWizard = lazy(() => import('./pages/BookWizard'));
const CharacterEditor = lazy(() => import('./pages/CharacterEditor'));
const Characters = lazy(() => import('./pages/Characters'));
const Community = lazy(() => import('./pages/Community'));
const CommunityPost = lazy(() => import('./pages/CommunityPost'));
const Feedback = lazy(() => import('./pages/Feedback'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Library = lazy(() => import('./pages/Library'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const StoryIdeas = lazy(() => import('./pages/StoryIdeas'));

export const PAGES = {
    "Blog": Blog,
    "BlogPost": BlogPost,
    "BookCreation": BookCreation,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
    "BookView": BookView,
    "BookWizard": BookWizard,
    "CharacterEditor": CharacterEditor,
    "Characters": Characters,
    "Community": Community,
    "CommunityPost": CommunityPost,
    "Feedback": Feedback,
    "Home": Home,
    "LandingPage": LandingPage,
    "Leaderboard": Leaderboard,
    "Library": Library,
    "Profile": Profile,
    "Settings": Settings,
    "StoryIdeas": StoryIdeas,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
