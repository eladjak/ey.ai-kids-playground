
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Book } from "@/entities/Book";
import { InvokeLLM } from "@/integrations/Core";
import { buildSafetyPromptPrefix } from "@/utils/content-moderation";
import useGamification from "@/hooks/useGamification";
import GamificationOverlay from "@/components/gamification/GamificationOverlay";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { 
  BookOpen, 
  Sparkles, 
  Gift, 
  BookMarked, 
  Users, 
  Layers, 
  Trophy, 
  Star, 
  Award,
  Wand2,
  ArrowRight,
  Play,
  Lightbulb,
  UserCircle,
  PenTool,
  CalendarDays,
  Bookmark,
  Bell,
  Clock,
  Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Import the BadgeDisplay component
import BadgeDisplay from "../components/gamification/BadgeDisplay";

export default function Home() {
  const gamification = useGamification();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("onboarding_complete")
  );
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("featured");
  const [recentBooks, setRecentBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [draftBooks, setDraftBooks] = useState([]);
  const [dailyPrompt, setDailyPrompt] = useState(null);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [userData, setUserData] = useState({
    full_name: "Guest",
    avatar_url: "",
    level: 1,
    xp: 0,
    nextLevelXp: 200,
    completedBooks: 0,
    streakDays: 0,
    badges: [],
    notifications: 0
  });
  
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage");
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
    
    const handleStorageChange = (e) => {
      if (e.key === "appLanguage") {
        setCurrentLanguage(e.newValue || "english");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const loadUserData = async () => {
      try {
        const user = await User.me();
        const userBooks = await Book.filter({ created_by: user.email }, "-created_date", 10);

        // Separate drafts/generating from completed books
        const drafts = userBooks.filter(b => b.status !== "complete");
        const completedBooks = userBooks.filter(b => b.status === "complete");

        setUserData(prev => ({
          ...prev,
          ...user,
          completedBooks: completedBooks.length,
          full_name: user.display_name || user.full_name,
          level: user.level || 1,
          xp: user.xp || 0,
          nextLevelXp: user.next_level_xp || 200,
          streakDays: user.streak_days || 0,
          badges: (gamification.badges || [])
            .filter(b => b.earned)
            .map(b => ({ id: b.id, name: b.nameEn }))
        }));

        setDraftBooks(drafts.slice(0, 3));
        setRecentBooks(completedBooks.slice(0, 6));

        if (completedBooks.length === 0) {
          createSampleFeaturedBooks();
        } else {
          setFeaturedBooks(completedBooks.slice(0, 3));
        }

      } catch (error) {
        createSampleFeaturedBooks();
      }
    };
    
    const generateDailyPrompt = async () => {
      try {
        setIsPromptLoading(true);
        
        const cachedPrompt = localStorage.getItem("dailyPrompt");
        const cacheDate = localStorage.getItem("dailyPromptDate");
        const today = new Date().toDateString();
        const storedLanguage = localStorage.getItem("appLanguage") || "english";
        
        if (cachedPrompt && cacheDate === today) {
          setDailyPrompt(JSON.parse(cachedPrompt));
          setIsPromptLoading(false);
          return;
        }
        
        const safetyPrefix = buildSafetyPromptPrefix('5-10');
        const languagePrompt = storedLanguage === "hebrew" ?
          "צור רעיון קצר לסיפור ילדים בעברית לגילאי 5-10. הרעיון צריך להיות מעורר דמיון ומהנה. כלול כותרת קצרה ותיאור קצר של הרעיון (1-2 משפטים). החזר כ-JSON עם השדות title ו-description. שמור על כותרת קצרה (3-6 מילים) והתיאור עד 20 מילים." :
          "Generate a creative, child-friendly, short story prompt for children aged 5-10. The prompt should be imaginative, fun, and spark creativity. Include a story title and a brief (1-2 sentence) description. Return as JSON with title and description fields. Keep the title short (3-6 words) and the description to max 20 words.";

        const result = await InvokeLLM({
          prompt: safetyPrefix + languagePrompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" }
            }
          }
        });
        
        if (result) {
          setDailyPrompt(result);
          localStorage.setItem("dailyPrompt", JSON.stringify(result));
          localStorage.setItem("dailyPromptDate", today);
        }
      } catch (error) {
        const storedLanguage = localStorage.getItem("appLanguage") || "english";
        
        if (storedLanguage === "hebrew") {
          setDailyPrompt({
            title: "היער הקסום",
            description: "ילד מגלה יער שבו החיות יכולים לדבר והעצים לוחשים סודות עתיקים."
          });
        } else {
          setDailyPrompt({
            title: "The Magical Forest",
            description: "A child discovers a forest where animals can talk and trees whisper ancient secrets."
          });
        }
      } finally {
        setIsPromptLoading(false);
      }
    };
    
    const initializeApp = async () => {
      setIsLoading(true);
      await loadUserData();
      await generateDailyPrompt();
      setIsLoading(false);
    };
    
    initializeApp();
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const createSampleFeaturedBooks = () => {
    const samples = [
      {
        id: "sample1",
        title: "The Dragon's Quest",
        description: "Join Maya on her adventure with a friendly dragon who lost his fire.",
        cover_image: "https://images.unsplash.com/photo-1613155296671-1f9236922850?w=400&auto=format&fit=crop&q=80",
        genre: "adventure",
        age_range: "5-7",
        isSample: true
      },
      {
        id: "sample2",
        title: "Ocean Explorers",
        description: "Dive deep with Sam as he discovers the magical world under the sea.",
        cover_image: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=400&auto=format&fit=crop&q=80",
        genre: "fantasy",
        age_range: "8-10",
        isSample: true
      },
      {
        id: "sample3",
        title: "Stars and Dreams",
        description: "A bedtime story about catching dreams among the stars.",
        cover_image: "https://images.unsplash.com/photo-1519749087703-55167e3d235e?w=400&auto=format&fit=crop&q=80",
        genre: "bedtime",
        age_range: "2-4",
        isSample: true
      }
    ];
    
    setFeaturedBooks(samples);
  };

  const getBadgeTranslation = (badgeId) => {
    const badgeTranslations = {
      english: {
        "first_book": "First Book",
        "storyteller": "Storyteller",
        "creative_mind": "Creative Mind",
        "dedicated_author": "Dedicated Author", 
        "steady_creator": "Steady Creator",
        "adventurer": "Adventurer"
      },
      hebrew: {
        "first_book": "הספר הראשון",
        "storyteller": "מספר סיפורים",
        "creative_mind": "יוצר יצירתי",
        "dedicated_author": "סופר מסור",
        "steady_creator": "יוצר עקבי",
        "adventurer": "הרפתקן"
      }
    };
    
    return badgeTranslations[currentLanguage]?.[badgeId] || badgeTranslations.english[badgeId] || badgeId;
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };
  
  const translations = {
    english: {
      "home.welcome": "Welcome back,",
      "home.title": "Create Magical Personalized Children's Books",
      "home.subtitle": "Spark your child's imagination with custom stories featuring them as the main character",
      "home.level": "Level",
      "home.xp": "XP",
      "home.books": "Books",
      "home.streak": "Day Streak",
      "home.progress.title": "Your Progress",
      "home.progress.toNext": "to next level",
      "home.badges.recent": "Recent Badges",
      "home.create.button": "Create Book",
      "home.create.new": "Create New Book",
      "home.library.button": "View Library",
      "home.search.placeholder": "Search books, ideas or themes...",
      "home.tabs.featured": "Featured Books",
      "home.tabs.recent": "Recent Books",
      "home.tabs.all": "All Books",
      "home.book.read": "Read Book",
      "home.book.continue": "Continue Reading",
      "home.book.edit": "Edit Book",
      "home.book.age": "Age Range",
      "home.book.genre": "Genre",
      "home.book.lastEdit": "Last edited",
      "home.dailyPrompt.title": "Daily Story Prompt",
      "home.dailyPrompt.try": "Try this prompt",
      "home.dailyPrompt.use": "Use This Prompt",
      "home.dailyPrompt.loading": "Loading inspiration...",
      "home.dailyPrompt.explore": "Explore more ideas",
      "home.promptSaved": "Prompt saved! Go to Story Ideas to use it.",
      "home.drafts.title": "Continue Where You Left Off",
      "home.drafts.continue": "Continue",
      "home.drafts.status.draft": "Draft",
      "home.drafts.status.generating": "Generating..."
    },
    hebrew: {
      "home.welcome": "ברוך שובך,",
      "home.title": "יצירת ספרי ילדים קסומים מותאמים אישית",
      "home.subtitle": "עוררו את הדמיון של ילדיכם עם סיפורים מותאמים אישית",
      "home.level": "רמה",
      "home.xp": "נקודות ניסיון",
      "home.books": "ספרים",
      "home.streak": "ימים ברצף",
      "home.progress.title": "ההתקדמות שלך",
      "home.progress.toNext": "לרמה הבאה",
      "home.badges.recent": "תגים אחרונים",
      "home.create.button": "יצירת ספר",
      "home.create.new": "יצירת ספר חדש",
      "home.library.button": "הספרייה שלי",
      "home.search.placeholder": "חיפוש ספרים, רעיונות או נושאים...",
      "home.tabs.featured": "ספרים מומלצים",
      "home.tabs.recent": "ספרים אחרונים",
      "home.tabs.all": "כל הספרים",
      "home.book.read": "קריאה",
      "home.book.continue": "המשך קריאה",
      "home.book.edit": "עריכה",
      "home.book.age": "טווח גילאים",
      "home.book.genre": "ז'אנר",
      "home.book.lastEdit": "נערך לאחרונה",
      "home.dailyPrompt.title": "רעיון יומי לסיפור",
      "home.dailyPrompt.try": "נסה רעיון זה",
      "home.dailyPrompt.use": "השתמש ברעיון",
      "home.dailyPrompt.loading": "טוען רעיונות...",
      "home.dailyPrompt.explore": "גלה עוד רעיונות",
      "home.promptSaved": "הרעיון נשמר! עבור לדף רעיונות לסיפורים כדי להשתמש בו.",
      "home.drafts.title": "המשך מהמקום שהפסקת",
      "home.drafts.continue": "המשך",
      "home.drafts.status.draft": "טיוטה",
      "home.drafts.status.generating": "...בהפקה"
    }
  };
  
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";
  
  const progressToNextLevel = (userData.xp / userData.nextLevelXp) * 100;

  const navigateWithPrompt = () => {
    if (dailyPrompt) {
      localStorage.setItem("dailyStoryPrompt", JSON.stringify(dailyPrompt));
    }
  };

  const translateGenre = (genre) => {
    const genreTranslations = {
      "adventure": isRTL ? "הרפתקאה" : "Adventure",
      "fairy_tale": isRTL ? "אגדה" : "Fairy Tale",
      "educational": isRTL ? "חינוכי" : "Educational",
      "bedtime": isRTL ? "סיפור לפני השינה" : "Bedtime",
      "fantasy": isRTL ? "פנטזיה" : "Fantasy",
      "science": isRTL ? "מדע" : "Science",
      "animals": isRTL ? "חיות" : "Animals",
      "sports": isRTL ? "ספורט" : "Sports"
    };
    
    return genreTranslations[genre] || genre;
  };
  
  return (
    <div className="max-w-6xl mx-auto pb-12" dir={isRTL ? "rtl" : "ltr"}>
      <section className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
          <Card className="w-full md:w-auto flex-grow-0 flex-shrink-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Link to={createPageUrl("Profile")} className="flex-shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-white shadow hover:shadow-md transition-all">
                    {userData.avatar_url ? (
                      <AvatarImage src={userData.avatar_url} alt={userData.full_name} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                        {userData.full_name?.charAt(0) || "G"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("home.welcome")}</p>
                  <h2 className="font-bold text-lg truncate">{userData.full_name}</h2>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="bg-amber-100 text-amber-800 gap-1">
                  <Trophy className="h-3 w-3" />
                  <span>{t("home.level")} {userData.level}</span>
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 gap-1">
                  <Star className="h-3 w-3" />
                  <span>{userData.streakDays} {t("home.streak")}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Button
                variant="outline"
                onClick={() => setShowSearch(!showSearch)}
                className={`w-full md:w-auto ${showSearch ? 'hidden md:flex' : ''}`}
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">{t("home.search.placeholder")}</span>
              </Button>
              
              {showSearch && (
                <div className="absolute inset-0 z-10 flex items-center">
                  <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder={t("home.search.placeholder")}
                    className="w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setShowSearch(false)}
                  />
                </div>
              )}
            </div>
            
            <Link to={createPageUrl("CreativeStoryStudio")} className="flex-shrink-0">
              <Button className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600">
                <Wand2 className="h-4 w-4 mr-2" />
                {t("home.create.button")}
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mt-6 overflow-hidden">
          <div className="relative min-h-[220px] sm:min-h-[280px] md:min-h-[320px] bg-gradient-to-br from-purple-700 via-indigo-600 to-violet-800">
            {/* Decorative elements instead of AI-generated image */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-8 right-12 w-32 h-32 bg-white/5 rounded-full" />
              <div className="absolute bottom-4 right-1/4 w-20 h-20 bg-white/5 rounded-full" />
              <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />
              <Sparkles className="absolute top-6 right-8 h-6 w-6 text-white/20" />
              <BookOpen className="absolute bottom-8 right-16 h-8 w-8 text-white/10" />
              <Star className="absolute top-12 right-1/3 h-5 w-5 text-amber-300/20" />
            </div>

            <div className="relative flex items-center min-h-[220px] sm:min-h-[280px] md:min-h-[320px]">
              <div className="p-4 md:p-6 lg:p-8 max-w-xl">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                  {t("home.title")}
                </h1>
                <p className="text-purple-100 text-sm md:text-base lg:text-lg mb-6 leading-relaxed">
                  {t("home.subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to={createPageUrl("CreativeStoryStudio")} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-white text-purple-700 hover:bg-purple-50">
                      <Wand2 className="h-4 w-4 mr-2" />
                      {t("home.create.new")}
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Library")} className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto text-white border-white bg-purple-700/40 hover:bg-purple-600/50 backdrop-blur-sm border-opacity-70 shadow-sm"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {t("home.library.button")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="p-4 md:p-6 lg:p-8">
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/60 dark:to-gray-800/60">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    {t("home.progress.title")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                      {userData.completedBooks} {t("home.books")}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{t("home.level")} {userData.level}</span>
                      <span className="text-gray-500">({userData.xp} XP)</span>
                    </div>
                    <span className="text-gray-500">
                      {userData.nextLevelXp - userData.xp} XP {t("home.progress.toNext")}
                    </span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-2" />
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                {userData.badges.map((badge, index) => (
                  <div key={index} className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                    <BadgeDisplay 
                      badgeId={badge.id} 
                      size="md" 
                      currentLanguage={currentLanguage} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Continue where you left off */}
      {draftBooks.length > 0 && (
        <section className="px-4 md:px-6 lg:px-8 pb-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            {t("home.drafts.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftBooks.map(book => (
              <Card key={book.id} className="overflow-hidden border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-orange-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{book.title || "Untitled Book"}</h3>
                    <Badge variant="outline" className="text-xs mt-1 bg-orange-100 text-orange-700 border-orange-200">
                      {book.status === "generating"
                        ? t("home.drafts.status.generating")
                        : t("home.drafts.status.draft")}
                    </Badge>
                  </div>
                  <Link to={`${createPageUrl("BookCreation")}?id=${book.id}`}>
                    <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                      <Play className="h-3 w-3 mr-1" />
                      {t("home.drafts.continue")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="p-4 md:p-6 lg:p-8">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">
              {activeTab === "featured" ? t("home.tabs.featured") : t("home.tabs.recent")}
            </h2>
            <TabsList className="bg-purple-100/50 dark:bg-purple-900/20">
              <TabsTrigger value="featured">{t("home.tabs.featured")}</TabsTrigger>
              <TabsTrigger value="recent">{t("home.tabs.recent")}</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="featured">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden" aria-hidden="true">
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-5 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-5 w-14 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : featuredBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                    {book.cover_image ? (
                      <img 
                        src={book.cover_image} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{book.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {translateGenre(book.genre)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {book.age_range}
                        </Badge>
                      </div>
                      
                      {book.isSample ? (
                        <Link to={createPageUrl("CreativeStoryStudio")}>
                          <Button size="sm">
                            <BookOpen className="h-4 w-4 mr-1" /> 
                            {t("home.create.button")}
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`${createPageUrl("BookView")}?id=${book.id}`}>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-1" /> 
                            {t("home.book.read")}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            {recentBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentBooks.map((book) => (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                      {book.cover_image ? (
                        <img 
                          src={book.cover_image} 
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {translateGenre(book.genre)}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs text-gray-500">
                          {book.updated_date && new Date(book.updated_date).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between mt-auto">
                        <Link to={`${createPageUrl("BookView")}?id=${book.id}`}>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-1" /> 
                            {t("home.book.continue")}
                          </Button>
                        </Link>
                        
                        <Link to={`${createPageUrl("BookCreation")}?id=${book.id}`}>
                          <Button size="sm" variant="outline">
                            <PenTool className="h-4 w-4 mr-1" /> 
                            {t("home.book.edit")}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed">
                <CardContent className="p-8 md:p-12 text-center">
                  <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">{t("home.noBooks.title")}</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {t("home.noBooks.subtitle")}
                  </p>
                  <Link to={createPageUrl("CreativeStoryStudio")}>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <PenTool className="h-4 w-4 mr-2" />
                      {t("home.create.button")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <section className="p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t("home.dailyPrompt.title")}</h2>
          
          <Link to={createPageUrl("StoryIdeas")} className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center text-sm font-medium transition-colors">
            {t("home.dailyPrompt.explore")}
            {isRTL ? <ArrowRight className="mr-1 h-4 w-4 rotate-180" /> : <ArrowRight className="ml-1 h-4 w-4" />}
          </Link>
        </div>
        
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10">
          <CardContent className="p-4 md:p-6">
            {isPromptLoading ? (
              <div className="flex flex-col items-center justify-center h-32">
                <Sparkles className="h-10 w-10 text-amber-300 animate-pulse" />
                <p className="text-amber-700 mt-4">{t("home.dailyPrompt.loading")}</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-800 mb-2">
                    {dailyPrompt?.title}
                  </h3>
                  <p className="text-amber-700 mb-4">
                    {dailyPrompt?.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      to={`${createPageUrl("CreativeStoryStudio")}?prompt=${encodeURIComponent(JSON.stringify(dailyPrompt))}`}
                      onClick={() => {
                        if (dailyPrompt) {
                          localStorage.setItem("selectedStoryPrompt", JSON.stringify({
                            ...dailyPrompt,
                            source: "daily_prompt"
                          }));
                        }
                      }}
                    >
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                        {t("home.dailyPrompt.use")}
                        {isRTL ? <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </Link>
                    
                    <Link 
                      to={createPageUrl("StoryIdeas")} 
                      onClick={() => {
                        if (dailyPrompt) {
                          localStorage.setItem("lastDailyPrompt", JSON.stringify({
                            ...dailyPrompt,
                            date: new Date().toISOString(),
                            source: "daily_prompt"
                          }));
                        }
                      }}
                    >
                      <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        {t("home.dailyPrompt.try")}
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="w-full md:w-1/3 h-32 md:h-40 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-12 w-12 text-amber-300" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Gamification celebrations overlay */}
      <GamificationOverlay
        pendingCelebrations={gamification.pendingCelebrations}
        onDismiss={gamification.dismissCelebration}
        isRTL={isRTL}
        isHebrew={currentLanguage === "hebrew"}
      />

      {/* First-time onboarding wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={() => setShowOnboarding(false)}
          userName={userData.full_name !== "Guest" ? userData.full_name : ""}
        />
      )}
    </div>
  );
}
