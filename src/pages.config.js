import { lazy } from 'react';
import Home from './pages/Home';
import __Layout from './Layout.jsx';

// Lazy-loaded pages for code splitting
const App = lazy(() => import('./pages/App'));
const BookCreation = lazy(() => import('./pages/BookCreation'));
const BookView = lazy(() => import('./pages/BookView'));
const BookWizard = lazy(() => import('./pages/BookWizard'));
const CharacterEditor = lazy(() => import('./pages/CharacterEditor'));
const Characters = lazy(() => import('./pages/Characters'));
const Community = lazy(() => import('./pages/Community'));
const CommunityPost = lazy(() => import('./pages/CommunityPost'));
const CreativeStoryStudio = lazy(() => import('./pages/CreativeStoryStudio'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Library = lazy(() => import('./pages/Library'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const StoryIdeas = lazy(() => import('./pages/StoryIdeas'));
const index = lazy(() => import('./pages/index'));

export const PAGES = {
    "App": App,
    "BookCreation": BookCreation,
    "BookView": BookView,
    "BookWizard": BookWizard,
    "CharacterEditor": CharacterEditor,
    "Characters": Characters,
    "Community": Community,
    "CommunityPost": CommunityPost,
    "CreativeStoryStudio": CreativeStoryStudio,
    "Feedback": Feedback,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "Library": Library,
    "Profile": Profile,
    "Settings": Settings,
    "StoryIdeas": StoryIdeas,
    "index": index,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
