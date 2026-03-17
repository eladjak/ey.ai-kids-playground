import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Book } from "@/entities/Book";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { InvokeLLM } from "@/integrations/Core";
import { buildSafetyPromptPrefix } from "@/utils/content-moderation";
import useGamification from "@/hooks/useGamification";
import { captureError } from "@/lib/errorTracking";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { useI18n } from "@/components/i18n/i18nProvider";
import UserWelcomeCard from "@/components/home/UserWelcomeCard";
import DailyPromptCard from "@/components/home/DailyPromptCard";
import DraftBooksSection from "@/components/home/DraftBooksSection";
import FeaturedBooksSection from "@/components/home/FeaturedBooksSection";
import { motion } from "framer-motion";

import {
  BookOpen,
  Sparkles,
  Wand2,
  Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const gamification = useGamification();
  const { language: currentLanguage, isRTL, t } = useI18n();
  const { user: currentUserHook } = useCurrentUser();

  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("onboarding_complete")
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const createSampleFeaturedBooks = () => [
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

  useEffect(() => {
    const generateDailyPrompt = async (lang) => {
      try {
        setIsPromptLoading(true);

        const cachedPrompt = localStorage.getItem("dailyPrompt");
        const cacheDate = localStorage.getItem("dailyPromptDate");
        const today = new Date().toDateString();
        if (cachedPrompt && cacheDate === today) {
          setDailyPrompt(JSON.parse(cachedPrompt));
          setIsPromptLoading(false);
          return;
        }

        const safetyPrefix = buildSafetyPromptPrefix("5-10");
        const languagePrompt =
          lang === "hebrew"
            ? "צור רעיון קצר לסיפור ילדים בעברית לגילאי 5-10. הרעיון צריך להיות מעורר דמיון ומהנה. כלול כותרת קצרה ותיאור קצר של הרעיון (1-2 משפטים). החזר כ-JSON עם השדות title ו-description. שמור על כותרת קצרה (3-6 מילים) והתיאור עד 20 מילים."
            : lang === "yiddish"
            ? "שרייב אַ קורצן, קינד-פֿרײַנדלעכן פּראָמפּט פֿאַר אַ קינדערגעשיכטע פֿאַר קינדער פֿון 5-10 יאָר. דער פּראָמפּט זאָל זיין קרעאַטיוו, שפּאַסיק, און אַנטצינדן קרעאַטיוויטעט. כלל אַ קורצן טיטל און אַ קורצע (1-2 זאַץ) באַשרייַבונג. שיק אַלס JSON מיט טיטל און באַשרייַבונג פֿעלדער."
            : "Generate a creative, child-friendly, short story prompt for children aged 5-10. The prompt should be imaginative, fun, and spark creativity. Include a story title and a brief (1-2 sentence) description. Return as JSON with title and description fields. Keep the title short (3-6 words) and the description to max 20 words.";

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
      } catch (err) {
        captureError(err, { context: 'Home.generateDailyPrompt' });
        setDailyPrompt(
          lang === "hebrew"
            ? { title: "היער הקסום", description: "ילד מגלה יער שבו החיות יכולים לדבר והעצים לוחשים סודות עתיקים." }
            : { title: "The Magical Forest", description: "A child discovers a forest where animals can talk and trees whisper ancient secrets." }
        );
      } finally {
        setIsPromptLoading(false);
      }
    };

    const initializeApp = async () => {
      setIsLoading(true);
      try {
        // Use user from hook; fall back gracefully if not yet loaded
        const user = currentUserHook;

        // Re-fetch user books with correct email after we have the user
        const ownedBooks = user
          ? await Book.filter({ created_by: user.email }, "-created_date", 10)
          : [];

        const drafts = ownedBooks.filter(b => b.status !== "complete");
        const completedBooks = ownedBooks.filter(b => b.status === "complete");

        if (user) {
          setUserData(prev => ({
            ...prev,
            ...user,
            completedBooks: completedBooks.length,
            full_name: user.display_name || user.full_name || "Guest",
            level: user.level || 1,
            xp: user.xp || 0,
            nextLevelXp: user.next_level_xp || 200,
            streakDays: user.streak_days || 0,
            badges: (gamification.badges || [])
              .filter(b => b.earned)
              .map(b => ({ id: b.id, name: b.nameEn }))
          }));
        }

        setDraftBooks(drafts.slice(0, 3));
        setRecentBooks(completedBooks.slice(0, 6));
        setFeaturedBooks(
          completedBooks.length > 0 ? completedBooks.slice(0, 3) : createSampleFeaturedBooks()
        );

        // Award XP on first ever login
        if (!localStorage.getItem("first_login_awarded")) {
          gamification.awardXP("first_login");
          localStorage.setItem("first_login_awarded", "true");
        }

        // Generate daily prompt after we know the user's language
        const userLang = user?.language || currentLanguage;
        generateDailyPrompt(userLang);
      } catch (err) {
        captureError(err, { context: 'Home.initializeApp' });
        setFeaturedBooks(createSampleFeaturedBooks());
        generateDailyPrompt(currentLanguage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserHook]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto pb-12" dir={isRTL ? "rtl" : "ltr"} aria-busy="true" role="status">
        <section className="p-4 md:p-6 lg:p-8">
          {/* Welcome card skeleton */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6">
            <Card className="w-full md:w-auto flex-grow-0 flex-shrink-0">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="flex gap-2 justify-center mb-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-1.5 w-full rounded" />
              </div>
            </Card>
          </div>

          {/* Action bar skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>

          {/* Hero banner skeleton */}
          <Card className="overflow-hidden">
            <Skeleton className="h-[280px] md:h-[320px] w-full" />
          </Card>
        </section>

        {/* Featured books skeleton */}
        <section className="p-4 md:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-40 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden" aria-hidden="true">
                <Skeleton className="aspect-square w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex justify-between pt-1">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Daily prompt skeleton */}
        <section className="p-4 md:p-6 lg:p-8">
          <Skeleton className="h-7 w-48 mb-6" />
          <Card>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex gap-3 pt-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-36" />
                  </div>
                </div>
                <Skeleton className="w-full md:w-1/3 h-32 md:h-40 rounded-lg" />
              </div>
            </div>
          </Card>
        </section>

        <span className="sr-only">Loading homepage content...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top bar: welcome card + search + create */}
      <section className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-4">
          <UserWelcomeCard userData={userData} />

          <div className={`flex items-center gap-2 w-full md:w-auto ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="relative flex-1 md:flex-none">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSearch(s => !s);
                  if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className={`w-full md:w-auto rounded-2xl border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20 ${showSearch ? "hidden md:flex" : ""}`}
              >
                <Search className={`h-4 w-4 text-purple-500 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="hidden md:inline text-gray-500">{t("home.search.placeholder")}</span>
              </Button>

              {showSearch && (
                <div className="absolute inset-0 z-10 flex items-center">
                  <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder={t("home.search.placeholder")}
                    className="w-full rounded-2xl border-purple-300 focus:border-purple-500 focus:ring-purple-500/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setShowSearch(false)}
                  />
                </div>
              )}
            </div>

            <Link to={createPageUrl("BookWizard")} className="flex-shrink-0">
              <Button className="relative w-full md:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30 rounded-2xl px-5 overflow-hidden group">
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Wand2 className={`relative h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="relative">{t("home.create.button")}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mt-6 overflow-hidden shadow-xl">
            <div className="relative min-h-[220px] sm:min-h-[280px] md:min-h-[320px]">
              <img
                src="/images/hero-banner.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/85 via-indigo-800/80 to-violet-900/85" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-8 right-12 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute bottom-4 right-1/4 w-20 h-20 bg-white/5 rounded-full" />
                <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />
                <Sparkles className="absolute top-6 right-8 h-6 w-6 text-white/20" />
                <BookOpen className="absolute bottom-8 right-16 h-8 w-8 text-white/10" />
              </div>

              <div className="relative flex items-center min-h-[220px] sm:min-h-[280px] md:min-h-[320px]">
                <div className="p-4 md:p-6 lg:p-8 max-w-xl">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                    {t("home.title")}
                  </h1>
                  <p className="text-purple-100 text-sm md:text-base lg:text-lg mb-6 leading-relaxed drop-shadow-sm">
                    {t("home.subtitle")}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to={createPageUrl("BookWizard")} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-white text-purple-700 hover:bg-purple-50 shadow-lg">
                        <Wand2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t("home.create.new")}
                      </Button>
                    </Link>
                    <Link to={createPageUrl("Library")} className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto text-white border-white bg-purple-700/40 hover:bg-purple-600/50 backdrop-blur-sm border-opacity-70 shadow-sm"
                      >
                        <BookOpen className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t("home.library.button")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Gradient divider */}
      <div className="h-1 mx-8 rounded-full bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent" />

      {/* Draft books (continue where you left off) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <DraftBooksSection draftBooks={draftBooks} />
      </motion.div>

      {/* Gradient divider */}
      <div className="h-1 mx-8 rounded-full bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent" />

      {/* Featured / recent books tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <FeaturedBooksSection
          featuredBooks={featuredBooks}
          recentBooks={recentBooks}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Gradient divider */}
      <div className="h-1 mx-8 rounded-full bg-gradient-to-r from-transparent via-violet-300 dark:via-violet-700 to-transparent" />

      {/* Daily story prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <DailyPromptCard dailyPrompt={dailyPrompt} isPromptLoading={isPromptLoading} />
      </motion.div>

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
