import React, { useState } from "react";
import { User } from "@/entities/User";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Globe,
  Heart,
  ArrowRight,
  ArrowLeft,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: "welcome", icon: Sparkles },
  { id: "profile", icon: BookOpen },
  { id: "language", icon: Globe },
  { id: "topics", icon: Heart }
];

const LANGUAGES = [
  { id: "english", label: "English", flag: "EN" },
  { id: "hebrew", label: "עברית", flag: "HE" },
  { id: "yiddish", label: "יידיש", flag: "YI" }
];

const TOPICS = [
  { id: "adventure", labelEn: "Adventure", labelHe: "הרפתקאות" },
  { id: "fantasy", labelEn: "Fantasy", labelHe: "פנטזיה" },
  { id: "animals", labelEn: "Animals", labelHe: "חיות" },
  { id: "science", labelEn: "Science", labelHe: "מדע" },
  { id: "fairy_tale", labelEn: "Fairy Tales", labelHe: "אגדות" },
  { id: "family", labelEn: "Family", labelHe: "משפחה" },
  { id: "friendship", labelEn: "Friendship", labelHe: "חברות" },
  { id: "nature", labelEn: "Nature", labelHe: "טבע" },
  { id: "humor", labelEn: "Humor", labelHe: "הומור" },
  { id: "bedtime", labelEn: "Bedtime", labelHe: "לפני השינה" },
  { id: "sports", labelEn: "Sports", labelHe: "ספורט" },
  { id: "magic", labelEn: "Magic", labelHe: "קסם" }
];

const AGE_RANGES = ["2-4", "5-7", "8-10", "11-13"];

const translations = {
  english: {
    "welcome.title": "Welcome to EY.AI!",
    "welcome.subtitle": "Let's set up your magical book studio",
    "welcome.start": "Let's Go!",
    "profile.title": "Tell Us About You",
    "profile.name": "Your Name",
    "profile.namePlaceholder": "Enter your name...",
    "profile.age": "Age Range",
    "language.title": "Choose Your Language",
    "language.subtitle": "You can change this later in settings",
    "topics.title": "What Do You Love?",
    "topics.subtitle": "Pick your favorite topics (at least 1)",
    "finish": "Start Creating!",
    "next": "Next",
    "back": "Back",
    "skip": "Skip for now"
  },
  hebrew: {
    "welcome.title": "!EY.AI-ברוכים הבאים ל",
    "welcome.subtitle": "בואו נקים את סטודיו הספרים הקסום שלכם",
    "welcome.start": "!יאללה",
    "profile.title": "ספרו לנו על עצמכם",
    "profile.name": "השם שלך",
    "profile.namePlaceholder": "...הכניסו את שמכם",
    "profile.age": "טווח גילאים",
    "language.title": "בחרו שפה",
    "language.subtitle": "תוכלו לשנות זאת מאוחר יותר בהגדרות",
    "topics.title": "?מה אתם אוהבים",
    "topics.subtitle": "(בחרו נושאים מועדפים (לפחות 1",
    "finish": "!בואו ליצור",
    "next": "הבא",
    "back": "חזרה",
    "skip": "דלג לעת עתה"
  }
};

export default function OnboardingWizard({ onComplete, userName }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(userName || "");
  const [ageRange, setAgeRange] = useState("");
  const [language, setLanguage] = useState("english");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const isRTL = language === "hebrew" || language === "yiddish";
  const t = (key) => translations[language]?.[key] || translations.english[key] || key;

  const toggleTopic = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const canAdvance = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 3) return selectedTopics.length > 0;
    return true;
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await User.updateMyProfile({
        display_name: name.trim(),
        preferred_age_range: ageRange,
        preferred_language: language,
        favorite_topics: selectedTopics
      });

      localStorage.setItem("appLanguage", language);
      localStorage.setItem("onboarding_complete", "true");
      localStorage.setItem("preferredAgeRange", ageRange);
      localStorage.setItem("favoriteTopics", JSON.stringify(selectedTopics));

      onComplete?.();
    } catch {
      // Still mark complete even if profile update fails (Base44 may not support all fields)
      localStorage.setItem("appLanguage", language);
      localStorage.setItem("onboarding_complete", "true");
      localStorage.setItem("preferredAgeRange", ageRange);
      localStorage.setItem("favoriteTopics", JSON.stringify(selectedTopics));
      onComplete?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -200 : 200, opacity: 0 })
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
        {/* Progress bar */}
        <div className="flex gap-1 p-3 bg-gray-50 dark:bg-gray-900">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-purple-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        <CardContent className="p-6 min-h-[360px] flex flex-col">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-3">{t("welcome.title")}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">{t("welcome.subtitle")}</p>
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8"
                    size="lg"
                  >
                    {t("welcome.start")}
                    <ArrowRight className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`} />
                  </Button>
                </div>
              )}

              {/* Step 1: Profile */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">{t("profile.title")}</h2>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t("profile.name")}</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("profile.namePlaceholder")}
                      className="text-lg"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t("profile.age")}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {AGE_RANGES.map(range => (
                        <Button
                          key={range}
                          variant={ageRange === range ? "default" : "outline"}
                          className={ageRange === range ? "bg-purple-600" : ""}
                          onClick={() => setAgeRange(range)}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Language */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">{t("language.title")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("language.subtitle")}</p>
                  </div>
                  <div className="space-y-3">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.id}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                          language === lang.id
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setLanguage(lang.id)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          language === lang.id
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        }`}>
                          {lang.flag}
                        </div>
                        <span className="text-lg font-medium">{lang.label}</span>
                        {language === lang.id && (
                          <Check className="h-5 w-5 text-purple-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Topics */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <h2 className="text-xl font-bold">{t("topics.title")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("topics.subtitle")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {TOPICS.map(topic => (
                      <Badge
                        key={topic.id}
                        variant={selectedTopics.includes(topic.id) ? "default" : "outline"}
                        className={`cursor-pointer text-sm py-2 px-3 transition-all ${
                          selectedTopics.includes(topic.id)
                            ? "bg-purple-500 text-white hover:bg-purple-600"
                            : "hover:bg-purple-50 dark:hover:bg-purple-950/20"
                        }`}
                        onClick={() => toggleTopic(topic.id)}
                      >
                        {isRTL ? topic.labelHe : topic.labelEn}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons (steps 1-3) */}
          {step > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className={`h-4 w-4 ${isRTL ? "ml-1 rotate-180" : "mr-1"}`} />
                {t("back")}
              </Button>

              <div className="flex gap-2">
                {step < STEPS.length - 1 && (
                  <Button variant="ghost" size="sm" onClick={() => setStep(step + 1)}>
                    {t("skip")}
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canAdvance() || isSaving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {step === STEPS.length - 1 ? (
                    <>
                      {isSaving ? (
                        <span className="animate-spin mr-2">...</span>
                      ) : (
                        <Check className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                      )}
                      {t("finish")}
                    </>
                  ) : (
                    <>
                      {t("next")}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? "mr-1 rotate-180" : "ml-1"}`} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
