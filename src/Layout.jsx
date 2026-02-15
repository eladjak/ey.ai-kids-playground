
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";

import {
  BookOpen,
  Settings,
  Home,
  Menu,
  X,
  PlusCircle,
  Library,
  LogOut,
  Moon,
  Sun,
  Users,
  Lightbulb,
  FileText,
  User as UserIcon,
  Users2,
  Gamepad2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isRTL, setIsRTL] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadUserAndSettings = async () => {
      try {
        const userData = await User.me();
        setUser(userData);

        const userLanguage = userData.language;
        const storedLanguage = localStorage.getItem("appLanguage");
        const defaultLanguage = "english";

        const selectedLanguage = userLanguage || storedLanguage || defaultLanguage;

        setCurrentLanguage(selectedLanguage);
        localStorage.setItem("appLanguage", selectedLanguage);

        const isRTL = selectedLanguage === "hebrew" || selectedLanguage === "yiddish";
        setIsRTL(isRTL);

        if (isRTL) {
          document.documentElement.dir = "rtl";
          document.body.classList.add("rtl");
          document.body.classList.remove("ltr");
        } else {
          document.documentElement.dir = "ltr";
          document.body.classList.remove("rtl");
          document.body.classList.add("ltr");
        }

        const userDarkMode = userData.dark_mode;
        const storedDarkMode = localStorage.getItem("darkMode") === "true";
        const shouldUseDarkMode = userDarkMode ?? storedDarkMode;

        setDarkMode(shouldUseDarkMode);
        localStorage.setItem("darkMode", shouldUseDarkMode.toString());

        if (shouldUseDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }

      } catch (error) {
        const storedLanguage = localStorage.getItem("appLanguage");
        if (storedLanguage) {
          setCurrentLanguage(storedLanguage);
          setIsRTL(storedLanguage === "hebrew" || storedLanguage === "yiddish");
        }

        const storedDarkMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(storedDarkMode);
        if (storedDarkMode) {
          document.documentElement.classList.add("dark");
        }
      }
    };

    loadUserAndSettings();
  }, []);

  const translations = {
    english: {
      "common.home": "Home",
      "common.createBook": "Creative Studio", // Changed from "Create New Book"
      "common.myLibrary": "My Library",
      "common.community": "Community",
      // "common.storyIdeas": "Story Ideas", // Removed
      "common.settings": "Settings",
      "common.logout": "Logout",
      "common.darkMode": "Dark Mode",
      "common.lightMode": "Light Mode",
      "common.documentation": "Documentation",
      "common.main": "Main",
      "common.create": "Create",
      "common.explore": "Explore",
      "common.system": "System",
      "common.myProfile": "My Profile",
      "common.characters": "My Characters",
      "common.games": "Games"
    },
    hebrew: {
      "common.home": "דף הבית",
      "common.createBook": "סטודיו יצירה", // Changed from "יצירת ספר חדש"
      "common.myLibrary": "הספרייה שלי",
      "common.community": "קהילה",
      // "common.storyIdeas": "רעיונות לסיפורים", // Removed
      "common.settings": "הגדרות",
      "common.logout": "התנתק",
      "common.darkMode": "מצב כהה",
      "common.lightMode": "מצב בהיר",
      "common.documentation": "תיעוד",
      "common.main": "ראשי",
      "common.create": "יצירה",
      "common.explore": "גלה עוד",
      "common.system": "מערכת",
      "common.myProfile": "הפרופיל שלי",
      "common.characters": "הדמויות שלי",
      "common.games": "משחקים"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const navItems = {
    main: [
      { href: "/", label: t("common.home"), icon: Home, pageName: "Home" },
      { href: "/Library", label: t("common.myLibrary"), icon: Library, pageName: "Library" },
      { href: "/Community", label: t("common.community"), icon: Users, pageName: "Community" },
      { href: "/Profile", label: t("common.myProfile"), icon: UserIcon, pageName: "Profile" }
    ],
    create: [
      { href: "/CreativeStoryStudio", label: t("common.createBook"), icon: PlusCircle, pageName: "CreativeStoryStudio" }, // Updated href, label, and pageName
      // { href: "/StoryIdeas", label: t("common.storyIdeas"), icon: Lightbulb, pageName: "StoryIdeas" }, // Removed
      { href: "/Characters", label: t("common.characters"), icon: Users2, pageName: "Characters" },
    ],
    explore: [
      { href: "/Games", label: t("common.games"), icon: Gamepad2, pageName: "Games" },
      { href: "/Documentation", label: t("common.documentation"), icon: FileText, pageName: "Documentation" },
    ],
    system: [
      { href: "/Settings", label: t("common.settings"), icon: Settings, pageName: "Settings" }
    ]
  };

  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link to={createPageUrl(item.pageName)} className="w-full">
        <Button
          variant="ghost"
          className={`w-full justify-start py-6 px-4 rounded-xl transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-700 dark:text-purple-300'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200'
          }`}
        >
          <item.icon className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'} ${
            isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-300'
          }`} />
          {item.label}
        </Button>
      </Link>
    );
  }

  const handleLogout = async () => {
    try {
      const currentPreferences = {
        language: currentLanguage,
        darkMode: darkMode
      };

      localStorage.setItem("lastUserPreferences", JSON.stringify(currentPreferences));
      await User.logout();
      window.location.reload();
    } catch (error) {
      // silently handled
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getLocalizedPageName = (pageName) => {
    if (currentLanguage === "english") return pageName;

    const hebrewPageNames = {
      "Home": "דף הבית",
      "CreativeStoryStudio": "סטודיו יצירה", // Updated from "CreateBook": "יצירת ספר"
      // "StoryIdeas": "רעיונות סיפור", // Removed
      "Library": "ספרייה",
      "Community": "קהילה",
      "Settings": "הגדרות",
      "BookCreation": "יצירת ספר", // Kept, assuming it's a separate internal route
      "BookView": "צפייה בספר",
      "Feedback": "משוב",
      "Collaborate": "שיתוף פעולה",
      "CommunityPost": "פרסום קהילה",
      "Documentation": "תיעוד",
      "Characters": "דמויות",
      "Profile": "פרופיל"
    };

    return hebrewPageNames[pageName] || pageName;
  };

  const getCurrentPageFromPath = () => {
    const path = location.pathname;
    if (path === "/" || path === "") return "Home";

    const pagePath = path.split("?")[0];
    const pageName = pagePath.replace(/^\/+/, "");
    // Special handling for root paths or known pages
    switch (pageName.toLowerCase()) {
      case "library": return "Library";
      case "community": return "Community";
      case "profile": return "Profile";
      case "creativestorystudio": return "CreativeStoryStudio"; // Updated from "createbook"
      // case "storyideas": return "StoryIdeas"; // Removed
      case "characters": return "Characters";
      case "documentation": return "Documentation";
      case "settings": return "Settings";
      default: return pageName.charAt(0).toUpperCase() + pageName.slice(1); // Capitalize first letter
    }
  };

  const displayPageName = getLocalizedPageName(currentPageName || getCurrentPageFromPath());

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <div className={`${isRTL ? 'pr-64' : 'pl-64'} max-lg:${isRTL ? 'pr-0' : 'pl-0'}`}>
        <aside className={`fixed top-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} h-full w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} lg:translate-x-0`}>
          <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 dark:from-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
                EY.AI Kids
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 dark:text-gray-300" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="mb-6">
              <h2 className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-2">
                {t("common.main")}
              </h2>
              <div className="space-y-1">
                {navItems.main.map(item => <NavLink key={item.href} item={item} />)}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-2">
                {t("common.create")}
              </h2>
              <div className="space-y-1">
                {navItems.create.map(item => <NavLink key={item.href} item={item} />)}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-2">
                {t("common.explore")}
              </h2>
              <div className="space-y-1">
                {navItems.explore.map(item => <NavLink key={item.href} item={item} />)}
              </div>
            </div>

            {/* New System section */}
            <div className="mb-6">
              <h2 className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-2">
                {t("common.system")}
              </h2>
              <div className="space-y-1">
                {navItems.system.map(item => <NavLink key={item.href} item={item} />)}
              </div>
            </div>
            {/* End of New System section */}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Link to={createPageUrl("Profile")} className="w-full">
              <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-700 shadow-md">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                      {user?.full_name?.charAt(0) || "G"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.full_name || "Guest"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {t("common.myProfile")}
                  </p>
                </div>
              </div>
            </Link>

            <div className="space-y-1 mt-4">
              <Button
                variant="ghost"
                className="w-full justify-start py-5 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200"
                onClick={toggleDarkMode}
              >
                {darkMode ? (
                  <>
                    <Sun className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'} text-amber-400`} />
                    {t("common.lightMode")}
                  </>
                ) : (
                  <>
                    <Moon className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'} text-gray-400 dark:text-gray-300`} />
                    {t("common.darkMode")}
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start py-5 px-4 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                {t("common.logout")}
              </Button>
            </div>
          </div>
        </aside>

        <div className={`lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`}>
          <div className="px-4 h-full flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 dark:text-gray-300" />
            </Button>
            
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-1.5 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-base text-gray-900 dark:text-white">EY.AI Kids</span>
            </Link>
            
            <Link to={createPageUrl("Profile")}>
              <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                {user?.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                    {user?.full_name?.charAt(0) || "G"}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
          </div>
        </div>

        <div className={`min-h-screen pt-16 lg:pt-0`}>
          <main className="p-4">
            {children}
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
