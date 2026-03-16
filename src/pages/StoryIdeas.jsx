
import React, { useState, useEffect } from "react";
import { useI18n } from "@/components/i18n/i18nProvider";
import { StoryIdea } from "@/entities/StoryIdea";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  InvokeLLM
} from "@/integrations/Core";
import { moderateInput, buildSafetyPromptPrefix } from "@/utils/content-moderation";
import { 
  Lightbulb, 
  Sparkles, 
  BookOpen, 
  Save,
  RefreshCw,
  Heart,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import components
import IdeaGenerator from "../components/storyIdeas/IdeaGenerator";
import SavedIdeas from "../components/storyIdeas/SavedIdeas";
import DailyPrompt from "../components/storyIdeas/DailyPrompt";

export default function StoryIdeas() {
  const { toast } = useToast();
  const { t, language, isRTL } = useI18n();
  const { user: hookUser } = useCurrentUser();
  // currentLanguage: the AI generation language (from user profile, may differ from UI language)
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");

  // New state for idea generation within this page
  const [ideaParams, setIdeaParams] = useState({
    childNames: [],
    childAge: "5-7",
    genres: [],
    themes: [],
    characters: [],
    setting: [],
    additionalDetails: ""
  });
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        // currentLanguage is the AI generation language from user profile
        const storedLanguage = hookUser?.language || localStorage.getItem("language") || "english";
        setCurrentLanguage(storedLanguage);

        // Load saved ideas
        const ideas = await StoryIdea.list("-created_date", 20);
        setSavedIdeas(ideas);

      } catch (error) {
        // silently handled
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookUser]);

  const handleIdeaSaved = async () => {
    // Reload saved ideas
    try {
      const ideas = await StoryIdea.list("-created_date", 20);
      setSavedIdeas(ideas);
    } catch (error) {
      // silently handled
    }
  };
  
  const constructPromptForIdea = (params, targetLanguage) => {
    // Moderate free-text user input
    const moderatedDetails = params.additionalDetails
      ? moderateInput(params.additionalDetails, 'additionalDetails')
      : null;

    if (moderatedDetails && moderatedDetails.blocked) {
      toast({ variant: "destructive", description: t("storyIdeas.inappropriateInput") });
      return null;
    }

    const languageInstruction = targetLanguage === "hebrew" ?
      "יש ליצור את כל התוכן בעברית בלבד. " :
      targetLanguage === "yiddish" ?
      "Create all content in Yiddish only. " :
      "Create all content in English only. ";

    const safetyPrefix = buildSafetyPromptPrefix(params.childAge || '5-10');

    let prompt = `${safetyPrefix}${languageInstruction}Create a detailed children's story idea with the following parameters:\n\n`;

    if (params.childNames && params.childNames.length > 0) {
      prompt += `Main characters: ${params.childNames.join(', ')}\n`;
    }

    if (params.childAge) {
      prompt += `Target age: ${params.childAge} years old\n`;
    }

    if (params.genres && params.genres.length > 0) {
      prompt += `Genre: ${params.genres.join(', ')}\n`;
    }

    if (params.themes && params.themes.length > 0) {
      prompt += `Themes: ${params.themes.join(', ')}\n`;
    }

    if (params.characters && params.characters.length > 0) {
      prompt += `Additional characters: ${params.characters.join(', ')}\n`;
    }

    if (params.setting && params.setting.length > 0) {
      prompt += `Setting: ${params.setting.join(', ')}\n`;
    }

    if (moderatedDetails?.sanitized) {
      prompt += `Additional details: ${moderatedDetails.sanitized}\n`;
    }

    prompt += `\nPlease provide:\n1. A catchy, age-appropriate title\n2. A brief but engaging description (2-3 sentences)\n3. 3-5 key plot points that create a complete story arc\n4. Character development opportunities\n5. A clear moral lesson or educational value\n\nMake sure everything is appropriate for children and engaging for the target age group.`;

    return prompt;
  };
  
  const generateIdea = async () => {
    try {
      setIsGenerating(true);
      setGeneratedIdea(null); // Clear previous idea
      const targetLanguage = currentLanguage;
      const prompt = constructPromptForIdea(ideaParams, targetLanguage);

      // Content moderation blocked the input
      if (!prompt) {
        setIsGenerating(false);
        return;
      }

      const result = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            plot_points: { type: "array", items: { type: "string" } },
            character_development: { type: "string" },
            moral_lesson: { type: "string" }
          },
          required: ["title", "description", "plot_points", "moral_lesson"]
        }
      });

      if (result) {
        setGeneratedIdea({
            ...result,
            language: targetLanguage,
            parameters: JSON.stringify(ideaParams)
        });
      }
    } catch (error) {
      toast({ variant: "destructive", description: t("storyIdeas.generateError") });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const saveGeneratedIdea = async () => {
      if (!generatedIdea) return;
      try {
          await StoryIdea.create(generatedIdea);
          toast({ description: t("storyIdeas.saveSuccess") });
          handleIdeaSaved(); // Reload saved ideas
          setGeneratedIdea(null); // Clear generated idea after saving
      } catch (error) {
          toast({ variant: "destructive", description: t("storyIdeas.saveFailed") });
      }
  };


  return (
    <div className="max-w-6xl mx-auto py-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header banner with image */}
      <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 p-6 md:p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('/images/story-ideas.jpg')] bg-cover bg-center opacity-15" />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">
            {t("storyIdeas.title")}
          </h1>
          <p className="text-purple-100">
            {t("storyIdeas.subtitle")}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t("storyIdeas.generate")}
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("storyIdeas.saved")}
            {savedIdeas.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {savedIdeas.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {t("storyIdeas.daily")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="space-y-6">
            <IdeaGenerator 
              ideaParams={ideaParams}
              onInputChange={(field, value) => setIdeaParams(prev => ({...prev, [field]: value}))}
              onGenerate={generateIdea}
              currentLanguage={currentLanguage}
              isRTL={isRTL}
              isGenerating={isGenerating} // Pass isGenerating to disable button in child
            />
            {generatedIdea && (
                <Card className="border-purple-200 dark:border-purple-800 shadow-lg bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            {t("storyIdeas.generatedIdeaTitle")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-2"><strong className="text-purple-700 dark:text-purple-300">{t("storyIdeas.titleLabel")}</strong> {generatedIdea.title}</p>
                        <p className="text-gray-600 dark:text-gray-300"><strong className="text-purple-700 dark:text-purple-300">{t("storyIdeas.descriptionLabel")}</strong> {generatedIdea.description}</p>
                        <div className="mt-4 flex gap-2">
                            <Button onClick={saveGeneratedIdea} className="bg-purple-600 hover:bg-purple-700 shadow-sm">
                                <Save className="mr-2 h-4 w-4" /> {t("storyIdeas.saveButton")}
                            </Button>
                            <Button variant="outline" onClick={generateIdea} disabled={isGenerating} className="border-purple-200 dark:border-purple-800">
                                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} /> {t("storyIdeas.regenerateButton")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <SavedIdeas 
            ideas={savedIdeas}
            currentLanguage={currentLanguage}
            isRTL={isRTL}
            onIdeaUpdated={handleIdeaSaved}
          />
        </TabsContent>

        <TabsContent value="daily">
          <DailyPrompt 
            currentLanguage={currentLanguage}
            isRTL={isRTL}
            onIdeaSaved={handleIdeaSaved}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
