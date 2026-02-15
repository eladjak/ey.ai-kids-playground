import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
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
  COLORS_DATA,
  GAME_PHASES,
  DIFFICULTY_LEVELS,
} from "./gameUtils";

// ---- Question Types ----

/**
 * Type A: Show a color swatch, pick the Hebrew name
 * Type B: Show a Hebrew color name, pick the swatch
 * Type C (hard): Show a color name + find the matching hex from swatches
 */

function generateColorQuestion(difficulty) {
  const availableColors =
    difficulty === "easy"
      ? COLORS_DATA.slice(0, 6) // 6 basic colors
      : difficulty === "medium"
        ? COLORS_DATA.slice(0, 9)
        : COLORS_DATA;

  // Pick target color
  const targetIdx = Math.floor(Math.random() * availableColors.length);
  const target = availableColors[targetIdx];

  // Pick 3 wrong colors
  const wrongColors = [];
  const usedIndices = new Set([targetIdx]);
  while (wrongColors.length < 3) {
    const idx = Math.floor(Math.random() * availableColors.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      wrongColors.push(availableColors[idx]);
    }
  }

  // Choose question type based on difficulty
  const types =
    difficulty === "easy"
      ? ["swatchToName"] // Show swatch, pick name
      : difficulty === "medium"
        ? ["swatchToName", "nameToSwatch"]
        : ["swatchToName", "nameToSwatch", "nameToSwatch"];

  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "swatchToName") {
    return {
      type: "swatchToName",
      targetColor: target,
      correctAnswer: target.name,
      options: shuffle([target.name, ...wrongColors.map((c) => c.name)]),
      allColors: shuffle([target, ...wrongColors]),
    };
  }

  // nameToSwatch
  return {
    type: "nameToSwatch",
    targetColor: target,
    correctAnswer: target.hex,
    options: shuffle([target, ...wrongColors]),
    allColors: shuffle([target, ...wrongColors]),
  };
}

export default function ColorsGame({ onBack }) {
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
    setQuestion(generateColorQuestion(diff));
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
          setQuestion(generateColorQuestion(difficulty));
          setFeedback(null);
          setSelectedAnswer(null);
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
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Palette className="w-20 h-20 text-pink-500" />
        </motion.div>

        <h2 className="text-3xl font-bold text-pink-700 dark:text-pink-300">
          עולם הצבעים
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md">
          למדו צבעים בעברית! התאימו את הצבע לשם שלו
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
                {level.value === "easy" && "🎨"}
                {level.value === "medium" && "🌈"}
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
    const isSwatchToName = question.type === "swatchToName";

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

        {/* Question Card */}
        <Card className="w-full border-2 border-pink-200 dark:border-pink-800 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {isSwatchToName
                ? "איך קוראים לצבע הזה?"
                : "מצאו את הצבע:"}
            </p>

            {isSwatchToName ? (
              /* Show a large color swatch */
              <motion.div
                key={`${round}-swatch`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl shadow-lg border-4 border-white dark:border-gray-700"
                style={{ backgroundColor: question.targetColor.hex }}
                role="img"
                aria-label={`צבע ${question.targetColor.name}`}
              />
            ) : (
              /* Show the Hebrew color name */
              <motion.div
                key={`${round}-name`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-200"
                aria-live="polite"
                role="heading"
                aria-level={3}
              >
                {question.targetColor.name}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Answer Options */}
        {isSwatchToName ? (
          /* Text options (pick the name) */
          <div
            className="grid grid-cols-2 gap-3 w-full"
            role="group"
            aria-label="אפשרויות תשובה"
          >
            {question.options.map((name, idx) => {
              const isSelected = selectedAnswer === name;
              const isCorrectAnswer = name === question.correctAnswer;
              let btnClass =
                "h-16 text-2xl font-bold rounded-2xl transition-all border-2 ";

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
                  "bg-white border-pink-200 text-pink-700 hover:bg-pink-50 hover:border-pink-400 hover:scale-105 dark:bg-gray-800 dark:border-pink-700 dark:text-pink-300 dark:hover:bg-gray-700";
              }

              return (
                <motion.div
                  key={`${round}-${name}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Button
                    className={btnClass}
                    style={{ width: "100%" }}
                    onClick={() => handleAnswer(name)}
                    disabled={!!feedback}
                    aria-label={`תשובה: ${name}`}
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
                    {name}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Color swatch options (pick the swatch) */
          <div
            className="grid grid-cols-2 gap-3 w-full"
            role="group"
            aria-label="אפשרויות תשובה"
          >
            {question.options.map((color, idx) => {
              const isSelected = selectedAnswer === color.hex;
              const isCorrectAnswer = color.hex === question.correctAnswer;

              let borderClass = "border-4 ";
              if (feedback) {
                if (isCorrectAnswer) {
                  borderClass += "border-green-500 ring-4 ring-green-200";
                } else if (isSelected && !isCorrectAnswer) {
                  borderClass += "border-red-500 ring-4 ring-red-200";
                } else {
                  borderClass += "border-gray-300 opacity-50";
                }
              } else {
                borderClass +=
                  "border-white dark:border-gray-600 hover:border-pink-400 hover:scale-105";
              }

              return (
                <motion.button
                  key={`${round}-${color.hex}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`h-24 w-full rounded-2xl shadow-md transition-all cursor-pointer ${borderClass}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleAnswer(color.hex)}
                  disabled={!!feedback}
                  aria-label={`צבע ${color.name}`}
                  aria-pressed={isSelected}
                >
                  {feedback && isCorrectAnswer && (
                    <CheckCircle2
                      className="w-8 h-8 mx-auto text-white drop-shadow-md"
                      aria-hidden="true"
                    />
                  )}
                  {feedback && isSelected && !isCorrectAnswer && (
                    <XCircle
                      className="w-8 h-8 mx-auto text-white drop-shadow-md"
                      aria-hidden="true"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

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
                ? "יפה מאוד! 🎨"
                : `הצבע הנכון: ${question.targetColor.name}`}
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
          אלופים!
        </h2>

        <Card className="w-full max-w-sm bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-950 dark:to-orange-950 border-2 border-pink-200 dark:border-pink-800">
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
              <p className="text-4xl font-bold text-pink-700 dark:text-pink-300">
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

            {/* Color dots decorative */}
            <div
              className="flex gap-2 mt-2"
              aria-hidden="true"
            >
              {COLORS_DATA.slice(0, 6).map((c) => (
                <motion.div
                  key={c.hex}
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: c.hex }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
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
