import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MessageSquare, Sparkles, Copy, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DialogueEnhancer({ bookData, characters = [], currentLanguage = "english", isRTL = false }) {
  const [inputDialogue, setInputDialogue] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const translations = {
    english: {
      "dialogue.title": "AI Dialogue Enhancer",
      "dialogue.input": "Enter dialogue to enhance",
      "dialogue.placeholder": "Character 1: Hello!\nCharacter 2: Hi there!",
      "dialogue.enhance": "Enhance Dialogue",
      "dialogue.enhancing": "Enhancing...",
      "dialogue.original": "Original",
      "dialogue.enhanced": "Enhanced",
      "dialogue.copy": "Copy Enhanced",
      "dialogue.copied": "Copied!",
      "dialogue.naturalness": "Naturalness",
      "dialogue.ageAppropriate": "Age Appropriate",
      "dialogue.characterVoice": "Character Voice",
      "dialogue.improvements": "Key Improvements",
      "dialogue.explanation": "Explanation"
    },
    hebrew: {
      "dialogue.title": "משפר דיאלוגים AI",
      "dialogue.input": "הזן דיאלוג לשיפור",
      "dialogue.placeholder": "דמות 1: שלום!\nדמות 2: היי!",
      "dialogue.enhance": "שפר דיאלוג",
      "dialogue.enhancing": "משפר...",
      "dialogue.original": "מקורי",
      "dialogue.enhanced": "משופר",
      "dialogue.copy": "העתק משופר",
      "dialogue.copied": "הועתק!",
      "dialogue.naturalness": "טבעיות",
      "dialogue.ageAppropriate": "התאמה לגיל",
      "dialogue.characterVoice": "קול דמות",
      "dialogue.improvements": "שיפורים מרכזיים",
      "dialogue.explanation": "הסבר"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key] || key;

  const enhanceDialogue = async () => {
    if (!inputDialogue.trim()) return;

    setEnhancing(true);
    try {
      const language = bookData.language || currentLanguage;
      const isHebrew = language === "hebrew";

      const characterInfo = characters.map(c => `${c.name} (${c.age} years old, ${c.gender})`).join(', ');

      const prompt = isHebrew ?
        `שפר את הדיאלוג הבא לספר ילדים בעברית.

**פרטי הסיפור:**
גיל יעד: ${bookData.child_age || 5}
טון: ${bookData.tone}
דמויות: ${characterInfo}

**דיאלוג מקורי:**
${inputDialogue}

שפר את הדיאלוג כך שיהיה:
1. טבעי יותר לגיל היעד
2. מתאים לאישיות כל דמות
3. מעניין ומושך
4. עם סגנון דיבור ייחודי לכל דמות

החזר:
- דיאלוג משופר
- ציון טבעיות (0-100)
- ציון התאמה לגיל (0-100)
- ציון קול דמות (0-100)
- רשימת שיפורים מרכזיים (3-5)
- הסבר קצר על מה שונה` :
        `Enhance this dialogue for a children's book in English.

**Story Details:**
Target age: ${bookData.child_age || 5}
Tone: ${bookData.tone}
Characters: ${characterInfo}

**Original Dialogue:**
${inputDialogue}

Enhance the dialogue to be:
1. More natural for target age
2. Fitting each character's personality
3. Engaging and interesting
4. With unique voice for each character

Return:
- Enhanced dialogue
- Naturalness score (0-100)
- Age appropriateness score (0-100)
- Character voice score (0-100)
- List of key improvements (3-5)
- Brief explanation of changes`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            enhanced_dialogue: { type: "string" },
            naturalness_score: { type: "number" },
            age_appropriate_score: { type: "number" },
            character_voice_score: { type: "number" },
            improvements: {
              type: "array",
              items: { type: "string" }
            },
            explanation: { type: "string" }
          }
        }
      });

      setResult(result);
    } catch (error) {
      // silently handled
    } finally {
      setEnhancing(false);
    }
  };

  const copyEnhanced = () => {
    if (result?.enhanced_dialogue) {
      navigator.clipboard.writeText(result.enhanced_dialogue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (score >= 60) return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
    return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
  };

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MessageSquare className="h-5 w-5 text-purple-500" />
            {t("dialogue.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={inputDialogue}
              onChange={(e) => setInputDialogue(e.target.value)}
              placeholder={t("dialogue.placeholder")}
              className="min-h-[120px]"
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          <Button
            onClick={enhanceDialogue}
            disabled={enhancing || !inputDialogue.trim()}
            className="w-full"
          >
            {enhancing ? (
              <>
                <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t("dialogue.enhancing")}
              </>
            ) : (
              <>
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t("dialogue.enhance")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-gray-500 mb-1">{t("dialogue.naturalness")}</div>
                <Badge className={getScoreColor(result.naturalness_score)}>
                  {result.naturalness_score}/100
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-gray-500 mb-1">{t("dialogue.ageAppropriate")}</div>
                <Badge className={getScoreColor(result.age_appropriate_score)}>
                  {result.age_appropriate_score}/100
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-gray-500 mb-1">{t("dialogue.characterVoice")}</div>
                <Badge className={getScoreColor(result.character_voice_score)}>
                  {result.character_voice_score}/100
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardHeader>
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CardTitle className="text-base">{t("dialogue.enhanced")}</CardTitle>
                <Button variant="outline" size="sm" onClick={copyEnhanced}>
                  {copied ? (
                    <>
                      <Check className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t("dialogue.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t("dialogue.copy")}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
                {result.enhanced_dialogue}
              </div>
            </CardContent>
          </Card>

          {result.improvements && result.improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t("dialogue.improvements")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.improvements.map((improvement, i) => (
                    <li key={i} className={`flex gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.explanation && (
            <Alert>
              <AlertDescription>{result.explanation}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}