import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Trophy,
  ArrowRight,
  RotateCcw,
  Zap,
  BookOpen,
} from "lucide-react";
import {
  playSound,
  calculateStars,
  calculateXP,
  shuffle,
  GAME_PHASES,
  DIFFICULTY_LEVELS,
} from "./gameUtils";

// Story templates with blanks and answer options
const STORY_TEMPLATES = {
  easy: [
    {
      text: "הילד הלך ל_____ ושם ראה _____ גדול.",
      blanks: [
        { answer: "גן", options: ["גן", "שולחן", "כוכב"] },
        { answer: "עץ", options: ["עץ", "דג", "עט"] },
      ],
    },
    {
      text: "ה_____ שחה ב_____ הכחול.",
      blanks: [
        { answer: "דג", options: ["דג", "ספר", "כיסא"] },
        { answer: "ים", options: ["ים", "שמיים", "קיר"] },
      ],
    },
    {
      text: "אמא הכינה _____ טעים ושתינו _____.",
      blanks: [
        { answer: "אוכל", options: ["אוכל", "שיר", "ציור"] },
        { answer: "מיץ", options: ["מיץ", "אבן", "ענן"] },
      ],
    },
    {
      text: "ה_____ נבח בשמחה כשראה את ה_____.",
      blanks: [
        { answer: "כלב", options: ["כלב", "עץ", "ספר"] },
        { answer: "ילד", options: ["ילד", "גשם", "שלג"] },
      ],
    },
    {
      text: "בלילה ה_____ זורח ו_____ מנצנצים.",
      blanks: [
        { answer: "ירח", options: ["ירח", "שמש", "גשם"] },
        { answer: "כוכבים", options: ["כוכבים", "פרחים", "עצים"] },
      ],
    },
  ],
  medium: [
    {
      text: "הנסיכה גרה ב_____ גבוה. יום אחד היא מצאה _____ קסום שיכול _____.",
      blanks: [
        { answer: "מגדל", options: ["מגדל", "חנות", "מטבח", "מערה"] },
        { answer: "ספר", options: ["ספר", "אבן", "כלב", "כובע"] },
        { answer: "לדבר", options: ["לדבר", "לרוץ", "לישון", "לאכול"] },
      ],
    },
    {
      text: "ה_____ הקטן רצה לטוס ל_____. הוא בנה _____ מנייר.",
      blanks: [
        { answer: "ילד", options: ["ילד", "דג", "אבן", "שולחן"] },
        { answer: "ירח", options: ["ירח", "בית", "גן", "חנות"] },
        { answer: "מטוס", options: ["מטוס", "כיסא", "שולחן", "ספר"] },
      ],
    },
    {
      text: "הארנב ה_____ קפץ מעל ה_____. הוא חיפש _____ לאכול.",
      blanks: [
        { answer: "לבן", options: ["לבן", "כבד", "חם", "רטוב"] },
        { answer: "גדר", options: ["גדר", "שמש", "מים", "אש"] },
        { answer: "גזר", options: ["גזר", "אבן", "כוכב", "ענן"] },
      ],
    },
    {
      text: "בגן החיות ראינו _____ ענק, _____ צבעוני ו_____ חמוד.",
      blanks: [
        { answer: "פיל", options: ["פיל", "עט", "כוס", "דף"] },
        { answer: "תוכי", options: ["תוכי", "שולחן", "ספר", "כובע"] },
        { answer: "פנדה", options: ["פנדה", "אבן", "ענן", "כיסא"] },
      ],
    },
  ],
  hard: [
    {
      text: "האסטרונאוט _____ לחלל בטיל _____. הוא ראה כוכבי _____ מדהימים וגילה כוכב לכת _____ שאף אחד לא _____ לפניו.",
      blanks: [
        { answer: "טס", options: ["טס", "שחה", "רקד", "ישן"] },
        { answer: "ענק", options: ["ענק", "קטן", "ישן", "שקט"] },
        { answer: "לכת", options: ["לכת", "ים", "הר", "גן"] },
        { answer: "חדש", options: ["חדש", "ישן", "קר", "חם"] },
        { answer: "ראה", options: ["ראה", "אכל", "שר", "ישן"] },
      ],
    },
    {
      text: "המדען ה_____ המציא מכונה שיכולה _____. כל ה_____ בעיר באו לראות את ההמצאה ה_____ שלו.",
      blanks: [
        { answer: "חכם", options: ["חכם", "עצלן", "רעב", "עייף"] },
        { answer: "לעוף", options: ["לעוף", "לישון", "לבכות", "לשכוח"] },
        { answer: "ילדים", options: ["ילדים", "עצים", "אבנים", "ענניים"] },
        { answer: "מיוחדת", options: ["מיוחדת", "משעממת", "רגילה", "ישנה"] },
      ],
    },
    {
      text: "פעם הייתה _____ אמיצה שיצאה ל_____. היא חצתה _____ עמוק, טיפסה על _____ גבוה ובסוף מצאה את ה_____ האבוד.",
      blanks: [
        { answer: "ילדה", options: ["ילדה", "אבן", "שולחן", "מנורה"] },
        { answer: "הרפתקה", options: ["הרפתקה", "ארוחה", "תנומה", "שיעור"] },
        { answer: "נהר", options: ["נהר", "ספר", "כלי", "כובע"] },
        { answer: "הר", options: ["הר", "כיסא", "דף", "עט"] },
        { answer: "אוצר", options: ["אוצר", "עיפרון", "מחק", "מספר"] },
      ],
    },
  ],
};

/**
 * StoryCompletionGame - Fill in the blanks in a story.
 * Child-friendly educational game for ages 4-10.
 */
export default function StoryCompletionGame({ onBack }) {
  const [phase, setPhase] = useState(GAME_PHASES.MENU);
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [stories, setStories] = useState([]);
  const [currentStory, setCurrentStory] = useState(null);
  const [currentBlankIdx, setCurrentBlankIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [storyComplete, setStoryComplete] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  const startGame = useCallback((diff) => {
    const diffConfig = DIFFICULTY_LEVELS[diff];
    const pool = STORY_TEMPLATES[diffConfig.value];
    const roundCount = Math.min(diffConfig.rounds, pool.length);
    const gameStories = shuffle(pool).slice(0, roundCount);

    setDifficulty(diff);
    setTotalRounds(roundCount);
    setStories(gameStories);
    setRound(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setPhase(GAME_PHASES.PLAYING);
    playSound("gameStart");

    setupStory(gameStories[0]);
  }, []);

  const setupStory = (story) => {
    setCurrentStory(story);
    setCurrentBlankIdx(0);
    setAnswers([]);
    setFeedback(null);
    setStoryComplete(false);
    setShuffledOptions(shuffle(story.blanks[0].options));
  };

  const selectAnswer = (answer, blankIdx) => {
    if (feedback || storyComplete) return;

    const isCorrect = answer === currentStory.blanks[blankIdx].answer;

    if (isCorrect) {
      playSound("correct");
      setFeedback("correct");
      setScore((prev) => prev + 10);
      setStreak((prev) => {
        const newStreak = prev + 1;
        setMaxStreak((max) => Math.max(max, newStreak));
        return newStreak;
      });
    } else {
      playSound("wrong");
      setFeedback("wrong");
      setStreak(0);
    }

    // Store the answer (correct or not, we move on)
    const newAnswers = [...answers, { blank: blankIdx, selected: answer, correct: isCorrect }];
    setAnswers(newAnswers);

    // After a delay, move to next blank or finish story
    setTimeout(() => {
      setFeedback(null);
      const nextBlank = blankIdx + 1;
      if (nextBlank >= currentStory.blanks.length) {
        // Story complete, move to next story or results
        setStoryComplete(true);
        setTimeout(() => {
          const nextRound = round + 1;
          if (nextRound >= totalRounds) {
            setPhase(GAME_PHASES.RESULT);
            playSound("gameOver");
          } else {
            setRound(nextRound);
            setupStory(stories[nextRound]);
          }
        }, 2000);
      } else {
        setCurrentBlankIdx(nextBlank);
        setShuffledOptions(shuffle(currentStory.blanks[nextBlank].options));
      }
    }, 1000);
  };

  const renderStoryText = () => {
    if (!currentStory) return null;
    const parts = currentStory.text.split("_____");
    return (
      <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-200">
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            <span>{part}</span>
            {idx < parts.length - 1 && (
              <span
                className={`inline-block min-w-[60px] border-b-2 px-2 mx-1 font-bold text-center ${
                  answers[idx]
                    ? answers[idx].correct
                      ? "border-green-500 text-green-600 dark:text-green-400"
                      : "border-red-500 text-red-600 dark:text-red-400"
                    : idx === currentBlankIdx
                    ? "border-purple-500 text-purple-600 animate-pulse"
                    : "border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
              >
                {answers[idx]
                  ? answers[idx].correct
                    ? answers[idx].selected
                    : `${currentStory.blanks[idx].answer}`
                  : idx === currentBlankIdx
                  ? "?"
                  : "___"}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
    );
  };

  const stars = calculateStars(score / 10, stories.reduce((sum, s) => sum + s.blanks.length, 0) || 1);
  const totalBlanks = stories.reduce((sum, s) => sum + s.blanks.length, 0);
  const xp = calculateXP(score / 10, maxStreak);

  // --- MENU ---
  if (phase === GAME_PHASES.MENU) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl mb-3"
            aria-hidden="true"
          >
            📖
          </motion.div>
          <h2 className="text-3xl font-bold text-orange-700 dark:text-orange-300">
            השלימו את הסיפור
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            מלאו את המילים החסרות בסיפור!
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(DIFFICULTY_LEVELS).map(([key, diff]) => {
            const pool = STORY_TEMPLATES[diff.value];
            const count = Math.min(diff.rounds, pool.length);
            return (
              <Button
                key={key}
                onClick={() => startGame(key)}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-l from-orange-400 to-amber-500 text-white hover:opacity-90 transition-opacity"
                aria-label={`${diff.label} - ${count} סיפורים`}
              >
                {diff.label} ({count} סיפורים)
              </Button>
            );
          })}
        </div>

        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full mt-4"
            aria-label="חזרה למשחקים"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזרה למשחקים
          </Button>
        )}
      </div>
    );
  }

  // --- PLAYING ---
  if (phase === GAME_PHASES.PLAYING && currentStory) {
    return (
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-sm px-3 py-1">
            סיפור {round + 1} / {totalRounds}
          </Badge>
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200 gap-1">
                <Zap className="w-3 h-3" aria-hidden="true" />
                {streak}
              </Badge>
            )}
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 gap-1">
              <Star className="w-3 h-3" aria-hidden="true" />
              {score}
            </Badge>
          </div>
        </div>

        {/* Story text */}
        <Card className="border-2 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
              <div aria-live="polite">
                {renderStoryText()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer options for current blank */}
        {!storyComplete && currentBlankIdx < currentStory.blanks.length && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              בחרו את המילה המתאימה:
            </p>
            <div
              className="grid grid-cols-2 gap-3"
              role="group"
              aria-label="אפשרויות תשובה"
            >
              {shuffledOptions.map((option) => (
                <motion.div key={option} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={() => selectAnswer(option, currentBlankIdx)}
                    disabled={!!feedback}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white hover:opacity-90 disabled:opacity-50"
                    aria-label={`בחר: ${option}`}
                  >
                    {option}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Story complete message */}
        {storyComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            role="alert"
          >
            <p className="text-xl font-bold">הסיפור הושלם! ✨</p>
          </motion.div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`text-center p-3 rounded-xl ${
                feedback === "correct"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              }`}
              role="alert"
              aria-live="assertive"
            >
              <p className="text-lg font-bold">
                {feedback === "correct" ? "!נכון" : "לא נכון, המילה הנכונה תופיע בסיפור"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- RESULT ---
  if (phase === GAME_PHASES.RESULT) {
    return (
      <div className="space-y-6 text-center" dir="rtl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          !כל הכבוד
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          השלמתם {totalRounds} סיפורים!
        </p>

        <div className="flex justify-center gap-2" aria-label={`${stars} כוכבים`}>
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: s * 0.2 }}
            >
              <Star
                className={`w-10 h-10 ${
                  s <= stars
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            ניקוד: <span className="font-bold text-orange-600">{score}</span>
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            רצף מקסימלי: <span className="font-bold text-orange-600">{maxStreak}</span>
          </p>
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 text-lg px-4 py-1">
            +{xp} XP
          </Badge>
        </div>

        <div className="space-y-3 pt-4">
          <Button
            onClick={() => startGame(difficulty)}
            className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-l from-orange-400 to-amber-500 text-white"
            aria-label="שחקו שוב"
          >
            <RotateCcw className="w-5 h-5 ml-2" aria-hidden="true" />
            שחקו שוב
          </Button>
          <Button
            variant="outline"
            onClick={() => setPhase(GAME_PHASES.MENU)}
            className="w-full"
            aria-label="בחירת רמה אחרת"
          >
            שנו רמה
          </Button>
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full"
              aria-label="חזרה למשחקים"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה למשחקים
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
