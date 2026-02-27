import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

/**
 * SaveStep - Step 4 of the wizard: Save, Download, Share.
 * Action buttons to finalize the book creation.
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

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isHebrew ? "הכל מוכן!" : "All set!"}
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

      {/* Generation Progress */}
      {isCreating && creationProgress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {creationProgress.label}
                </span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {creationProgress.percent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${creationProgress.percent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {creationProgress.step && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
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
