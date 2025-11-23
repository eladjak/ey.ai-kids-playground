import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Star,
  Award,
  BookOpen,
  Sparkles,
  Users,
  Palette,
  BookMarked,
  Share2,
  MessageSquare,
  Calendar,
  Lightbulb,
  Gift
} from "lucide-react";

export default function UserRewards({
  userData,
  currentLanguage = "english",
  isRTL = false
}) {
  const [rewards, setRewards] = useState({
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    badges: [],
    streaks: { current: 0, longest: 0 },
    achievements: []
  });

  // Translation dictionary
  const translations = {
    english: {
      title: "Your Rewards",
      level: "Level",
      xp: "XP",
      nextLevel: "to next level",
      badges: "Badges",
      achievements: "Achievements",
      streaks: "Activity Streaks",
      days: "days",
      currentStreak: "Current Streak",
      longestStreak: "Longest Streak",
      noBadges: "Complete activities to earn badges",
      noAchievements: "Complete more books to unlock achievements",
      viewAll: "View All"
    },
    hebrew: {
      title: "התגמולים שלך",
      level: "רמה",
      xp: "נקודות ניסיון",
      nextLevel: "לרמה הבאה",
      badges: "תגים",
      achievements: "הישגים",
      streaks: "רצף פעילות",
      days: "ימים",
      currentStreak: "רצף נוכחי",
      longestStreak: "רצף הארוך ביותר",
      noBadges: "השלם פעילויות כדי להרוויח תגים",
      noAchievements: "השלם עוד ספרים כדי לפתוח הישגים",
      viewAll: "צפה בהכל"
    },
    yiddish: {
      // Yiddish translations would go here
    }
  };

  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  // Badge definitions with translations
  const badgeDefinitions = [
    {
      id: "first_book",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      names: {
        english: "First Book",
        hebrew: "ספר ראשון"
      },
      descriptions: {
        english: "Created your first book",
        hebrew: "יצרת את הספר הראשון שלך"
      }
    },
    {
      id: "storyteller",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      names: {
        english: "Storyteller",
        hebrew: "מספר סיפורים"
      },
      descriptions: {
        english: "Created 5 different stories",
        hebrew: "יצרת 5 סיפורים שונים"
      }
    },
    {
      id: "creator",
      icon: Palette,
      color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
      names: {
        english: "Creative Designer",
        hebrew: "מעצב יצירתי"
      },
      descriptions: {
        english: "Used 3 different art styles",
        hebrew: "השתמשת ב-3 סגנונות אמנות שונים"
      }
    },
    {
      id: "multilingual",
      icon: MessageSquare,
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      names: {
        english: "Multilingual Author",
        hebrew: "סופר רב-לשוני"
      },
      descriptions: {
        english: "Created books in multiple languages",
        hebrew: "יצרת ספרים במספר שפות"
      }
    },
    {
      id: "sharer",
      icon: Share2,
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      names: {
        english: "Social Sharer",
        hebrew: "משתף חברתי"
      },
      descriptions: {
        english: "Shared a book with the community",
        hebrew: "שיתפת ספר עם הקהילה"
      }
    },
    {
      id: "streak",
      icon: Calendar,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      names: {
        english: "Weekly Creator",
        hebrew: "יוצר שבועי"
      },
      descriptions: {
        english: "Created content 7 days in a row",
        hebrew: "יצרת תוכן 7 ימים ברציפות"
      }
    },
    {
      id: "ideator",
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      names: {
        english: "Idea Generator",
        hebrew: "יוצר רעיונות"
      },
      descriptions: {
        english: "Generated 10 unique story ideas",
        hebrew: "יצרת 10 רעיונות סיפור ייחודיים"
      }
    }
  ];

  // Dummy achievements
  const achievementDefinitions = [
    {
      id: "prolific_author",
      icon: BookMarked,
      color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      names: {
        english: "Prolific Author",
        hebrew: "סופר פורה"
      },
      descriptions: {
        english: "Created 10 books",
        hebrew: "יצרת 10 ספרים"
      },
      reward: { xp: 200 }
    },
    {
      id: "genre_master",
      icon: Award,
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      names: {
        english: "Genre Master",
        hebrew: "אמן הז'אנרים"
      },
      descriptions: {
        english: "Created books in all available genres",
        hebrew: "יצרת ספרים בכל הז'אנרים הזמינים"
      },
      reward: { xp: 300 }
    },
    {
      id: "community_star",
      icon: Users,
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
      names: {
        english: "Community Star",
        hebrew: "כוכב הקהילה"
      },
      descriptions: {
        english: "Received 50 likes on your shared books",
        hebrew: "קיבלת 50 לייקים על הספרים ששיתפת"
      },
      reward: { xp: 250 }
    }
  ];

  // Load user rewards data
  useEffect(() => {
    // Here you would typically fetch the user's rewards data from your backend
    // For this example, we'll just set some dummy data
    
    // Simulate XP calculation based on activities
    const calculateUserRewards = () => {
      // Get books created count (this would come from your database)
      const booksCreated = 3;
      const ideasGenerated = 4;
      const daysActive = 5;
      
      // Calculate XP (100 per book, 10 per idea, 5 per day active)
      const totalXp = (booksCreated * 100) + (ideasGenerated * 10) + (daysActive * 5);
      
      // Calculate level (every 100 XP = 1 level)
      const level = Math.max(1, Math.floor(totalXp / 100) + 1);
      
      // Calculate next level XP
      const nextLevelXp = level * 100;
      
      // Determine earned badges
      const earnedBadges = [];
      
      if (booksCreated >= 1) {
        earnedBadges.push(badgeDefinitions.find(b => b.id === "first_book"));
      }
      
      if (ideasGenerated >= 3) {
        earnedBadges.push(badgeDefinitions.find(b => b.id === "ideator"));
      }
      
      if (booksCreated >= 3) {
        earnedBadges.push(badgeDefinitions.find(b => b.id === "storyteller"));
      }
      
      // Determine earned achievements
      const earnedAchievements = [];
      
      // Set the rewards state
      setRewards({
        level,
        xp: totalXp,
        nextLevelXp,
        badges: earnedBadges,
        streaks: { current: 3, longest: 7 },
        achievements: earnedAchievements
      });
    };
    
    calculateUserRewards();
  }, [userData, currentLanguage]);

  return (
    <Card className="shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level and XP Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 px-3 py-1">
                {t("level")} {rewards.level}
              </Badge>
              
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {rewards.xp} {t("xp")}
              </span>
            </div>
            
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {nextLevelProgress(rewards.xp, rewards.nextLevelXp)} {t("nextLevel")}
            </span>
          </div>
          
          <Progress value={progressPercentage(rewards.xp, rewards.nextLevelXp)} className="h-2" />
        </div>
        
        {/* Streaks */}
        <div className="flex gap-4 justify-center">
          <div className="text-center">
            <div className="mb-1 p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full inline-flex">
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-bold">{rewards.streaks.current}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("currentStreak")}</div>
          </div>
          
          <div className="text-center">
            <div className="mb-1 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full inline-flex">
              <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold">{rewards.streaks.longest}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("longestStreak")}</div>
          </div>
        </div>
        
        {/* Badges */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">{t("badges")}</h3>
            <Button variant="ghost" size="sm" className="text-xs">
              {t("viewAll")}
            </Button>
          </div>
          
          {rewards.badges.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {rewards.badges.map((badge, index) => (
                <div key={index} className="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  <div className={`p-1.5 rounded-full ${badge.color} mb-2`}>
                    <badge.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-center">
                    {badge.names[currentLanguage] || badge.names.english}
                  </span>
                </div>
              ))}
              
              {/* Locked badge placeholder */}
              <div className="flex flex-col items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700">
                <div className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 mb-2">
                  <Gift className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400">?????</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              {t("noBadges")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function progressPercentage(current, target) {
  return Math.min(100, Math.round((current / target) * 100));
}

function nextLevelProgress(current, target) {
  return target - current;
}