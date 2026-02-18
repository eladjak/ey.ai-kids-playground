import App from './pages/App';
import BookCreation from './pages/BookCreation';
import BookView from './pages/BookView';
import BookWizard from './pages/BookWizard';
import CharacterEditor from './pages/CharacterEditor';
import Characters from './pages/Characters';
import Community from './pages/Community';
import CommunityPost from './pages/CommunityPost';
import CreativeStoryStudio from './pages/CreativeStoryStudio';
import Feedback from './pages/Feedback';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import StoryIdeas from './pages/StoryIdeas';
import index from './pages/index';
import __Layout from './Layout.jsx';


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
