import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Globe,
  PenLine,
  Lightbulb,
  Shuffle
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StoryIdea } from "@/entities/StoryIdea";

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
    he: "חיות",
    yi: "חיות"
  },
  {
    id: "space",
    icon: Rocket,
    gradient: "from-indigo-400 to-purple-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    ring: "ring-indigo-400",
    en: "Space",
    he: "חלל",
    yi: "חלל"
  },
  {
    id: "family",
    icon: Users,
    gradient: "from-pink-400 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    ring: "ring-pink-400",
    en: "Family",
    he: "משפחה",
    yi: "משפּחה"
  },
  {
    id: "fairy_tale",
    icon: Crown,
    gradient: "from-yellow-400 to-amber-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    ring: "ring-yellow-400",
    en: "Fairy Tales",
    he: "אגדות",
    yi: "מעשׂיות"
  },
  {
    id: "adventure",
    icon: Compass,
    gradient: "from-emerald-400 to-green-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    ring: "ring-emerald-400",
    en: "Adventure",
    he: "הרפתקאות",
    yi: "אַוואַנטורעס"
  },
  {
    id: "nature",
    icon: TreePine,
    gradient: "from-green-400 to-teal-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    ring: "ring-green-400",
    en: "Nature",
    he: "טבע",
    yi: "נאַטור"
  },
  {
    id: "science",
    icon: GraduationCap,
    gradient: "from-cyan-400 to-blue-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    ring: "ring-cyan-400",
    en: "Science",
    he: "מדע",
    yi: "וויסנשאַפֿט"
  },
  {
    id: "magic",
    icon: Sparkles,
    gradient: "from-violet-400 to-fuchsia-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    ring: "ring-violet-400",
    en: "Magic",
    he: "קסמים",
    yi: "כּישוף"
  },
  {
    id: "friendship",
    icon: Heart,
    gradient: "from-rose-400 to-pink-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    ring: "ring-rose-400",
    en: "Friendship",
    he: "חברות",
    yi: "פֿרײַנדשאַפֿט"
  },
  {
    id: "music",
    icon: Music,
    gradient: "from-fuchsia-400 to-purple-500",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    ring: "ring-fuchsia-400",
    en: "Music",
    he: "מוזיקה",
    yi: "מוזיק"
  },
  {
    id: "art",
    icon: Palette,
    gradient: "from-orange-400 to-red-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    ring: "ring-orange-400",
    en: "Art",
    he: "אמנות",
    yi: "קונסט"
  },
  {
    id: "travel",
    icon: Globe,
    gradient: "from-sky-400 to-blue-500",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    ring: "ring-sky-400",
    en: "Travel",
    he: "טיולים",
    yi: "רײַזן"
  }
];

/**
 * Fun "Surprise Me!" twist phrases per topic.
 * Combined with the topic name to create a creative custom idea.
 */
const SURPRISE_TWISTS = {
  en: [
    "who discovers they can talk to clouds",
    "on a mission to find the world's tastiest cookie",
    "who accidentally shrinks to the size of an ant",
    "that can travel through rainbows",
    "who builds a rocket out of cardboard boxes",
    "that befriends a tiny invisible dragon",
    "who discovers a secret library under the sea",
    "on a quest to collect every color of the sunset"
  ],
  he: [
    "שמגלה שהוא יכול לדבר עם העננים",
    "במשימה למצוא את העוגייה הטעימה בעולם",
    "שמתכווץ בטעות לגודל של נמלה",
    "שיכול לנסוע דרך קשתות",
    "שבונה רקטה מקרטון",
    "שמתיידד עם דרקון קטנטן בלתי נראה",
    "שמגלה ספרייה סודית מתחת לים",
    "במסע לאסוף כל צבעי השקיעה"
  ],
  yi: [
    "וואָס ענטדעקט אַז ער קען רעדן מיט וואָלקנס",
    "אויף אַ מיסיע צו געפֿינען דעם טעמסטן קיכל אין דער וועלט",
    "וואָס שרומפּט אַראָפּ צו דער גרייס פֿון אַן אַמייז",
    "וואָס קען רײַזן דורך רעגנבויגנס",
    "וואָס בויט אַ ראַקעטע פֿון קאַרטאָן",
    "וואָס ווערט אַ פֿרײַנד מיט אַ קליין אומזעיִקן דראַקאָן",
    "וואָס ענטדעקט אַ סודותדיקע ביבליאָטעק אונטער ים",
    "אויף אַ קוועסט צו זאַמלען אַלע פֿאַרבן פֿון שקיעה"
  ]
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

const surpriseRevealVariants = {
  initial: { scale: 0.5, rotate: -15, opacity: 0 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 15 }
  },
  exit: { scale: 0.5, rotate: 15, opacity: 0, transition: { duration: 0.15 } }
};

function getTopicLabel(topic, language) {
  if (language === "hebrew") return topic.he;
  if (language === "yiddish") return topic.yi || topic.en;
  return topic.en;
}

function getSurpriseButtonLabel(language) {
  if (language === "hebrew") return "הפתע אותי!";
  if (language === "yiddish") return "אַ השתּאות!";
  return "Surprise Me!";
}

/**
 * TopicStep - Step 1 of the wizard: Choose a story topic.
 * Displays visual topic cards, "I have my own idea" text input,
 * "Use Saved Idea" toggle, and a "Surprise Me!" button.
 */
export default function TopicStep({ selectedTopic, onSelectTopic, customIdea, onCustomIdeaChange, isRTL, language }) {
  const isHebrew = language === "hebrew";
  const isYiddish = language === "yiddish";
  const [showCustomIdea, setShowCustomIdea] = useState(!!customIdea);
  const [showSavedIdeas, setShowSavedIdeas] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [surprisedTopicId, setSurprisedTopicId] = useState(null);

  useEffect(() => {
    if (showSavedIdeas && savedIdeas.length === 0) {
      loadSavedIdeas();
    }
  }, [showSavedIdeas]);

  const loadSavedIdeas = async () => {
    try {
      setIsLoadingIdeas(true);
      const ideas = await StoryIdea.list("-created_date", 10);
      setSavedIdeas(ideas);
    } catch {
      // silently handled
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const handleSelectCustomIdea = () => {
    setShowCustomIdea(true);
    setShowSavedIdeas(false);
    onSelectTopic("custom");
  };

  const handleSelectSavedIdea = (idea) => {
    if (onCustomIdeaChange) {
      onCustomIdeaChange(idea.description || idea.title);
    }
    onSelectTopic("custom");
    setShowSavedIdeas(false);
    setShowCustomIdea(true);
  };

  const handleSurpriseMe = () => {
    // Pick a random topic from TOPIC_CARDS
    const randomTopic = TOPIC_CARDS[Math.floor(Math.random() * TOPIC_CARDS.length)];
    // Pick a random twist
    const twistList = isYiddish
      ? SURPRISE_TWISTS.yi
      : isHebrew
      ? SURPRISE_TWISTS.he
      : SURPRISE_TWISTS.en;
    const randomTwist = twistList[Math.floor(Math.random() * twistList.length)];
    const topicLabel = getTopicLabel(randomTopic, language);

    // Build the creative idea text
    let ideaText;
    if (isHebrew) {
      ideaText = `סיפור על ${topicLabel} ${randomTwist}`;
    } else if (isYiddish) {
      ideaText = `אַ מעשׂה וועגן ${topicLabel} ${randomTwist}`;
    } else {
      ideaText = `A story about ${topicLabel.toLowerCase()} ${randomTwist}`;
    }

    // Animate: briefly mark the surprised topic
    setSurprisedTopicId(randomTopic.id);
    setTimeout(() => setSurprisedTopicId(null), 800);

    // Auto-fill topic + custom idea
    onSelectTopic("custom");
    if (onCustomIdeaChange) onCustomIdeaChange(ideaText);
    setShowCustomIdea(true);
    setShowSavedIdeas(false);
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isHebrew ? "על מה יהיה הסיפור?" : isYiddish ? "וועגן וואָס וועט די מעשׂה זײַן?" : "What's the story about?"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {isHebrew ? "בחר נושא שמעניין אותך" : isYiddish ? "קלײַב אַ טעמע וואָס אינטערעסירט דיך" : "Pick a topic you love"}
        </p>
      </div>

      {/* Surprise Me! Button — prominent, placed before the grid */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleSurpriseMe}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={getSurpriseButtonLabel(language)}
          className="
            flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-base
            bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500
            text-white shadow-lg hover:shadow-xl
            transition-all duration-200
          "
        >
          <Shuffle className="h-5 w-5" aria-hidden="true" />
          {getSurpriseButtonLabel(language)}
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </motion.button>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        role="radiogroup"
        aria-label={isHebrew ? "בחר נושא" : "Choose topic"}
      >
        {TOPIC_CARDS.map((topic, index) => {
          const Icon = topic.icon;
          const isSelected = selectedTopic === topic.id || (selectedTopic === "custom" && surprisedTopicId === topic.id);
          const isSurprised = surprisedTopicId === topic.id;

          return (
            <motion.button
              key={topic.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowCustomIdea(false);
                setSurprisedTopicId(null);
                onSelectTopic(topic.id);
              }}
              role="radio"
              aria-checked={selectedTopic === topic.id}
              aria-label={getTopicLabel(topic, language)}
              className={`
                flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl
                transition-all duration-200 cursor-pointer min-h-[120px] md:min-h-[140px]
                ${topic.bg}
                ${isSelected
                  ? `ring-2 ${topic.ring} shadow-lg`
                  : "hover:shadow-md border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                }
              `}
            >
              <AnimatePresence mode="wait">
                {isSurprised ? (
                  <motion.div
                    key="surprised"
                    variants={surpriseRevealVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${topic.gradient} flex items-center justify-center mb-3`}
                  >
                    <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" aria-hidden="true" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="normal"
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${topic.gradient} flex items-center justify-center mb-3`}
                  >
                    <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" aria-hidden="true" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">
                {getTopicLabel(topic, language)}
              </span>

              {selectedTopic === topic.id && !surprisedTopicId && (
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

        {/* "I have my own idea" card */}
        <motion.button
          custom={TOPIC_CARDS.length}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSelectCustomIdea}
          role="radio"
          aria-checked={selectedTopic === "custom"}
          aria-label={isHebrew ? "יש לי רעיון משלי" : isYiddish ? "איך האָב מײַן אייגענעם רעיון" : "I have my own idea"}
          className={`
            flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl
            transition-all duration-200 cursor-pointer min-h-[120px] md:min-h-[140px]
            bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800
            ${selectedTopic === "custom"
              ? "ring-2 ring-purple-500 shadow-lg"
              : "hover:shadow-md border border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400"
            }
          `}
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-3">
            <PenLine className="h-6 w-6 md:h-7 md:w-7 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">
            {isHebrew ? "רעיון משלי" : isYiddish ? "מײַן רעיון" : "My Own Idea"}
          </span>
          {selectedTopic === "custom" && !surprisedTopicId && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-1 w-2 h-2 rounded-full bg-purple-600"
              aria-hidden="true"
            />
          )}
        </motion.button>
      </div>

      {/* Custom idea text input */}
      <AnimatePresence>
        {showCustomIdea && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                {isHebrew ? "ספר לנו על הרעיון שלך:" : isYiddish ? "דערציי אונדז וועגן דײַן רעיון:" : "Tell us about your idea:"}
              </label>
              <Textarea
                value={customIdea || ""}
                onChange={(e) => onCustomIdeaChange?.(e.target.value)}
                placeholder={isHebrew
                  ? "למשל: סיפור על דרקון ידידותי שלומד לבשל..."
                  : isYiddish
                  ? "פֿאַרביישפּיל: אַ מעשׂה וועגן אַ פֿרײַנדלעכן דראַקאָן..."
                  : "e.g., A story about a friendly dragon who learns to cook..."
                }
                dir={isRTL ? "rtl" : "ltr"}
                rows={3}
                maxLength={500}
                className="resize-none bg-white dark:bg-gray-900"
                aria-label={isHebrew ? "תיאור הרעיון שלך" : "Describe your idea"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Use Saved Idea" toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => setShowSavedIdeas(!showSavedIdeas)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 gap-2"
          aria-expanded={showSavedIdeas}
        >
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
          {isHebrew ? "השתמש ברעיון שמור" : isYiddish ? "נוץ אַ געשפּאָרטן רעיון" : "Use Saved Idea"}
        </Button>
      </div>

      {/* Saved ideas list */}
      <AnimatePresence>
        {showSavedIdeas && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {isHebrew ? "הרעיונות השמורים שלך:" : "Your saved ideas:"}
              </h3>
              {isLoadingIdeas ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                </div>
              ) : savedIdeas.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">
                  {isHebrew ? "אין רעיונות שמורים עדיין" : "No saved ideas yet"}
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedIdeas.map((idea) => (
                    <motion.button
                      key={idea.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectSavedIdea(idea)}
                      className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {idea.title}
                      </p>
                      {idea.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {idea.description}
                        </p>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { TOPIC_CARDS };
