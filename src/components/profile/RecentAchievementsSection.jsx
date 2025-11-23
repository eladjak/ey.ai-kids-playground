import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BadgeDisplay from "../gamification/BadgeDisplay";

export default function RecentAchievementsSection({ achievements = [], currentLanguage = "english" }) {
  const translations = {
    english: {
      "recentAchievements.title": "Recent Achievements",
      "recentAchievements.empty": "No achievements yet",
      "recentAchievements.complete": "Complete actions to earn achievements",
      "recentAchievements.viewAll": "View All Achievements",
      "recentAchievements.completed": "Completed",
      "recentAchievements.inProgress": "In Progress"
    },
    hebrew: {
      "recentAchievements.title": "הישגים אחרונים",
      "recentAchievements.empty": "אין הישגים עדיין",
      "recentAchievements.complete": "השלם פעולות כדי להרוויח הישגים",
      "recentAchievements.viewAll": "צפה בכל ההישגים",
      "recentAchievements.completed": "הושלם",
      "recentAchievements.inProgress": "בתהליך"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key];
  const isRTL = currentLanguage === "hebrew";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          {t("recentAchievements.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {achievements.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {achievements.slice(0, 3).map((achievement, index) => {
                const translationLang = currentLanguage === "hebrew" ? "he" : "en";
                const achievementText = achievement.translations?.[translationLang] || {
                  title: achievement.title,
                  description: achievement.description
                };
                
                return (
                  <motion.div
                    key={achievement.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`overflow-hidden h-full ${achievement.completed ? 'border-green-100 dark:border-green-900/30' : ''}`}
                    >
                      <div className="p-4 flex flex-col items-center text-center h-full">
                        <BadgeDisplay 
                          badgeId={achievement.id} 
                          size="lg" 
                          completed={achievement.completed}
                          inProgress={!achievement.completed && achievement.progress > 0}
                          currentLanguage={currentLanguage}
                        />
                        <h4 className="font-medium mt-3 mb-2 text-gray-900 dark:text-gray-100">
                          {achievementText.title}
                        </h4>
                        
                        {achievement.completed ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {t("recentAchievements.completed")}
                          </Badge>
                        ) : (
                          <div className="w-full mt-2">
                            <div className="flex justify-between text-xs">
                              <span>{achievement.progress}/{achievement.max_progress}</span>
                              <span>{achievement.xp_reward} XP</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.max_progress) * 100} 
                              className="h-1.5 mt-1" 
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
                {t("recentAchievements.empty")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t("recentAchievements.complete")}
              </p>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => document.querySelector('[data-value="achievements"]').click()}
          >
            {t("recentAchievements.viewAll")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}