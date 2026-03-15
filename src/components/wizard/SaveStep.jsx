import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Magical, child-friendly progress labels for book creation.
 * Keyed by language, with `at` representing the % threshold at which the label activates.
 */
const MAGIC_LABELS = {
  en: [
    { at: 5, text: "Sprinkling magic dust..." },
    { at: 10, text: "Opening the storybook..." },
    { at: 20, text: "Gathering your characters..." },
    { at: 35, text: "Writing the adventure..." },
    { at: 50, text: "The magic paintbrush is working..." },
    { at: 70, text: "Painting beautiful pictures..." },
    { at: 85, text: "Adding sparkles and stars..." },
    { at: 95, text: "Almost there! Final touches..." }
  ],
  he: [
    { at: 5, text: "מפזרים אבקת קסם..." },
    { at: 10, text: "פותחים את ספר הסיפורים..." },
    { at: 20, text: "אוספים את הדמויות שלך..." },
    { at: 35, text: "כותבים את ההרפתקה..." },
    { at: 50, text: "מכחול הקסם עובד..." },
    { at: 70, text: "מציירים תמונות יפות..." },
    { at: 85, text: "מוסיפים נצנוצים וכוכבים..." },
    { at: 95, text: "כמעט שם! נגיעות אחרונות..." }
  ],
  yi: [
    { at: 5, text: "מיר שפּריצן קסם שטויב..." },
    { at: 10, text: "מיר עפֿענען דעם מעשׂה-ביכל..." },
    { at: 20, text: "מיר זאַמלען דײַנע פּערזאָנאַזשן..." },
    { at: 35, text: "מיר שרײַבן דעם אַוואַנטורע..." },
    { at: 50, text: "דער קסם פּענדזל אַרבעט..." },
    { at: 70, text: "מיר מאָלן שיינע בילדער..." },
    { at: 85, text: "מיר לייגן צו פֿונקלען..." },
    { at: 95, text: "כּמעט דאָ! לעצטע שטריכן..." }
  ]
};

/**
 * Get the current magical label for a given progress percentage and language.
 * Returns the label for the highest `at` threshold that is <= percent.
 */
function getMagicLabel(percent, language) {
  const langKey = language === "hebrew" ? "he" : language === "yiddish" ? "yi" : "en";
  const labels = MAGIC_LABELS[langKey];
  // Find the last label whose `at` is <= current percent
  let activeLabel = labels[0].text;
  for (const entry of labels) {
    if (percent >= entry.at) {
      activeLabel = entry.text;
    }
  }
  return activeLabel;
}

/**
 * SaveStep - Step 4 of the wizard: Save, Download, Share.
 * Action buttons to finalize the book creation.
 * Progress labels are magical and child-friendly.
 */
export default function SaveStep({
  bookData,
  selectedCharacters,
  selectedTopic,
  isCreating,
  onCreateBook,
  creationProgress,
  isRTL,
  language
}) {
  const isHebrew = language === "hebrew";
  const isYiddish = language === "yiddish";

  const summaryItems = [
    {
      label: isHebrew ? "נושא" : "Topic",
      value: selectedTopic || (isHebrew ? "לא נבחר" : "Not selected")
    },
    {
      label: isHebrew ? "שם הסיפור" : "Story Title",
      value: bookData.title || (isHebrew ? "ייוצר אוטומטית" : "Will be auto-generated")
    },
    {
      label: isHebrew ? "דמויות" : "Characters",
      value: selectedCharacters.length > 0
        ? selectedCharacters.map((c) => c.name).join(", ")
        : (isHebrew ? "לא נבחרו" : "None selected")
    },
    {
      label: isHebrew ? "סגנון" : "Art Style",
      value: bookData.art_style || "disney"
    },
    {
      label: isHebrew ? "אורך" : "Length",
      value: bookData.length === "short"
        ? (isHebrew ? "קצר" : "Short")
        : bookData.length === "long"
          ? (isHebrew ? "ארוך" : "Long")
          : (isHebrew ? "בינוני" : "Medium")
    }
  ];

  // Determine the current magical label from the progress percent
  const magicLabel = creationProgress
    ? getMagicLabel(creationProgress.percent, language)
    : null;

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isHebrew ? "הכל מוכן!" : isYiddish ? "אַלץ גרייט!" : "All set!"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {isHebrew ? "בדוק את הסיכום ולחץ ליצירת הספר" : "Review the summary and create your book"}
        </p>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <BookOpen className="h-5 w-5 text-purple-600" aria-hidden="true" />
              {isHebrew ? "סיכום הספר" : "Book Summary"}
            </h3>
            <dl className="space-y-3">
              {summaryItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} items-start gap-3`}
                >
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px]">
                    {item.label}:
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" aria-hidden="true" />
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Book CTA */}
      <motion.div
        whileHover={!isCreating ? { scale: 1.02 } : {}}
        whileTap={!isCreating ? { scale: 0.98 } : {}}
      >
        <Button
          onClick={onCreateBook}
          disabled={isCreating}
          className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-3 shadow-lg"
          aria-label={isHebrew ? "צור את הספר שלי" : "Create my book"}
        >
          {isCreating ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          )}
          {isCreating
            ? (isHebrew ? "יוצר את הספר..." : "Creating your book...")
            : (isHebrew ? "צור את הספר שלי!" : "Create My Book!")
          }
        </Button>
      </motion.div>

      {/* Generation Progress — with magical labels */}
      {isCreating && creationProgress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-5 space-y-4">
              {/* Magical label — large and fun */}
              <motion.p
                key={magicLabel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center text-base font-semibold text-purple-700 dark:text-purple-300"
                aria-live="polite"
              >
                {magicLabel}
              </motion.p>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${creationProgress.percent}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-end">
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    {creationProgress.percent}%
                  </span>
                </div>
              </div>

              {/* Step indicator (smaller, secondary) */}
              {creationProgress.step && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  {creationProgress.step}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
