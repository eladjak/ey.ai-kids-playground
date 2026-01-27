import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Flame, Sparkles, Moon } from "lucide-react";

export default function SceneTemplates({ onSelectTemplate, currentLanguage = "english", isRTL = false }) {
  const translations = {
    english: {
      "templates.title": "Scene Templates",
      "templates.subtitle": "Start with a proven story structure",
      "templates.use": "Use Template",
      "templates.opening": "Opening Scene",
      "templates.openingDesc": "Introduction to characters and world",
      "templates.conflict": "Conflict Introduction",
      "templates.conflictDesc": "Present the main challenge or problem",
      "templates.rising": "Rising Action",
      "templates.risingDesc": "Build tension and develop the story",
      "templates.climax": "Climax",
      "templates.climaxDesc": "The most intense or important moment",
      "templates.resolution": "Resolution",
      "templates.resolutionDesc": "Resolve conflicts and wrap up",
      "templates.ending": "Ending Scene",
      "templates.endingDesc": "Conclude the story with a satisfying ending"
    },
    hebrew: {
      "templates.title": "תבניות סצנה",
      "templates.subtitle": "התחל עם מבנה סיפור מוכח",
      "templates.use": "השתמש בתבנית",
      "templates.opening": "סצנת פתיחה",
      "templates.openingDesc": "הכרת הדמויות והעולם",
      "templates.conflict": "הצגת הקונפליקט",
      "templates.conflictDesc": "הצג את האתגר או הבעיה המרכזית",
      "templates.rising": "פעולה עולה",
      "templates.risingDesc": "בנה מתח ופתח את הסיפור",
      "templates.climax": "שיא",
      "templates.climaxDesc": "הרגע האינטנסיבי או החשוב ביותר",
      "templates.resolution": "פתרון",
      "templates.resolutionDesc": "פתור קונפליקטים וסכם",
      "templates.ending": "סצנת סיום",
      "templates.endingDesc": "סיים את הסיפור עם סוף מספק"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key] || key;

  const templates = [
    {
      id: "opening",
      title: t("templates.opening"),
      description: t("templates.openingDesc"),
      icon: BookOpen,
      color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20",
      template: {
        mood: "joyful",
        pacing: "slow",
        key_elements: ["Character introduction", "Setting establishment", "Normal world"]
      }
    },
    {
      id: "conflict",
      title: t("templates.conflict"),
      description: t("templates.conflictDesc"),
      icon: Flame,
      color: "bg-orange-50 text-orange-700 dark:bg-orange-900/20",
      template: {
        mood: "tense",
        pacing: "medium",
        key_elements: ["Problem introduction", "Stakes established", "Challenge presented"]
      }
    },
    {
      id: "rising",
      title: t("templates.rising"),
      description: t("templates.risingDesc"),
      icon: Sparkles,
      color: "bg-purple-50 text-purple-700 dark:bg-purple-900/20",
      template: {
        mood: "exciting",
        pacing: "fast",
        key_elements: ["Obstacles", "Character growth", "Tension building"]
      }
    },
    {
      id: "climax",
      title: t("templates.climax"),
      description: t("templates.climaxDesc"),
      icon: Flame,
      color: "bg-red-50 text-red-700 dark:bg-red-900/20",
      template: {
        mood: "exciting",
        pacing: "fast",
        key_elements: ["Peak moment", "Decision point", "Maximum tension"]
      }
    },
    {
      id: "resolution",
      title: t("templates.resolution"),
      description: t("templates.resolutionDesc"),
      icon: Sparkles,
      color: "bg-green-50 text-green-700 dark:bg-green-900/20",
      template: {
        mood: "calm",
        pacing: "medium",
        key_elements: ["Problem solved", "Lessons learned", "New equilibrium"]
      }
    },
    {
      id: "ending",
      title: t("templates.ending"),
      description: t("templates.endingDesc"),
      icon: Moon,
      color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20",
      template: {
        mood: "joyful",
        pacing: "slow",
        key_elements: ["Conclusion", "Character reflection", "Satisfying closure"]
      }
    }
  ];

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{t("templates.title")}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t("templates.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectTemplate(template.template)}
            >
              <CardHeader>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-lg ${template.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{template.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {template.description}
                </p>
                <div className={`flex gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {template.template.key_elements.map((element, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {element}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  {t("templates.use")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}