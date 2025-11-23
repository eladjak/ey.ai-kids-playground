import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "@/entities/Book";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  BookOpen,
  Save,
  RotateCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

// Import components
import ChildInfoStep from "../components/createBook/ChildInfoStep";
import StoryDetailsStep from "../components/createBook/StoryDetailsStep";
import StoryStyleStep from "../components/createBook/StoryStyleStep";
import LanguageStep from "../components/createBook/LanguageStep";
import BookPreview from "../components/createBook/BookPreview";

export default function CreateBook() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  
  const [bookData, setBookData] = useState({
    title: "",
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
    status: "draft"
  });

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const user = await User.me();
        const storedLanguage = user.language || localStorage.getItem("appLanguage") || "english";
        setCurrentLanguage(storedLanguage);
        
        setBookData(prev => ({
          ...prev,
          language: storedLanguage
        }));
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };
    
    loadUserSettings();
  }, []);

  const translations = {
    english: {
      "createBook.title": "Create New Book",
      "createBook.subtitle": "Let's create a personalized storybook for your child",
      "createBook.step1": "Child Information",
      "createBook.step2": "Story Details", 
      "createBook.step3": "Art & Style",
      "createBook.step4": "Language & Settings",
      "createBook.step5": "Preview & Create",
      "createBook.back": "Back",
      "createBook.next": "Next",
      "createBook.create": "Create My Book",
      "createBook.creating": "Creating...",
      "createBook.success": "Book created successfully!",
      "createBook.error": "Failed to create book. Please try again."
    },
    hebrew: {
      "createBook.title": "יצירת ספר חדש",
      "createBook.subtitle": "בואו ניצור ספר סיפורים מותאם אישית לילד שלכם",
      "createBook.step1": "פרטי הילד",
      "createBook.step2": "פרטי הסיפור",
      "createBook.step3": "אמנות וסגנון",
      "createBook.step4": "שפה והגדרות",
      "createBook.step5": "תצוגה מקדימה ויצירה",
      "createBook.back": "חזור",
      "createBook.next": "הבא",
      "createBook.create": "צור את הספר שלי",
      "createBook.creating": "יוצר...",
      "createBook.success": "הספר נוצר בהצלחה!",
      "createBook.error": "נכשל ביצירת הספר. אנא נסה שוב."
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";

  const steps = [
    { title: t("createBook.step1"), component: ChildInfoStep },
    { title: t("createBook.step2"), component: StoryDetailsStep },
    { title: t("createBook.step3"), component: StoryStyleStep },
    { title: t("createBook.step4"), component: LanguageStep },
    { title: t("createBook.step5"), component: BookPreview }
  ];

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

  const updateBookData = (field, value) => {
    setBookData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createBook = async () => {
    try {
      setIsLoading(true);
      
      const createdBook = await Book.create(bookData);
      
      toast({
        description: t("createBook.success"),
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
      
      navigate(`${createPageUrl("BookCreation")}?id=${createdBook.id}`);
    } catch (error) {
      console.error("Error creating book:", error);
      toast({
        variant: "destructive",
        description: t("createBook.error")
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Library"))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("createBook.back")}
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("createBook.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("createBook.subtitle")}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("createBook.step")} {currentStep + 1} {t("createBook.of")} {steps.length}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {steps[currentStep].title}
          </span>
        </div>
        <Progress value={(currentStep + 1) / steps.length * 100} className="h-2" />
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <CurrentStepComponent 
            bookData={bookData}
            updateBookData={updateBookData}
            currentLanguage={currentLanguage}
            isRTL={isRTL}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          {isRTL ? (
            <>
              {t("createBook.back")}
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              {t("createBook.back")}
            </>
          )}
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={createBook}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                {t("createBook.creating")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t("createBook.create")}
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            {isRTL ? (
              <>
                <ArrowLeft className="h-4 w-4" />
                {t("createBook.next")}
              </>
            ) : (
              <>
                {t("createBook.next")}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}