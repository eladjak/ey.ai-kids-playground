import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useI18n } from "@/components/i18n/i18nProvider";
import { Trophy, Star, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BadgeDisplay from "@/components/gamification/BadgeDisplay";

function getTimeOfDayGreeting(language, isRTL, name) {
  const hour = new Date().getHours();
  const displayName = name && name !== "Guest" ? `, ${name}` : "";

  if (isRTL && language === "hebrew") {
    if (hour >= 5 && hour < 12) return `בוקר טוב${displayName}!`;
    if (hour >= 12 && hour < 17) return `צהריים טובים${displayName}!`;
    if (hour >= 17 && hour < 22) return `ערב טוב${displayName}!`;
    return `לילה טוב${displayName}!`;
  }

  if (hour >= 5 && hour < 12) return `Good morning${displayName}!`;
  if (hour >= 12 && hour < 17) return `Good afternoon${displayName}!`;
  if (hour >= 17 && hour < 22) return `Good evening${displayName}!`;
  return `Sweet dreams${displayName}!`;
}

const UserWelcomeCard = React.memo(function UserWelcomeCard({ userData }) {
  const { language: currentLanguage, isRTL, t } = useI18n();

  const progressToNextLevel = userData.nextLevelXp > 0
    ? Math.min((userData.xp / userData.nextLevelXp) * 100, 100)
    : 0;

  const greeting = getTimeOfDayGreeting(currentLanguage, isRTL, userData.full_name);

  const streakDays = userData.streakDays || 0;
  const showStreak = streakDays >= 3;
  const pulseStreak = streakDays >= 7;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
      {/* User info card */}
      <Card className="w-full md:w-auto flex-grow-0 flex-shrink-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Link to={createPageUrl("Profile")} className="flex-shrink-0">
              <Avatar className="h-12 w-12 border-2 border-white shadow hover:shadow-md transition-all">
                {userData.avatar_url ? (
                  <AvatarImage src={userData.avatar_url} alt={userData.full_name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                    {userData.full_name?.charAt(0) || "G"}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">{greeting}</p>
              <h2 className="font-bold text-lg truncate">{userData.full_name}</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-3">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 gap-1">
              <Trophy className="h-3 w-3" />
              <span>{t("home.level")} {userData.level}</span>
            </Badge>

            {showStreak ? (
              <Badge
                variant="outline"
                className={`bg-orange-100 text-orange-800 gap-1 ${pulseStreak ? "animate-pulse" : ""}`}
              >
                <Flame className="h-3 w-3 text-orange-500" />
                <span>{streakDays} {t("home.streak")}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 gap-1">
                <Star className="h-3 w-3" />
                <span>{streakDays} {t("home.streak")}</span>
              </Badge>
            )}
          </div>

          {/* XP progress bar */}
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{userData.xp} XP</span>
              <span>{userData.nextLevelXp - userData.xp} XP {t("home.progress.toNext")}</span>
            </div>
            <Progress value={progressToNextLevel} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Badges row */}
      {userData.badges && userData.badges.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {userData.badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
              <BadgeDisplay
                badgeId={badge.id}
                size="sm"
                currentLanguage={currentLanguage}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default UserWelcomeCard;
