import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, BookOpen, Star, Award, Users, Calendar, Zap, 
  Heart, MessageCircle, PenTool, Globe, Bookmark, Crown,
  Target, Flame, Sparkles, Lightbulb, Palette,
  Brush, Music, Laptop, Coffee, Gift, Wand2,
  LayoutGrid, // שימוש ב-LayoutGrid במקום Layers
  Filter
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import BadgeDisplay from "../gamification/BadgeDisplay";

export default function AchievementList({ 
  achievements = [], 
  currentLanguage = "english", 
  showCategories = false,
  showProgress = true
}) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";

  const translations = {
    english: {
      "achievements.title": "Achievements",
      "achievements.search": "Search achievements",
      "achievements.filter.all": "All",
      "achievements.filter.unlocked": "Unlocked",
      "achievements.filter.locked": "In Progress",
      "achievements.categories.all": "All Categories",
      "achievements.categories.books": "Books",
      "achievements.categories.activity": "Activity",
      "achievements.categories.creativity": "Creativity",
      "achievements.categories.community": "Community",
      "achievements.progress": "Progress",
      "achievements.xpEarned": "XP earned",
      "achievements.dateLocked": "Unlocked",
      "achievements.progress.complete": "Complete",
      "achievements.progress.progress": "In Progress",
      "achievements.empty": "No achievements found",
      "achievements.empty.description": "Complete activities to earn achievements",
      "achievements.unlock": "How to unlock",
      "achievements.listView": "List",
      "achievements.categoryView": "Categories"
    },
    hebrew: {
      "achievements.title": "הישגים",
      "achievements.search": "חיפוש הישגים",
      "achievements.filter.all": "הכל",
      "achievements.filter.unlocked": "נפתחו",
      "achievements.filter.locked": "בתהליך",
      "achievements.categories.all": "כל הקטגוריות",
      "achievements.categories.books": "ספרים",
      "achievements.categories.activity": "פעילות",
      "achievements.categories.creativity": "יצירתיות",
      "achievements.categories.community": "קהילה",
      "achievements.progress": "התקדמות",
      "achievements.xpEarned": "XP הורווח",
      "achievements.dateLocked": "נפתח",
      "achievements.progress.complete": "הושלם",
      "achievements.progress.progress": "בתהליך",
      "achievements.empty": "לא נמצאו הישגים",
      "achievements.empty.description": "השלם פעילויות כדי להרוויח הישגים",
      "achievements.unlock": "איך לפתוח",
      "achievements.listView": "רשימה",
      "achievements.categoryView": "קטגוריות"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key];
  
  const categoryIcons = {
    books: <BookOpen className="h-5 w-5 text-blue-500" />,
    activity: <Calendar className="h-5 w-5 text-green-500" />,
    creativity: <Palette className="h-5 w-5 text-purple-500" />,
    community: <Users className="h-5 w-5 text-amber-500" />
  };
  
  const categories = [
    { id: "all", name: t("achievements.categories.all"), icon: <Trophy className="h-5 w-5 text-gray-500" /> },
    { id: "books", name: t("achievements.categories.books"), icon: categoryIcons.books },
    { id: "activity", name: t("achievements.categories.activity"), icon: categoryIcons.activity },
    { id: "creativity", name: t("achievements.categories.creativity"), icon: categoryIcons.creativity },
    { id: "community", name: t("achievements.categories.community"), icon: categoryIcons.community }
  ];
  
  const filteredAchievements = achievements.filter(achievement => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      (achievement.translations?.[currentLanguage === "hebrew" ? "he" : "en"]?.title || achievement.title)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = filter === "all" || 
      (filter === "unlocked" && achievement.completed) || 
      (filter === "locked" && !achievement.completed);
    
    // Category filter
    const matchesCategory = categoryFilter === "all" || achievement.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  const groupedByCategory =  
    filteredAchievements.reduce((groups, achievement) => {
      const category = achievement.category || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(achievement);
      return groups;
    }, {});
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      currentLanguage === "hebrew" ? "he-IL" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    );
  };
  
  const getTranslation = (achievement, field) => {
    const translationKey = currentLanguage === "hebrew" ? "he" : "en";
    return achievement.translations?.[translationKey]?.[field] || achievement[field];
  };
  
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <Tabs defaultValue="list" className="w-[200px]">
              <TabsList>
                <TabsTrigger value="list" className="flex gap-1">
                  <Bookmark className="h-4 w-4" />
                  {t("achievements.listView")}
                </TabsTrigger>
                <TabsTrigger value="category" className="flex gap-1">
                  <LayoutGrid className="h-4 w-4" />
                  {t("achievements.categoryView")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-2 flex-grow sm:flex-grow-0 sm:max-w-[300px]">
            <Input
              type="search"
              placeholder={t("achievements.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("achievements.filter.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("achievements.filter.all")}</SelectItem>
                <SelectItem value="unlocked">{t("achievements.filter.unlocked")}</SelectItem>
                <SelectItem value="locked">{t("achievements.filter.locked")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {showCategories && (
          <div className="mt-4 pb-1">
            <div className="flex overflow-x-auto gap-2 pb-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={categoryFilter === category.id ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center gap-2 whitespace-nowrap ${
                    categoryFilter === category.id 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : ''
                  }`}
                  onClick={() => setCategoryFilter(category.id)}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-6">
        {filteredAchievements.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {filteredAchievements.map((achievement, index) => {
              const translationLang = currentLanguage === "hebrew" ? "he" : "en";
              const title = achievement.translations?.[translationLang]?.title || achievement.title;
              const description = achievement.translations?.[translationLang]?.description || achievement.description;
              
              return (
                <Card 
                  key={achievement.id || index}
                  className={`overflow-hidden border ${
                    achievement.completed 
                      ? 'border-green-100 dark:border-green-900/30' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center gap-2">
                      <BadgeDisplay 
                        badgeId={achievement.id} 
                        size="lg" 
                        completed={achievement.completed}
                        inProgress={!achievement.completed && achievement.progress > 0}
                        currentLanguage={currentLanguage}
                      />
                      
                      <h3 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">
                        {title}
                      </h3>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                      </p>
                      
                      {achievement.completed ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {t("achievements.progress.complete")}
                        </Badge>
                      ) : showProgress && (
                        <div className="w-full mt-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{achievement.progress}/{achievement.max_progress}</span>
                            <span>{achievement.xp_reward} XP</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.max_progress) * 100} 
                            className="h-2 mt-1" 
                          />
                        </div>
                      )}
                      
                      {achievement.unlocked_date && (
                        <div className="text-xs text-gray-500 mt-1">
                          {t("achievements.dateLocked")}: {formatDate(achievement.unlocked_date)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">{t("achievements.empty")}</h3>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">{t("achievements.empty.description")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}