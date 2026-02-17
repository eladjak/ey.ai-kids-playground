import React from "react";
import { motion } from "framer-motion";
import {
  Cat,
  Rocket,
  Users,
  Sparkles,
  TreePine,
  Crown,
  Compass,
  GraduationCap,
  Heart,
  Music,
  Palette,
  Globe
} from "lucide-react";

/**
 * Topic cards data with icons, colors, and Hebrew/English labels.
 */
const TOPIC_CARDS = [
  {
    id: "animals",
    icon: Cat,
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    ring: "ring-amber-400",
    en: "Animals",
    he: "חיות"
  },
  {
    id: "space",
    icon: Rocket,
    gradient: "from-indigo-400 to-purple-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    ring: "ring-indigo-400",
    en: "Space",
    he: "חלל"
  },
  {
    id: "family",
    icon: Users,
    gradient: "from-pink-400 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    ring: "ring-pink-400",
    en: "Family",
    he: "משפחה"
  },
  {
    id: "fairy_tale",
    icon: Crown,
    gradient: "from-yellow-400 to-amber-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    ring: "ring-yellow-400",
    en: "Fairy Tales",
    he: "אגדות"
  },
  {
    id: "adventure",
    icon: Compass,
    gradient: "from-emerald-400 to-green-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    ring: "ring-emerald-400",
    en: "Adventure",
    he: "הרפתקאות"
  },
  {
    id: "nature",
    icon: TreePine,
    gradient: "from-green-400 to-teal-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    ring: "ring-green-400",
    en: "Nature",
    he: "טבע"
  },
  {
    id: "science",
    icon: GraduationCap,
    gradient: "from-cyan-400 to-blue-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    ring: "ring-cyan-400",
    en: "Science",
    he: "מדע"
  },
  {
    id: "magic",
    icon: Sparkles,
    gradient: "from-violet-400 to-fuchsia-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    ring: "ring-violet-400",
    en: "Magic",
    he: "קסמים"
  },
  {
    id: "friendship",
    icon: Heart,
    gradient: "from-rose-400 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    ring: "ring-rose-400",
    en: "Friendship",
    he: "חברות"
  },
  {
    id: "music",
    icon: Music,
    gradient: "from-fuchsia-400 to-purple-500",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    ring: "ring-fuchsia-400",
    en: "Music",
    he: "מוזיקה"
  },
  {
    id: "art",
    icon: Palette,
    gradient: "from-orange-400 to-red-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    ring: "ring-orange-400",
    en: "Art",
    he: "אמנות"
  },
  {
    id: "travel",
    icon: Globe,
    gradient: "from-sky-400 to-blue-500",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    ring: "ring-sky-400",
    en: "Travel",
    he: "טיולים"
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

/**
 * TopicStep - Step 1 of the wizard: Choose a story topic.
 * Displays visual topic cards in a grid that the user can select.
 */
export default function TopicStep({ selectedTopic, onSelectTopic, isRTL, language }) {
  const isHebrew = language === "hebrew";

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isHebrew ? "על מה יהיה הסיפור?" : "What's the story about?"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {isHebrew ? "בחר נושא שמעניין אותך" : "Pick a topic you love"}
        </p>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        role="radiogroup"
        aria-label={isHebrew ? "בחר נושא" : "Choose topic"}
      >
        {TOPIC_CARDS.map((topic, index) => {
          const Icon = topic.icon;
          const isSelected = selectedTopic === topic.id;

          return (
            <motion.button
              key={topic.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectTopic(topic.id)}
              role="radio"
              aria-checked={isSelected}
              aria-label={isHebrew ? topic.he : topic.en}
              className={`
                flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl
                transition-all duration-200 cursor-pointer min-h-[120px] md:min-h-[140px]
                ${topic.bg}
                ${isSelected
                  ? `ring-3 ${topic.ring} shadow-lg`
                  : "hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                }
              `}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${topic.gradient} flex items-center justify-center mb-3`}>
                <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">
                {isHebrew ? topic.he : topic.en}
              </span>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-1 w-2 h-2 rounded-full bg-purple-600"
                  aria-hidden="true"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export { TOPIC_CARDS };
