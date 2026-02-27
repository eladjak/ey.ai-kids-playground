import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap } from "lucide-react";

/**
 * XP event type labels for display
 */
const EVENT_LABELS = {
  english: {
    book_created: "Book Created",
    page_edited: "Page Edited",
    character_created: "Character Created",
    community_share: "Shared with Community",
    streak_day: "Daily Streak",
    book_completed: "Book Completed",
    first_login: "Welcome Back"
  },
  hebrew: {
    book_created: "ספר נוצר",
    page_edited: "עמוד נערך",
    character_created: "דמות נוצרה",
    community_share: "שותף עם הקהילה",
    streak_day: "רצף יומי",
    book_completed: "ספר הושלם",
    first_login: "ברוך שובך"
  }
};

/**
 * XPToast - Floating +XP animation that appears when XP is awarded.
 */
export default function XPToast({
  celebration,
  onDismiss,
  isHebrew = false
}) {
  if (!celebration || celebration.type !== "xp") return null;

  const eventLabel = isHebrew
    ? EVENT_LABELS.hebrew[celebration.eventType] || ""
    : EVENT_LABELS.english[celebration.eventType] || "";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-20 right-4 z-40 pointer-events-none"
        initial={{ opacity: 0, y: 40, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onAnimationComplete={() => {
          // Auto-dismiss after a short delay
          setTimeout(onDismiss, 2000);
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-amber-200 dark:border-amber-800 px-4 py-3 flex items-center gap-3 pointer-events-auto">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>

          {/* Text */}
          <div>
            {eventLabel && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{eventLabel}</p>
            )}
            <motion.p
              className="text-lg font-bold text-amber-600 dark:text-amber-400"
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              +{celebration.amount} XP
            </motion.p>
          </div>

          {/* Sparkle icon */}
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: 2, duration: 0.3 }}
          >
            <Star className="h-5 w-5 text-amber-400" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
