import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Share2, Sparkles, CheckCircle2 } from "lucide-react";

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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Create Book - Primary CTA */}
        <motion.div
          className="sm:col-span-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onCreateBook}
            disabled={isCreating}
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-3 shadow-lg"
            aria-label={isHebrew ? "צור את הספר שלי" : "Create my book"}
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            {isCreating
              ? (isHebrew ? "יוצר את הספר..." : "Creating your book...")
              : (isHebrew ? "צור את הספר שלי!" : "Create My Book!")
            }
          </Button>
        </motion.div>

        {/* Download (placeholder) */}
        <Card className="border-dashed opacity-60 cursor-not-allowed">
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <Download className="h-6 w-6 text-gray-400" aria-hidden="true" />
            <span className="text-sm text-gray-500">
              {isHebrew ? "הורדה (בקרוב)" : "Download (coming soon)"}
            </span>
          </CardContent>
        </Card>

        {/* Share (placeholder) */}
        <Card className="border-dashed opacity-60 cursor-not-allowed">
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <Share2 className="h-6 w-6 text-gray-400" aria-hidden="true" />
            <span className="text-sm text-gray-500">
              {isHebrew ? "שיתוף (בקרוב)" : "Share (coming soon)"}
            </span>
          </CardContent>
        </Card>

        {/* Library link (placeholder) */}
        <Card className="border-dashed opacity-60 cursor-not-allowed">
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <BookOpen className="h-6 w-6 text-gray-400" aria-hidden="true" />
            <span className="text-sm text-gray-500">
              {isHebrew ? "ספרייה (בקרוב)" : "Library (coming soon)"}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
