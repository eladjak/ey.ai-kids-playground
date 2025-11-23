
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "@/entities/Book";
import { StoryIdea } from "@/entities/StoryIdea";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Settings,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // This import is no longer strictly needed for the progress bar itself, but might be used elsewhere. Keeping it for now.
import { useToast } from "@/components/ui/use-toast";

// Import existing components
import IdeaGenerator from "../components/storyIdeas/IdeaGenerator";
import SavedIdeas from "../components/storyIdeas/SavedIdeas";
import ChildInfoStep from "../components/createBook/ChildInfoStep"; // This component is effectively removed from the flow, but the import remains. Removing it might cause linting issues if not checked globally. Keeping it as it doesn't harm.
import StoryDetailsStep from "../components/createBook/StoryDetailsStep";
import StoryStyleStep from "../components/createBook/StoryStyleStep";
import LanguageStep from "../components/createBook/LanguageStep"; // This component is not used in the provided outline or current file flow, can be removed if not used elsewhere.
import BookPreview from "../components/createBook/BookPreview";
import AIStudio from "../components/ai/AIStudio"; // This component is not used in the provided outline or current file flow, can be removed if not used elsewhere.
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import IdeaResult from "../components/storyIdeas/IdeaResult"; // Import the new component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // New import for modal
import IdeaEditor from "../components/storyIdeas/IdeaEditor"; // NEW IMPORT
import StoryRefinementStep from "../components/createBook/StoryRefinementStep"; // ENSURING THIS IS USED
// Removed: import StoryStructureBuilder from "../components/storyBuilder/StoryStructureBuilder";

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
  const [editingIdea, setEditingIdea] = useState(null); // For the edit modal

  // Book Data State
  const [bookData, setBookData] = useState({
    title: "",
    description: "", // Added for story description
    plot_points: [], // Added for story plot points
    character_development: "", // Added for character development
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
    childNames: [], // Added for array of child names/characters
    selectedCharacters: [] // Added for detailed character objects
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

        // Always load fresh ideas on mount
        await loadSavedIdeas();

      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array ensures it runs only once on mount

  const loadSavedIdeas = async () => {
    try {
      const ideas = await StoryIdea.list("-created_date", 20);
      setSavedIdeas(ideas);
    } catch(e) {
      console.error("failed to load saved ideas", e)
    }
  }

  // Translation system
  const translations = {
    english: {
      "studio.title": "Creative Story Studio",
      "studio.subtitle": "Create amazing personalized children's books",
      "studio.step.start": "Choose Starting Point",
      "studio.step.idea": "Generate Ideas",
      "studio.step.refine": "Refine Story", // REVERTED
      "studio.step.style": "Art Style",
      "studio.step.create": "Create Book",
      "studio.start.title": "How would you like to start?",
      "studio.start.subtitle": "Choose the path that best suits you for creating the book",
      "studio.start.new": "Generate New Ideas",
      "studio.start.new.desc": "Let AI help you brainstorm creative story concepts",
      "studio.start.existing": "Use Saved Idea",
      "studio.start.existing.desc": "Pick from your previously generated story ideas",
      "studio.start.direct": "I Know What I Want",
      "studio.start.direct.desc": "Jump straight to book creation",
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
      "studio.step.start": "בחר נקודת התחלה",
      "studio.step.idea": "יצירת רעיונות",
      "studio.step.refine": "עידון הרעיון", // REVERTED
      "studio.step.style": "סגנון אומנותי",
      "studio.step.create": "יצירת הספר",
      "studio.start.title": "איך תרצה להתחיל?",
      "studio.start.subtitle": "בחר את הדרך שהכי מתאימה לך ליצירת הספר",
      "studio.start.new": "צור רעיונות חדשים",
      "studio.start.new.desc": "תן ל-AI לעזור לך לחשוב על רעיונות יצירתיים",
      "studio.start.existing": "השתמש ברעיון קיים",
      "studio.start.existing.desc": "בחר מהרעיונות שכבר יצרת בעבר",
      "studio.start.direct": "אני יודע מה אני רוצה",
      "studio.start.direct.desc": "עבור ישירות ליצירת הספר",
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

  // Step configuration - REVERTING TO PREVIOUS WORKING VERSION
  const steps = [
    { id: 'start', title: t("studio.step.start"), component: 'StartingPoint' },
    { id: 'idea', title: t("studio.step.idea"), component: 'IdeaGeneration' },
    { id: 'refine', title: t("studio.step.refine"), component: 'StoryRefinement' }, // REVERTED
    { id: 'style', title: t("studio.step.style"), component: 'StoryStyle' },
    { id: 'create', title: t("studio.step.create"), component: 'CreateBook' }
  ];

  // Define currentStepData here to be accessible throughout the component
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

  // Starting Point Selection Component
  const StartingPointStep = () => (
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
            className={`cursor-pointer transition-all duration-200 ${
              startingPoint === 'new-idea' ? 'ring-2 ring-purple-500 shadow-xl' : 'hover:shadow-lg'
            }`}
            onClick={() => {
              setStartingPoint('new-idea');
              setTimeout(() => jumpToStep(1), 300);
            }}
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
            className={`cursor-pointer transition-all duration-200 ${
              startingPoint === 'existing-idea' ? 'ring-2 ring-purple-500 shadow-xl' : 'hover:shadow-lg'
            }`}
            onClick={() => {
              setStartingPoint('existing-idea');
              setTimeout(() => jumpToStep(1), 300);
            }}
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
            className={`cursor-pointer transition-all duration-200 ${
              startingPoint === 'direct-create' ? 'ring-2 ring-purple-500 shadow-xl' : 'hover:shadow-lg'
            }`}
            onClick={() => {
              setStartingPoint('direct-create');
              // The original jumped to 2 (Develop Story/Refine). Now jump to step 2 which is 'StoryRefinement'
              setTimeout(() => jumpToStep(2), 300);
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

  // Helper function to construct prompt
  function constructPromptForIdea(params, targetLanguage) {
    const isHebrew = targetLanguage === "hebrew";
    const languageInstruction = isHebrew ? "יש ליצור את כל התוכן בעברית בלבד. " : "Create all content in English only. ";
    // Simplified prompt construction logic
    let prompt = `${languageInstruction}Create a story idea for a child named ${params.childNames?.[0] || 'a child'}. `;
    if (params.genres?.length > 0) prompt += `The genre should be ${params.genres.join(', ')}. `;
    if (params.themes?.length > 0) prompt += `It should explore themes of ${params.themes.join(', ')}. `;
    if (params.characters?.length > 0) prompt += `Key characters include ${params.characters.join(', ')}. `;
    if (params.setting?.length > 0) prompt += `The setting is ${params.setting.join(', ')}. `;
    if (params.additionalDetails) prompt += `Additional details: ${params.additionalDetails}. `;

    prompt += `Please provide a title, a short description, 3-5 key plot points, character development ideas, and a moral lesson.`;

    return prompt;
  }

  // Helper function to convert idea (from LLM or saved) to book data
  const convertIdeaToBookData = (idea, generationParams = null) => {
    console.log("convertIdeaToBookData called with:", { idea, generationParams }); // Debug log

    try {
      // If it's a saved idea, its parameters are stored within `idea.parameters`
      // If it's a newly generated idea, the `generationParams` (i.e., `ideaParams` state) are passed directly
      const effectiveParams = generationParams || (typeof idea.parameters === 'string' ? JSON.parse(idea.parameters) : idea.parameters) || {};

      console.log("Effective params for conversion:", effectiveParams); // Debug log

      // Extract character names from multiple sources
      let characterNames = [];

      // 1. From direct childNames (if exists)
      if (effectiveParams?.childNames && effectiveParams.childNames.length > 0) {
        characterNames = [...effectiveParams.childNames];
      }

      // 2. From characters array (convert {value, display} to names)
      if (effectiveParams?.characters && effectiveParams.characters.length > 0) {
        const characterDisplayNames = effectiveParams.characters.map(char =>
          typeof char === 'string' ? char : char.display || char.value
        );
        characterNames = [...characterNames, ...characterDisplayNames];
      }

      // Remove duplicates
      characterNames = [...new Set(characterNames)];

      console.log("Extracted character names:", characterNames); // Debug log

      // Extract genre information
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

      // Extract other theme information for interests
      let interests = "";
      if (effectiveParams?.themes && effectiveParams.themes.length > 0) {
        const themeNames = effectiveParams.themes.map(theme =>
          typeof theme === 'string' ? theme : theme.display || theme.value
        );
        interests = themeNames.join(', ');
      }

      // Extract setting information for family_members or additional context
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
        description: idea.description || bookData.description, // Added description
        plot_points: idea.plot_points || bookData.plot_points, // Added plot points
        character_development: idea.character_development || bookData.character_development, // Added char dev
        moral: idea.moral_lesson || bookData.moral,
        language: idea.language || bookData.language,
        child_name: characterNames[0] || bookData.child_name, // First character as primary
        childNames: characterNames, // All characters
        child_age: effectiveParams?.childAge ? parseInt(String(effectiveParams.childAge).split('-')[0]) : bookData.child_age,
        genre: genres[0] || bookData.genre, // First genre as primary
        age_range: effectiveParams?.childAge || bookData.age_range,
        tone: effectiveParams?.tone || bookData.tone,
        interests: interests || effectiveParams?.interests || bookData.interests,
        family_members: settingInfo || effectiveParams?.family_members || bookData.family_members,
        child_gender: effectiveParams?.childGender || bookData.child_gender,
        // Create selectedCharacters array for consistency
        selectedCharacters: characterNames.map(name => ({
          name: name,
          age: effectiveParams?.childAge ? parseInt(String(effectiveParams.childAge).split('-')[0]) : 5,
          gender: effectiveParams?.childGender || "neutral",
          primary_image_url: null
        }))
      };

      console.log("Updated book data:", updatedBookData); // Debug log
      setBookData(updatedBookData);
      setIdeaParams(effectiveParams);

    } catch (error) {
      console.error("Error converting idea to book data:", error);
      toast({
        variant: "destructive",
        title: "Conversion Error",
        description: "Could not properly load data from the selected idea."
      });
    }
  };

  // This is a combination of logic from old CreateBook and StoryIdeas pages
  const generateIdea = async () => {
    console.log("generateIdea called in CreativeStoryStudio with ideaParams:", ideaParams); // Debug log

    try {
      setIsGenerating(true);
      setGeneratedIdea(null); // Clear previous idea when generating a new one
      const targetLanguage = bookData?.language || currentLanguage;
      const prompt = constructPromptForIdea(ideaParams, targetLanguage);

      console.log("Prompt being sent to LLM:", prompt); // Debug log

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

      console.log("Result from InvokeLLM:", result); // Debug log

      if (result) {
        const ideaWithMetadata = {
          ...result,
          language: targetLanguage,
          parameters: JSON.stringify(ideaParams)
        };

        console.log("Setting generatedIdea to:", ideaWithMetadata); // Debug log
        setGeneratedIdea(ideaWithMetadata);
        convertIdeaToBookData(ideaWithMetadata, ideaParams);
        toast({ title: t("studio.idea.generated.title"), description: t("studio.idea.generated.desc") });
      }
    } catch (error) {
      console.error("Error generating story idea:", error);
      toast({ variant: "destructive", title: t("studio.idea.error.title"), description: t("studio.idea.error.desc") });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIdea = async (idea) => {
    console.log("saveIdea called with:", idea); // Debug log
    try {
      setIsGenerating(true);
      await StoryIdea.create(idea);
      toast({ title: t("studio.idea.saved.title"), description: t("studio.idea.saved.desc") });
      // Optionally refresh saved ideas after saving
      await loadSavedIdeas();
    } catch (error) {
      console.error("Error saving idea:", error);
      toast({ variant: "destructive", title: t("studio.idea.saveError.title"), description: t("studio.idea.saveError.desc") });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIdeaAndContinue = async (idea) => {
    console.log("saveIdeaAndContinue called with:", idea); // Debug log
    await saveIdea(idea);
    nextStep();
  };

  const editIdea = (editedIdea) => {
    console.log("editIdea called in parent with:", editedIdea); // Debug log
    setGeneratedIdea(editedIdea); // This is the fix for saving edits
    convertIdeaToBookData(editedIdea, ideaParams);
    toast({ title: "Idea Updated", description: "Your changes have been saved locally." });
  };

  const deleteIdea = () => {
    console.log("deleteIdea called"); // Debug log
    setGeneratedIdea(null);
  };

  const handleUseIdea = (idea) => {
    console.log("handleUseIdea called with:", idea); // Debug log
    setSelectedIdea(idea);
    convertIdeaToBookData(idea);
    nextStep();
  };

  const handleEditSavedIdea = (idea) => {
    console.log("handleEditSavedIdea called with:", idea); // Debug log
    setEditingIdea(idea);
  };

  const handleUpdateSavedIdea = async (updatedIdea) => {
    console.log("handleUpdateSavedIdea called with:", updatedIdea); // Debug log
    try {
      setIsGenerating(true);
      await StoryIdea.update(updatedIdea.id, updatedIdea);
      await loadSavedIdeas(); // Refresh the list
      setEditingIdea(null);
      toast({ title: "Idea Updated", description: "Your changes have been saved." });
    } catch (error) {
      console.error("Failed to update idea:", error);
      toast({ variant: "destructive", title: "Update Error", description: "Failed to save your changes." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    console.log("handleDeleteIdea called with:", ideaId); // Debug log
    try {
      setIsGenerating(true);
      await StoryIdea.delete(ideaId);
      await loadSavedIdeas(); // Refresh list
      toast({ title: "Idea Deleted", description: "The story idea has been removed." });
    } catch (error) {
      console.error("Failed to delete idea:", error);
      toast({ variant: "destructive", title: "Delete Error", description: "Could not delete the idea." });
    } finally {
      setIsGenerating(false);
    }
  };

  const createBook = async () => {
    try {
      setIsGenerating(true);

      // Ensure cover image is generated if not present
      let finalBookData = { ...bookData };
      if (!finalBookData.cover_image) {
        const coverPrompt = `Children's book cover for "${finalBookData.title}", featuring a child named ${finalBookData.child_name} in a ${finalBookData.genre} setting. Illustrated in ${finalBookData.art_style} style.`;
        const coverResult = await GenerateImage({
          prompt: coverPrompt,
          model: aiSettings.imageModel // Use selected image model
        });
        if (coverResult && coverResult.url) {
          finalBookData = { ...finalBookData, cover_image: coverResult.url };
          setBookData(finalBookData); // Update state with cover image
        } else {
          console.warn("Failed to generate cover image, proceeding without it.");
        }
      }

      const createdBook = await Book.create(finalBookData);

      toast({
        description: t("studio.book.create.success"),
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100",
      });

      navigate(`${createPageUrl("BookCreation")}?id=${createdBook.id}`);
    } catch (error) {
      console.error("Error creating book:", error);
      toast({
        variant: "destructive",
        description: t("studio.book.create.error"),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Idea Generation Step
  const IdeaGenerationStep = () => {
    console.log("IdeaGenerationStep rendering"); // Debug log
    console.log("startingPoint:", startingPoint); // Debug log
    console.log("generatedIdea:", generatedIdea); // Debug log
    console.log("savedIdeas:", savedIdeas); // Debug log

    if (startingPoint === 'new-idea') {
      return (
        <div className="space-y-6">
          <IdeaGenerator
            ideaParams={ideaParams}
            onInputChange={(field, value) => {
              console.log("IdeaGenerator onInputChange:", field, value); // Debug log
              setIdeaParams(prev => ({ ...prev, [field]: value }));
            }}
            onGenerate={generateIdea} // Use the new local generateIdea function
            isGenerating={isGenerating}
            currentLanguage={currentLanguage}
            isRTL={isRTL}
            existingChildrenNames={bookData.childNames} // Passing childNames from bookData
          />
          {generatedIdea && (
            <div className="mt-6"> {/* Added wrapper div as per outline's structure */}
              <IdeaResult
                idea={generatedIdea}
                onContinue={() => {
                  console.log("IdeaResult onContinue called"); // Debug log
                  // Convert idea to book data before moving to the next step
                  convertIdeaToBookData(generatedIdea, ideaParams);
                  nextStep();
                }}
                onRegenerate={() => {
                  console.log("IdeaResult onRegenerate called"); // Debug log
                  setGeneratedIdea(null); // Clear current idea
                  generateIdea(); // Generate new one
                }}
                onSave={() => {
                  console.log("IdeaResult onSave called"); // Debug log
                  saveIdea(generatedIdea);
                }}
                onSaveAndContinue={() => {
                  console.log("IdeaResult onSaveAndContinue called"); // Debug log
                  saveIdeaAndContinue(generatedIdea);
                }}
                onEdit={editIdea} // Pass the corrected edit function
                onDelete={() => {
                  console.log("IdeaResult onDelete called"); // Debug log
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
    } else if (startingPoint === 'existing-idea') {
      return (
        <div className="space-y-6"> {/* Added wrapper div as per outline */}
          <SavedIdeas
            ideas={savedIdeas}
            onUseIdea={(idea) => {
              console.log("handleUseIdea called with:", idea); // Debug log
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

  // Render current step - REVERTED to include StoryRefinementStep
  const renderCurrentStep = () => {
    switch (currentStepData.component) {
      case 'StartingPoint':
        return <StartingPointStep />;
      case 'IdeaGeneration':
        return <IdeaGenerationStep />;
      case 'StoryRefinement': // REVERTED
        return (
          <StoryRefinementStep
            bookData={bookData}
            updateBookData={(field, value) => setBookData(prev => ({ ...prev, [field]: value }))}
            currentLanguage={currentLanguage}
            isRTL={isRTL}
          />
        );
      case 'StoryStyle':
        return (
          <StoryStyleStep
            bookData={bookData}
            updateBookData={(field, value) => setBookData(prev => ({ ...prev, [field]: value }))}
            currentLanguage={currentLanguage}
            isRTL={isRTL}
          />
        );
      case 'CreateBook':
        return <BookPreview bookData={bookData} coverImage={bookData.cover_image} isGenerating={isGenerating} />;
      default:
        // REMOVING the new StoryStructureBuilder for now to ensure stability
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

      {/* Progress Bar */}
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

          {/* Debug info - can be removed later */}
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs opacity-50 hover:opacity-100 transition-opacity">
            <p>Debug Info:</p>
            <pre className="whitespace-pre-wrap">{JSON.stringify({
              currentStep: currentStep,
              currentStepComponent: currentStepData?.component,
              startingPoint: startingPoint,
              hasGeneratedIdea: !!generatedIdea,
              hasSelectedIdea: !!selectedIdea,
              editingIdeaId: editingIdea?.id || 'none',
              ideaParams: ideaParams,
              bookDataTitle: bookData.title,
              bookDataLanguage: bookData.language,
              bookDataChildNames: bookData.childNames,
              isGenerating: isGenerating
            }, null, 2)}</pre>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Edit Idea Modal */}
      <Dialog open={!!editingIdea} onOpenChange={(isOpen) => !isOpen && setEditingIdea(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>עריכת רעיון הסיפור</DialogTitle>
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
          disabled={currentStep === 0 || (currentStep === 1 && startingPoint === 'direct-create')}
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
              (currentStepData.id === 'idea' && startingPoint !== 'direct-create' && !generatedIdea && !selectedIdea) ||
              (currentStepData.id === 'start' && startingPoint === null)
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
