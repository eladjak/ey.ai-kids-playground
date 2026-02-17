import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";

/**
 * FriendlyError - A child-friendly error display with cute illustrations.
 * Shows a friendly message with retry and go-back buttons.
 *
 * @param {string} title - Error title
 * @param {string} message - Friendly error message
 * @param {function} onRetry - Retry callback
 * @param {function} onGoBack - Go back callback
 * @param {boolean} isRTL - Right-to-left layout
 * @param {string} language - Current language
 */
export default function FriendlyError({ title, message, onRetry, onGoBack, isRTL, language }) {
  const isHebrew = language === "hebrew";

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center"
      dir={isRTL ? "rtl" : "ltr"}
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sad character illustration */}
      <motion.div
        className="mb-6"
        animate={{
          y: [0, -5, 0],
          rotate: [0, -3, 3, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center shadow-md">
          <span className="text-5xl" aria-hidden="true">😅</span>
        </div>
      </motion.div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title || (isHebrew ? "אופס! משהו השתבש" : "Oops! Something went wrong")}
      </h2>

      {/* Message */}
      <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md">
        {message || (isHebrew ? "לא לדאוג, אפשר לנסות שוב!" : "Don't worry, we can try again!")}
      </p>

      {/* Action buttons */}
      <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
            aria-label={isHebrew ? "נסה שוב" : "Try again"}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {isHebrew ? "ננסה שוב!" : "Let's try again!"}
          </Button>
        )}
        {onGoBack && (
          <Button
            variant="outline"
            onClick={onGoBack}
            className="gap-2"
            aria-label={isHebrew ? "חזור" : "Go back"}
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} aria-hidden="true" />
            {isHebrew ? "חזור" : "Go Back"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
