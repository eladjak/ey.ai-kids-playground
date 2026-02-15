import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
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
  pickRandom,
  shuffle,
  GAME_PHASES,
  DIFFICULTY_LEVELS,
} from "./gameUtils";

// ---- Question Generator ----

function generateQuestion(difficulty) {
  const ops =
    difficulty === "easy"
      ? ["+"]
      : difficulty === "medium"
        ? ["+", "-"]
        : ["+", "-", "×"];
  const op = pickRandom(ops);

  let a, b, answer;

  switch (op) {
    case "+": {
      const max = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
      a = Math.floor(Math.random() * max) + 1;
      b = Math.floor(Math.random() * max) + 1;
      answer = a + b;
      break;
    }
    case "-": {
      const max = difficulty === "medium" ? 20 : 50;
      a = Math.floor(Math.random() * max) + 1;
      b = Math.floor(Math.random() * a) + 1; // ensure positive result
      answer = a - b;
      break;
    }
    case "×": {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      break;
    }
    default: {
      a = 1;
      b = 1;
      answer = 2;
    }
  }

  // Generate 3 wrong options
  const wrongSet = new Set();
  while (wrongSet.size < 3) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = answer + (offset === 0 ? 1 : offset);
    if (wrong !== answer && wrong >= 0) {
      wrongSet.add(wrong);
    }
  }

  const options = shuffle([answer, ...wrongSet]);

  return { a, b, op, answer, options };
}

// ---- Emoji Helpers ----

const OP_EMOJI = { "+": "➕", "-": "➖", "×": "✖️" };

export default function MathGame({ onBack }) {
  const [phase, setPhase] = useState(GAME_PHASES.MENU);
  const [difficulty, setDifficulty] = useState(null);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const startGame = useCallback(
    (diff) => {
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
      setQuestion(generateQuestion(diff));
      setTimeLeft(config.timeLimit);
      setPhase(GAME_PHASES.PLAYING);
      playSound("gameStart");
    },
    []
  );

  // Timer
  useEffect(() => {
    if (phase !== GAME_PHASES.PLAYING || timeLeft <= 0 || feedback) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Time's up - treat as wrong
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, round, feedback]);

  const handleAnswer = useCallback(
    (selected) => {
      if (feedback) return; // already answered
      clearInterval(timerRef.current);

      const isCorrect = selected === question?.answer;
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

      // Move to next question after delay
      setTimeout(() => {
        if (round >= totalRounds) {
          setPhase(GAME_PHASES.RESULT);
          playSound("gameOver");
        } else {
          const config = Object.values(DIFFICULTY_LEVELS).find(
            (d) => d.value === difficulty
          );
          setRound((prev) => prev + 1);
          setQuestion(generateQuestion(difficulty));
          setFeedback(null);
          setSelectedAnswer(null);
          setTimeLeft(config.timeLimit);
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
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Calculator className="w-20 h-20 text-blue-500" />
        </motion.div>

        <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300">
          משחק חשבון
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md">
          פתרו תרגילים ואספו כוכבים! בחרו רמת קושי:
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
    const config = Object.values(DIFFICULTY_LEVELS).find(
      (d) => d.value === difficulty
    );
    const hasTimer = config.timeLimit > 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 p-4 w-full max-w-lg mx-auto"
        dir="rtl"
      >
        {/* Header: Round & Score */}
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

        {/* Progress bar */}
        <Progress
          value={(round / totalRounds) * 100}
          className="w-full h-3"
          aria-label={`התקדמות: שאלה ${round} מתוך ${totalRounds}`}
        />

        {/* Timer */}
        {hasTimer && (
          <div
            className={`text-2xl font-bold ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-600 dark:text-gray-400"}`}
            role="timer"
            aria-live="polite"
            aria-label={`זמן נותר: ${timeLeft} שניות`}
          >
            {timeLeft}
          </div>
        )}

        {/* Question Card */}
        <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="flex items-center justify-center p-8">
            <motion.div
              key={`${round}-question`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-blue-800 dark:text-blue-200 tracking-wider"
              aria-live="polite"
              role="heading"
              aria-level={3}
            >
              <span>{question.a}</span>
              <span className="mx-4">{OP_EMOJI[question.op] || question.op}</span>
              <span>{question.b}</span>
              <span className="mx-4">=</span>
              <span className="text-blue-400">?</span>
            </motion.div>
          </CardContent>
        </Card>

        {/* Answer Options */}
        <div
          className="grid grid-cols-2 gap-3 w-full"
          role="group"
          aria-label="אפשרויות תשובה"
        >
          <AnimatePresence mode="wait">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === question.answer;
              let btnClass =
                "h-20 text-3xl font-bold rounded-2xl transition-all border-2 ";

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
                  "bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:scale-105 dark:bg-gray-800 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-gray-700";
              }

              return (
                <motion.div
                  key={`${round}-${option}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Button
                    className={btnClass}
                    style={{ width: "100%" }}
                    onClick={() => handleAnswer(option)}
                    disabled={!!feedback}
                    aria-label={`תשובה: ${option}`}
                    aria-pressed={isSelected}
                  >
                    {feedback && isCorrectAnswer && (
                      <CheckCircle2
                        className="w-6 h-6 ml-2 text-green-600"
                        aria-hidden="true"
                      />
                    )}
                    {feedback && isSelected && !isCorrectAnswer && (
                      <XCircle
                        className="w-6 h-6 ml-2 text-red-600"
                        aria-hidden="true"
                      />
                    )}
                    {option}
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Feedback message */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-2xl font-bold ${feedback === "correct" ? "text-green-600" : "text-red-500"}`}
              role="alert"
              aria-live="assertive"
            >
              {feedback === "correct" ? "כל הכבוד! 🎉" : `התשובה הנכונה: ${question.answer}`}
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
          סיום המשחק!
        </h2>

        <Card className="w-full max-w-sm bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-2 border-yellow-200 dark:border-yellow-800">
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
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
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
