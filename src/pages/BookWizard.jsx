import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "@/entities/Book";
import { Page } from "@/entities/Page";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { moderateInput, buildSafetyPromptPrefix, sanitizeAIOutput } from "@/utils/content-moderation";
import { checkAgeAppropriateLanguage } from "@/utils/content-moderation";
import useGamification from "@/hooks/useGamification";
import GamificationOverlay from "@/components/gamification/GamificationOverlay";

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
  const gamification = useGamification();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Step 1: Topic
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [customIdea, setCustomIdea] = useState("");

  // Step 2: Characters
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  // Creation progress
  const [creationProgress, setCreationProgress] = useState(null);
  // Track image generation failures for retry
  const [imageFailures, setImageFailures] = useState([]);

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
        const lang = user.language || localStorage.getItem("language") || "english";
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
      case 0: return selectedTopic === "custom" ? !!customIdea?.trim() : !!selectedTopic;
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

      // Use bookData.age_range, fallback to preferredAgeRange from onboarding, then default
      const ageRange = bookData.age_range || localStorage.getItem("preferredAgeRange") || "5-10";
      const safetyPrefix = buildSafetyPromptPrefix(ageRange);
      const langInstruction = isHebrew
        ? "יש ליצור את כל התוכן בעברית בלבד. "
        : "Create all content in English only. ";

      const topicDescription = selectedTopic === "custom" && customIdea
        ? customIdea
        : selectedTopic;

      const prompt = `${safetyPrefix}${langInstruction}Create a children's story idea about the topic "${topicDescription}" with characters: ${characterNames}. ${characterTraits ? `Character traits: ${characterTraits}.` : ""} Please provide:
1. A catchy title for the story
2. A brief description (2-3 sentences)
3. A moral lesson

The story should be age-appropriate for children ages ${ageRange}, fun, engaging, and educational.`;

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
        // Sanitize AI output before using it
        const sanitizedTitle = sanitizeAIOutput(result.title || "");
        const sanitizedDescription = sanitizeAIOutput(result.description || "");
        const sanitizedMoral = sanitizeAIOutput(result.moral_lesson || "");

        // Run age-appropriate language check on generated content
        const ageCheck = checkAgeAppropriateLanguage(sanitizedDescription, ageRange);
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

        const sanitizedResult = { ...result, title: sanitizedTitle, description: sanitizedDescription, moral_lesson: sanitizedMoral };
        setGeneratedOutline(sanitizedResult);
        setBookData((prev) => ({
          ...prev,
          title: sanitizedTitle || prev.title,
          description: sanitizedDescription || prev.description,
          moral: sanitizedMoral || prev.moral,
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

  // Retry failed images for an already-created book
  const retryFailedImages = async (bookId, failures) => {
    if (!failures || failures.length === 0) return;

    toast({
      title: isHebrew ? "מנסה שוב איורים שנכשלו..." : "Retrying failed illustrations...",
      description: isHebrew
        ? `מנסה ליצור ${failures.length} איורים מחדש`
        : `Attempting to regenerate ${failures.length} illustrations`
    });

    const retryResults = await Promise.allSettled(
      failures.map(({ pageId, imagePrompt }) =>
        GenerateImage({ prompt: imagePrompt })
          .then((result) => ({ pageId, url: result?.url || "" }))
          .catch(() => ({ pageId, url: "" }))
      )
    );

    const stillFailed = [];
    await Promise.allSettled(
      retryResults.map(async (outcome, idx) => {
        if (outcome.status === "fulfilled" && outcome.value.url) {
          await Page.update(outcome.value.pageId, { image_url: outcome.value.url });
        } else {
          stillFailed.push(failures[idx]);
        }
      })
    );

    setImageFailures(stillFailed);

    if (stillFailed.length === 0) {
      toast({
        title: isHebrew ? "כל האיורים נוצרו!" : "All illustrations generated!",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } else {
      toast({
        variant: "destructive",
        title: isHebrew ? `${stillFailed.length} איורים עדיין נכשלו` : `${stillFailed.length} illustrations still failed`,
        description: isHebrew ? "ניתן לנסות שוב מאוחר יותר" : "You can retry again later"
      });
    }
  };

  // Create the book with parallel page generation
  const createBook = async () => {
    try {
      setIsCreating(true);
      setError(null);
      setImageFailures([]);
      setCreationProgress({ label: isHebrew ? "בודק תוכן..." : "Checking content...", percent: 5, step: "" });

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
        setCreationProgress(null);
        return;
      }

      // Step 1: Generate story outline + cover image in parallel
      setCreationProgress({
        label: isHebrew ? "יוצר עלילה ועטיפה..." : "Creating story & cover...",
        percent: 10,
        step: isHebrew ? "שלב 1 מתוך 4" : "Step 1 of 4"
      });

      let pageCount = 10;
      if (bookData.length === "short") pageCount = 6;
      if (bookData.length === "long") pageCount = 15;

      const characterNames = selectedCharacters.map((c) => c.name).join(", ");
      // Build character appearance descriptions for visual consistency across illustrations
      const characterAppearances = selectedCharacters
        .map((c) => {
          const parts = [c.name];
          if (c.appearance) parts.push(c.appearance);
          else if (c.description) parts.push(c.description);
          else if (c.traits) parts.push(c.traits);
          return parts.join(": ");
        })
        .join(". ");

      const topicDescription = selectedTopic === "custom" && customIdea ? customIdea : selectedTopic;
      // Use bookData.age_range, fallback to preferredAgeRange from onboarding, then default
      const ageRange = bookData.age_range || localStorage.getItem("preferredAgeRange") || "5-10";
      const safetyPrefix = buildSafetyPromptPrefix(ageRange);
      const langInstruction = bookData.language === "hebrew"
        ? "יש ליצור את כל התוכן בעברית בלבד. "
        : "Create all content in English only. ";

      const outlinePrompt = `${safetyPrefix}${langInstruction}Create a detailed outline for a children's book:
- Title: ${bookData.title}
- Description: ${bookData.description}
- Topic: ${topicDescription}
- Characters: ${characterNames}
- Art style: ${bookData.art_style}
- Tone: ${bookData.tone || "exciting"}
- Moral: ${bookData.moral || "positive message"}
- Age range: ${ageRange}

Create exactly ${pageCount} pages (including a title page).
For each page, provide a brief description of what happens.
The story should have a clear beginning, middle, and end.`;

      const coverPrompt = `Children's book cover for "${bookData.title}", featuring characters ${characterNames} in a ${topicDescription} setting. ${characterAppearances ? `Character appearances: ${characterAppearances}.` : ""} Illustrated in ${bookData.art_style} style. Bright, colorful, child-friendly.`;

      const [outlineResult, coverResult] = await Promise.all([
        InvokeLLM({
          prompt: outlinePrompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              outline: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    page_number: { type: "number" },
                    description: { type: "string" }
                  }
                }
              }
            }
          }
        }),
        GenerateImage({ prompt: coverPrompt }).catch(() => null)
      ]);

      const coverImage = coverResult?.url || "";

      // Step 2: Create book entity
      setCreationProgress({
        label: isHebrew ? "שומר את הספר..." : "Saving book...",
        percent: 25,
        step: isHebrew ? "שלב 2 מתוך 4" : "Step 2 of 4"
      });

      // Sanitize AI-generated title before saving
      const sanitizedTitle = sanitizeAIOutput(outlineResult?.title || bookData.title);

      const finalBookData = {
        ...bookData,
        title: sanitizedTitle,
        cover_image: coverImage,
        status: "generating"
      };

      const createdBook = await Book.create(finalBookData);

      // Step 3: Generate ALL page texts in parallel
      setCreationProgress({
        label: isHebrew ? "כותב את הסיפור..." : "Writing the story...",
        percent: 35,
        step: isHebrew ? "שלב 3 מתוך 4" : "Step 3 of 4"
      });

      const outlinePages = outlineResult?.outline || [];
      const pageTextPromises = outlinePages.map((pageOutline, i) => {
        const prompt = `${safetyPrefix}${langInstruction}Write the text content for page ${i} of a children's story based on this description: "${pageOutline.description}"

Story details:
- Title: ${finalBookData.title}
- Main characters: ${characterNames}
- Art style: ${bookData.art_style}
- Target age: ${ageRange}
${i === 0 ? "This is the title page/introduction. Keep it brief and engaging." : ""}

Also create a detailed image generation prompt for this page.

Return as JSON with:
1. text_content: The page text
2. image_prompt: Detailed image generation prompt`;

        return InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              text_content: { type: "string" },
              image_prompt: { type: "string" }
            }
          }
        });
      });

      const pageTexts = await Promise.all(pageTextPromises);

      // Sanitize all AI-generated text content
      const sanitizedPageTexts = pageTexts.map((pt) => ({
        ...pt,
        text_content: sanitizeAIOutput(pt?.text_content || ""),
        image_prompt: pt?.image_prompt || ""
      }));

      // Step 4: Generate ALL illustrations in parallel
      // Use Promise.allSettled so one failure doesn't cancel the rest
      setCreationProgress({
        label: isHebrew ? "מצייר איורים..." : "Drawing illustrations...",
        percent: 60,
        step: isHebrew ? "שלב 4 מתוך 4" : "Step 4 of 4"
      });

      const imagePromises = sanitizedPageTexts.map((pageText) => {
        // Prepend character appearance descriptions to every image prompt for visual consistency
        const characterContext = characterAppearances
          ? `Characters: ${characterAppearances}. `
          : "";
        const imagePrompt = `${characterContext}Scene: ${pageText.image_prompt}. Children's book illustration in ${bookData.art_style} style. Bright, colorful, age-appropriate for ${ageRange} year olds.`;
        return GenerateImage({ prompt: imagePrompt })
          .then((result) => ({ url: result?.url || "", prompt: imagePrompt }))
          .catch((err) => {
            console.error("[BookWizard] Image generation failed:", err?.message || err);
            return { url: "", prompt: imagePrompt, failed: true };
          });
      });

      const imageSettled = await Promise.allSettled(imagePromises);

      // Collect results, tracking failures with progress updates
      const imageResults = [];
      let successCount = 0;
      const pendingFailures = [];

      imageSettled.forEach((outcome, i) => {
        if (outcome.status === "fulfilled") {
          imageResults.push(outcome.value);
          if (!outcome.value.failed && outcome.value.url) {
            successCount++;
          } else {
            pendingFailures.push({ index: i, prompt: outcome.value.prompt });
          }
        } else {
          console.error("[BookWizard] Image promise rejected for page", i, outcome.reason);
          imageResults.push({ url: "", prompt: sanitizedPageTexts[i]?.image_prompt || "", failed: true });
          pendingFailures.push({ index: i, prompt: sanitizedPageTexts[i]?.image_prompt || "" });
        }
        // Update progress as images complete
        const doneCount = i + 1;
        const imgPercent = 60 + Math.floor((doneCount / imageSettled.length) * 25);
        setCreationProgress((prev) => prev ? { ...prev, percent: imgPercent } : prev);
      });

      // Save all pages in parallel
      setCreationProgress({
        label: isHebrew ? "שומר עמודים..." : "Saving pages...",
        percent: 85,
        step: ""
      });

      const pageCreatePromises = sanitizedPageTexts.map((pageText, i) => {
        const imageUrl = imageResults[i]?.url || "";
        // If image failed, set a placeholder message on the page record
        const imagePromptFinal = imageResults[i]?.failed
          ? `[Image generation failed] ${pageText.image_prompt}`
          : pageText.image_prompt;

        return Page.create({
          book_id: createdBook.id,
          page_number: i,
          text_content: pageText.text_content,
          image_url: imageUrl,
          image_prompt: imagePromptFinal,
          layout_type: i === 0 ? "cover" : "standard"
        });
      });

      const savedPages = await Promise.all(pageCreatePromises);

      // Map failures to page IDs for retry
      const failuresWithPageIds = pendingFailures.map(({ index, prompt }) => ({
        pageId: savedPages[index]?.id,
        imagePrompt: prompt
      })).filter((f) => f.pageId);

      // Mark book as complete
      await Book.update(createdBook.id, { status: "complete" });

      setCreationProgress({
        label: isHebrew ? "הספר מוכן!" : "Book ready!",
        percent: 100,
        step: ""
      });

      // Award XP for book creation
      try {
        await gamification.awardXP("book_created");
        await gamification.incrementStat("totalBooks");
      } catch {
        // gamification is non-critical
      }

      // Show summary: how many images succeeded, and offer retry if any failed
      if (failuresWithPageIds.length > 0) {
        setImageFailures(failuresWithPageIds);
        toast({
          variant: "destructive",
          title: isHebrew ? "הספר נוצר עם בעיות" : "Book created with issues",
          description: isHebrew
            ? `${successCount} מתוך ${sanitizedPageTexts.length} איורים נוצרו בהצלחה. האחרים נכשלו.`
            : `${successCount} of ${sanitizedPageTexts.length} illustrations generated successfully. ${failuresWithPageIds.length} failed.`
        });
      } else {
        toast({
          title: isHebrew ? "הספר נוצר!" : "Book created!",
          description: isHebrew ? "הספר שלך מוכן לקריאה!" : "Your book is ready to read!",
          className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
        });
      }

      // Navigate to BookView
      navigate(`${createPageUrl("BookView")}?id=${createdBook.id}`);

      // If there were failures, offer retry after navigation (non-blocking)
      if (failuresWithPageIds.length > 0) {
        setTimeout(() => {
          retryFailedImages(createdBook.id, failuresWithPageIds);
        }, 2000);
      }
    } catch {
      setError({
        title: isHebrew ? "אופס! לא הצלחנו ליצור את הספר" : "Oops! Couldn't create the book",
        message: isHebrew ? "משהו השתבש. בואו ננסה שוב!" : "Something went wrong. Let's try again!",
        onRetry: createBook
      });
    } finally {
      setIsCreating(false);
      setCreationProgress(null);
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
            customIdea={customIdea}
            onCustomIdeaChange={setCustomIdea}
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
            creationProgress={creationProgress}
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

      {/* Gamification celebrations */}
      <GamificationOverlay
        pendingCelebrations={gamification.pendingCelebrations}
        onDismiss={gamification.dismissCelebration}
        isRTL={isRTL}
        isHebrew={isHebrew}
      />
    </motion.div>
  );
}
