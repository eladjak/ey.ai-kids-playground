import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users2, Heart, Swords, Users, Sparkles, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RelationshipMap({ characters = [], scenes = [], bookData, currentLanguage = "english", isRTL = false }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [relationships, setRelationships] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  const translations = {
    english: {
      "rel.title": "Character Relationships",
      "rel.analyze": "Analyze Relationships",
      "rel.analyzing": "Analyzing character dynamics...",
      "rel.noCharacters": "Need at least 2 characters to analyze relationships.",
      "rel.type": "Type",
      "rel.strength": "Strength",
      "rel.development": "Development",
      "rel.keyMoments": "Key Moments",
      "rel.friend": "Friendship",
      "rel.family": "Family",
      "rel.rival": "Rivalry",
      "rel.mentor": "Mentor/Student",
      "rel.romantic": "Romantic",
      "rel.neutral": "Neutral",
      "rel.conflict": "Conflict",
      "rel.weak": "Weak",
      "rel.moderate": "Moderate",
      "rel.strong": "Strong",
      "rel.growing": "Growing",
      "rel.stable": "Stable",
      "rel.declining": "Declining"
    },
    hebrew: {
      "rel.title": "יחסים בין דמויות",
      "rel.analyze": "נתח יחסים",
      "rel.analyzing": "מנתח דינמיקה בין הדמויות...",
      "rel.noCharacters": "נדרשות לפחות 2 דמויות לניתוח יחסים.",
      "rel.type": "סוג",
      "rel.strength": "עוצמה",
      "rel.development": "התפתחות",
      "rel.keyMoments": "רגעי מפתח",
      "rel.friend": "חברות",
      "rel.family": "משפחה",
      "rel.rival": "יריבות",
      "rel.mentor": "מנטור/תלמיד",
      "rel.romantic": "רומנטי",
      "rel.neutral": "ניטרלי",
      "rel.conflict": "קונפליקט",
      "rel.weak": "חלש",
      "rel.moderate": "בינוני",
      "rel.strong": "חזק",
      "rel.growing": "גדל",
      "rel.stable": "יציב",
      "rel.declining": "יורד"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key] || key;

  const analyzeRelationships = async () => {
    setAnalyzing(true);
    try {
      const language = bookData.language || currentLanguage;
      const isHebrew = language === "hebrew";

      const prompt = isHebrew ?
        `נתח את היחסים בין הדמויות בסיפור זה בעברית.

**דמויות:**
${characters.map(c => `- ${c.name} (גיל: ${c.age}, מגדר: ${c.gender})`).join('\n')}

**סצנות:**
${scenes.map((s, i) => `
סצנה ${i + 1}: ${s.title}
תיאור: ${s.description}
דמויות: ${s.characters?.join(', ') || 'לא צוינו'}
`).join('\n')}

לכל זוג דמויות, נתח:
1. **סוג היחס**: friend (חברות), family (משפחה), rival (יריבות), mentor (מנטור/תלמיד), romantic (רומנטי), neutral (ניטרלי), conflict (קונפליקט)
2. **עוצמת היחס** (0-100)
3. **התפתחות**: growing (גדל), stable (יציב), declining (יורד)
4. **רגעי מפתח**: 2-3 סצנות שמשפיעות על היחס
5. **תיאור**: משפט קצר על היחס

מוצרים כל זוג אפשרי של דמויות.` :
        `Analyze character relationships in this story in English.

**Characters:**
${characters.map(c => `- ${c.name} (age: ${c.age}, gender: ${c.gender})`).join('\n')}

**Scenes:**
${scenes.map((s, i) => `
Scene ${i + 1}: ${s.title}
Description: ${s.description}
Characters: ${s.characters?.join(', ') || 'Not specified'}
`).join('\n')}

For each character pair, analyze:
1. **Type**: friend, family, rival, mentor, romantic, neutral, conflict
2. **Strength** (0-100)
3. **Development**: growing, stable, declining
4. **Key moments**: 2-3 scenes affecting the relationship
5. **Description**: brief description of the relationship

Return all possible character pairs.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            relationships: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  character1: { type: "string" },
                  character2: { type: "string" },
                  type: { type: "string", enum: ["friend", "family", "rival", "mentor", "romantic", "neutral", "conflict"] },
                  strength: { type: "number" },
                  development: { type: "string", enum: ["growing", "stable", "declining"] },
                  key_moments: {
                    type: "array",
                    items: { type: "string" }
                  },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRelationships(result.relationships || []);
    } catch (error) {
      // silently handled
    } finally {
      setAnalyzing(false);
    }
  };

  const getRelationshipIcon = (type) => {
    switch (type) {
      case "friend": return <Users className="h-5 w-5" />;
      case "family": return <Heart className="h-5 w-5" />;
      case "rival": return <Swords className="h-5 w-5" />;
      case "romantic": return <Heart className="h-5 w-5" />;
      case "conflict": return <Swords className="h-5 w-5" />;
      default: return <Users2 className="h-5 w-5" />;
    }
  };

  const getRelationshipColor = (type) => {
    switch (type) {
      case "friend": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300";
      case "family": return "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300";
      case "rival": return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300";
      case "mentor": return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300";
      case "romantic": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300";
      case "conflict": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getDevelopmentColor = (dev) => {
    switch (dev) {
      case "growing": return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "stable": return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "declining": return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  if (!characters || characters.length < 2) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{t("rel.noCharacters")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {!relationships && (
        <Button
          onClick={analyzeRelationships}
          disabled={analyzing}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("rel.analyzing")}
            </>
          ) : (
            <>
              <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("rel.analyze")}
            </>
          )}
        </Button>
      )}

      {relationships && (
        <div className="grid grid-cols-1 gap-4">
          {relationships.map((rel, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRelationship === index ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedRelationship(selectedRelationship === index ? null : index)}
            >
              <CardHeader>
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className={getRelationshipColor(rel.type) + " p-2 rounded-lg border"}>
                      {getRelationshipIcon(rel.type)}
                    </span>
                    <span>{rel.character1} ↔ {rel.character2}</span>
                  </CardTitle>
                  <Badge className={getDevelopmentColor(rel.development)}>
                    {t(`rel.${rel.development}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t("rel.type")}</div>
                    <Badge className={getRelationshipColor(rel.type)}>
                      {t(`rel.${rel.type}`)}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t("rel.strength")}</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {rel.strength}/100
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{rel.description}</p>
                </div>

                {selectedRelationship === index && rel.key_moments && (
                  <div className="border-t pt-3 mt-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("rel.keyMoments")}
                    </div>
                    <div className="space-y-2">
                      {rel.key_moments.map((moment, i) => (
                        <div key={i} className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm">
                          {moment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}