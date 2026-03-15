import React from "react";
import { Trophy, BookOpen, Sparkles, Award, Star, Users, Calendar, Zap, 
  Heart, MessageCircle, PenTool, Globe, Bookmark, Crown } from "lucide-react";

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

// הוספת ייצוא ברירת מחדל לפונקציה
const BadgeDisplay = React.memo(function BadgeDisplay({
  badgeId, 
  size = "md", 
  showLabel = true, 
  currentLanguage = "english",
  completed = false,
  inProgress = false
}) {
  // Map badge IDs to translated names
  const badgeTranslations = {
    english: {
      "first_book": "First Book",
      "storyteller": "Storyteller",
      "prolific_author": "Prolific Author",
      "character_creator": "Character Creator",
      "community_star": "Community Star",
      "streak_master": "Streak Master",
      "genre_explorer": "Genre Explorer",
      "multilingual": "Multilingual",
      "creative_mind": "Creative Mind",
      "dedicated_author": "Dedicated Author",
      "steady_creator": "Steady Creator",
      "adventurer": "Adventurer",
      "social_butterfly": "Social Butterfly",
      "feedback_expert": "Feedback Expert",
      "community_fan": "Community Fan",
      "fast_learner": "Fast Learner",
      "star_author": "Star Author",
      "collector": "Collector"
    },
    hebrew: {
      "first_book": "הספר הראשון",
      "storyteller": "מספר סיפורים",
      "prolific_author": "סופר פורה",
      "character_creator": "יוצר דמויות",
      "community_star": "כוכב הקהילה",
      "streak_master": "אלוף הרצף",
      "genre_explorer": "חוקר ז'אנרים",
      "multilingual": "רב-לשוני",
      "creative_mind": "יוצר יצירתי",
      "dedicated_author": "סופר מסור",
      "steady_creator": "יוצר עקבי",
      "adventurer": "הרפתקן",
      "social_butterfly": "פרפר חברתי",
      "feedback_expert": "מומחה משוב",
      "community_fan": "חובב קהילה",
      "fast_learner": "לומד מהיר",
      "star_author": "סופר כוכב",
      "collector": "אספן"
    },
    yiddish: {
      "first_book": "ערשטן בוך",
      "storyteller": "מעשהזאָגער",
      "prolific_author": "פּראָדוקטיווער מחבר",
      "character_creator": "כאַראַקטער שאַפֿער",
      "community_star": "קהילה שטערן",
      "streak_master": "שטרייַף מייסטער",
      "genre_explorer": "זשאַנר אַנטדעקער",
      "multilingual": "פֿיל-שפּראַכיק",
      "creative_mind": "קרעאַטיווער קאָפּ",
      "dedicated_author": "דעדיקירטער מחבר",
      "steady_creator": "שטענדיקער שאַפֿער",
      "adventurer": "אַוואַנטוריסט",
      "social_butterfly": "חברותשאַפֿטלעכער",
      "feedback_expert": "פֿידבעק מומחה",
      "community_fan": "קהילה ליבהאָבער",
      "fast_learner": "שנעלער לערנער",
      "star_author": "שטערן מחבר",
      "collector": "זאַמלער"
    }
  };

  // Get the appropriate icon or use a fallback
  const IconComponent = BadgeIcons[badgeId] || Trophy;

  // Get translated name or fall back to badge ID
  const badgeName = badgeTranslations[currentLanguage]?.[badgeId] ||
                   badgeTranslations.english[badgeId] ||
                   badgeId;
  
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