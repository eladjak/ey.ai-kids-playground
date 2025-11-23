import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function LanguageStep({ bookData, updateBookData }) {
  const [currentLanguage, setCurrentLanguage] = useState("english");
  
  // Load language preference
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
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Translations
  const translations = {
    english: {
      "language.title": "Choose Language",
      "language.subtitle": "Select the language for your story",
      "language.storyLanguage": "Story Language",
      "language.english": "English",
      "language.english.description": "Generate the story in English",
      "language.hebrew": "Hebrew",
      "language.hebrew.description": "Generate the story in Hebrew (with RTL support)",
      "language.yiddish": "Yiddish",
      "language.yiddish.description": "Generate the story in Yiddish (with RTL support)"
    },
    hebrew: {
      "language.title": "בחירת שפה",
      "language.subtitle": "בחר את השפה לסיפור שלך",
      "language.storyLanguage": "שפת הסיפור",
      "language.english": "אנגלית",
      "language.english.description": "יצירת סיפור באנגלית",
      "language.hebrew": "עברית",
      "language.hebrew.description": "יצירת סיפור בעברית (עם תמיכה בכיוון ימין לשמאל)",
      "language.yiddish": "יידיש",
      "language.yiddish.description": "יצירת סיפור ביידיש (עם תמיכה בכיוון ימין לשמאל)"
    },
    yiddish: {
      "language.title": "אויסקלייַבן שפּראַך",
      "language.subtitle": "אויסקלייַבן די שפּראַך פֿאַר דײַן מעשה",
      "language.storyLanguage": "מעשה שפּראַך"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  // Determine text direction
  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";

  const handleChange = (field, value) => {
    updateBookData(field, value);
  };

  const languages = [
    {
      id: "english",
      title: t("language.english"),
      description: t("language.english.description"),
      icon: "🇺🇸"
    },
    {
      id: "hebrew",
      title: t("language.hebrew"),
      description: t("language.hebrew.description"),
      icon: "🇮🇱"
    },
    {
      id: "yiddish",
      title: t("language.yiddish"),
      description: t("language.yiddish.description"),
      icon: "ייִ"
    }
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white">
          {t("language.title")}
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t("language.subtitle")}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label>{t("language.storyLanguage")}</Label>
          <RadioGroup
            value={bookData.language}
            onValueChange={(value) => handleChange("language", value)}
            className="space-y-3"
          >
            {languages.map((language) => (
              <div
                key={language.id}
                className={`flex items-center space-${isRTL ? 'x-reverse' : 'x'}-2 rounded-lg border p-4 ${
                  bookData.language === language.id
                    ? "border-purple-500 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                <RadioGroupItem value={language.id} id={language.id} />
                <Label
                  htmlFor={language.id}
                  className="flex flex-1 cursor-pointer items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-base font-medium leading-none">
                      {language.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language.description}
                    </p>
                  </div>
                  <span className="text-2xl">{language.icon}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}