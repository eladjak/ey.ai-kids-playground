import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LeaderboardPreview({ currentLanguage = "english" }) {
  const translations = {
    english: {
      "leaderboard.title": "Top Storytellers",
      "leaderboard.viewAll": "View Full Leaderboard",
      "leaderboard.you": "You",
      "leaderboard.level": "Level",
      "leaderboard.books": "Books",
      "leaderboard.position": "Your position",
      "leaderboard.weekly": "Weekly Leaders",
      "leaderboard.monthly": "This Month"
    },
    hebrew: {
      "leaderboard.title": "מספרי הסיפורים המובילים",
      "leaderboard.viewAll": "צפה בדירוג המלא",
      "leaderboard.you": "אתה",
      "leaderboard.level": "רמה",
      "leaderboard.books": "ספרים",
      "leaderboard.position": "המיקום שלך",
      "leaderboard.weekly": "מובילים שבועיים",
      "leaderboard.monthly": "החודש"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";
  
  // שימוש בנתוני דוגמה לטבלת המובילים
  const leaderboardData = [
    {
      id: 1,
      name: "Sophie K.",
      avatar: "https://i.pravatar.cc/150?img=29",
      level: 8,
      books: 24,
      xp: 1860
    },
    {
      id: 2,
      name: "Ethan M.",
      avatar: "https://i.pravatar.cc/150?img=12",
      level: 7,
      books: 19,
      xp: 1580
    },
    {
      id: 3,
      name: "Olivia J.",
      avatar: "https://i.pravatar.cc/150?img=23",
      level: 6,
      books: 15,
      xp: 1250
    },
    {
      id: 4,
      name: "Daniel S.",
      avatar: "https://i.pravatar.cc/150?img=52",
      level: 5,
      books: 12,
      xp: 980
    },
    {
      id: 5,
      name: "Current User",
      avatar: "",
      level: 4,
      books: 8,
      xp: 720,
      isCurrentUser: true
    }
  ];

  // סגנונות ואייקונים עבור דירוגים מובילים
  const getRankStyles = (index) => {
    switch (index) {
      case 0:
        return {
          icon: <Trophy className="h-4 w-4 text-amber-500" />,
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
        };
      case 1:
        return {
          icon: <Medal className="h-4 w-4 text-gray-500" />,
          badge: "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300"
        };
      case 2:
        return {
          icon: <Award className="h-4 w-4 text-amber-800" />,
          badge: "bg-amber-100/50 text-amber-800 dark:bg-amber-900/10 dark:text-amber-400"
        };
      default:
        return {
          icon: null,
          badge: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        };
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {t("leaderboard.title")}
          </CardTitle>
          <Badge variant="outline" className="text-xs font-normal text-purple-600 dark:text-purple-400">
            {t("leaderboard.weekly")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent dir={isRTL ? "rtl" : "ltr"}>
        <div className="space-y-4">
          {leaderboardData.slice(0, 4).map((user, index) => (
            <div 
              key={user.id} 
              className={`flex items-center gap-3 p-2 rounded-lg ${
                user.isCurrentUser ? 'bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/50' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-6 text-center font-medium ${
                index < 3 ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500'
              }`}>
                {index + 1}
              </div>
              
              <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <p className="font-medium truncate">
                    {user.name}
                  </p>
                  {user.isCurrentUser && (
                    <Badge className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {t("leaderboard.you")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{t("leaderboard.level")} {user.level}</span>
                  <span>•</span>
                  <span>{user.books} {t("leaderboard.books")}</span>
                </div>
              </div>
              
              <Badge className={`${getRankStyles(index).badge} flex items-center gap-1 px-2 py-1`}>
                {getRankStyles(index).icon}
                <span>{user.xp} XP</span>
              </Badge>
            </div>
          ))}
          
          {/* Your position indicator */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("leaderboard.position")}:
                <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                  #5 / 124
                </span>
              </p>
              
              <Link to={createPageUrl("Leaderboard")}>
                <Button variant="link" size="sm" className="h-8 p-0 text-purple-600 dark:text-purple-400">
                  <span>{t("leaderboard.viewAll")}</span>
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}