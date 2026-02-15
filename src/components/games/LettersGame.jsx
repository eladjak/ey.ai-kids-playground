import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Star,
  RotateCcw,
  ArrowRight,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  playSound,
  calculateStars,
  calculateXP,
  shuffle,
  HEBREW_LETTERS,
  GAME_PHASES,
  DIFFICULTY_LEVELS,
} from "./gameUtils";

// ---- Question Generator ----

function generateLetterQuestion(difficulty) {
  const availableLetters =
    difficulty === "easy"
      ? HEBREW_LETTERS.slice(0, 8) // first 8 letters for easy
      : difficulty === "medium"
        ? HEBREW_LETTERS.slice(0, 15)
        : HEBREW_LETTERS;

  // Pick a target letter
  const targetIdx = Math.floor(Math.random() * availableLetters.length);
  const target = availableLetters[targetIdx];

  // Pick 3 wrong letters (different from target)
  const wrongLetters = [];
  const usedIndices = new Set([targetIdx]);
  while (wrongLetters.length < 3) {
    const idx = Math.floor(Math.random() * availableLetters.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      wrongLetters.push(availableLetters[idx]);
    }
  }

  // Randomly choose question type
  const questionTypes =
    difficulty === "easy"
      ? ["findLetter"] // Easy: just match letter to name
      : ["findLetter", "findName"]; // Medium/Hard: both directions

  const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  if (type === "findLetter") {
    // Show name, find the letter
    return {
      type: "findLetter",
      prompt: target.name,
      correctAnswer: target.letter,
      options: shuffle([
        target.letter,
        ...wrongLetters.map((l) => l.letter),
      ]),
      target,
    };
  }

  // Show letter, find the name
  return {
    type: "findName",
    prompt: target.letter,
    correctAnswer: target.name,
    options: shuffle([target.name, ...wrongLetters.map((l) => l.name)]),
    target,
  };
}

// ---- Background Colors for Letters ----
const LETTER_BG_COLORS = [
  "from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950",
  "from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950",
  "from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950",
  "from-purple-100 to-violet-100 dark:from-purple-950 dark:to-violet-950",
  "from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950",
  "from-teal-100 to-sky-100 dark:from-teal-950 dark:to-sky-950",
];

export default function LettersGame({ onBack }) {
  const [phase, setPhase] = useState(GAME_PHASES.MENU);
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [bgColor, setBgColor] = useState(LETTER_BG_COLORS[0]);

  const startGame = useCallback((diff) => {
    const config = Object.values(DIFFICULTY_LEVELS).find(
      (d) => d.value === diff
    );
    setDifficulty(diff);
    setTotalRounds(config.rounds);
    setRound(1);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setQuestion(generateLetterQuestion(diff));
    setBgColor(
      LETTER_BG_COLORS[Math.floor(Math.random() * LETTER_BG_COLORS.length)]
    );
    setPhase(GAME_PHASES.PLAYING);
    playSound("gameStart");
  }, []);

  const handleAnswer = useCallback(
    (selected) => {
      if (feedback) return;

      const isCorrect = selected === question?.correctAnswer;
      setSelectedAnswer(selected);

      if (isCorrect) {
        setScore((prev) => prev + 1);
        setStreak((prev) => {
          const newStreak = prev + 1;
          setMaxStreak((max) => Math.max(max, newStreak));
          return newStreak;
        });
        setFeedback("correct");
        playSound("correct");
      } else {
        setStreak(0);
        setFeedback("wrong");
        playSound("wrong");
      }

      setTimeout(() => {
        if (round >= totalRounds) {
          setPhase(GAME_PHASES.RESULT);
          playSound("gameOver");
        } else {
          setRound((prev) => prev + 1);
          setQuestion(generateLetterQuestion(difficulty));
          setFeedback(null);
          setSelectedAnswer(null);
          setBgColor(
            LETTER_BG_COLORS[
              Math.floor(Math.random() * LETTER_BG_COLORS.length)
            ]
          );
        }
      }, 1200);
    },
    [feedback, question, round, totalRounds, difficulty]
  );

  const stars = calculateStars(score, totalRounds);
  const xp = calculateXP(score, maxStreak);

  // ---- Render: Menu ----
  if (phase === GAME_PHASES.MENU) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 p-6"
        dir="rtl"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <BookOpen className="w-20 h-20 text-purple-500" />
        </motion.div>

        <h2 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
          אותיות בעברית
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md">
          למדו את האותיות בעברית! התאימו את האות לשם שלה
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {Object.values(DIFFICULTY_LEVELS).map((level) => (
            <Button
              key={level.value}
              onClick={() => startGame(level.value)}
              className="h-16 text-xl font-bold rounded-2xl transition-transform hover:scale-105"
              variant={
                level.value === "easy"
                  ? "default"
                  : level.value === "medium"
                    ? "secondary"
                    : "outline"
              }
              aria-label={`רמת קושי ${level.label} - ${level.rounds} שאלות`}
            >
              <span className="flex items-center gap-2">
                {level.value === "easy" && "🌟"}
                {level.value === "medium" && "⚡"}
                {level.value === "hard" && "🔥"}
                {level.label}
                <span className="text-sm font-normal opacity-70">
                  ({level.rounds} שאלות)
                </span>
              </span>
            </Button>
          ))}
        </div>

        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mt-4 text-gray-500"
            aria-label="חזרה לתפריט המשחקים"
          >
            חזרה לתפריט המשחקים
          </Button>
        )}
      </motion.div>
    );
  }

  // ---- Render: Playing ----
  if (phase === GAME_PHASES.PLAYING && question) {
    const isLetterPrompt = question.type === "findName"; // big letter shown

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 p-4 w-full max-w-lg mx-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <Badge variant="outline" className="text-base px-4 py-1">
            שאלה {round} מתוך {totalRounds}
          </Badge>
          <div className="flex items-center gap-2">
            {streak >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-orange-500"
              >
                <Zap className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-bold">{streak}x</span>
              </motion.div>
            )}
            <Badge className="text-base px-4 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <Star className="w-4 h-4 inline ml-1" aria-hidden="true" />
              {score}
            </Badge>
          </div>
        </div>

        <Progress
          value={(round / totalRounds) * 100}
          className="w-full h-3"
          aria-label={`התקדמות: שאלה ${round} מתוך ${totalRounds}`}
        />

        {/* Question prompt */}
        <Card
          className={`w-full bg-gradient-to-br ${bgColor} border-2 border-purple-200 dark:border-purple-800`}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              {isLetterPrompt
                ? "מה השם של האות הזו?"
                : "איזו אות זו?"}
            </p>
            <motion.div
              key={`${round}-prompt`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className={
                isLetterPrompt
                  ? "text-8xl md:text-9xl font-bold text-purple-700 dark:text-purple-300"
                  : "text-4xl md:text-5xl font-bold text-purple-700 dark:text-purple-300"
              }
              aria-live="polite"
              role="heading"
              aria-level={3}
            >
              {question.prompt}
            </motion.div>
          </CardContent>
        </Card>

        {/* Answer Options */}
        <div
          className={`grid ${isLetterPrompt ? "grid-cols-2" : "grid-cols-2"} gap-3 w-full`}
          role="group"
          aria-label="אפשרויות תשובה"
        >
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === question.correctAnswer;
            let btnClass =
              "h-20 font-bold rounded-2xl transition-all border-2 ";

            const textSize = isLetterPrompt ? "text-2xl" : "text-5xl";

            if (feedback) {
              if (isCorrectAnswer) {
                btnClass +=
                  "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200";
              } else if (isSelected && !isCorrectAnswer) {
                btnClass +=
                  "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200";
              } else {
                btnClass +=
                  "bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700";
              }
            } else {
              btnClass +=
                "bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-400 hover:scale-105 dark:bg-gray-800 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-gray-700";
            }

            return (
              <motion.div
                key={`${round}-${option}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Button
                  className={`${btnClass} ${textSize}`}
                  style={{ width: "100%" }}
                  onClick={() => handleAnswer(option)}
                  disabled={!!feedback}
                  aria-label={`תשובה: ${option}`}
                  aria-pressed={isSelected}
                >
                  {feedback && isCorrectAnswer && (
                    <CheckCircle2
                      className="w-5 h-5 ml-1 text-green-600"
                      aria-hidden="true"
                    />
                  )}
                  {feedback && isSelected && !isCorrectAnswer && (
                    <XCircle
                      className="w-5 h-5 ml-1 text-red-600"
                      aria-hidden="true"
                    />
                  )}
                  {option}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-xl font-bold text-center ${feedback === "correct" ? "text-green-600" : "text-red-500"}`}
              role="alert"
              aria-live="assertive"
            >
              {feedback === "correct"
                ? "מצוין! 🎉"
                : `התשובה הנכונה: ${question.correctAnswer}`}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // ---- Render: Result ----
  if (phase === GAME_PHASES.RESULT) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 p-6"
        dir="rtl"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1, ease: "easeOut" }}
          aria-hidden="true"
        >
          <Trophy className="w-20 h-20 text-yellow-500" />
        </motion.div>

        <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
          כל הכבוד!
        </h2>

        <Card className="w-full max-w-sm bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            {/* Stars */}
            <div className="flex gap-2" aria-label={`${stars} כוכבים`}>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: i <= stars ? 1 : 0.3,
                    scale: i <= stars ? 1 : 0.7,
                  }}
                  transition={{ delay: i * 0.3 }}
                >
                  <Star
                    className={`w-12 h-12 ${i <= stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    aria-hidden="true"
                  />
                </motion.div>
              ))}
            </div>

            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                {score}/{totalRounds}
              </p>
              <p className="text-gray-600 dark:text-gray-400">תשובות נכונות</p>
            </div>

            {maxStreak >= 3 && (
              <Badge className="text-base px-4 py-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                <Zap className="w-4 h-4 inline ml-1" aria-hidden="true" />
                רצף מקסימלי: {maxStreak}
              </Badge>
            )}

            <Badge className="text-lg px-6 py-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              +{xp} XP
            </Badge>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={() => startGame(difficulty)}
            className="h-14 px-8 text-lg font-bold rounded-2xl"
            aria-label="שחקו שוב"
          >
            <RotateCcw className="w-5 h-5 ml-2" aria-hidden="true" />
            שחקו שוב
          </Button>
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="h-14 px-8 text-lg rounded-2xl"
              aria-label="חזרה לתפריט"
            >
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              חזרה
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return null;
}
