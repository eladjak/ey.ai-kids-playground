import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, BookOpen, Star, Award, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function UserStats({ userData, currentLanguage = "english" }) {
  const translations = {
    english: {
      "stats.level": "Level",
      "stats.storyteller": "Storyteller",
      "stats.xp": "XP",
      "stats.nextLevel": "to next level",
      "stats.books": "Books",
      "stats.pages": "pages created",
      "stats.streak": "day streak",
      "stats.keepGoing": "Keep it going!",
      "stats.badges": "Earned Badges",
      "stats.complete": "Complete actions to earn badges",
      "stats.badgesCount": "badges earned"
    },
    hebrew: {
      "stats.level": "רמה",
      "stats.storyteller": "מספר סיפורים",
      "stats.xp": "נקודות ניסיון",
      "stats.nextLevel": "לרמה הבאה",
      "stats.books": "ספרים",
      "stats.pages": "דפים נוצרו",
      "stats.streak": "ימים ברצף",
      "stats.keepGoing": "המשך כך!",
      "stats.badges": "תגים שהושגו",
      "stats.complete": "השלם משימות כדי להרוויח תגים",
      "stats.badgesCount": "תגים הושגו"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key];
  const isRTL = currentLanguage === "hebrew";

  const completedBadges = userData.badges?.filter(badge => badge.completed) || [];
  const xpProgress = (userData.xp / userData.next_level_xp) * 100;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          {t("stats.level")} {userData.level} {t("stats.storyteller")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" dir={isRTL ? "rtl" : "ltr"}>
          {/* Level & XP */}
          <div className="md:col-span-2 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-800 dark:to-blue-800 rounded-lg p-5 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white/80 font-medium">{t("stats.level")}</h3>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">{userData.level}</span>
                  <span className="text-lg mb-1">{t("stats.storyteller")}</span>
                </div>
              </div>
              <Trophy className="h-8 w-8 text-amber-300" />
            </div>
            
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>{userData.xp} {t("stats.xp")}</span>
                <span>{userData.next_level_xp - userData.xp} {t("stats.nextLevel")}</span>
              </div>
              <motion.div 
                className="h-2 bg-white/20 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </motion.div>
            </div>
          </div>
          
          {/* Books Created */}
          <motion.div 
            className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-blue-800 dark:text-blue-300 font-medium">{t("stats.books")}</h3>
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{userData.total_books}</p>
            <p className="text-blue-600/70 dark:text-blue-300/70 text-sm">
              {userData.total_pages} {t("stats.pages")}
            </p>
          </motion.div>
          
          {/* Streak */}
          <motion.div 
            className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-amber-800 dark:text-amber-300 font-medium">{t("stats.streak")}</h3>
              <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{userData.streak_days}</p>
            <p className="text-amber-600/70 dark:text-amber-300/70 text-sm">
              {t("stats.keepGoing")}
            </p>
          </motion.div>
          
          {/* Badge Showcase */}
          <div className="md:col-span-4 mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                {t("stats.badges")}
              </h3>
              <Badge variant="outline" className="px-2 py-0 text-xs">
                {completedBadges.length} {t("stats.badgesCount")}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {completedBadges.length > 0 ? (
                completedBadges.map((badge, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2">
                      <BadgeCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300">
                      {badge.name}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <Award className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
                    {t("stats.complete")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}