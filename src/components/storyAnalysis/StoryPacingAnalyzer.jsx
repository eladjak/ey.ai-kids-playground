import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Gauge, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function StoryPacingAnalyzer({ bookData, scenes = [], currentLanguage = "english", isRTL = false }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const translations = {
    english: {
      "pacing.title": "Story Pacing Analysis",
      "pacing.analyze": "Analyze Pacing",
      "pacing.analyzing": "Analyzing story pacing...",
      "pacing.overall": "Overall",
      "pacing.sceneByScene": "Scene by Scene",
      "pacing.recommendations": "Recommendations",
      "pacing.overallScore": "Overall Pacing Score",
      "pacing.tempo": "Story Tempo",
      "pacing.balance": "Balance Score",
      "pacing.engagement": "Engagement Level",
      "pacing.sceneNumber": "Scene",
      "pacing.pacingLevel": "Pacing",
      "pacing.tension": "Tension",
      "pacing.actionDensity": "Action Density",
      "pacing.dialogueRatio": "Dialogue Ratio",
      "pacing.recommendation": "Recommendation",
      "pacing.tooSlow": "Too Slow",
      "pacing.slow": "Slow",
      "pacing.balanced": "Balanced",
      "pacing.fast": "Fast",
      "pacing.tooFast": "Too Fast",
      "pacing.low": "Low",
      "pacing.medium": "Medium",
      "pacing.high": "High",
      "pacing.noScenes": "No scenes available for analysis. Create scenes first."
    },
    hebrew: {
      "pacing.title": "ניתוח קצב הסיפור",
      "pacing.analyze": "נתח קצב",
      "pacing.analyzing": "מנתח את קצב הסיפור...",
      "pacing.overall": "כללי",
      "pacing.sceneByScene": "סצנה אחר סצנה",
      "pacing.recommendations": "המלצות",
      "pacing.overallScore": "ציון קצב כללי",
      "pacing.tempo": "טמפו הסיפור",
      "pacing.balance": "ציון איזון",
      "pacing.engagement": "רמת מעורבות",
      "pacing.sceneNumber": "סצנה",
      "pacing.pacingLevel": "קצב",
      "pacing.tension": "מתח",
      "pacing.actionDensity": "צפיפות אקשן",
      "pacing.dialogueRatio": "יחס דיאלוג",
      "pacing.recommendation": "המלצה",
      "pacing.tooSlow": "איטי מדי",
      "pacing.slow": "איטי",
      "pacing.balanced": "מאוזן",
      "pacing.fast": "מהיר",
      "pacing.tooFast": "מהיר מדי",
      "pacing.low": "נמוך",
      "pacing.medium": "בינוני",
      "pacing.high": "גבוה",
      "pacing.noScenes": "אין סצנות לניתוח. צור סצנות תחילה."
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key] || key;

  const analyzePacing = async () => {
    setAnalyzing(true);
    try {
      const language = bookData.language || currentLanguage;
      const isHebrew = language === "hebrew";

      const prompt = isHebrew ? 
        `נתח את קצב הסיפור הבא בעברית. הסיפור מיועד לגיל ${bookData.child_age || 5} בסגנון ${bookData.tone}.

**פרטי הסיפור:**
כותרת: ${bookData.title}
ז'אנר: ${bookData.genre}
אורך: ${bookData.length}

**סצנות (${scenes.length}):**
${scenes.map((scene, i) => `
סצנה ${i + 1}: ${scene.title}
תיאור: ${scene.description}
מיקום: ${scene.location || 'לא צוין'}
דמויות: ${scene.characters?.join(', ') || 'לא צוינו'}
`).join('\n')}

נתח את הקצב לפי:
1. **ציון כללי** (0-100) - כמה הקצב מתאים לגיל ולסוג הסיפור
2. **טמפו** (slow/medium/fast) - המהירות הכללית
3. **איזון** (0-100) - כמה הסיפור מאוזן בין אקשן לרגש
4. **מעורבות** (low/medium/high) - כמה הסיפור מרתק

לכל סצנה:
- רמת קצב (too_slow/slow/balanced/fast/too_fast)
- מתח (0-100)
- צפיפות אקשן (0-100)
- יחס דיאלוג (0-100)
- המלצה ספציפית לשיפור

תן 3-5 המלצות כלליות לשיפור הקצב.` :
        `Analyze the pacing of this story in English. Target age: ${bookData.child_age || 5}, tone: ${bookData.tone}.

**Story Details:**
Title: ${bookData.title}
Genre: ${bookData.genre}
Length: ${bookData.length}

**Scenes (${scenes.length}):**
${scenes.map((scene, i) => `
Scene ${i + 1}: ${scene.title}
Description: ${scene.description}
Location: ${scene.location || 'Not specified'}
Characters: ${scene.characters?.join(', ') || 'Not specified'}
`).join('\n')}

Analyze pacing for:
1. **Overall Score** (0-100) - how well-paced for age and genre
2. **Tempo** (slow/medium/fast) - overall speed
3. **Balance** (0-100) - action vs emotion balance
4. **Engagement** (low/medium/high) - how engaging

For each scene:
- Pacing level (too_slow/slow/balanced/fast/too_fast)
- Tension (0-100)
- Action density (0-100)
- Dialogue ratio (0-100)
- Specific recommendation

Provide 3-5 general recommendations for improving pacing.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            tempo: { type: "string", enum: ["slow", "medium", "fast"] },
            balance_score: { type: "number" },
            engagement: { type: "string", enum: ["low", "medium", "high"] },
            scene_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene_number: { type: "number" },
                  pacing_level: { type: "string", enum: ["too_slow", "slow", "balanced", "fast", "too_fast"] },
                  tension: { type: "number" },
                  action_density: { type: "number" },
                  dialogue_ratio: { type: "number" },
                  recommendation: { type: "string" }
                }
              }
            },
            recommendations: {
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

  const getPacingColor = (level) => {
    switch (level) {
      case "too_slow": return "text-red-600 bg-red-50 dark:bg-red-900/20";
      case "slow": return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
      case "balanced": return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "fast": return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "too_fast": return "text-purple-600 bg-purple-50 dark:bg-purple-900/20";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "low": return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "medium": return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "high": return "text-green-600 bg-green-50 dark:bg-green-900/20";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getPacingIcon = (level) => {
    switch (level) {
      case "too_slow": return <TrendingDown className="h-4 w-4" />;
      case "slow": return <TrendingDown className="h-4 w-4" />;
      case "balanced": return <Minus className="h-4 w-4" />;
      case "fast": return <TrendingUp className="h-4 w-4" />;
      case "too_fast": return <Zap className="h-4 w-4" />;
      default: return <Gauge className="h-4 w-4" />;
    }
  };

  if (!scenes || scenes.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{t("pacing.noScenes")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {!analysis && (
        <Button
          onClick={analyzePacing}
          disabled={analyzing}
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("pacing.analyzing")}
            </>
          ) : (
            <>
              <Gauge className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("pacing.analyze")}
            </>
          )}
        </Button>
      )}

      {analysis && (
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overall">{t("pacing.overall")}</TabsTrigger>
            <TabsTrigger value="scenes">{t("pacing.sceneByScene")}</TabsTrigger>
            <TabsTrigger value="recommendations">{t("pacing.recommendations")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("pacing.overallScore")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {analysis.overall_score}/100
                  </div>
                  <Progress value={analysis.overall_score} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("pacing.tempo")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getLevelColor(analysis.tempo)}>
                    {t(`pacing.${analysis.tempo}`)}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("pacing.balance")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.balance_score}/100</div>
                  <Progress value={analysis.balance_score} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{t("pacing.engagement")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getLevelColor(analysis.engagement)}>
                    {t(`pacing.${analysis.engagement}`)}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scenes" className="space-y-4">
            {analysis.scene_analysis?.map((sceneData, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <CardTitle className="text-base">
                      {t("pacing.sceneNumber")} {sceneData.scene_number}
                    </CardTitle>
                    <Badge className={getPacingColor(sceneData.pacing_level)}>
                      {getPacingIcon(sceneData.pacing_level)}
                      <span className={isRTL ? 'mr-1' : 'ml-1'}>
                        {t(`pacing.${sceneData.pacing_level}`)}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{t("pacing.tension")}</div>
                      <Progress value={sceneData.tension} />
                      <div className="text-xs mt-1">{sceneData.tension}/100</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{t("pacing.actionDensity")}</div>
                      <Progress value={sceneData.action_density} />
                      <div className="text-xs mt-1">{sceneData.action_density}/100</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{t("pacing.dialogueRatio")}</div>
                      <Progress value={sceneData.dialogue_ratio} />
                      <div className="text-xs mt-1">{sceneData.dialogue_ratio}/100</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      {t("pacing.recommendation")}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {sceneData.recommendation}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-3">
            {analysis.recommendations?.map((rec, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
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