import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Gamepad2,
  Calculator,
  BookOpen,
  Palette,
  ArrowRight,
  Star,
  Trophy,
  Sparkles,
} from "lucide-react";

import MathGame from "@/components/games/MathGame";
import LettersGame from "@/components/games/LettersGame";
import ColorsGame from "@/components/games/ColorsGame";

const GAMES = [
  {
    id: "math",
    title: "משחק חשבון",
    subtitle: "חיבור, חיסור וכפל",
    description: "פתרו תרגילי חשבון ואספו כוכבים!",
    icon: Calculator,
    color: "from-blue-400 to-indigo-500",
    bgLight: "from-blue-50 to-indigo-50",
    bgDark: "dark:from-blue-950 dark:to-indigo-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
    component: MathGame,
    badge: "חשבון",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    id: "letters",
    title: "אותיות בעברית",
    subtitle: "הכירו את האלפבית",
    description: "למדו לזהות אותיות בעברית בצורה כיפית!",
    icon: BookOpen,
    color: "from-purple-400 to-violet-500",
    bgLight: "from-purple-50 to-violet-50",
    bgDark: "dark:from-purple-950 dark:to-violet-950",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-700 dark:text-purple-300",
    component: LettersGame,
    badge: "קריאה",
    badgeColor:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  {
    id: "colors",
    title: "עולם הצבעים",
    subtitle: "צבעים בעברית",
    description: "התאימו צבעים לשמות שלהם בעברית!",
    icon: Palette,
    color: "from-pink-400 to-rose-500",
    bgLight: "from-pink-50 to-rose-50",
    bgDark: "dark:from-pink-950 dark:to-rose-950",
    borderColor: "border-pink-200 dark:border-pink-800",
    textColor: "text-pink-700 dark:text-pink-300",
    component: ColorsGame,
    badge: "צבעים",
    badgeColor:
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState(null);

  // If a game is active, render it full-screen
  if (activeGame) {
    const GameComponent = GAMES.find((g) => g.id === activeGame)?.component;
    if (GameComponent) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <GameComponent onBack={() => setActiveGame(null)} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-[80vh] p-4 md:p-8" dir="rtl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="inline-block mb-4"
          aria-hidden="true"
        >
          <Gamepad2 className="w-16 h-16 text-indigo-500 mx-auto" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-l from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          משחקים חינוכיים
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-3 max-w-md mx-auto">
          למדו ושחקו! בחרו משחק והתחילו להרוויח כוכבים
        </p>

        {/* Decorative badges */}
        <div
          className="flex justify-center gap-3 mt-4"
          aria-hidden="true"
        >
          <Badge
            variant="outline"
            className="text-sm px-3 py-1 border-yellow-300 text-yellow-700 dark:text-yellow-300"
          >
            <Star className="w-3 h-3 ml-1" />
            אספו כוכבים
          </Badge>
          <Badge
            variant="outline"
            className="text-sm px-3 py-1 border-orange-300 text-orange-700 dark:text-orange-300"
          >
            <Trophy className="w-3 h-3 ml-1" />
            3 רמות קושי
          </Badge>
          <Badge
            variant="outline"
            className="text-sm px-3 py-1 border-purple-300 text-purple-700 dark:text-purple-300"
          >
            <Sparkles className="w-3 h-3 ml-1" />
            XP ונקודות
          </Badge>
        </div>
      </motion.div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {GAMES.map((game, idx) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
          >
            <Card
              className={`group cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-2 ${game.borderColor} overflow-hidden`}
              onClick={() => {
                setActiveGame(game.id);
              }}
              role="button"
              tabIndex={0}
              aria-label={`${game.title} - ${game.description}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveGame(game.id);
                }
              }}
            >
              {/* Gradient top bar */}
              <div
                className={`h-2 bg-gradient-to-l ${game.color}`}
                aria-hidden="true"
              />

              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  {/* Icon */}
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.bgLight} ${game.bgDark} flex items-center justify-center`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <game.icon
                      className={`w-10 h-10 ${game.textColor}`}
                      aria-hidden="true"
                    />
                  </motion.div>

                  {/* Title */}
                  <div>
                    <h2 className={`text-2xl font-bold ${game.textColor}`}>
                      {game.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {game.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {game.description}
                  </p>

                  {/* Badge */}
                  <Badge className={`${game.badgeColor}`}>{game.badge}</Badge>

                  {/* Play button */}
                  <Button
                    className={`w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-l ${game.color} text-white hover:opacity-90 transition-opacity`}
                    aria-label={`שחקו ב${game.title}`}
                    tabIndex={-1}
                  >
                    <Gamepad2 className="w-5 h-5 ml-2" aria-hidden="true" />
                    שחקו עכשיו!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-10 text-sm text-gray-500 dark:text-gray-400"
      >
        <p>משחקים נוספים בקרוב! מתאים לגילאי 4-10</p>
      </motion.div>
    </div>
  );
}
