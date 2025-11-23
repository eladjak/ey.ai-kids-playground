import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Gift,
  Flame,
  Crown,
  HeartHandshake,
  Zap,
  PartyPopper,
  UserCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Achievements({ 
  userData, 
  currentLanguage = "english",
  isRTL = false
}) {
  const [activeTab, setActiveTab] = useState("badges");
  
  // Translation data
  const translations = {
    english: {
      title: "Your Achievements",
      subtitle: "Track your progress and earned rewards",
      tabs: {
        badges: "Badges",
        stats: "Statistics",
        rewards: "Rewards",
        levels: "Levels"
      },
      level: "Level",
      xp: "XP",
      toNextLevel: "to next level",
      badges: {
        earned: "Earned Badges",
        locked: "Locked Badges",
        firstBook: "First Book",
        firstBookDesc: "Created your first book",
        storyteller: "Storyteller",
        storytellerDesc: "Created 3 different stories",
        illustrator: "Illustrator", 
        illustratorDesc: "Generated 10 illustrations",
        multilingual: "Multilingual",
        multilingualDesc: "Created stories in multiple languages",
        sharingIsCaring: "Sharing is Caring",
        sharingIsCaringDesc: "Shared your first book",
        topContributor: "Top Contributor",
        topContributorDesc: "Became a regular contributor",
        perfectFeedback: "Perfect Feedback",
        perfectFeedbackDesc: "Received 5-star feedback",
        dailyCreator: "Daily Creator",
        dailyCreatorDesc: "Created content for 5 consecutive days",
        genreMaster: "Genre Master",
        genreMasterDesc: "Created stories in 5 different genres",
        ideaGenerator: "Idea Generator",
        ideaGeneratorDesc: "Generated 10 story ideas",
        collaborator: "Collaborator",
        collaboratorDesc: "Collaborated on 3 stories",
        holidaySpecial: "Holiday Special",
        holidaySpecialDesc: "Created a holiday-themed story",
        learningJourney: "Learning Journey",
        learningJourneyDesc: "Created 5 educational stories",
        featuredStory: "Featured Story",
        featuredStoryDesc: "Had a story featured in the community",
        illustrationWizard: "Illustration Wizard",
        illustrationWizardDesc: "Used 5 different art styles"
      },
      stats: {
        booksCreated: "Books Created",
        illustrations: "Illustrations",
        ideas: "Story Ideas",
        longestStreak: "Longest Streak",
        days: "days",
        favorite: "Favorite Genre",
        feedback: "Average Feedback",
        communities: "Communities",
        shares: "Book Shares",
        characters: "Characters Created",
        totalWords: "Total Words"
      },
      rewards: {
        available: "Available Rewards",
        redeemed: "Redeemed Rewards",
        specialBadge: "Special Badge",
        newArtStyle: "New Art Style",
        premiumTemplate: "Premium Template",
        doubleXp: "Double XP Weekend",
        extraStorage: "Extra Storage",
        bookCover: "Custom Book Cover",
        collaborationSlot: "Extra Collaboration Slot",
        redeem: "Redeem",
        redeemed: "Redeemed"
      }
    },
    hebrew: {
      title: "ההישגים שלך",
      subtitle: "עקוב אחר התקדמותך והפרסים שהרווחת",
      tabs: {
        badges: "תגים",
        stats: "סטטיסטיקה",
        rewards: "פרסים",
        levels: "רמות"
      },
      level: "רמה",
      xp: "נקודות ניסיון",
      toNextLevel: "לרמה הבאה",
      badges: {
        earned: "תגים שהרווחת",
        locked: "תגים נעולים",
        firstBook: "ספר ראשון",
        firstBookDesc: "יצרת את הספר הראשון שלך",
        storyteller: "מספר סיפורים",
        storytellerDesc: "יצרת 3 סיפורים שונים",
        illustrator: "מאייר", 
        illustratorDesc: "יצרת 10 איורים",
        multilingual: "רב-לשוני",
        multilingualDesc: "יצרת סיפורים במספר שפות",
        sharingIsCaring: "שיתוף הוא אכפתיות",
        sharingIsCaringDesc: "שיתפת את הספר הראשון שלך",
        topContributor: "תורם מוביל",
        topContributorDesc: "הפכת לתורם קבוע",
        perfectFeedback: "משוב מושלם",
        perfectFeedbackDesc: "קיבלת משוב של 5 כוכבים",
        dailyCreator: "יוצר יומי",
        dailyCreatorDesc: "יצרת תוכן במשך 5 ימים רצופים",
        genreMaster: "אמן הז'אנרים",
        genreMasterDesc: "יצרת סיפורים ב-5 ז'אנרים שונים",
        ideaGenerator: "יוצר רעיונות",
        ideaGeneratorDesc: "יצרת 10 רעיונות לסיפורים",
        collaborator: "משתף פעולה",
        collaboratorDesc: "שיתפת פעולה ב-3 סיפורים",
        holidaySpecial: "מיוחד לחג",
        holidaySpecialDesc: "יצרת סיפור בנושא חג",
        learningJourney: "מסע למידה",
        learningJourneyDesc: "יצרת 5 סיפורים חינוכיים",
        featuredStory: "סיפור מובחר",
        featuredStoryDesc: "סיפור שלך הוצג בקהילה",
        illustrationWizard: "אשף האיורים",
        illustrationWizardDesc: "השתמשת ב-5 סגנונות אמנות שונים"
      },
      stats: {
        booksCreated: "ספרים שנוצרו",
        illustrations: "איורים",
        ideas: "רעיונות לסיפורים",
        longestStreak: "רצף הימים הארוך ביותר",
        days: "ימים",
        favorite: "ז'אנר מועדף",
        feedback: "משוב ממוצע",
        communities: "קהילות",
        shares: "שיתופי ספרים",
        characters: "דמויות שנוצרו",
        totalWords: "סך המילים"
      },
      rewards: {
        available: "פרסים זמינים",
        redeemed: "פרסים שמומשו",
        specialBadge: "תג מיוחד",
        newArtStyle: "סגנון אמנותי חדש",
        premiumTemplate: "תבנית פרימיום",
        doubleXp: "סוף שבוע עם נקודות כפולות",
        extraStorage: "אחסון נוסף",
        bookCover: "כריכת ספר מותאמת אישית",
        collaborationSlot: "מקום נוסף לשיתוף פעולה",
        redeem: "מימוש",
        redeemed: "מומש"
      }
    }
  };
  
  // Translation function
  const t = (path) => {
    const parts = path.split('.');
    let result = translations[currentLanguage] || translations.english;
    
    for (const part of parts) {
      result = result[part] || {};
    }
    
    return typeof result === 'string' ? result : path;
  };
  
  // Sample user progress data
  const [userProgress, setUserProgress] = useState({
    level: 2,
    xp: 120,
    nextLevelXp: 200,
    earnedBadges: [
      { id: "firstBook", icon: BookOpen },
      { id: "storyteller", icon: Sparkles },
      { id: "sharingIsCaring", icon: Share2 }
    ],
    lockedBadges: [
      { id: "illustrator", icon: Palette, progress: 40 },
      { id: "multilingual", icon: MessageSquare, progress: 25 },
      { id: "topContributor", icon: Trophy, progress: 10 },
      { id: "perfectFeedback", icon: Star, progress: 60 },
      { id: "dailyCreator", icon: Calendar, progress: 20 },
      { id: "genreMaster", icon: BookMarked, progress: 40 },
      { id: "ideaGenerator", icon: Lightbulb, progress: 30 },
      { id: "collaborator", icon: Users, progress: 0 },
      { id: "holidaySpecial", icon: Gift, progress: 0 },
      { id: "learningJourney", icon: Award, progress: 10 },
      { id: "featuredStory", icon: Crown, progress: 0 },
      { id: "illustrationWizard", icon: Zap, progress: 50 }
    ],
    stats: {
      booksCreated: 3,
      illustrations: 12,
      ideas: 5,
      longestStreak: 3,
      favoriteGenre: "Adventure",
      avgFeedback: 4.5,
      communities: 1,
      shares: 2,
      characters: 8,
      totalWords: 3240
    },
    availableRewards: [
      { id: "specialBadge", icon: Award, xpCost: 300 },
      { id: "newArtStyle", icon: Palette, xpCost: 500 },
      { id: "premiumTemplate", icon: BookMarked, xpCost: 800 }
    ],
    redeemedRewards: [
      { id: "doubleXp", icon: Flame, date: "2023-10-15" }
    ]
  });
  
  useEffect(() => {
    // In a real app, you would load the user's achievement data here
    if (userData) {
      // Update the userProgress state with data from userData
    }
  }, [userData]);
  
  return (
    <Card className="shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{t("title")}</CardTitle>
            <p className="text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="font-medium">
                {t("level")} {userProgress.level}
              </span>
            </div>
            
            <div className="space-y-1 w-32">
              <div className="flex justify-between text-xs">
                <span>{userProgress.xp} XP</span>
                <span>{userProgress.nextLevelXp - userProgress.xp} {t("toNextLevel")}</span>
              </div>
              <Progress 
                value={(userProgress.xp / userProgress.nextLevelXp) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        <Tabs defaultValue="badges" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="badges">
              <Award className="h-4 w-4 mr-2" />
              {t("tabs.badges")}
            </TabsTrigger>
            <TabsTrigger value="stats">
              <LineChart className="h-4 w-4 mr-2" />
              {t("tabs.stats")}
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Gift className="h-4 w-4 mr-2" />
              {t("tabs.rewards")}
            </TabsTrigger>
            <TabsTrigger value="levels">
              <Trophy className="h-4 w-4 mr-2" />
              {t("tabs.levels")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="badges">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">{t("badges.earned")}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {userProgress.earnedBadges.map((badge) => (
                    <div 
                      key={badge.id}
                      className="flex flex-col items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                        <badge.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-medium text-sm text-center">{t(`badges.${badge.id}`)}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        {t(`badges.${badge.id}Desc`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">{t("badges.locked")}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {userProgress.lockedBadges.map((badge) => (
                    <div 
                      key={badge.id}
                      className="flex flex-col items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
                        <badge.icon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h4 className="font-medium text-sm text-center text-gray-600 dark:text-gray-400">
                        {t(`badges.${badge.id}`)}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                        {t(`badges.${badge.id}Desc`)}
                      </p>
                      <Progress 
                        value={badge.progress} 
                        className="h-1.5 w-full mt-3"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-medium">{userProgress.stats.booksCreated}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("stats.booksCreated")}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-medium">{userProgress.stats.illustrations}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("stats.illustrations")}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-medium">{userProgress.stats.ideas}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("stats.ideas")}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-medium">{userProgress.stats.longestStreak} {t("stats.days")}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("stats.longestStreak")}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <BookMarked className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="font-medium">{userProgress.stats.favoriteGenre}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("stats.favorite")}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h4 className="font-medium">{userProgress.stats.avgFeedback}/5</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("stats.feedback")}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Users className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h4 className="font-medium">{userProgress.stats.communities}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("stats.communities")}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h4 className="font-medium">{userProgress.stats.shares}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t("stats.shares")}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="rewards">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">{t("rewards.available")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {userProgress.availableRewards.map((reward) => (
                    <Card 
                      key={reward.id}
                      className="bg-white dark:bg-gray-800 overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                            <reward.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 ml-3">
                            {t(`rewards.${reward.id}`)}
                          </h4>
                        </div>
                        <Badge variant="secondary">
                          {reward.xpCost} XP
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <Button 
                          disabled={userProgress.xp < reward.xpCost} 
                          className="w-full"
                        >
                          {t("rewards.redeem")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {userProgress.redeemedRewards.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">{t("rewards.redeemed")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {userProgress.redeemedRewards.map((reward) => (
                      <Card 
                        key={reward.id}
                        className="bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                              <reward.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 ml-3">
                              {t(`rewards.${reward.id}`)}
                            </h4>
                          </div>
                          <Badge variant="outline">
                            {t("rewards.redeemed")}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="levels">
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-purple-600 dark:border-purple-500 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                    <span className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                      {userProgress.level}
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 rounded-full w-10 h-10 flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    {userProgress.xp} XP
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-2">
                      {userProgress.level}
                    </div>
                    <span className="font-medium">Current Level</span>
                  </div>
                  <Badge variant="outline">{userProgress.xp}/{userProgress.nextLevelXp} XP</Badge>
                </div>
                <Progress value={(userProgress.xp / userProgress.nextLevelXp) * 100} className="h-2 mb-4" />
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center mr-2">
                      {userProgress.level + 1}
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Next Level</span>
                  </div>
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                    {userProgress.nextLevelXp} XP
                  </Badge>
                </div>
                
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <p className="mb-2">Rewards at Next Level:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>New badge available</li>
                    <li>Unlock special art style</li>
                    <li>+100 XP bonus</li>
                  </ul>
                </div>
                
                <Button className="w-full mt-4">
                  <Link to={createPageUrl("StoryIdeas")} className="w-full">
                    Create More Content to Level Up
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                      <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                      Create a book
                    </p>
                    <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                      +50 XP
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                      <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                      Generate a story idea
                    </p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                      +20 XP
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-2">
                      <Share2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                      Share a book
                    </p>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                      +30 XP
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}