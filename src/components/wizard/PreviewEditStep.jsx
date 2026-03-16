import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Sparkles, RefreshCw, Edit3, BookOpen, Globe, ChevronDown, Settings2, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Visual art style definitions with emoji, color, and trilingual descriptions.
 * Used in PreviewEditStep to show child-friendly style previews.
 */
const ART_STYLE_VISUAL = [
  {
    value: "disney",
    emoji: "🏰",
    color: "#4f46e5",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-700",
    en: "Disney Animation",
    he: "אנימציית דיסני",
    yi: "דיסני אַנימאַציע",
    desc: { en: "Colorful & magical", he: "צבעוני וקסום", yi: "פֿאַרביק און כּישופֿדיק" }
  },
  {
    value: "watercolor",
    emoji: "🎨",
    color: "#06b6d4",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-700",
    en: "Watercolor",
    he: "צבעי מים",
    yi: "וואַסערפֿאַרבן",
    desc: { en: "Soft & dreamy", he: "עדין וחלומי", yi: "ווייך און חלומדיק" }
  },
  {
    value: "cartoon",
    emoji: "😄",
    color: "#f59e0b",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-700",
    en: "Bright Cartoon",
    he: "קומיקס צבעוני",
    yi: "קאַריקאַטור",
    desc: { en: "Fun & playful", he: "כיפי ושובבי", yi: "שפּאַסיק" }
  },
  {
    value: "realistic",
    emoji: "📷",
    color: "#64748b",
    bg: "bg-slate-50 dark:bg-slate-950/30",
    border: "border-slate-200 dark:border-slate-700",
    en: "Semi-Realistic",
    he: "מציאותי למחצה",
    yi: "האַלב-רעאַליסטיש",
    desc: { en: "Photo-like detail", he: "פרטים כמו צילום", yi: "פֿאָטאָ-ווי" }
  },
  {
    value: "comic",
    emoji: "💥",
    color: "#ef4444",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-700",
    en: "Comic Book",
    he: "ספר קומיקס",
    yi: "קאָמיקס",
    desc: { en: "Bold & dynamic", he: "נועז ודינמי", yi: "שטאַרק" }
  },
  {
    value: "storybook",
    emoji: "📖",
    color: "#8b5cf6",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-700",
    en: "Storybook",
    he: "ספר ילדים קלאסי",
    yi: "מעשׂה-ביכל",
    desc: { en: "Classic & warm", he: "קלאסי וחמים", yi: "קלאַסיש" }
  },
  {
    value: "anime",
    emoji: "⭐",
    color: "#ec4899",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-200 dark:border-pink-700",
    en: "Anime/Manga",
    he: "אנימה/מנגה",
    yi: "אַנימע",
    desc: { en: "Japanese style", he: "סגנון יפני", yi: "יאַפּאַנישער סטיל" }
  },
  {
    value: "impressionist",
    emoji: "🌻",
    color: "#84cc16",
    bg: "bg-lime-50 dark:bg-lime-950/30",
    border: "border-lime-200 dark:border-lime-700",
    en: "Impressionist",
    he: "אימפרסיוניסטי",
    yi: "אימפּרעסיאָניסטיש",
    desc: { en: "Artistic & textured", he: "אמנותי ומרקמי", yi: "קינסטלעריש" }
  },
  {
    value: "pixar",
    emoji: "🎬",
    color: "#0ea5e9",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-700",
    en: "Pixar 3D",
    he: "תלת מימד פיקסאר",
    yi: "פּיקסאַר 3D",
    desc: { en: "3D & expressive", he: "תלת-מימדי ומרגש", yi: "3D" }
  },
  {
    value: "minimalist",
    emoji: "⬜",
    color: "#94a3b8",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-700",
    en: "Minimalist",
    he: "מינימליסטי",
    yi: "מינימאַליסטיש",
    desc: { en: "Clean & simple", he: "נקי ופשוט", yi: "פּשוט" }
  },
  {
    value: "vintage",
    emoji: "🕰️",
    color: "#92400e",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-700",
    en: "Vintage",
    he: "וינטג'",
    yi: "וינטאַזש",
    desc: { en: "Nostalgic charm", he: "קסם נוסטלגי", yi: "נאָסטאַלגיש" }
  },
  {
    value: "fantasy",
    emoji: "🧚",
    color: "#a855f7",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-700",
    en: "Fantasy Art",
    he: "פנטזיה קסומה",
    yi: "פֿאַנטאַזיע",
    desc: { en: "Magical & enchanted", he: "קסום ומכושף", yi: "כּישופֿדיק" }
  },
  {
    value: "pop_art",
    emoji: "🎯",
    color: "#e11d48",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-700",
    en: "Pop Art",
    he: "פופ ארט",
    yi: "פּאָפּ קונסט",
    desc: { en: "Bold & colorful", he: "נועז וצבעוני", yi: "שטאַרק" }
  },
  {
    value: "crayon",
    emoji: "🖍️",
    color: "#f97316",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-700",
    en: "Crayon & Pastel",
    he: "צבעי פסטל",
    yi: "פּאַסטעל",
    desc: { en: "Soft & hand-drawn", he: "עדין ומצויר ביד", yi: "ווייך" }
  },
  {
    value: "collage",
    emoji: "✂️",
    color: "#14b8a6",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    border: "border-teal-200 dark:border-teal-700",
    en: "Paper Collage",
    he: "קולאז' נייר",
    yi: "פּאַפּיר קאָלאַזש",
    desc: { en: "Textured & layered", he: "מרקמי ושכבות", yi: "טעקסטורירט" }
  },
  {
    value: "gouache",
    emoji: "🖌️",
    color: "#059669",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-700",
    en: "Gouache Painting",
    he: "גואש",
    yi: "גואַש",
    desc: { en: "Rich & opaque", he: "עשיר ואטום", yi: "רייַך" }
  },
  {
    value: "chibi",
    emoji: "🌸",
    color: "#f472b6",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-200 dark:border-pink-700",
    en: "Chibi",
    he: "צ'יבי (מיני אנימה)",
    yi: "טשיבי",
    desc: { en: "Cute & tiny", he: "חמוד וזעיר", yi: "חמודיק" }
  }
];

function getStyleLabel(style, language) {
  if (language === "hebrew") return style.he;
  if (language === "yiddish") return style.yi || style.en;
  return style.en;
}

function getStyleDesc(style, language) {
  if (language === "hebrew") return style.desc.he;
  if (language === "yiddish") return style.desc.yi || style.desc.en;
  return style.desc.en;
}

/**
 * PreviewEditStep - Step 3 of the wizard: Preview and edit the story outline.
 * Shows generated story details with edit capability.
 * Art style selection uses visual preview cards instead of plain text buttons.
 */
export default function PreviewEditStep({
  bookData,
  onBookDataChange,
  generatedOutline,
  isGeneratingOutline,
  onRegenerateOutline,
  isRTL,
  language
}) {
  const isHebrew = language === "hebrew";
  const isYiddish = language === "yiddish";
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Loading skeleton
  if (isGeneratingOutline) {
    return (
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isHebrew ? "מכינים את הסיפור שלך..." : isYiddish ? "מיר גרייטן דײַן מעשׂה..." : "Preparing your story..."}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {isHebrew ? "ה-AI עובד על רעיון מדהים בשבילך" : "The AI is crafting an amazing story for you"}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="pt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="flex justify-center pt-6">
              <div className="flex items-center gap-2 text-purple-600">
                <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span className="text-sm font-medium">
                  {isHebrew ? "יוצר את הסיפור..." : "Generating story..."}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isHebrew ? "בדוק ועדכן את הסיפור" : isYiddish ? "קוק איבער דײַן מעשׂה" : "Review & edit your story"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {isHebrew ? "אפשר לערוך לפני שממשיכים" : "You can make changes before continuing"}
        </p>
      </div>

      {/* Story Title */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
            <BookOpen className="h-5 w-5 text-purple-600" aria-hidden="true" />
            {isHebrew ? "שם הסיפור" : "Story Title"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={bookData.title || ""}
            onChange={(e) => onBookDataChange("title", e.target.value)}
            placeholder={isHebrew ? "שם הסיפור שלך..." : "Your story title..."}
            dir={isRTL ? "rtl" : "ltr"}
            className="text-lg font-semibold"
            maxLength={100}
            aria-label={isHebrew ? "שם הסיפור" : "Story title"}
          />
        </CardContent>
      </Card>

      {/* Story Description */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
            <Edit3 className="h-5 w-5 text-blue-600" aria-hidden="true" />
            {isHebrew ? "תיאור הסיפור" : "Story Description"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={bookData.description || ""}
            onChange={(e) => onBookDataChange("description", e.target.value)}
            placeholder={isHebrew ? "תיאור קצר על מה הסיפור..." : "Brief description of the story..."}
            dir={isRTL ? "rtl" : "ltr"}
            rows={4}
            maxLength={500}
            className="resize-none"
            aria-label={isHebrew ? "תיאור הסיפור" : "Story description"}
          />

          {/* Moral / Lesson */}
          <div>
            <Label className="mb-1 block text-sm font-medium">
              {isHebrew ? "מסר או לקח" : "Moral / Lesson"}
            </Label>
            <Input
              value={bookData.moral || ""}
              onChange={(e) => onBookDataChange("moral", e.target.value)}
              placeholder={isHebrew ? "מה הלקח של הסיפור?" : "What's the lesson of the story?"}
              dir={isRTL ? "rtl" : "ltr"}
              maxLength={200}
              aria-label={isHebrew ? "מסר או לקח" : "Moral or lesson"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Selector */}
      <Card>
        <CardContent className="p-4">
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Globe className="h-5 w-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
            <Label className="text-sm font-medium whitespace-nowrap">
              {isHebrew ? "שפת הסיפור:" : "Story language:"}
            </Label>
            <Select
              value={bookData.language || "english"}
              onValueChange={(value) => onBookDataChange("language", value)}
            >
              <SelectTrigger className="w-[160px]" aria-label={isHebrew ? "בחר שפה" : "Select language"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hebrew">עברית</SelectItem>
                <SelectItem value="yiddish">יידיש</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Art Style Selection — Visual Preview Cards */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
            <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />
            {isHebrew ? "סגנון אמנותי" : isYiddish ? "קונסט-סטיל" : "Art Style"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            role="radiogroup"
            aria-label={isHebrew ? "בחר סגנון אמנותי" : "Choose art style"}
          >
            {ART_STYLE_VISUAL.map((style) => {
              const isSelected = bookData.art_style === style.value;
              return (
                <button
                  key={style.value}
                  onClick={() => onBookDataChange("art_style", style.value)}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={getStyleLabel(style, language)}
                  className={`
                    relative p-3 rounded-xl text-left border-2 cursor-pointer
                    transition-colors duration-150
                    ${isSelected
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md"
                      : `${style.border} ${style.bg} hover:border-purple-300 dark:hover:border-purple-600`
                    }
                  `}
                >
                  {/* Selected checkmark — no enter/exit animation to prevent flicker */}
                  <div
                    className={`absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center transition-opacity duration-150 ${isSelected ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    aria-hidden="true"
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>

                  <div className="flex flex-col items-start gap-1">
                    {/* Emoji */}
                    <span className="text-2xl leading-none mb-1" aria-hidden="true">
                      {style.emoji}
                    </span>

                    {/* Style name */}
                    <span className={`text-sm font-semibold leading-tight ${isSelected ? "text-purple-800 dark:text-purple-200" : "text-gray-800 dark:text-gray-200"}`}>
                      {getStyleLabel(style, language)}
                    </span>

                    {/* Short description */}
                    <span className={`text-xs leading-tight ${isSelected ? "text-purple-600 dark:text-purple-300" : "text-gray-500 dark:text-gray-400"}`}>
                      {getStyleDesc(style, language)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Story Length Selection */}
      <Card>
        <CardContent className="p-4">
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Label className="text-sm font-medium whitespace-nowrap">
              {isHebrew ? "אורך הסיפור:" : "Story length:"}
            </Label>
            <Select
              value={bookData.length || "medium"}
              onValueChange={(value) => onBookDataChange("length", value)}
            >
              <SelectTrigger className="w-[160px]" aria-label={isHebrew ? "בחר אורך סיפור" : "Select story length"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">{isHebrew ? "קצר (6 עמודים)" : "Short (6 pages)"}</SelectItem>
                <SelectItem value="medium">{isHebrew ? "בינוני (10 עמודים)" : "Medium (10 pages)"}</SelectItem>
                <SelectItem value="long">{isHebrew ? "ארוך (15 עמודים)" : "Long (15 pages)"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-600 dark:text-gray-400 hover:text-purple-600 gap-2"
          aria-expanded={showAdvanced}
        >
          <Settings2 className="h-4 w-4" aria-hidden="true" />
          {isHebrew ? "הגדרות מתקדמות" : "Advanced Settings"}
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} aria-hidden="true" />
        </Button>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4"
          >
            {/* Tone */}
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Label className="text-sm font-medium whitespace-nowrap">
                    {isHebrew ? "טון הסיפור:" : "Story tone:"}
                  </Label>
                  <Select
                    value={bookData.tone || "exciting"}
                    onValueChange={(value) => onBookDataChange("tone", value)}
                  >
                    <SelectTrigger className="w-[180px]" aria-label={isHebrew ? "בחר טון" : "Select tone"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exciting">{isHebrew ? "מרגש" : "Exciting"}</SelectItem>
                      <SelectItem value="calm">{isHebrew ? "רגוע" : "Calm"}</SelectItem>
                      <SelectItem value="funny">{isHebrew ? "מצחיק" : "Funny"}</SelectItem>
                      <SelectItem value="educational">{isHebrew ? "חינוכי" : "Educational"}</SelectItem>
                      <SelectItem value="mysterious">{isHebrew ? "מסתורי" : "Mysterious"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Age Range */}
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Label className="text-sm font-medium whitespace-nowrap">
                    {isHebrew ? "טווח גילאים:" : "Age range:"}
                  </Label>
                  <Select
                    value={bookData.age_range || "5-7"}
                    onValueChange={(value) => onBookDataChange("age_range", value)}
                  >
                    <SelectTrigger className="w-[180px]" aria-label={isHebrew ? "בחר טווח גילאים" : "Select age range"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-5">{isHebrew ? "3-5 (גן)" : "3-5 (Preschool)"}</SelectItem>
                      <SelectItem value="5-7">{isHebrew ? "5-7 (גן-א)" : "5-7 (Kindergarten)"}</SelectItem>
                      <SelectItem value="7-10">{isHebrew ? "7-10 (בית ספר)" : "7-10 (Elementary)"}</SelectItem>
                      <SelectItem value="10-12">{isHebrew ? "10-12 (נוער)" : "10-12 (Pre-teen)"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Moral */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <Label className="text-sm font-medium block">
                  {isHebrew ? "פירוט המסר (אופציונלי):" : "Detailed moral message (optional):"}
                </Label>
                <Textarea
                  value={bookData.moral_detail || ""}
                  onChange={(e) => onBookDataChange("moral_detail", e.target.value)}
                  placeholder={isHebrew
                    ? "הסבר מפורט יותר על המסר שתרצה שהסיפור יעביר..."
                    : "More detailed explanation of the message you want the story to convey..."
                  }
                  dir={isRTL ? "rtl" : "ltr"}
                  rows={2}
                  maxLength={300}
                  className="resize-none"
                  aria-label={isHebrew ? "פירוט המסר" : "Detailed moral"}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regenerate button */}
      {onRegenerateOutline && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onRegenerateOutline}
            disabled={isGeneratingOutline}
            className="gap-2"
            aria-label={isHebrew ? "יצירת רעיון חדש" : "Generate new idea"}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {isHebrew ? "רעיון חדש" : "New Idea"}
          </Button>
        </div>
      )}
    </div>
  );
}
