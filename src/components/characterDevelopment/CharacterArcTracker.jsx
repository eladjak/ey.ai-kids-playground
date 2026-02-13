import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Heart, 
  Brain, 
  Zap, 
  Target,
  CheckCircle,
  AlertCircle,
  Users,
  LineChart
} from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';

export default function CharacterArcTracker({ 
  character, 
  scenes = [],
  bookData,
  currentLanguage = 'english',
  isRTL = false 
}) {
  const [arcData, setArcData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedScene, setSelectedScene] = useState(null);

  const translations = {
    english: {
      'arc.title': 'Character Arc Analysis',
      'arc.subtitle': 'Track character development through the story',
      'arc.analyze': 'Analyze Arc',
      'arc.analyzing': 'Analyzing character journey...',
      'arc.emotional': 'Emotional Journey',
      'arc.personality': 'Personality Growth',
      'arc.relationships': 'Relationships',
      'arc.milestones': 'Key Milestones',
      'arc.consistency': 'Consistency Score',
      'arc.development': 'Development Level',
      'arc.scenes': 'Scene by Scene',
      'arc.overview': 'Overview',
      'arc.insights': 'AI Insights',
      'scene.emotional': 'Emotional State',
      'scene.growth': 'Growth Point',
      'scene.relationship': 'Relationship Change',
      'level.low': 'Needs Development',
      'level.medium': 'Good Progress',
      'level.high': 'Strong Arc'
    },
    hebrew: {
      'arc.title': 'ניתוח קשת הדמות',
      'arc.subtitle': 'מעקב אחר התפתחות הדמות לאורך הסיפור',
      'arc.analyze': 'נתח קשת',
      'arc.analyzing': 'מנתח את מסע הדמות...',
      'arc.emotional': 'מסע רגשי',
      'arc.personality': 'צמיחה אישיותית',
      'arc.relationships': 'יחסים',
      'arc.milestones': 'נקודות מפתח',
      'arc.consistency': 'ציון עקביות',
      'arc.development': 'רמת התפתחות',
      'arc.scenes': 'סצנה אחר סצנה',
      'arc.overview': 'סקירה',
      'arc.insights': 'תובנות AI',
      'scene.emotional': 'מצב רגשי',
      'scene.growth': 'נקודת צמיחה',
      'scene.relationship': 'שינוי ביחסים',
      'level.low': 'דורש פיתוח',
      'level.medium': 'התקדמות טובה',
      'level.high': 'קשת חזקה'
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key] || key;

  const analyzeCharacterArc = async () => {
    setIsAnalyzing(true);
    try {
      const language = bookData.language || currentLanguage;
      const isHebrew = language === 'hebrew';
      
      const scenesSummary = scenes.map((scene, idx) => 
        `Scene ${idx + 1}: ${scene.title} - ${scene.description}`
      ).join('\n');

      const prompt = isHebrew ?
        `אתה מומחה לפיתוח דמויות בספרות ילדים. נתח את קשת הדמות:

**פרטי הדמות:**
- שם: ${character.name}
- גיל: ${character.age}
- תיאור: ${character.personality || 'לא צוין'}

**סצנות הסיפור:**
${scenesSummary}

**נתח את:**
1. **מסע רגשי:** איך הרגשות משתנים בכל סצנה (0-100 לכל סצנה)
2. **צמיחה אישיותית:** מה הדמות לומדת ואיך היא משתנה
3. **יחסים:** שינויים ביחסים עם דמויות אחרות
4. **נקודות מפתח:** רגעים קריטיים בהתפתחות
5. **עקביות:** האם הדמות מתנהגת באופן עקבי (ציון 0-100)
6. **רמת התפתחות:** low/medium/high

החזר JSON בלבד:
{
  "emotionalJourney": [
    {"scene": 1, "emotion": "שם רגש", "intensity": 0-100, "description": "תיאור"}
  ],
  "personalityGrowth": {
    "start": "איך הדמות מתחילה",
    "end": "איך הדמות מסיימת",
    "changes": ["שינוי 1", "שינוי 2"]
  },
  "relationships": [
    {"character": "שם דמות אחרת", "development": "תיאור התפתחות"}
  ],
  "milestones": [
    {"scene": מספר, "title": "כותרת", "description": "תיאור", "impact": "high/medium/low"}
  ],
  "consistencyScore": 0-100,
  "developmentLevel": "low/medium/high",
  "insights": ["תובנה 1", "תובנה 2", "תובנה 3"]
}` :
        `You are an expert in character development for children's literature. Analyze this character's arc:

**Character Details:**
- Name: ${character.name}
- Age: ${character.age}
- Description: ${character.personality || 'not specified'}

**Story Scenes:**
${scenesSummary}

**Analyze:**
1. **Emotional Journey:** How emotions change in each scene (0-100 per scene)
2. **Personality Growth:** What the character learns and how they change
3. **Relationships:** Changes in relationships with other characters
4. **Key Milestones:** Critical moments in development
5. **Consistency:** Is the character behaving consistently (score 0-100)
6. **Development Level:** low/medium/high

Return ONLY JSON:
{
  "emotionalJourney": [
    {"scene": 1, "emotion": "emotion name", "intensity": 0-100, "description": "description"}
  ],
  "personalityGrowth": {
    "start": "how character begins",
    "end": "how character ends",
    "changes": ["change 1", "change 2"]
  },
  "relationships": [
    {"character": "other character name", "development": "development description"}
  ],
  "milestones": [
    {"scene": number, "title": "title", "description": "description", "impact": "high/medium/low"}
  ],
  "consistencyScore": 0-100,
  "developmentLevel": "low/medium/high",
  "insights": ["insight 1", "insight 2", "insight 3"]
}`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            emotionalJourney: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scene: { type: 'number' },
                  emotion: { type: 'string' },
                  intensity: { type: 'number' },
                  description: { type: 'string' }
                }
              }
            },
            personalityGrowth: {
              type: 'object',
              properties: {
                start: { type: 'string' },
                end: { type: 'string' },
                changes: { type: 'array', items: { type: 'string' } }
              }
            },
            relationships: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  character: { type: 'string' },
                  development: { type: 'string' }
                }
              }
            },
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scene: { type: 'number' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  impact: { type: 'string' }
                }
              }
            },
            consistencyScore: { type: 'number' },
            developmentLevel: { type: 'string' },
            insights: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      if (result) {
        setArcData(result);
      }
    } catch (error) {
      // silently handled
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (scenes.length > 2 && !arcData && !isAnalyzing) {
      analyzeCharacterArc();
    }
  }, [scenes.length]);

  const getEmotionColor = (emotion) => {
    const lowerEmotion = emotion.toLowerCase();
    if (lowerEmotion.includes('happy') || lowerEmotion.includes('joy') || lowerEmotion.includes('שמח')) {
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    } else if (lowerEmotion.includes('sad') || lowerEmotion.includes('עצוב')) {
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    } else if (lowerEmotion.includes('angry') || lowerEmotion.includes('כעס')) {
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    } else if (lowerEmotion.includes('fear') || lowerEmotion.includes('פחד')) {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const getDevelopmentColor = (level) => {
    switch(level) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-red-600 dark:text-red-400';
    }
  };

  if (isAnalyzing) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TrendingUp className="h-5 w-5 animate-bounce" />
            {t('arc.analyzing')}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!arcData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
            {t('arc.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={analyzeCharacterArc} className="w-full">
            <LineChart className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('arc.analyze')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
        <CardHeader>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                {t('arc.title')} - {character.name}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('arc.subtitle')}
              </p>
            </div>
            <Button onClick={analyzeCharacterArc} variant="outline" size="sm">
              {t('arc.analyze')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-medium">{t('arc.consistency')}</span>
                <span className={`text-2xl font-bold ${arcData.consistencyScore >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {arcData.consistencyScore}%
                </span>
              </div>
              <Progress value={arcData.consistencyScore} className="mt-2" />
            </Card>
            <Card className="p-4">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-medium">{t('arc.development')}</span>
                <Badge className={getDevelopmentColor(arcData.developmentLevel)}>
                  {t(`level.${arcData.developmentLevel}`)}
                </Badge>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={`grid w-full grid-cols-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <TabsTrigger value="overview">{t('arc.overview')}</TabsTrigger>
          <TabsTrigger value="scenes">{t('arc.scenes')}</TabsTrigger>
          <TabsTrigger value="insights">{t('arc.insights')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Personality Growth */}
          <Card>
            <CardHeader>
              <CardTitle className={`text-sm flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Brain className="h-4 w-4" />
                {t('arc.personality')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">Start</Badge>
                <p className="text-sm">{arcData.personalityGrowth?.start}</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">End</Badge>
                <p className="text-sm">{arcData.personalityGrowth?.end}</p>
              </div>
              {arcData.personalityGrowth?.changes?.length > 0 && (
                <div>
                  <Badge variant="outline" className="mb-2">Changes</Badge>
                  <ul className="space-y-1">
                    {arcData.personalityGrowth.changes.map((change, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Relationships */}
          {arcData.relationships?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className={`text-sm flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Users className="h-4 w-4" />
                  {t('arc.relationships')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {arcData.relationships.map((rel, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium text-sm mb-1">{rel.character}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{rel.development}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          {arcData.milestones?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className={`text-sm flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Target className="h-4 w-4" />
                  {t('arc.milestones')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {arcData.milestones.map((milestone, idx) => (
                  <div key={idx} className="p-3 border-l-4 border-indigo-500 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className={`flex items-center justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <p className="font-medium text-sm">{milestone.title}</p>
                      <Badge className={getImpactColor(milestone.impact)} variant="secondary">
                        {milestone.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{milestone.description}</p>
                    <Badge variant="outline" className="text-xs">Scene {milestone.scene}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scenes" className="space-y-3 mt-4">
          {arcData.emotionalJourney?.map((journey, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedScene(idx)}>
              <CardContent className="p-4">
                <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Badge variant="outline">Scene {journey.scene}</Badge>
                      <Badge className={getEmotionColor(journey.emotion)}>
                        {journey.emotion}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{journey.description}</p>
                  </div>
                  <div className="text-right">
                    <Heart className={`h-5 w-5 ${journey.intensity > 70 ? 'text-red-500' : journey.intensity > 40 ? 'text-yellow-500' : 'text-blue-500'}`} />
                    <span className="text-xs text-gray-500">{journey.intensity}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="insights" className="space-y-3 mt-4">
          {arcData.insights?.map((insight, idx) => (
            <Card key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
              <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <p className="text-sm">{insight}</p>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}