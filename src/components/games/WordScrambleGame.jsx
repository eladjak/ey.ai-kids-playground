import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Star,
  Trophy,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  playSound,
  calculateStars,
  calculateXP,
  shuffle,
  GAME_PHASES,
  DIFFICULTY_LEVELS,
} from "./gameUtils";

// Hebrew words for scramble - organized by difficulty
const WORD_POOLS = {
  easy: [
    { word: "ילד", hint: "בן קטן" },
    { word: "בית", hint: "מקום לגור בו" },
    { word: "שמש", hint: "מאירה ביום" },
    { word: "ספר", hint: "קוראים אותו" },
    { word: "כלב", hint: "חיית מחמד נאמנה" },
    { word: "חתול", hint: "חיית מחמד שמיילת" },
    { word: "פרח", hint: "גדל בגינה" },
    { word: "מים", hint: "שותים כשצמאים" },
    { word: "עץ", hint: "גבוה ועם עלים" },
    { word: "דג", hint: "שוחה במים" },
  ],
  medium: [
    { word: "ארנב", hint: "קופץ ואוכל גזר" },
    { word: "ירח", hint: "נראה בלילה" },
    { word: "כוכב", hint: "מנצנץ בשמיים" },
    { word: "גשם", hint: "יורד מהעננים" },
    { word: "שלג", hint: "לבן וקר" },
    { word: "תפוח", hint: "פרי אדום או ירוק" },
    { word: "ציפור", hint: "עפה בשמיים" },
    { word: "חלון", hint: "רואים דרכו החוצה" },
    { word: "שולחן", hint: "אוכלים עליו" },
    { word: "מטוס", hint: "טס בשמיים" },
    { word: "רכבת", hint: "נוסעת על פסים" },
    { word: "פרפר", hint: "חרק עם כנפיים צבעוניות" },
  ],
  hard: [
    { word: "מחשב", hint: "עובדים ומשחקים עליו" },
    { word: "ספרייה", hint: "מקום עם הרבה ספרים" },
    { word: "אוניברסיטה", hint: "מקום ללמוד אחרי בית ספר" },
    { word: "פלאפון", hint: "מכשיר לדבר ולשלוח הודעות" },
    { word: "מקרר", hint: "שומר על האוכל קר" },
    { word: "טלוויזיה", hint: "צופים בה בתוכניות" },
    { word: "דינוזאור", hint: "חיה ענקית שנכחדה" },
    { word: "אסטרונאוט", hint: "טס לחלל" },
    { word: "שוקולד", hint: "ממתק חום ומתוק" },
    { word: "גלידה", hint: "קינוח קר ומתוק" },
  ],
};

/**
 * WordScrambleGame - Arrange scrambled Hebrew letters to form words.
 * Child-friendly educational game for ages 4-10.
 */
export default function WordScrambleGame({ onBack }) {
  const [phase, setPhase] = useState(GAME_PHASES.MENU);
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [hintUsed, setHintUsed] = useState(false);

  const startGame = useCallback((diff) => {
    const diffConfig = DIFFICULTY_LEVELS[diff];
    const pool = WORD_POOLS[diffConfig.value];
    const gameWords = shuffle(pool).slice(0, diffConfig.rounds);

    setDifficulty(diff);
    setTotalRounds(diffConfig.rounds);
    setWords(gameWords);
    setRound(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setPhase(GAME_PHASES.PLAYING);
    playSound("gameStart");

    // Set up first word
    setupWord(gameWords[0]);
  }, []);

  const setupWord = (wordObj) => {
    setCurrentWord(wordObj);
    setShowHint(false);
    setHintUsed(false);
    setFeedback(null);
    setSelectedLetters([]);

    // Scramble the letters, making sure it's different from the original
    const letters = wordObj.word.split("");
    let scrambled = shuffle(letters);
    // If the scramble happens to be the same as the original, shuffle again
    while (scrambled.join("") === wordObj.word && letters.length > 2) {
      scrambled = shuffle(letters);
    }
    setScrambledLetters(
      scrambled.map((letter, idx) => ({ letter, id: `${letter}-${idx}`, used: false }))
    );
  };

  const selectLetter = (letterObj) => {
    if (feedback) return; // Don't allow selection during feedback
    setSelectedLetters((prev) => [...prev, letterObj]);
    setScrambledLetters((prev) =>
      prev.map((l) => (l.id === letterObj.id ? { ...l, used: true } : l))
    );
    playSound("click");
  };

  const removeLetter = (index) => {
    if (feedback) return;
    const removed = selectedLetters[index];
    setSelectedLetters((prev) => prev.filter((_, i) => i !== index));
    setScrambledLetters((prev) =>
      prev.map((l) => (l.id === removed.id ? { ...l, used: false } : l))
    );
  };

  const resetLetters = () => {
    if (feedback) return;
    setSelectedLetters([]);
    setScrambledLetters((prev) => prev.map((l) => ({ ...l, used: false })));
  };

  const checkAnswer = () => {
    const answer = selectedLetters.map((l) => l.letter).join("");
    const isCorrect = answer === currentWord.word;

    if (isCorrect) {
      playSound("correct");
      setFeedback("correct");
      const points = hintUsed ? 5 : 10;
      setScore((prev) => prev + points);
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

    // Move to next word after a short delay
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= totalRounds) {
        setPhase(GAME_PHASES.RESULT);
        playSound("gameOver");
      } else {
        setRound(nextRound);
        setupWord(words[nextRound]);
      }
    }, 1500);
  };

  // Auto-check when all letters are placed
  useEffect(() => {
    if (
      phase === GAME_PHASES.PLAYING &&
      currentWord &&
      selectedLetters.length === currentWord.word.length &&
      !feedback
    ) {
      checkAnswer();
    }
  }, [selectedLetters, phase, currentWord, feedback]);

  const stars = calculateStars(score / 10, totalRounds);
  const xp = calculateXP(score / 10, maxStreak);

  // --- MENU ---
  if (phase === GAME_PHASES.MENU) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl mb-3"
            aria-hidden="true"
          >
            🔤
          </motion.div>
          <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
            סדרו את המילה
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            סדרו את האותיות המבולבלות למילה הנכונה!
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(DIFFICULTY_LEVELS).map(([key, diff]) => (
            <Button
              key={key}
              onClick={() => startGame(key)}
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-l from-emerald-400 to-teal-500 text-white hover:opacity-90 transition-opacity"
              aria-label={`${diff.label} - ${diff.rounds} סיבובים`}
            >
              {diff.label} ({diff.rounds} מילים)
            </Button>
          ))}
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
  if (phase === GAME_PHASES.PLAYING && currentWord) {
    return (
      <div className="space-y-6" dir="rtl">
        {/* Header: round + score + streak */}
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {round + 1} / {totalRounds}
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

        {/* Hint section */}
        <Card className="border-2 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">רמז:</p>
            {showHint ? (
              <p className="text-lg font-medium text-emerald-700 dark:text-emerald-300" aria-live="polite">
                {currentWord.hint}
              </p>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowHint(true);
                  setHintUsed(true);
                }}
                aria-label="הצג רמז (מפחית ניקוד)"
              >
                <Sparkles className="w-4 h-4 ml-1" aria-hidden="true" />
                הצג רמז (-5 נק')
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Selected letters (answer area) */}
        <div className="min-h-[60px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-3 flex justify-center items-center gap-2 flex-wrap">
          {selectedLetters.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">לחצו על האותיות למטה</p>
          ) : (
            selectedLetters.map((letterObj, idx) => (
              <motion.button
                key={`selected-${letterObj.id}-${idx}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-2xl font-bold flex items-center justify-center cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                onClick={() => removeLetter(idx)}
                aria-label={`הסר אות ${letterObj.letter}`}
              >
                {letterObj.letter}
              </motion.button>
            ))
          )}
        </div>

        {/* Scrambled letters (available) */}
        <div
          className="flex justify-center items-center gap-2 flex-wrap"
          role="group"
          aria-label="אותיות זמינות"
        >
          {scrambledLetters.map((letterObj) => (
            <motion.button
              key={letterObj.id}
              whileHover={!letterObj.used ? { scale: 1.1 } : {}}
              whileTap={!letterObj.used ? { scale: 0.95 } : {}}
              className={`w-14 h-14 rounded-xl text-2xl font-bold flex items-center justify-center transition-all ${
                letterObj.used
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-default"
                  : "bg-gradient-to-br from-blue-400 to-indigo-500 text-white cursor-pointer shadow-lg hover:shadow-xl"
              }`}
              onClick={() => !letterObj.used && selectLetter(letterObj)}
              disabled={letterObj.used}
              aria-label={letterObj.used ? `${letterObj.letter} (כבר נבחרה)` : `בחר אות ${letterObj.letter}`}
              aria-pressed={letterObj.used}
            >
              {letterObj.letter}
            </motion.button>
          ))}
        </div>

        {/* Reset button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={resetLetters}
            disabled={selectedLetters.length === 0 || !!feedback}
            aria-label="אפס בחירה"
          >
            <RotateCcw className="w-4 h-4 ml-1" aria-hidden="true" />
            נסו שוב
          </Button>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`text-center p-4 rounded-xl ${
                feedback === "correct"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              }`}
              role="alert"
              aria-live="assertive"
            >
              <p className="text-2xl font-bold">
                {feedback === "correct" ? "כל הכבוד! 🎉" : `התשובה: ${currentWord.word}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- RESULT ---
  if (phase === GAME_PHASES.RESULT) {
    const correctCount = Math.round(score / 10);
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
          !סיימתם
        </h2>

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
            ניקוד: <span className="font-bold text-emerald-600">{score}</span>
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
            className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-l from-emerald-400 to-teal-500 text-white"
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
