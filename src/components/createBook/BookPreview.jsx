import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Calendar, Clock, BookText, Palette, Languages, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function BookPreview({ bookData, coverImage, isGenerating }) {
  const [currentLanguage, setCurrentLanguage] = useState("english");
  
  // Load language preference
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
    
    const handleStorageChange = (e) => {
      if (e.key === "language") {
        setCurrentLanguage(e.newValue || "english");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Translations
  const translations = {
    english: {
      "preview.title": "Book Preview",
      "preview.subtitle": "Preview your book settings before creation",
      "preview.cover": "Cover Preview",
      "preview.generating": "Generating cover...",
      "preview.coverPlaceholder": "Cover will be generated when you proceed",
      "preview.details": "Book Details",
      "preview.for": "For",
      "preview.ageYears": "years old",
      "preview.genre": "Genre",
      "preview.length": "Length",
      "preview.artStyle": "Art Style",
      "preview.language": "Language",
      "preview.shortLength": "Short (5-10 pages)",
      "preview.mediumLength": "Medium (11-20 pages)",
      "preview.longLength": "Long (21-30 pages)",
      // Genre translations
      "preview.genre.adventure": "Adventure",
      "preview.genre.fairy_tale": "Fairy Tale",
      "preview.genre.educational": "Educational",
      "preview.genre.bedtime": "Bedtime Story",
      "preview.genre.fantasy": "Fantasy",
      "preview.genre.science": "Science",
      "preview.genre.animals": "Animals",
      "preview.genre.sports": "Sports",
      // Art styles translations
      "preview.artStyle.disney": "Disney Animation",
      "preview.artStyle.pixar": "Pixar 3D",
      "preview.artStyle.watercolor": "Watercolor Painting",
      "preview.artStyle.sketch": "Pencil Sketch",
      "preview.artStyle.cartoon": "Bright Cartoon",
      "preview.artStyle.realistic": "Semi-Realistic",
      "preview.artStyle.anime": "Anime/Manga",
      "preview.artStyle.clay": "Clay/Stop-Motion",
      "preview.artStyle.popup": "Pop-Up Book",
      "preview.artStyle.minimalist": "Minimalist",
      "preview.artStyle.vintage": "Vintage",
      "preview.artStyle.cultural": "Folk Art",
      // Languages
      "preview.language.english": "English",
      "preview.language.hebrew": "Hebrew",
      "preview.language.yiddish": "Yiddish"
    },
    hebrew: {
      "preview.title": "תצוגה מקדימה של הספר",
      "preview.subtitle": "צפה בהגדרות הספר שלך לפני היצירה",
      "preview.cover": "תצוגה מקדימה של הכריכה",
      "preview.generating": "מייצר כריכה...",
      "preview.coverPlaceholder": "הכריכה תיווצר כאשר תמשיך",
      "preview.details": "פרטי הספר",
      "preview.for": "עבור",
      "preview.ageYears": "שנים",
      "preview.genre": "ז'אנר",
      "preview.length": "אורך",
      "preview.artStyle": "סגנון אמנותי",
      "preview.language": "שפה",
      "preview.shortLength": "קצר (5-10 עמודים)",
      "preview.mediumLength": "בינוני (11-20 עמודים)",
      "preview.longLength": "ארוך (21-30 עמודים)",
      // Genre translations
      "preview.genre.adventure": "הרפתקאות",
      "preview.genre.fairy_tale": "אגדה",
      "preview.genre.educational": "חינוכי",
      "preview.genre.bedtime": "סיפור לפני השינה",
      "preview.genre.fantasy": "פנטזיה",
      "preview.genre.science": "מדע",
      "preview.genre.animals": "חיות",
      "preview.genre.sports": "ספורט",
      // Art styles translations
      "preview.artStyle.disney": "אנימציית דיסני",
      "preview.artStyle.pixar": "תלת מימד של פיקסאר",
      "preview.artStyle.watercolor": "ציור בצבעי מים",
      "preview.artStyle.sketch": "רישום בעיפרון",
      "preview.artStyle.cartoon": "קומיקס צבעוני",
      "preview.artStyle.realistic": "מציאותי למחצה",
      "preview.artStyle.anime": "אנימה/מנגה",
      "preview.artStyle.clay": "חימר/סטופ-מושן",
      "preview.artStyle.popup": "ספר פופ-אפ",
      "preview.artStyle.minimalist": "מינימליסטי",
      "preview.artStyle.vintage": "וינטג'",
      "preview.artStyle.cultural": "אמנות עממית",
      // Languages
      "preview.language.english": "אנגלית",
      "preview.language.hebrew": "עברית",
      "preview.language.yiddish": "יידיש"
    },
    yiddish: {
      "preview.title": "בוך פאראויסקוק",
      "preview.subtitle": "פאראויסקוק דיין בוך סעטטינגס איידער באשאפונג",
      "preview.cover": "צודעק פאראויסקוק",
      "preview.details": "בוך דעטאַילס",
      "preview.for": "פאר"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  // Determine text direction
  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";

  const formatGenre = (genre) => {
    const genreKey = `preview.genre.${genre}`;
    return t(genreKey);
  };

  const getLanguageDisplay = (lang) => {
    const langMap = {
      english: t("preview.language.english"),
      hebrew: t("preview.language.hebrew"),
      yiddish: t("preview.language.yiddish")
    };
    return langMap[lang] || lang;
  };

  const getArtStyleDisplay = (style) => {
    const artStyleKey = `preview.artStyle.${style}`;
    return t(artStyleKey);
  };

  const getBookLength = (length) => {
    if (length === 'short') return t("preview.shortLength");
    if (length === 'medium') return t("preview.mediumLength");
    if (length === 'long') return t("preview.longLength");
    return length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-white dark:bg-gray-800 shadow-md backdrop-blur-md dark:bg-opacity-30 border-gray-200 dark:border-gray-800" dir={isRTL ? "rtl" : "ltr"}>
        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-300 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            {t("preview.title")}
          </CardTitle>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("preview.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <BookOpen className="h-5 w-5 text-purple-500" />
              {t("preview.cover")}
            </h3>
            <div className="aspect-[4/3] max-h-[300px] overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-gray-900 flex items-center justify-center shadow-md">
              {isGenerating ? (
                <div className="text-center p-6">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-t-purple-500 border-purple-200 animate-spin"></div>
                  <p className="text-purple-600 dark:text-purple-300 animate-pulse">
                    {t("preview.generating")}
                  </p>
                </div>
              ) : coverImage ? (
                <motion.img
                  src={coverImage}
                  alt={bookData.title || "Book cover"}
                  className="w-full h-full object-contain"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
              ) : (
                <div className="text-center p-6">
                  <BookOpen className="h-16 w-16 text-purple-300 dark:text-purple-800 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("preview.coverPlaceholder")}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <BookText className="h-5 w-5 text-purple-500" />
              {t("preview.details")}
            </h3>
            <div className="space-y-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="border-b border-purple-100 dark:border-purple-900/30 pb-3">
                <h4 className="text-xl font-bold mb-1 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-300">
                  {bookData.title || "Untitled Book"}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500/70" />
                  {t("preview.for")} {bookData.child_name || "Your Child"}, {bookData.child_age || "5"} {t("preview.ageYears")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <BookText className="h-4 w-4 text-purple-500/70" />
                    <span className="font-medium">{t("preview.genre")}:</span> 
                    <span className="px-2 py-0.5 rounded-full bg-purple-100/70 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm">
                      {formatGenre(bookData.genre)}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Clock className="h-4 w-4 text-purple-500/70" />
                    <span className="font-medium">{t("preview.length")}:</span> 
                    <span className="px-2 py-0.5 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
                      {getBookLength(bookData.length)}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Palette className="h-4 w-4 text-purple-500/70" />
                    <span className="font-medium">{t("preview.artStyle")}:</span> 
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm">
                      {getArtStyleDisplay(bookData.art_style)}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Languages className="h-4 w-4 text-purple-500/70" />
                    <span className="font-medium">{t("preview.language")}:</span> 
                    <span className="px-2 py-0.5 rounded-full bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm">
                      {getLanguageDisplay(bookData.language)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 pt-3 border-t border-purple-100 dark:border-purple-900/30">
                <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                  {bookData.age_range || "5-7"} years
                </Badge>
                <Badge className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                  {bookData.tone || "exciting"} tone
                </Badge>
                {bookData.interests && (
                  <Badge className="bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {bookData.interests}
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}