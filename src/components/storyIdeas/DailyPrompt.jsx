import React from "react";
import { Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DailyPrompt({ 
  prompt, 
  onUse, 
  onDismiss, 
  currentLanguage = "english", 
  isRTL = false 
}) {
  // Translation function with hardcoded translations
  const translations = {
    english: {
      "title": "Daily Story Prompt",
      "subtitle": "From today's featured story prompt",
      "use": "Use this prompt",
      "dismiss": "Dismiss"
    },
    hebrew: {
      "title": "רעיון יומי לסיפור",
      "subtitle": "מתוך רעיון הסיפור היומי המוצג",
      "use": "השתמש ברעיון זה",
      "dismiss": "סגור"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  if (!prompt) return null;

  return (
    <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 mb-6">
      <CardHeader>
        <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          {t("title")}
        </CardTitle>
        <p className="text-amber-700 dark:text-amber-400 text-sm">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="font-medium text-amber-800 dark:text-amber-300">{prompt.title}</h4>
          <p className="text-amber-700 dark:text-amber-400 mt-1">{prompt.description}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-white" 
            onClick={onUse}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            {t("use")}
          </Button>
          <Button 
            variant="outline" 
            className="border-amber-200 text-amber-700 hover:bg-amber-100"
            onClick={onDismiss}
          >
            {t("dismiss")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}