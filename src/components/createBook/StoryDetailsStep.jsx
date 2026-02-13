
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wand2, BookOpen, Users, Target, Clock } from "lucide-react";

export default function StoryDetailsStep({ bookData, updateBookData, onGenerateTitle, currentLanguage = "english", isRTL = false }) {
  // `currentLanguage` and `isRTL` are now received as props.
  // The internal `useState` for currentLanguage and its associated `useEffect`
  // for loading from localStorage and listening to storage events are no longer needed
  // in this component, as language management is now externalized.
  
  // Translations
  const translations = {
    english: {
      "storyDetails.title": "Story Details & Settings",
      "storyDetails.subtitle": "Review and customize your story settings",
      "storyDetails.storyOverview": "Story Overview",
      "storyDetails.bookTitle.label": "Book Title",
      "storyDetails.bookTitle.placeholder": "Enter a title for your book",
      "storyDetails.bookTitle.generateButton": "Generate Title",
      "storyDetails.characters": "Main Characters",
      "storyDetails.themes": "Story Themes",
      "storyDetails.setting": "Story Setting",
      "storyDetails.genre.label": "Story Genre",
      "storyDetails.genre.adventure": "Adventure",
      "storyDetails.genre.fairyTale": "Fairy Tale",
      "storyDetails.genre.educational": "Educational",
      "storyDetails.genre.bedtime": "Bedtime Story",
      "storyDetails.genre.fantasy": "Fantasy",
      "storyDetails.genre.science": "Science",
      "storyDetails.genre.animals": "Animals",
      "storyDetails.genre.sports": "Sports",
      "storyDetails.ageRange.label": "Target Age Range",
      "storyDetails.ageRange.toddler": "Toddlers (2-4 years)",
      "storyDetails.ageRange.preschool": "Preschoolers (5-7 years)",
      "storyDetails.ageRange.elementary": "Elementary (8-10 years)",
      "storyDetails.ageRange.preteen": "Preteens (11+ years)",
      "storyDetails.tone.label": "Story Tone",
      "storyDetails.tone.humorous": "Humorous",
      "storyDetails.tone.whimsical": "Whimsical",
      "storyDetails.tone.calming": "Calming",
      "storyDetails.tone.exciting": "Exciting",
      "storyDetails.tone.educational": "Educational",
      "storyDetails.length.label": "Story Length",
      "storyDetails.length.short": "Short (5-10 pages)",
      "storyDetails.length.medium": "Medium (11-20 pages)",
      "storyDetails.length.long": "Long (21-30 pages)",
      "storyDetails.moral.label": "Moral or Lesson",
      "storyDetails.moral.placeholder": "What lesson would you like the story to teach?"
    },
    hebrew: {
      "storyDetails.title": "פרטי הסיפור והגדרות",
      "storyDetails.subtitle": "בדוק והתאם אישית את הגדרות הסיפור",
      "storyDetails.storyOverview": "סקירת הסיפור",
      "storyDetails.bookTitle.label": "כותרת הספר",
      "storyDetails.bookTitle.placeholder": "הזן כותרת לספר שלך",
      "storyDetails.bookTitle.generateButton": "יצירת כותרת",
      "storyDetails.characters": "דמויות ראשיות",
      "storyDetails.themes": "נושאי הסיפור",
      "storyDetails.setting": "רקע הסיפור",
      "storyDetails.genre.label": "סוגה ספרותית",
      "storyDetails.genre.adventure": "הרפתקאות",
      "storyDetails.genre.fairyTale": "אגדה",
      "storyDetails.genre.educational": "חינוכי",
      "storyDetails.genre.bedtime": "סיפור לפני השינה",
      "storyDetails.genre.fantasy": "פנטזיה",
      "storyDetails.genre.science": "מדע",
      "storyDetails.genre.animals": "חיות",
      "storyDetails.genre.sports": "ספורט",
      "storyDetails.ageRange.label": "טווח גילאים",
      "storyDetails.ageRange.toddler": "פעוטות (2-4 שנים)",
      "storyDetails.ageRange.preschool": "גן (5-7 שנים)",
      "storyDetails.ageRange.elementary": "יסודי (8-10 שנים)",
      "storyDetails.ageRange.preteen": "טרום נוער (11+ שנים)",
      "storyDetails.tone.label": "טון הסיפור",
      "storyDetails.tone.humorous": "הומוריסטי",
      "storyDetails.tone.whimsical": "דמיוני",
      "storyDetails.tone.calming": "מרגיע",
      "storyDetails.tone.exciting": "מרגש",
      "storyDetails.tone.educational": "חינוכי",
      "storyDetails.length.label": "אורך הסיפור",
      "storyDetails.length.short": "קצר (5-10 עמודים)",
      "storyDetails.length.medium": "בינוני (11-20 עמודים)",
      "storyDetails.length.long": "ארוך (21-30 עמודים)",
      "storyDetails.moral.label": "מוסר השכל או לקח",
      "storyDetails.moral.placeholder": "איזה לקח היית רוצה שהסיפור ילמד?"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const handleChange = (field, value) => {
    updateBookData(field, value);
  };

  const handleGenerateTitle = async () => {
    if (!onGenerateTitle) {
      // If no onGenerateTitle prop provided, generate locally
      const { InvokeLLM } = await import('@/integrations/Core');
      
      try {
        const targetLanguage = bookData.language || currentLanguage;
        const languageInstruction = targetLanguage === "hebrew" ? 
          "יש ליצור את כל התוכן בעברית בלבד. " : 
          targetLanguage === "yiddish" ? 
          "Create all content in Yiddish only. " :
          "Create all content in English only. ";

        const charactersInfo = bookData.childNames ? bookData.childNames.join(', ') : (bookData.child_name || 'a child');
        const themesInfo = bookData.interests || 'adventure and friendship';

        const prompt = `${languageInstruction}Create a creative and engaging book title for a children's story with these details:
        - Main characters: ${charactersInfo}
        - Age: ${bookData.child_age || 5} years old
        - Genre: ${bookData.genre}
        - Theme/Moral: ${bookData.moral || themesInfo}
        - Tone: ${bookData.tone}
        - Child's interests: ${bookData.interests || 'general'}
        
        The title should be catchy, age-appropriate, and reflect the story's theme. Return only the title, nothing else.`;

        const result = await InvokeLLM({
          prompt: prompt
        });

        if (result && typeof result === 'string') {
          updateBookData('title', result.trim());
        }
      } catch (error) {
        // silently handled
      }
    } else {
      onGenerateTitle();
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Story Overview Section */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
        <CardHeader>
          <CardTitle className={`text-xl text-purple-700 dark:text-purple-300 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <BookOpen className="h-5 w-5" />
            {t("storyDetails.storyOverview")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Characters */}
          {bookData.childNames && bookData.childNames.length > 0 && (
            <div>
              <Label className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Users className="h-4 w-4 text-purple-500" />
                {t("storyDetails.characters")}
              </Label>
              <div className={`flex flex-wrap gap-2 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {bookData.childNames.map((name, index) => (
                  <Badge key={index} className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Themes */}
          {bookData.interests && (
            <div>
              <Label className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Target className="h-4 w-4 text-blue-500" />
                {t("storyDetails.themes")}
              </Label>
              <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{bookData.interests}</p>
            </div>
          )}

          {/* Setting */}
          {bookData.family_members && (
            <div>
              <Label className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Target className="h-4 w-4 text-green-500" />
                {t("storyDetails.setting")}
              </Label>
              <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{bookData.family_members}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Settings */}
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white">
            {t("storyDetails.title")}
          </CardTitle>
          <p className={`text-gray-500 dark:text-gray-400 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t("storyDetails.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Book Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("storyDetails.bookTitle.label")}</Label>
            <div className={`flex gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Input
                id="title"
                placeholder={t("storyDetails.bookTitle.placeholder")}
                value={bookData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="flex-1"
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button 
                type="button" 
                onClick={handleGenerateTitle}
                variant="outline"
              >
                <Wand2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t("storyDetails.bookTitle.generateButton")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre">{t("storyDetails.genre.label")}</Label>
              <Select
                id="genre"
                value={bookData.genre}
                onValueChange={(value) => handleChange("genre", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adventure">{t("storyDetails.genre.adventure")}</SelectItem>
                  <SelectItem value="fairy_tale">{t("storyDetails.genre.fairyTale")}</SelectItem>
                  <SelectItem value="educational">{t("storyDetails.genre.educational")}</SelectItem>
                  <SelectItem value="bedtime">{t("storyDetails.genre.bedtime")}</SelectItem>
                  <SelectItem value="fantasy">{t("storyDetails.genre.fantasy")}</SelectItem>
                  <SelectItem value="science">{t("storyDetails.genre.science")}</SelectItem>
                  <SelectItem value="animals">{t("storyDetails.genre.animals")}</SelectItem>
                  <SelectItem value="sports">{t("storyDetails.genre.sports")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Range */}
            <div className="space-y-2">
              <Label htmlFor="age_range">{t("storyDetails.ageRange.label")}</Label>
              <Select
                id="age_range"
                value={bookData.age_range}
                onValueChange={(value) => handleChange("age_range", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-4">{t("storyDetails.ageRange.toddler")}</SelectItem>
                  <SelectItem value="5-7">{t("storyDetails.ageRange.preschool")}</SelectItem>
                  <SelectItem value="8-10">{t("storyDetails.ageRange.elementary")}</SelectItem>
                  <SelectItem value="11+">{t("storyDetails.ageRange.preteen")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Story Tone */}
          <div className="space-y-3">
            <Label>{t("storyDetails.tone.label")}</Label>
            <RadioGroup
              value={bookData.tone}
              onValueChange={(value) => handleChange("tone", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "humorous", label: t("storyDetails.tone.humorous") },
                { value: "whimsical", label: t("storyDetails.tone.whimsical") },
                { value: "calming", label: t("storyDetails.tone.calming") },
                { value: "exciting", label: t("storyDetails.tone.exciting") },
                { value: "educational", label: t("storyDetails.tone.educational") }
              ].map((tone) => (
                <div key={tone.value} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} space-${isRTL ? 'x-reverse' : 'x'}-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${bookData.tone === tone.value ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : ''}`}>
                  <RadioGroupItem value={tone.value} id={`tone-${tone.value}`} />
                  <Label htmlFor={`tone-${tone.value}`} className="flex-1 cursor-pointer">{tone.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Story Length */}
          <div className="space-y-3">
            <Label className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="h-4 w-4 text-purple-500" />
              {t("storyDetails.length.label")}
            </Label>
            <RadioGroup
              value={bookData.length}
              onValueChange={(value) => handleChange("length", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "short", label: t("storyDetails.length.short") },
                { value: "medium", label: t("storyDetails.length.medium") },
                { value: "long", label: t("storyDetails.length.long") }
              ].map((length) => (
                <div key={length.value} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} space-${isRTL ? 'x-reverse' : 'x'}-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${bookData.length === length.value ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : ''}`}>
                  <RadioGroupItem value={length.value} id={`length-${length.value}`} />
                  <Label htmlFor={`length-${length.value}`} className="flex-1 cursor-pointer">{length.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Moral/Lesson */}
          <div className="space-y-2">
            <Label htmlFor="moral">{t("storyDetails.moral.label")}</Label>
            <Textarea
              id="moral"
              placeholder={t("storyDetails.moral.placeholder")}
              value={bookData.moral}
              onChange={(e) => handleChange("moral", e.target.value)}
              className="min-h-[100px]"
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
