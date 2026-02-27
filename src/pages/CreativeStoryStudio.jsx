
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Book } from "@/entities/Book";
import { StoryIdea } from "@/entities/StoryIdea";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Play,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import IdeaGenerator from "../components/storyIdeas/IdeaGenerator";
import SavedIdeas from "../components/storyIdeas/SavedIdeas";
import BookPreview from "../components/createBook/BookPreview";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import IdeaResult from "../components/storyIdeas/IdeaResult";
import { moderateInput, buildSafetyPromptPrefix } from "@/utils/content-moderation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import IdeaEditor from "../components/storyIdeas/IdeaEditor";
import StoryRefinementStep from "../components/createBook/StoryRefinementStep";
import ArtStyleSection from "../components/createBook/ArtStyleSection";

export default function CreativeStoryStudio() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State Management
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [startingPoint, setStartingPoint] = useState(null); // 'new-idea', 'existing-idea', 'direct-create'
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);

  // Book Data State
  const [bookData, setBookData] = useState({
    title: "",
    description: "",
    plot_points: [],
    character_development: "",
    child_name: "",
    child_age: 5,
    child_gender: "neutral",
    genre: "adventure",
    age_range: "5-7",
    tone: "exciting",
    moral: "",
    length: "medium",
    art_style: "disney",
    language: "english",
    interests: "",
    family_members: "",
    status: "draft",
    cover_image: "",
    childNames: [],
    selectedCharacters: []
  });

  // Idea Generation State
  const [ideaParams, setIdeaParams] = useState({
    childNames: [],
    childAge: "5-7",
    genres: [],
    themes: [],
    characters: [],
    setting: [],
    additionalDetails: ""
  });

  const [aiSettings, setAISettings] = useState({
    imageModel: null,
    textModel: null,
    voiceModel: null
  });

  // Load user preferences and saved data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const user = await User.me();
        const storedLanguage = user.language || localStorage.getItem("appLanguage") || "english";
        setCurrentLanguage(storedLanguage);

        setBookData(prev => ({
          ...prev,
          language: storedLanguage
        }));

        await loadSavedIdeas();
      } catch (error) {
        // silently handled
      }
    };

    loadInitialData();
  }, []);

  const loadSavedIdeas = async () => {
    try {
      const ideas = await StoryIdea.list("-created_date", 20);
      setSavedIdeas(ideas);
    } catch(e) {
      // silently handled
    }
  };

  // Translation system - simplified for 3 steps
  const translations = {
    english: {
      "studio.title": "Creative Story Studio",
      "studio.subtitle": "Create amazing personalized children's books",
      "studio.step.idea": "Get Started",
      "studio.step.refine": "Refine & Style",
      "studio.step.create": "Preview & Create",
      "studio.start.title": "How would you like to start?",
      "studio.start.subtitle": "Choose the path that best suits you for creating the book",
      "studio.start.new": "Generate New Ideas",
      "studio.start.new.desc": "Let AI help you brainstorm creative story concepts",
      "studio.start.existing": "Use Saved Idea",
      "studio.start.existing.desc": "Pick from your previously generated story ideas",
      "studio.start.direct": "I Know What I Want",
      "studio.start.direct.desc": "Jump straight to story refinement",
      "studio.back": "Back",
      "studio.next": "Next Step",
      "studio.create": "Create My Book",
      "studio.idea.generated.title": "Idea generated!",
      "studio.idea.generated.desc": "Review and proceed to the next step.",
      "studio.idea.error.title": "Error",
      "studio.idea.error.desc": "Failed to generate idea.",
      "studio.idea.save.success": "Idea saved successfully!",
      "studio.idea.save.error": "Failed to save idea.",
      "studio.idea.saved.title": "Idea Saved!",
      "studio.idea.saved.desc": "Your story idea has been successfully saved.",
      "studio.idea.saveError.title": "Save Error",
      "studio.idea.saveError.desc": "Failed to save the story idea.",
      "studio.book.create.success": "Book created successfully!",
      "studio.book.create.error": "Failed to create book."
    },
    hebrew: {
      "studio.title": "סטודיו יצירת סיפורים",
      "studio.subtitle": "צור ספרי ילדים מותאמים אישית מדהימים",
      "studio.step.idea": "בואו נתחיל",
      "studio.step.refine": "עידון וסגנון",
      "studio.step.create": "תצוגה מקדימה ויצירה",
      "studio.start.title": "איך תרצה להתחיל?",
      "studio.start.subtitle": "בחר את הדרך שהכי מתאימה לך ליצירת הספר",
      "studio.start.new": "צור רעיונות חדשים",
      "studio.start.new.desc": "תן ל-AI לעזור לך לחשוב על רעיונות יצירתיים",
      "studio.start.existing": "השתמש ברעיון קיים",
      "studio.start.existing.desc": "בחר מהרעיונות שכבר יצרת בעבר",
      "studio.start.direct": "אני יודע מה אני רוצה",
      "studio.start.direct.desc": "עבור ישירות לעידון הסיפור",
      "studio.back": "חזור",
      "studio.next": "השלב הבא",
      "studio.create": "צור את הספר שלי",
      "studio.idea.generated.title": "רעיון נוצר!",
      "studio.idea.generated.desc": "סקור והמשך לשלב הבא.",
      "studio.idea.error.title": "שגיאה",
      "studio.idea.error.desc": "הייתה שגיאה ביצירת הרעיון.",
      "studio.idea.save.success": "הרעיון נשמר בהצלחה!",
      "studio.idea.save.error": "שגיאה בשמירת הרעיון.",
      "studio.idea.saved.title": "רעיון נשמר!",
      "studio.idea.saved.desc": "רעיון הסיפור שלך נשמר בהצלחה.",
      "studio.idea.saveError.title": "שגיאת שמירה",
      "studio.idea.saveError.desc": "הייתה שגיאה בשמירת רעיון הסיפור.",
      "studio.book.create.success": "הספר נוצר בהצלחה!",
      "studio.book.create.error": "הייתה שגיאה ביצירת הספר."
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";

  // Step configuration - SIMPLIFIED: 3 steps instead of 5
  const steps = [
    { id: 'idea', title: t("studio.step.idea"), component: 'IdeaStep' },
    { id: 'refine', title: t("studio.step.refine"), component: 'RefineStyleStep' },
    { id: 'create', title: t("studio.step.create"), component: 'CreateBook' }
  ];

  const currentStepData = steps[currentStep];

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  // Helper function to construct prompt with content moderation
  function constructPromptForIdea(params, targetLanguage) {
    const moderatedDetails = params.additionalDetails
      ? moderateInput(params.additionalDetails, 'additionalDetails')
      : null;

    if (moderatedDetails && moderatedDetails.blocked) {
      toast({ variant: "destructive", title: t("studio.idea.error.title"), description: "Some input contains inappropriate content. Please revise." });
      return null;
    }

    const isHebrew = targetLanguage === "hebrew";
    const languageInstruction = isHebrew ? "יש ליצור את כל התוכן בעברית בלבד. " : "Create all content in English only. ";
    const safetyPrefix = buildSafetyPromptPrefix(params.childAge || '5-10');

    let prompt = `${safetyPrefix}${languageInstruction}Create a story idea for a child named ${params.childNames?.[0] || 'a child'}. `;
    if (params.genres?.length > 0) prompt += `The genre should be ${params.genres.join(', ')}. `;
    if (params.themes?.length > 0) prompt += `It should explore themes of ${params.themes.join(', ')}. `;
    if (params.characters?.length > 0) prompt += `Key characters include ${params.characters.join(', ')}. `;
    if (params.setting?.length > 0) prompt += `The setting is ${params.setting.join(', ')}. `;
    if (moderatedDetails?.sanitized) prompt += `Additional details: ${moderatedDetails.sanitized}. `;

    prompt += `Please provide a title, a short description, 3-5 key plot points, character development ideas, and a moral lesson.`;

    return prompt;
  }

  // Helper function to convert idea to book data
  const convertIdeaToBookData = (idea, generationParams = null) => {
    try {
      const effectiveParams = generationParams || (typeof idea.parameters === 'string' ? JSON.parse(idea.parameters) : idea.parameters) || {};

      let characterNames = [];
      if (effectiveParams?.childNames && effectiveParams.childNames.length > 0) {
        characterNames = [...effectiveParams.childNames];
      }
      if (effectiveParams?.characters && effectiveParams.characters.length > 0) {
        const characterDisplayNames = effectiveParams.characters.map(char =>
          typeof char === 'string' ? char : char.display || char.value
        );
        characterNames = [...characterNames, ...characterDisplayNames];
      }
      characterNames = [...new Set(characterNames)];

      let genres = [];
      if (effectiveParams?.genres && effectiveParams.genres.length > 0) {
        genres = effectiveParams.genres;
      }
      if (effectiveParams?.customGenres && effectiveParams.customGenres.length > 0) {
        const customGenreNames = effectiveParams.customGenres.map(g =>
          typeof g === 'string' ? g : g.display || g.value
        );
        genres = [...genres, ...customGenreNames];
      }

      let interests = "";
      if (effectiveParams?.themes && effectiveParams.themes.length > 0) {
        const themeNames = effectiveParams.themes.map(theme =>
          typeof theme === 'string' ? theme : theme.display || theme.value
        );
        interests = themeNames.join(', ');
      }

      let settingInfo = "";
      if (effectiveParams?.setting && effectiveParams.setting.length > 0) {
        const settingNames = effectiveParams.setting.map(setting =>
          typeof setting === 'string' ? setting : setting.display || setting.value
        );
        settingInfo = settingNames.join(', ');
      }

      const updatedBookData = {
        ...bookData,
        title: idea.title || bookData.title,
        description: idea.description || bookData.description,
        plot_points: idea.plot_points || bookData.plot_points,
        character_development: idea.character_development || bookData.character_development,
        moral: idea.moral_lesson || bookData.moral,
        language: idea.language || bookData.language,
        child_name: characterNames[0] || bookData.child_name,
        childNames: characterNames,
        child_age: effectiveParams?.childAge ? parseInt(String(effectiveParams.childAge).split('-')[0]) : bookData.child_age,
        genre: genres[0] || bookData.genre,
        age_range: effectiveParams?.childAge || bookData.age_range,
        tone: effectiveParams?.tone || bookData.tone,
        interests: interests || effectiveParams?.interests || bookData.interests,
        family_members: settingInfo || effectiveParams?.family_members || bookData.family_members,
        child_gender: effectiveParams?.childGender || bookData.child_gender,
        selectedCharacters: characterNames.map(name => ({
          name: name,
          age: effectiveParams?.childAge ? parseInt(String(effectiveParams.childAge).split('-')[0]) : 5,
          gender: effectiveParams?.childGender || "neutral",
          primary_image_url: null
        }))
      };

      setBookData(updatedBookData);
      setIdeaParams(effectiveParams);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Conversion Error",
        description: "Could not properly load data from the selected idea."
      });
    }
  };

  const generateIdea = async () => {
    try {
      setIsGenerating(true);
      setGeneratedIdea(null);
      const targetLanguage = bookData?.language || currentLanguage;
      const prompt = constructPromptForIdea(ideaParams, targetLanguage);

      if (!prompt) {
        setIsGenerating(false);
        return;
      }

      const result = await InvokeLLM({
        prompt,
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
        const ideaWithMetadata = {
          ...result,
          language: targetLanguage,
          parameters: JSON.stringify(ideaParams)
        };

        setGeneratedIdea(ideaWithMetadata);
        convertIdeaToBookData(ideaWithMetadata, ideaParams);
        toast({ title: t("studio.idea.generated.title"), description: t("studio.idea.generated.desc") });
      }
    } catch (error) {
      toast({ variant: "destructive", title: t("studio.idea.error.title"), description: t("studio.idea.error.desc") });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIdea = async (idea) => {
    try {
      setIsGenerating(true);
      await StoryIdea.create(idea);
      toast({ title: t("studio.idea.saved.title"), description: t("studio.idea.saved.desc") });
      await loadSavedIdeas();
    } catch (error) {
      toast({ variant: "destructive", title: t("studio.idea.saveError.title"), description: t("studio.idea.saveError.desc") });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIdeaAndContinue = async (idea) => {
    await saveIdea(idea);
    nextStep();
  };

  const editIdea = (editedIdea) => {
    setGeneratedIdea(editedIdea);
    convertIdeaToBookData(editedIdea, ideaParams);
    toast({ title: "Idea Updated", description: "Your changes have been saved locally." });
  };

  const deleteIdea = () => {
    setGeneratedIdea(null);
  };

  const handleUseIdea = (idea) => {
    setSelectedIdea(idea);
    convertIdeaToBookData(idea);
    nextStep();
  };

  const handleEditSavedIdea = (idea) => {
    setEditingIdea(idea);
  };

  const handleUpdateSavedIdea = async (updatedIdea) => {
    try {
      setIsGenerating(true);
      await StoryIdea.update(updatedIdea.id, updatedIdea);
      await loadSavedIdeas();
      setEditingIdea(null);
      toast({ title: "Idea Updated", description: "Your changes have been saved." });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Error", description: "Failed to save your changes." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    try {
      setIsGenerating(true);
      await StoryIdea.delete(ideaId);
      await loadSavedIdeas();
      toast({ title: "Idea Deleted", description: "The story idea has been removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Error", description: "Could not delete the idea." });
    } finally {
      setIsGenerating(false);
    }
  };

  const createBook = async () => {
    try {
      setIsGenerating(true);

      let finalBookData = { ...bookData };
      if (!finalBookData.cover_image) {
        const coverPrompt = `Children's book cover for "${finalBookData.title}", featuring a child named ${finalBookData.child_name} in a ${finalBookData.genre} setting. Illustrated in ${finalBookData.art_style} style.`;
        const coverResult = await GenerateImage({
          prompt: coverPrompt,
          model: aiSettings.imageModel
        });
        if (coverResult && coverResult.url) {
          finalBookData = { ...finalBookData, cover_image: coverResult.url };
          setBookData(finalBookData);
        }
      }

      const createdBook = await Book.create(finalBookData);

      toast({
        description: t("studio.book.create.success"),
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100",
      });

      navigate(`${createPageUrl("BookCreation")}?id=${createdBook.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("studio.book.create.error"),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 1: Combined Start + Idea Generation
  const IdeaStep = () => {
    // If no starting point chosen yet, show selection
    if (!startingPoint) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t("studio.start.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("studio.start.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg`}
                onClick={() => setStartingPoint('new-idea')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                    <Wand2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">{t("studio.start.new")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("studio.start.new.desc")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg`}
                onClick={() => setStartingPoint('existing-idea')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">{t("studio.start.existing")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("studio.start.existing.desc")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg`}
                onClick={() => {
                  setStartingPoint('direct-create');
                  nextStep();
                }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">{t("studio.start.direct")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("studio.start.direct.desc")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      );
    }

    // Show idea generation or saved ideas
    if (startingPoint === 'new-idea') {
      return (
        <div className="space-y-6">
          <IdeaGenerator
            ideaParams={ideaParams}
            onInputChange={(field, value) => {
              setIdeaParams(prev => ({ ...prev, [field]: value }));
            }}
            onGenerate={generateIdea}
            isGenerating={isGenerating}
            currentLanguage={currentLanguage}
            isRTL={isRTL}
            existingChildrenNames={bookData.childNames}
          />
          {generatedIdea && (
            <div className="mt-6">
              <IdeaResult
                idea={generatedIdea}
                onContinue={() => {
                  convertIdeaToBookData(generatedIdea, ideaParams);
                  nextStep();
                }}
                onRegenerate={() => {
                  setGeneratedIdea(null);
                  generateIdea();
                }}
                onSave={() => {
                  saveIdea(generatedIdea);
                }}
                onSaveAndContinue={() => {
                  saveIdeaAndContinue(generatedIdea);
                }}
                onEdit={editIdea}
                onDelete={() => {
                  deleteIdea();
                }}
                isRegenerating={isGenerating}
                isSaving={isGenerating}
                currentLanguage={currentLanguage}
              />
            </div>
          )}
        </div>
      );
    }

    if (startingPoint === 'existing-idea') {
      return (
        <div className="space-y-6">
          <SavedIdeas
            ideas={savedIdeas}
            onUseIdea={(idea) => {
              handleUseIdea(idea);
            }}
            onEditIdea={handleEditSavedIdea}
            onDeleteIdea={handleDeleteIdea}
            currentLanguage={currentLanguage}
            isRTL={isRTL}
          />
        </div>
      );
    }

    return null;
  };

  // Step 2: Combined Refine + Style
  const RefineStyleStepComponent = () => (
    <div className="space-y-8">
      <StoryRefinementStep
        bookData={bookData}
        updateBookData={(field, value) => setBookData(prev => ({ ...prev, [field]: value }))}
        currentLanguage={currentLanguage}
        isRTL={isRTL}
      />
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <ArtStyleSection
          bookData={bookData}
          updateBookData={(field, value) => setBookData(prev => ({ ...prev, [field]: value }))}
          currentLanguage={currentLanguage}
          isRTL={isRTL}
        />
      </div>
    </div>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStepData.component) {
      case 'IdeaStep':
        return <IdeaStep />;
      case 'RefineStyleStep':
        return <RefineStyleStepComponent />;
      case 'CreateBook':
        return <BookPreview bookData={bookData} coverImage={bookData.cover_image} isGenerating={isGenerating} />;
      default:
        return <div>Step not implemented</div>;
    }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8"
      dir={isRTL ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Upgrade Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link to={createPageUrl("BookWizard")}>
          <div className={`bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}>
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-purple-800 dark:text-purple-200 text-sm">
                {isRTL ? "שדרגנו! נסה את יצירת הספר החדשה" : "We've upgraded! Try our new Create Book wizard"}
              </p>
              <p className="text-purple-600 dark:text-purple-400 text-xs mt-0.5">
                {isRTL ? "חוויה פשוטה וחכמה יותר ב-4 שלבים" : "A simpler, smarter experience in 4 steps"}
              </p>
            </div>
            {isRTL ? (
              <ArrowLeft className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            ) : (
              <ArrowRight className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            )}
          </div>
        </Link>
      </motion.div>

      {/* Header */}
      <div className={`text-center mb-8 ${isRTL ? 'rtl' : ''}`}>
        <motion.h1
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t("studio.title")}
        </motion.h1>
        <motion.p
          className="text-gray-600 dark:text-gray-300 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t("studio.subtitle")}
        </motion.p>
      </div>

      {/* Progress Bar - 3 steps */}
      <div className={`mb-8 ${isRTL ? 'rtl' : ''}`}>
        <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mb-4`}>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} / {steps.length}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentStepData.title}
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700`}>
          <div
            className={`bg-purple-600 h-2 rounded-full transition-all duration-300 ${isRTL ? 'float-right' : ''}`}
            style={{ width: `${(currentStep + 1) / steps.length * 100}%`, direction: isRTL ? 'rtl' : 'ltr' }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      {/* Edit Idea Modal */}
      <Dialog open={!!editingIdea} onOpenChange={(isOpen) => !isOpen && setEditingIdea(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{isRTL ? "עריכת רעיון הסיפור" : "Edit Story Idea"}</DialogTitle>
          </DialogHeader>
          {editingIdea && (
            <IdeaEditor
              idea={editingIdea}
              onSave={handleUpdateSavedIdea}
              onCancel={() => setEditingIdea(null)}
              isSaving={isGenerating}
              currentLanguage={currentLanguage}
              isRTL={isRTL}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mt-8`}>
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          {isRTL ? (
            <>
              {t("studio.back")}
              <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              {t("studio.back")}
            </>
          )}
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={createBook}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {t("studio.create")}
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            disabled={
              (currentStepData.id === 'idea' && !startingPoint && !generatedIdea && !selectedIdea)
            }
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            {isRTL ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                {t("studio.next")}
              </>
            ) : (
              <>
                {t("studio.next")}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
