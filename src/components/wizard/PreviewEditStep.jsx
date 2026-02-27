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
import { Sparkles, RefreshCw, Edit3, BookOpen, Globe, ChevronDown, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ART_STYLE_OPTIONS, translateGenre, translateArtStyle } from "@/utils/book-translations";

/**
 * PreviewEditStep - Step 3 of the wizard: Preview and edit the story outline.
 * Shows generated story details with edit capability.
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Loading skeleton
  if (isGeneratingOutline) {
    return (
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isHebrew ? "מכינים את הסיפור שלך..." : "Preparing your story..."}
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
          {isHebrew ? "בדוק ועדכן את הסיפור" : "Review & edit your story"}
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

      {/* Art Style Selection */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
            <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />
            {isHebrew ? "סגנון אמנותי" : "Art Style"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ART_STYLE_OPTIONS.map((style) => {
              const isSelected = bookData.art_style === style.value;
              return (
                <motion.button
                  key={style.value}
                  onClick={() => onBookDataChange("art_style", style.value)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  aria-pressed={isSelected}
                  aria-label={isHebrew ? style.he : style.en}
                  className={`
                    p-3 rounded-xl text-sm font-medium text-center transition-all duration-200
                    ${isSelected
                      ? "bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-500 text-purple-800 dark:text-purple-200"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }
                  `}
                >
                  {isHebrew ? style.he : style.en}
                </motion.button>
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
