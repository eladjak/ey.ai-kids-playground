import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Volume2, PenTool } from "lucide-react"; // Corrected icons

export default function LanguageStep({ bookData, updateBookData }) {
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [rhymingEnabled, setRhymingEnabled] = useState(false);
  
  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage");
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
  }, []);
  
  // Define translations
  const translations = {
    english: {
      "languageStep.title": "Language & Narration",
      "languageStep.subtitle": "Choose book language and optional features",
      "languageStep.language": "Book Language",
      "languageStep.audioNarration": "Audio Narration",
      "languageStep.audioDescription": "Enable automated voice narration",
      "languageStep.rhyming": "Poetic Rhyming",
      "languageStep.rhymingDescription": "Create story with rhythmic rhymes"
    },
    hebrew: {
      "languageStep.title": "שפה והקראה",
      "languageStep.subtitle": "בחר שפת ספר ותכונות נוספות",
      "languageStep.language": "שפת הספר",
      "languageStep.audioNarration": "הקראה קולית",
      "languageStep.audioDescription": "הפעל הקראה קולית אוטומטית",
      "languageStep.rhyming": "חריזה שירית",
      "languageStep.rhymingDescription": "צור סיפור עם חריזה מקצבית"
    }
  };
  
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";
  
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white">
          {t("languageStep.title")}
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t("languageStep.subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>{t("languageStep.language")}</Label>
          <RadioGroup
            value={bookData.language}
            onValueChange={(value) => updateBookData("language", value)}
            className="flex flex-col space-y-1"
          >
            {/* Add language options here if needed */}
          </RadioGroup>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-blue-500" />
                <Label htmlFor="audio-narration">{t("languageStep.audioNarration")}</Label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("languageStep.audioDescription")}
              </p>
            </div>
            <Switch
              id="audio-narration"
              checked={audioEnabled}
              onCheckedChange={setAudioEnabled}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-purple-500" />
                <Label htmlFor="rhyming">{t("languageStep.rhyming")}</Label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("languageStep.rhymingDescription")}
              </p>
            </div>
            <Switch
              id="rhyming"
              checked={rhymingEnabled}
              onCheckedChange={setRhymingEnabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}