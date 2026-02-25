import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "@/entities/Book";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { moderateInput, buildSafetyPromptPrefix } from "@/utils/content-moderation";
import { checkAgeAppropriateLanguage } from "@/utils/content-moderation";

import WizardProgress from "@/components/wizard/WizardProgress";
import TopicStep from "@/components/wizard/TopicStep";
import CharacterPicker from "@/components/shared/CharacterPicker";
import PreviewEditStep from "@/components/wizard/PreviewEditStep";
import SaveStep from "@/components/wizard/SaveStep";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import FriendlyError from "@/components/shared/FriendlyError";

export default function BookWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Step 1: Topic
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Step 2: Characters
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  // Step 3: Book data (preview/edit)
  const [bookData, setBookData] = useState({
    title: "",
    description: "",
    moral: "",
    art_style: "disney",
    length: "medium",
    genre: "adventure",
    age_range: "5-7",
    language: "english",
    child_name: "",
    child_age: 5,
    child_gender: "neutral",
    tone: "exciting",
    interests: "",
    family_members: "",
    status: "draft",
    cover_image: ""
  });

  const [generatedOutline, setGeneratedOutline] = useState(null);

  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";
  const isHebrew = currentLanguage === "hebrew";

  // Step definitions
  const steps = [
    { id: "topic", title: isHebrew ? "בחר נושא" : "Choose Topic" },
    { id: "characters", title: isHebrew ? "בחר דמויות" : "Characters" },
    { id: "preview", title: isHebrew ? "תצוגה ועריכה" : "Preview & Edit" },
    { id: "save", title: isHebrew ? "יצירה" : "Create" }
  ];

  // Load user language
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        const lang = user.language || localStorage.getItem("appLanguage") || "english";
        setCurrentLanguage(lang);
        setBookData((prev) => ({ ...prev, language: lang }));
      } catch {
        // Use default language
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Navigation
  const canGoNext = () => {
    switch (currentStep) {
      case 0: return !!selectedTopic;
      case 1: return selectedCharacters.length > 0;
      case 2: return !!bookData.title;
      case 3: return true;
      default: return false;
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = async () => {
    if (currentStep >= steps.length - 1) return;

    // When moving from step 2 to step 3, generate outline if not already done
    if (currentStep === 1 && !generatedOutline) {
      await generateOutline();
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Generate story outline from AI
  const generateOutline = async () => {
    try {
      setIsGeneratingOutline(true);
      setError(null);

      const characterNames = selectedCharacters.map((c) => c.name).join(", ");
      const characterTraits = selectedCharacters
        .filter((c) => c.traits)
        .map((c) => `${c.name} (${c.traits})`)
        .join("; ");

      // Validate character names through content moderation
      for (const char of selectedCharacters) {
        const modResult = moderateInput(char.name, "name");
        if (modResult.blocked) {
          toast({
            variant: "destructive",
            title: isHebrew ? "תוכן לא מתאים" : "Inappropriate content",
            description: isHebrew ? "אחד השמות מכיל תוכן לא מתאים" : "One of the names contains inappropriate content"
          });
          setIsGeneratingOutline(false);
          return;
        }
      }

      const safetyPrefix = buildSafetyPromptPrefix("5-10");
      const langInstruction = isHebrew
        ? "יש ליצור את כל התוכן בעברית בלבד. "
        : "Create all content in English only. ";

      const prompt = `${safetyPrefix}${langInstruction}Create a children's story idea about the topic "${selectedTopic}" with characters: ${characterNames}. ${characterTraits ? `Character traits: ${characterTraits}.` : ""} Please provide:
1. A catchy title for the story
2. A brief description (2-3 sentences)
3. A moral lesson

The story should be age-appropriate for children ages 5-10, fun, engaging, and educational.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            moral_lesson: { type: "string" }
          },
          required: ["title", "description", "moral_lesson"]
        }
      });

      if (result) {
        // Run age-appropriate language check on generated content
        const ageCheck = checkAgeAppropriateLanguage(result.description, "5-10");
        if (!ageCheck.isAppropriate) {
          // AI should not generate inappropriate content due to safety prefix,
          // but double-check just in case
          toast({
            variant: "destructive",
            title: isHebrew ? "בעיה בתוכן" : "Content issue",
            description: isHebrew ? "התוכן שנוצר לא מתאים. מנסה שוב..." : "Generated content was not appropriate. Trying again..."
          });
          setIsGeneratingOutline(false);
          return;
        }

        setGeneratedOutline(result);
        setBookData((prev) => ({
          ...prev,
          title: result.title || prev.title,
          description: result.description || prev.description,
          moral: result.moral_lesson || prev.moral,
          genre: selectedTopic || prev.genre,
          child_name: selectedCharacters[0]?.name || prev.child_name,
          interests: selectedTopic,
          childNames: selectedCharacters.map((c) => c.name),
          selectedCharacters: selectedCharacters.map((c) => ({
            name: c.name,
            age: c.age || 5,
            gender: c.gender || "neutral",
            primary_image_url: c.avatar || null
          }))
        }));
      }
    } catch {
      setError({
        title: isHebrew ? "אופס! משהו השתבש" : "Oops! Something went wrong",
        message: isHebrew
          ? "לא הצלחנו ליצור את הסיפור. אפשר לנסות שוב!"
          : "We couldn't generate the story. Let's try again!",
        onRetry: generateOutline
      });
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // Create the book
  const createBook = async () => {
    try {
      setIsCreating(true);
      setError(null);

      // Moderate title and description
      const titleCheck = moderateInput(bookData.title, "title");
      const descCheck = moderateInput(bookData.description, "description");

      if (titleCheck.blocked || descCheck.blocked) {
        toast({
          variant: "destructive",
          title: isHebrew ? "תוכן לא מתאים" : "Inappropriate content",
          description: isHebrew ? "הכותרת או התיאור מכילים תוכן לא מתאים" : "The title or description contains inappropriate content"
        });
        setIsCreating(false);
        return;
      }

      // Generate cover image
      let coverImage = "";
      try {
        const coverPrompt = `Children's book cover for "${bookData.title}", featuring characters ${selectedCharacters.map((c) => c.name).join(", ")} in a ${selectedTopic} setting. Illustrated in ${bookData.art_style} style. Bright, colorful, child-friendly.`;
        const coverResult = await GenerateImage({ prompt: coverPrompt });
        if (coverResult?.url) {
          coverImage = coverResult.url;
        }
      } catch {
        // Proceed without cover image
      }

      const finalBookData = {
        ...bookData,
        cover_image: coverImage,
        status: "draft"
      };

      const createdBook = await Book.create(finalBookData);

      toast({
        title: isHebrew ? "הספר נוצר!" : "Book created!",
        description: isHebrew ? "הספר שלך נוצר בהצלחה" : "Your book was created successfully",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });

      navigate(`${createPageUrl("BookCreation")}?id=${createdBook.id}`);
    } catch {
      setError({
        title: isHebrew ? "אופס! לא הצלחנו ליצור את הספר" : "Oops! Couldn't create the book",
        message: isHebrew ? "משהו השתבש. בואו ננסה שוב!" : "Something went wrong. Let's try again!",
        onRetry: createBook
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateBookField = (field, value) => {
    setBookData((prev) => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (isLoading) {
    return (
      <LoadingOverlay
        message={isHebrew ? "מכינים הכל בשבילך..." : "Getting everything ready..."}
        isRTL={isRTL}
      />
    );
  }

  // Error state
  if (error && !isGeneratingOutline && !isCreating) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <FriendlyError
          title={error.title}
          message={error.message}
          onRetry={error.onRetry}
          onGoBack={() => {
            setError(null);
            prevStep();
          }}
          isRTL={isRTL}
          language={currentLanguage}
        />
      </div>
    );
  }

  // Render current step content
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TopicStep
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            isRTL={isRTL}
            language={currentLanguage}
          />
        );
      case 1:
        return (
          <CharacterPicker
            selectedCharacters={selectedCharacters}
            onCharactersChange={setSelectedCharacters}
            isRTL={isRTL}
            language={currentLanguage}
          />
        );
      case 2:
        return (
          <PreviewEditStep
            bookData={bookData}
            onBookDataChange={updateBookField}
            generatedOutline={generatedOutline}
            isGeneratingOutline={isGeneratingOutline}
            onRegenerateOutline={generateOutline}
            isRTL={isRTL}
            language={currentLanguage}
          />
        );
      case 3:
        return (
          <SaveStep
            bookData={bookData}
            selectedCharacters={selectedCharacters}
            selectedTopic={selectedTopic}
            isCreating={isCreating}
            onCreateBook={createBook}
            isRTL={isRTL}
            language={currentLanguage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8"
      dir={isRTL ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h1
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isHebrew ? "אשף יצירת ספר" : "Book Creation Wizard"}
        </motion.h1>
        <motion.p
          className="text-gray-600 dark:text-gray-300 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isHebrew ? "צור ספר ילדים מדהים בארבעה שלבים פשוטים" : "Create an amazing children's book in four simple steps"}
        </motion.p>
      </div>

      {/* Progress Indicator */}
      <WizardProgress
        steps={steps}
        currentStep={currentStep}
        onStepClick={goToStep}
        isRTL={isRTL}
      />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 30 : -30 }}
          transition={{ duration: 0.3 }}
          className="mb-8 min-h-[400px]"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} justify-between items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700`}>
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
          aria-label={isHebrew ? "חזור" : "Back"}
        >
          {isRTL ? (
            <>
              {isHebrew ? "חזור" : "Back"}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </>
          )}
        </Button>

        {currentStep < steps.length - 1 && (
          <Button
            onClick={nextStep}
            disabled={!canGoNext() || isGeneratingOutline}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            aria-label={isHebrew ? "השלב הבא" : "Next step"}
          >
            {isGeneratingOutline ? (
              <span>{isHebrew ? "מייצר..." : "Generating..."}</span>
            ) : isRTL ? (
              <>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {isHebrew ? "הבא" : "Next"}
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Creating overlay */}
      {isCreating && (
        <LoadingOverlay
          message={isHebrew ? "יוצר את הספר הקסום שלך..." : "Creating your magical book..."}
          isRTL={isRTL}
          overlay
        />
      )}
    </motion.div>
  );
}
