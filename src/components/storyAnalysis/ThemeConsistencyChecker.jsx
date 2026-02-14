import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Target, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { buildSafetyPromptPrefix } from "@/utils/content-moderation";

export default function ThemeConsistencyChecker({ bookData, scenes = [], currentLanguage = "english", isRTL = false }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const translations = {
    english: {
      "theme.title": "Theme Consistency Analysis",
      "theme.analyze": "Analyze Theme",
      "theme.analyzing": "Analyzing theme consistency...",
      "theme.overall": "Overall",
      "theme.scenes": "Scene Analysis",
      "theme.suggestions": "Suggestions",
      "theme.consistencyScore": "Consistency Score",
      "theme.mainTheme": "Main Theme",
      "theme.subThemes": "Sub-themes",
      "theme.themePresence": "Theme Presence",
      "theme.sceneNumber": "Scene",
      "theme.themeStrength": "Theme Strength",
      "theme.alignment": "Alignment",
      "theme.strong": "Strong",
      "theme.moderate": "Moderate",
      "theme.weak": "Weak",
      "theme.excellent": "Excellent",
      "theme.good": "Good",
      "theme.needsWork": "Needs Work",
      "theme.noScenes": "No scenes available for analysis."
    },
    hebrew: {
      "theme.title": "ניתוח עקביות נושא",
      "theme.analyze": "נתח נושא",
      "theme.analyzing": "מנתח עקביות נושא...",
      "theme.overall": "כללי",
      "theme.scenes": "ניתוח סצנות",
      "theme.suggestions": "הצעות",
      "theme.consistencyScore": "ציון עקביות",
      "theme.mainTheme": "נושא ראשי",
      "theme.subThemes": "נושאי משנה",
      "theme.themePresence": "נוכחות נושא",
      "theme.sceneNumber": "סצנה",
      "theme.themeStrength": "עוצמת נושא",
      "theme.alignment": "התאמה",
      "theme.strong": "חזק",
      "theme.moderate": "בינוני",
      "theme.weak": "חלש",
      "theme.excellent": "מצוין",
      "theme.good": "טוב",
      "theme.needsWork": "צריך עבודה",
      "theme.noScenes": "אין סצנות לניתוח."
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key] || key;

  const analyzeTheme = async () => {
    setAnalyzing(true);
    try {
      const language = bookData.language || currentLanguage;
      const isHebrew = language === "hebrew";

      const safetyPrefix = buildSafetyPromptPrefix(bookData.child_age || '5-10');
      const prompt = safetyPrefix + (isHebrew ?
        `נתח את עקביות הנושא המרכזי בסיפור זה בעברית.

**פרטי הסיפור:**
כותרת: ${bookData.title}
ז'אנר: ${bookData.genre}
מוסר/מסר: ${bookData.moral || 'לא צוין'}
תחומי עניין: ${bookData.interests || 'כללי'}

**סצנות (${scenes.length}):**
${scenes.map((s, i) => `
סצנה ${i + 1}: ${s.title}
תיאור: ${s.description}
`).join('\n')}

נתח:
1. **הנושא הראשי** - מה הנושא המרכזי של הסיפור?
2. **נושאי משנה** (2-4) - נושאים תומכים
3. **ציון עקביות** (0-100) - כמה הסיפור עקבי בנושא
4. **נוכחות נושא** (0-100) - כמה הנושא נוכח לאורך הסיפור

לכל סצנה:
- עוצמת נושא (0-100)
- התאמה לנושא הראשי (strong/moderate/weak)
- הסבר קצר

5-7 הצעות לחיזוק עקביות הנושא.` :
        `Analyze the theme consistency of this story in English.

**Story Details:**
Title: ${bookData.title}
Genre: ${bookData.genre}
Moral/Message: ${bookData.moral || 'Not specified'}
Interests: ${bookData.interests || 'General'}

**Scenes (${scenes.length}):**
${scenes.map((s, i) => `
Scene ${i + 1}: ${s.title}
Description: ${s.description}
`).join('\n')}

Analyze:
1. **Main Theme** - What's the central theme?
2. **Sub-themes** (2-4) - Supporting themes
3. **Consistency Score** (0-100) - How consistent is the theme?
4. **Theme Presence** (0-100) - How present is the theme throughout?

For each scene:
- Theme strength (0-100)
- Alignment with main theme (strong/moderate/weak)
- Brief explanation

Provide 5-7 suggestions to strengthen theme consistency.`);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            main_theme: { type: "string" },
            sub_themes: {
              type: "array",
              items: { type: "string" }
            },
            consistency_score: { type: "number" },
            theme_presence: { type: "number" },
            scene_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene_number: { type: "number" },
                  theme_strength: { type: "number" },
                  alignment: { type: "string", enum: ["strong", "moderate", "weak"] },
                  explanation: { type: "string" }
                }
              }
            },
            suggestions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      // silently handled
    } finally {
      setAnalyzing(false);
    }
  };

  const getAlignmentColor = (alignment) => {
    switch (alignment) {
      case "strong": return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "moderate": return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "weak": return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return { label: t("theme.excellent"), color: "text-green-600" };
    if (score >= 60) return { label: t("theme.good"), color: "text-blue-600" };
    return { label: t("theme.needsWork"), color: "text-orange-600" };
  };

  if (!scenes || scenes.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{t("theme.noScenes")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {!analysis && (
        <Button onClick={analyzeTheme} disabled={analyzing} className="w-full">
          {analyzing ? (
            <>
              <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("theme.analyzing")}
            </>
          ) : (
            <>
              <Target className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("theme.analyze")}
            </>
          )}
        </Button>
      )}

      {analysis && (
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overall">{t("theme.overall")}</TabsTrigger>
            <TabsTrigger value="scenes">{t("theme.scenes")}</TabsTrigger>
            <TabsTrigger value="suggestions">{t("theme.suggestions")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardHeader>
                <CardTitle className="text-lg">{t("theme.mainTheme")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {analysis.main_theme}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("theme.consistencyScore")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreLevel(analysis.consistency_score).color}`}>
                    {analysis.consistency_score}/100
                  </div>
                  <Progress value={analysis.consistency_score} className="mt-2" />
                  <p className="text-xs mt-1 text-gray-500">
                    {getScoreLevel(analysis.consistency_score).label}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("theme.themePresence")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analysis.theme_presence}/100
                  </div>
                  <Progress value={analysis.theme_presence} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {analysis.sub_themes && analysis.sub_themes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t("theme.subThemes")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {analysis.sub_themes.map((theme, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scenes" className="space-y-3">
            {analysis.scene_analysis?.map((sceneData, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <CardTitle className="text-base">
                      {t("theme.sceneNumber")} {sceneData.scene_number}
                    </CardTitle>
                    <Badge className={getAlignmentColor(sceneData.alignment)}>
                      {t(`theme.${sceneData.alignment}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t("theme.themeStrength")}</div>
                    <Progress value={sceneData.theme_strength} />
                    <div className="text-xs mt-1">{sceneData.theme_strength}/100</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {sceneData.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3">
            {analysis.suggestions?.map((suggestion, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <TrendingUp className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}