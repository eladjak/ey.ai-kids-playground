import Home from './pages/Home';
import Library from './pages/Library';
import BookCreation from './pages/BookCreation';
import BookView from './pages/BookView';
import Settings from './pages/Settings';
import Community from './pages/Community';
import CommunityPost from './pages/CommunityPost';
import Collaborate from './pages/Collaborate';
import Feedback from './pages/Feedback';
import index from './pages/index';
import App from './pages/App';
import Profile from './pages/Profile';
import Documentation from './pages/Documentation';
import Leaderboard from './pages/Leaderboard';
import Characters from './pages/Characters';
import CharacterEditor from './pages/CharacterEditor';
import CreativeStoryStudio from './pages/CreativeStoryStudio';
import CreateBook from './pages/CreateBook';
import StoryIdeas from './pages/StoryIdeas';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Library": Library,
    "BookCreation": BookCreation,
    "BookView": BookView,
    "Settings": Settings,
    "Community": Community,
    "CommunityPost": CommunityPost,
    "Collaborate": Collaborate,
    "Feedback": Feedback,
    "index": index,
    "App": App,
    "Profile": Profile,
    "Documentation": Documentation,
    "Leaderboard": Leaderboard,
    "Characters": Characters,
    "CharacterEditor": CharacterEditor,
    "CreativeStoryStudio": CreativeStoryStudio,
    "CreateBook": CreateBook,
    "StoryIdeas": StoryIdeas,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};