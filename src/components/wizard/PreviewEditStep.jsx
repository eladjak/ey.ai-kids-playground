import React from "react";
import { motion } from "framer-motion";
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
import { Sparkles, RefreshCw, Edit3, BookOpen } from "lucide-react";
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
