import React from "react";
import { Trophy, BookOpen, Sparkles, Award, Star, Users, Calendar, Zap,
  Heart, MessageCircle, PenTool, Globe, Bookmark, Crown } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";

const BadgeIcons = {
  "first_book": BookOpen,
  "storyteller": Sparkles,
  "prolific_author": Crown,
  "character_creator": PenTool,
  "community_star": Star,
  "streak_master": Zap,
  "genre_explorer": Globe,
  "multilingual": Globe,
  "creative_mind": PenTool,
  "dedicated_author": Award,
  "steady_creator": Calendar,
  "adventurer": Globe,
  "social_butterfly": Users,
  "feedback_expert": MessageCircle,
  "community_fan": Heart,
  "fast_learner": Zap,
  "star_author": Star,
  "collector": Bookmark,
  "achievement": Trophy
};

/**
 * Maps snake_case badge IDs to camelCase i18n keys under badgeNames.*
 */
const BADGE_ID_TO_I18N_KEY = {
  "first_book": "firstBook",
  "storyteller": "storyteller",
  "prolific_author": "prolificAuthor",
  "character_creator": "characterCreator",
  "community_star": "communityStar",
  "streak_master": "streakMaster",
  "genre_explorer": "genreExplorer",
  "multilingual": "multilingual",
  "creative_mind": "creativeMind",
  "dedicated_author": "dedicatedAuthor",
  "steady_creator": "steadyCreator",
  "adventurer": "adventurer",
  "social_butterfly": "socialButterfly",
  "feedback_expert": "feedbackExpert",
  "community_fan": "communityFan",
  "fast_learner": "fastLearner",
  "star_author": "starAuthor",
  "collector": "collector"
};

// הוספת ייצוא ברירת מחדל לפונקציה
const BadgeDisplay = React.memo(function BadgeDisplay({
  badgeId,
  size = "md",
  showLabel = true,
  completed = false,
  inProgress = false
}) {
  const { t } = useI18n();

  // Get the appropriate icon or use a fallback
  const IconComponent = BadgeIcons[badgeId] || Trophy;

  // Get translated name via i18n system, fall back to badge ID
  const i18nKey = BADGE_ID_TO_I18N_KEY[badgeId];
  const badgeName = i18nKey ? t(`badgeNames.${i18nKey}`) : badgeId;
  
  // Standardized sizes: sm = compact (w-10 h-10 container), lg = large (w-16 h-16 container)
  const sizeMappings = {
    sm: {
      container: "w-10 h-10 flex items-center justify-center",
      icon: "h-5 w-5",
      labelClass: "text-xs mt-1"
    },
    md: {
      container: "w-12 h-12 flex items-center justify-center",
      icon: "h-6 w-6",
      labelClass: "text-xs font-medium mt-1"
    },
    lg: {
      container: "w-16 h-16 flex items-center justify-center",
      icon: "h-8 w-8",
      labelClass: "text-sm font-medium mt-1"
    }
  };

  const { container, icon, labelClass } = sizeMappings[size] || sizeMappings.md;
  
  const getIconColor = () => {
    if (completed) return "text-purple-600 dark:text-purple-400";
    if (inProgress) return "text-blue-600 dark:text-blue-400";
    return "text-gray-400 dark:text-gray-500";
  };
  
  const getContainerColor = () => {
    if (completed) return "bg-purple-100 dark:bg-purple-900/30";
    if (inProgress) return "bg-blue-100 dark:bg-blue-900/30";
    return "bg-gray-100 dark:bg-gray-800/50";
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className={`${container} ${getContainerColor()} rounded-full`}>
        <IconComponent className={`${icon} ${getIconColor()}`} />
      </div>
      {showLabel && (
        <span className={`${labelClass} text-center`}>
          {badgeName}
        </span>
      )}
    </div>
  );
});

export default BadgeDisplay;