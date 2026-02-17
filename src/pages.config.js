import App from './pages/App';
import BookCreation from './pages/BookCreation';
import BookView from './pages/BookView';
import BookWizard from './pages/BookWizard';
import CharacterEditor from './pages/CharacterEditor';
import Characters from './pages/Characters';
import Collaborate from './pages/Collaborate';
import Community from './pages/Community';
import CommunityPost from './pages/CommunityPost';
import CreateBook from './pages/CreateBook';
import CreativeStoryStudio from './pages/CreativeStoryStudio';
import Documentation from './pages/Documentation';
import Feedback from './pages/Feedback';
import Games from './pages/Games';
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
    "Collaborate": Collaborate,
    "Community": Community,
    "CommunityPost": CommunityPost,
    "CreateBook": CreateBook,
    "CreativeStoryStudio": CreativeStoryStudio,
    "Documentation": Documentation,
    "Feedback": Feedback,
    "Games": Games,
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