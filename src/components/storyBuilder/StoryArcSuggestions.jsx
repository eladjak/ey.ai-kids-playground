import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Wand2, RefreshCw } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';
import { buildSafetyPromptPrefix } from '@/utils/content-moderation';

export default function StoryArcSuggestions({ 
  bookData, 
  scenes = [], 
  onApplySuggestion,
  currentLanguage = 'english',
  isRTL = false 
}) {
  const [suggestions, setSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [issues, setIssues] = useState([]);
  const [arcAnalysis, setArcAnalysis] = useState(null);

  const translations = {
    english: {
      'arc.title': 'Story Arc Analysis',
      'arc.subtitle': 'AI-powered insights to strengthen your narrative',
      'arc.analyze': 'Analyze Story Arc',
      'arc.reanalyze': 'Re-analyze',
      'arc.analyzing': 'Analyzing your story...',
      'arc.issues': 'Potential Issues',
      'arc.suggestions': 'Suggestions',
      'arc.arc': 'Story Arc',
      'arc.apply': 'Apply',
      'arc.noData': 'Add scenes to get AI suggestions',
      'arc.pacing': 'Pacing',
      'arc.tension': 'Tension Build',
      'arc.resolution': 'Resolution',
      'arc.character': 'Character Development',
      'issue.plotHole': 'Plot Hole',
      'issue.pacing': 'Pacing Issue',
      'issue.character': 'Character Issue',
      'issue.consistency': 'Consistency Issue'
    },
    hebrew: {
      'arc.title': 'ניתוח קשת סיפור',
      'arc.subtitle': 'תובנות מבוססות AI לחיזוק הנרטיב שלך',
      'arc.analyze': 'נתח קשת סיפור',
      'arc.reanalyze': 'נתח מחדש',
      'arc.analyzing': 'מנתח את הסיפור שלך...',
      'arc.issues': 'בעיות אפשריות',
      'arc.suggestions': 'הצעות',
      'arc.arc': 'קשת הסיפור',
      'arc.apply': 'החל',
      'arc.noData': 'הוסף סצנות כדי לקבל הצעות AI',
      'arc.pacing': 'קצב',
      'arc.tension': 'בניית מתח',
      'arc.resolution': 'פתרון',
      'arc.character': 'פיתוח דמויות',
      'issue.plotHole': 'חור בעלילה',
      'issue.pacing': 'בעיית קצב',
      'issue.character': 'בעיית דמות',
      'issue.consistency': 'בעיית עקביות'
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key] || key;

  const analyzeStoryArc = async () => {
    if (!scenes || scenes.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const language = bookData.language || currentLanguage;
      const isHebrew = language === 'hebrew';
      
      const sceneSummaries = scenes.map((scene, idx) => 
        `Scene ${idx + 1}: ${scene.title} - ${scene.description}`
      ).join('\n');
      
      const charactersInfo = bookData.selectedCharacters?.map(c => 
        `${c.name} (${c.age}, ${c.gender})`
      ).join(', ') || 'main character';

      const safetyPrefix = buildSafetyPromptPrefix(bookData.age_range || '5-10');
      const prompt = safetyPrefix + (isHebrew ?
        `אתה Story Doctor מומחה לספרי ילדים. נתח את המבנה הבא של הסיפור וספק תובנות מקצועיות:

**פרטי הסיפור:**
- כותרת: ${bookData.title || 'ללא כותרת'}
- דמויות: ${charactersInfo}
- ז'אנר: ${bookData.genre || 'כללי'}
- גיל יעד: ${bookData.age_range || 'לא צוין'}
- מוסר השכל: ${bookData.moral || 'לא צוין'}

**סצנות הסיפור:**
${sceneSummaries}

**נתח ודווח על:**
1. **בעיות אפשריות:** חורים בעלילה, בעיות קצב, חוסר עקביות
2. **קשת הסיפור:** האם יש התחלה-אמצע-סוף ברורים?
3. **פיתוח דמויות:** האם הדמויות מתפתחות?
4. **הצעות לשיפור:** 3-5 הצעות קונקרטיות

החזר JSON בלבד בפורמט הבא:
{
  "issues": [
    {"type": "plotHole/pacing/character/consistency", "severity": "low/medium/high", "description": "תיאור הבעיה", "scene": מספר_סצנה}
  ],
  "arc": {
    "structure": "תיאור המבנה הכללי",
    "pacing": {"score": 0-10, "feedback": "משוב"},
    "tension": {"score": 0-10, "feedback": "משוב"},
    "resolution": {"score": 0-10, "feedback": "משוב"},
    "characterDevelopment": {"score": 0-10, "feedback": "משוב"}
  },
  "suggestions": [
    {"title": "כותרת ההצעה", "description": "תיאור מפורט", "priority": "low/medium/high", "scene": מספר_סצנה_או_null}
  ]
}` :
        `You are an expert Story Doctor for children's books. Analyze the following story structure and provide professional insights:

**Story Details:**
- Title: ${bookData.title || 'Untitled'}
- Characters: ${charactersInfo}
- Genre: ${bookData.genre || 'general'}
- Target Age: ${bookData.age_range || 'not specified'}
- Moral: ${bookData.moral || 'not specified'}

**Story Scenes:**
${sceneSummaries}

**Analyze and report on:**
1. **Potential Issues:** plot holes, pacing problems, inconsistencies
2. **Story Arc:** Is there a clear beginning-middle-end?
3. **Character Development:** Do characters grow and change?
4. **Improvement Suggestions:** 3-5 concrete suggestions

Return ONLY JSON in this format:
{
  "issues": [
    {"type": "plotHole/pacing/character/consistency", "severity": "low/medium/high", "description": "issue description", "scene": scene_number}
  ],
  "arc": {
    "structure": "overall structure description",
    "pacing": {"score": 0-10, "feedback": "feedback"},
    "tension": {"score": 0-10, "feedback": "feedback"},
    "resolution": {"score": 0-10, "feedback": "feedback"},
    "characterDevelopment": {"score": 0-10, "feedback": "feedback"}
  },
  "suggestions": [
    {"title": "suggestion title", "description": "detailed description", "priority": "low/medium/high", "scene": scene_number_or_null}
  ]
}`);

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  severity: { type: 'string' },
                  description: { type: 'string' },
                  scene: { type: 'number' }
                }
              }
            },
            arc: {
              type: 'object',
              properties: {
                structure: { type: 'string' },
                pacing: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    feedback: { type: 'string' }
                  }
                },
                tension: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    feedback: { type: 'string' }
                  }
                },
                resolution: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    feedback: { type: 'string' }
                  }
                },
                characterDevelopment: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    feedback: { type: 'string' }
                  }
                }
              }
            },
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string' },
                  scene: { type: 'number' }
                }
              }
            }
          }
        }
      });

      if (result && typeof result === 'object') {
        setIssues(result.issues || []);
        setArcAnalysis(result.arc || null);
        setSuggestions(result.suggestions || []);
      }
    } catch (error) {
      // silently handled
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when scenes change significantly
  useEffect(() => {
    if (scenes && scenes.length > 2 && !suggestions && !isAnalyzing) {
      analyzeStoryArc();
    }
  }, [scenes?.length]);

  const getIssueIcon = (type) => {
    switch(type) {
      case 'plotHole': return <AlertCircle className="h-4 w-4" />;
      case 'pacing': return <TrendingUp className="h-4 w-4" />;
      case 'character': return <Lightbulb className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'medium': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!scenes || scenes.length === 0) {
    return (
      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          {t('arc.noData')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
        <CardHeader>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                {t('arc.title')}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('arc.subtitle')}
              </CardDescription>
            </div>
            <Button
              onClick={analyzeStoryArc}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('arc.analyzing')}
                </>
              ) : (
                <>
                  <Wand2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {suggestions ? t('arc.reanalyze') : t('arc.analyze')}
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {(issues.length > 0 || suggestions || arcAnalysis) && (
          <CardContent className="space-y-6">
            {/* Issues */}
            {issues.length > 0 && (
              <div className="space-y-3">
                <h4 className={`font-semibold text-sm flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  {t('arc.issues')} ({issues.length})
                </h4>
                <div className="space-y-2">
                  {issues.map((issue, idx) => (
                    <Alert key={idx} className={`${getSeverityColor(issue.severity)} border-0`}>
                      <div className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {getIssueIcon(issue.type)}
                        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Badge variant="secondary" className="text-xs">
                              {t(`issue.${issue.type}`)}
                            </Badge>
                            {issue.scene && (
                              <span className="text-xs opacity-70">
                                {t('scene.title')} {issue.scene}
                              </span>
                            )}
                          </div>
                          <AlertDescription className="text-sm">
                            {issue.description}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Arc Analysis */}
            {arcAnalysis && (
              <div className="space-y-3">
                <h4 className={`font-semibold text-sm flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  {t('arc.arc')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'pacing', label: t('arc.pacing') },
                    { key: 'tension', label: t('arc.tension') },
                    { key: 'resolution', label: t('arc.resolution') },
                    { key: 'characterDevelopment', label: t('arc.character') }
                  ].map(({ key, label }) => (
                    arcAnalysis[key] && (
                      <Card key={key} className="p-3 bg-white dark:bg-gray-800">
                        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-medium">{label}</span>
                          <span className={`text-lg font-bold ${getScoreColor(arcAnalysis[key].score)}`}>
                            {arcAnalysis[key].score}/10
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {arcAnalysis[key].feedback}
                        </p>
                      </Card>
                    )
                  ))}
                </div>
                {arcAnalysis.structure && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-white dark:bg-gray-800 rounded-lg">
                    {arcAnalysis.structure}
                  </p>
                )}
              </div>
            )}

            {/* Suggestions */}
            {suggestions && suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className={`font-semibold text-sm flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  {t('arc.suggestions')} ({suggestions.length})
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <Card key={idx} className="p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                      <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-1 space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <h5 className="font-semibold text-sm">{suggestion.title}</h5>
                            <Badge className={`${getPriorityColor(suggestion.priority)} text-xs`}>
                              {suggestion.priority}
                            </Badge>
                            {suggestion.scene && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {t('scene.title')} {suggestion.scene}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {suggestion.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApplySuggestion && onApplySuggestion(suggestion)}
                          className="shrink-0"
                        >
                          <CheckCircle className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {t('arc.apply')}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}