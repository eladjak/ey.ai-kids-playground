
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Book } from "@/entities/Book";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserBadge } from "@/entities/UserBadge";
import useGamification, { BADGE_DEFINITIONS } from "@/hooks/useGamification";
import { useI18n } from "@/components/i18n/i18nProvider";
import FollowButton from "@/components/social/FollowButton";
import { useToast } from "@/components/ui/use-toast";
import {
  User as UserIcon,
  Settings,
  Edit,
  Camera,
  Trophy,
  BookOpen,
  ChevronRight,
  Star,
  Clock,
  Sparkles,
  Calendar,
  Award,
  Gift,
  ArrowUpRight,
  Loader2,
  Palette,
  Globe,
  MessageSquare,
  Users,
  Heart,
  Zap,
  MessageCircle,
  Plus,
  FileText,
  BarChart3
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

import { motion } from "framer-motion";

import BadgeDisplay from "../components/gamification/BadgeDisplay";
import AvatarSelector from "../components/profile/AvatarSelector";
import UserStats from "../components/profile/UserStats";
import AchievementList from "../components/profile/AchievementList";
import RecentActivity from "../components/profile/RecentActivity";
import MyBooksSection from "../components/profile/MyBooksSection";

export default function Profile() {
  const { t, language: i18nLanguage, isRTL } = useI18n();
  const { toast } = useToast();
  const { user: hookUser } = useCurrentUser();

  const showToast = (message, type = "info") => {
    toast({
      title: message,
      variant: type === "error" ? "destructive" : "default",
    });
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18nLanguage);
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [userBooks, setUserBooks] = useState([]);

  const [userData, setUserData] = useState({
    id: "",
    email: "",
    full_name: "",
    role: "",
    created_date: "",
    display_name: "",
    avatar_url: "",
    bio: "",
    level: 1,
    xp: 0,
    next_level_xp: 200,
    total_books: 0,
    total_pages: 0,
    streak_days: 0,
    badges: [],
    favorite_genres: [],
    completed_books: []
  });

  const [editableData, setEditableData] = useState({
    display_name: "",
    bio: ""
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [readingStats, setReadingStats] = useState({
    totalBooks: 0,
    totalPages: 0,
    favoriteGenre: null,
    memberSince: null,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);

        const user = hookUser;
        if (!user) {
          // Hook may still be loading; wait for it
          setIsLoading(false);
          return;
        }
        
        const allBooks = await Book.filter({ created_by: user.email }, "-created_date");
        const recentBooksData = allBooks.slice(0, 3); 

        const formattedUser = {
          ...user,
          display_name: user.display_name || user.full_name,
          level: user.level || 1,
          xp: user.xp || 0,
          next_level_xp: user.next_level_xp || 200,
          bio: user.bio || "",
          avatar_url: user.avatar_url || "",
          total_books: allBooks.length,
          total_pages: allBooks.reduce((total, book) => total + (book.total_pages || 0), 0),
          streak_days: user.streak_days || 0,
          badges: user.badges || [],
          favorite_genres: user.favorite_genres || []
        };
        
        setUserData(formattedUser);
        setEditableData({
          display_name: formattedUser.display_name,
          bio: formattedUser.bio
        });
        setRecentBooks(recentBooksData);
        setUserBooks(allBooks);

        // Compute reading stats
        const totalPages = allBooks.reduce((sum, b) => sum + (b.total_pages || 0), 0);
        const genreCounts = {};
        allBooks.forEach((b) => {
          if (b.genre) {
            genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
          }
        });
        const favoriteGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        setReadingStats({
          totalBooks: allBooks.length,
          totalPages,
          favoriteGenre,
          memberSince: user.created_date || null,
        });

        const interfaceLanguage = user.language || i18nLanguage || "english";
        setCurrentLanguage(interfaceLanguage);
        
        loadAchievementsData(user, allBooks);
        loadRecentActivityData(allBooks);
        
      } catch (error) {
        showToast(t("profile.error"), "error");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookUser]);

  const loadAchievementsData = async (user, books) => {
    try {
      // Load earned badges from UserBadge entity
      let userBadges = [];
      try {
        userBadges = await UserBadge.filter({ user_id: user.id || user.email });
      } catch {
        // UserBadge may not have data yet
      }

      // Compute stats for badge progress
      const genres = new Set(books.map(b => b.genre).filter(Boolean));
      const languages = new Set(books.map(b => b.language).filter(Boolean));
      const stats = {
        totalBooks: books.length,
        totalCharacters: user.total_characters || 0,
        communityShares: user.community_shares || 0,
        streakDays: user.streak_days || 0,
        uniqueGenres: genres.size,
        uniqueLanguages: languages.size
      };

      // Build achievements from BADGE_DEFINITIONS with real progress
      const achievementData = Object.values(BADGE_DEFINITIONS).map(def => {
        const earned = userBadges.find(b => b.badge_id === def.id);
        const isCompleted = !!earned || def.check(stats);
        const currentProgress = def.progress(stats);

        return {
          id: def.id,
          title: def.nameEn,
          description: def.descEn,
          icon: BookOpen,
          category: def.category,
          completed: isCompleted,
          progress: currentProgress,
          max_progress: def.maxProgress,
          unlocked_date: earned?.earned_date || null,
          xp_reward: def.xpReward,
          translations: {
            en: { title: def.nameEn, description: def.descEn },
            he: { title: def.nameHe, description: def.descHe }
          }
        };
      });

      setAchievements(achievementData);
    } catch {
      setAchievements([]);
    }
  };

  const loadRecentActivityData = (books) => {
    // Build activity from real book data
    const activities = books.slice(0, 10).map((book, i) => ({
      id: `book_${book.id}`,
      type: "book_created",
      title: t("profile.activity.bookCreated"),
      description: book.title || t("profile.activity.untitled"),
      date: new Date(book.created_date || Date.now()),
      icon: BookOpen,
      iconColor: "text-blue-500"
    }));

    setRecentActivity(activities);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(currentLanguage === "english" ? "en-US" : "he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        display_name: editableData.display_name,
        bio: editableData.bio
      });
      
      setUserData(prev => ({
        ...prev,
        display_name: editableData.display_name,
        bio: editableData.bio
      }));
      
      setEditMode(false);
      
      showToast(t("profile.saved"), "success");
    } catch (error) {
      showToast(t("profile.error"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpdate = async (newAvatarUrl) => {
    try {
      setIsSaving(true);
      
      await User.updateMyUserData({
        avatar_url: newAvatarUrl
      });
      
      setUserData(prev => ({
        ...prev,
        avatar_url: newAvatarUrl
      }));
      
      showToast(t("profile.avatar.updated"), "success");
      setAvatarEditorOpen(false);
    } catch (error) {
      showToast(t("profile.avatar.error"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  const dir = isRTL ? "rtl" : "ltr";

  return (
    <div className="max-w-6xl mx-auto pb-16" dir={dir}>
      {/* Gradient Header Banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl mb-6 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 p-8 pb-20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)]" />
        </div>

        {/* Profile Card overlapping the banner */}
        <div className="relative -mt-14 mx-4 md:mx-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <motion.div
              className="relative group cursor-pointer -mt-16"
              onClick={() => setAvatarEditorOpen(true)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="h-28 w-28 relative overflow-hidden">
                <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-700 shadow-xl
                                  group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-all ring-4 ring-purple-200/50 dark:ring-purple-900/30">
                  {userData.avatar_url ? (
                    <AvatarImage src={userData.avatar_url} alt={userData.display_name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-3xl font-bold">
                      {userData.display_name?.charAt(0) || userData.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0
                                bg-black/40 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>

                <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1.5 border-2 border-white
                                dark:border-gray-800 shadow-md transform transition-transform
                                group-hover:scale-110">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
            </motion.div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.display_name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{userData.email}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 px-4 py-1.5 rounded-full flex items-center shadow-sm border border-purple-100 dark:border-purple-800/30">
                  <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400 me-1.5" />
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {t("profile.level")} {userData.level}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 px-4 py-1.5 rounded-full flex items-center shadow-sm border border-blue-100 dark:border-blue-800/30">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 me-1.5" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {userData.total_books} {t("profile.booksCreated")}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/20 px-4 py-1.5 rounded-full flex items-center shadow-sm border border-amber-100 dark:border-amber-800/30">
                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 me-1.5" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    {t("profile.joined")} {formatDate(userData.created_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Show follow button when viewing other profiles - ready for public profiles */}
            {userData.email && hookUser?.email && userData.email !== hookUser.email && (
              <FollowButton targetEmail={userData.email} />
            )}
            <Button onClick={() => setEditMode(true)} variant="outline" className="mt-4 md:mt-0 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20">
              <Edit className="h-4 w-4 me-2" />
              {t("profile.editProfile")}
            </Button>
          </div>

          <div className="mt-6">
            <UserStats userData={userData} currentLanguage={currentLanguage} />
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="overview">{t("profile.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="books">{t("profile.tabs.books")}</TabsTrigger>
          <TabsTrigger value="achievements">{t("profile.tabs.achievements")}</TabsTrigger>
          <TabsTrigger value="activity">{t("profile.tabs.activity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <MyBooksSection 
              books={recentBooks} 
              currentLanguage={currentLanguage} 
            />

            <Card className="relative overflow-hidden border-0 shadow-lg">
              <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: "url('/images/achievements.jpg')" }}
              />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  {t("profile.recentAchievements")}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
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
                          <Card 
                            key={achievement.id || index}
                            className={`overflow-hidden ${achievement.completed ? 'border-green-100 dark:border-green-900/30' : ''}`}
                          >
                            <div className="p-4">
                              <div className="flex flex-col items-center text-center gap-2">
                                <BadgeDisplay 
                                  badgeId={achievement.id} 
                                  size="lg" 
                                  completed={achievement.completed}
                                  inProgress={!achievement.completed && achievement.progress > 0}
                                  currentLanguage={currentLanguage}
                                />
                                <h4 className="font-medium mt-2 text-gray-900 dark:text-gray-100">
                                  {achievementText.title}
                                </h4>
                                {achievement.completed ? (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {t("profile.achievements.completed")}
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
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">
                        {t("profile.achievements.earnMore")}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => document.querySelector('[data-value="achievements"]').click()}
                  >
                    {t("profile.viewAll")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reading Stats Card */}
            <Card className="md:col-span-2 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  {t("profile.readingStats.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Static Tailwind color maps — dynamic class strings break Tailwind's JIT scanner */}
                {(() => {
                  const colorClasses = {
                    purple: {
                      card: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-100/50 dark:border-purple-800/20",
                      icon: "bg-purple-100 dark:bg-purple-900/30",
                      iconText: "text-purple-600 dark:text-purple-400"
                    },
                    blue: {
                      card: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-100/50 dark:border-blue-800/20",
                      icon: "bg-blue-100 dark:bg-blue-900/30",
                      iconText: "text-blue-600 dark:text-blue-400"
                    },
                    amber: {
                      card: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-100/50 dark:border-amber-800/20",
                      icon: "bg-amber-100 dark:bg-amber-900/30",
                      iconText: "text-amber-600 dark:text-amber-400"
                    },
                    green: {
                      card: "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border border-green-100/50 dark:border-green-800/20",
                      icon: "bg-green-100 dark:bg-green-900/30",
                      iconText: "text-green-600 dark:text-green-400"
                    }
                  };
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: BookOpen, color: "purple", value: readingStats.totalBooks, label: t("profile.readingStats.booksCreated"), delay: 0 },
                        { icon: FileText, color: "blue", value: readingStats.totalPages, label: t("profile.readingStats.totalPages"), delay: 0.1 },
                        { icon: Star, color: "amber", value: readingStats.favoriteGenre ? readingStats.favoriteGenre.replace(/_/g, " ") : t("profile.readingStats.noGenre"), label: t("profile.readingStats.favoriteGenre"), delay: 0.2, capitalize: true },
                        { icon: Calendar, color: "green", value: readingStats.memberSince ? formatDate(readingStats.memberSince) : "-", label: t("profile.readingStats.memberSince"), delay: 0.3 }
                      ].map((stat, idx) => {
                        const IconComp = stat.icon;
                        const cc = colorClasses[stat.color];
                        return (
                          <motion.div
                            key={idx}
                            className={`${cc.card} rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: stat.delay, duration: 0.4 }}
                          >
                            <div className={`mx-auto mb-3 w-12 h-12 rounded-full ${cc.icon} flex items-center justify-center`}>
                              <IconComp className={`h-6 w-6 ${cc.iconText}`} />
                            </div>
                            <p className={`text-2xl font-bold text-gray-900 dark:text-white ${stat.capitalize ? 'capitalize' : ''}`}>{stat.value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="books">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t("profile.tabs.books")}</h2>
              <Link to={createPageUrl("BookWizard")}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("profile.createBook")}
                </Button>
              </Link>
            </div>
            
            <MyBooksSection 
              books={userBooks} 
              currentLanguage={currentLanguage} 
              showAll={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("profile.tabs.achievements")}</h2>
            <AchievementList 
              achievements={achievements}
              currentLanguage={currentLanguage}
              showCategories={true}
              showProgress={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("profile.tabs.activity")}</h2>
            <RecentActivity 
              activities={recentActivity}
              currentLanguage={currentLanguage}
              showFilters={true}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.editProfile")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t("profile.form.displayName")}</Label>
              <Input 
                id="displayName" 
                value={editableData.display_name}
                onChange={(e) => setEditableData({...editableData, display_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">{t("profile.form.bio")}</Label>
              <Input
                id="bio"
                value={editableData.bio}
                onChange={(e) => setEditableData({...editableData, bio: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMode(false)}>
              {t("profile.cancel")}
            </Button>
            <Button onClick={saveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("profile.saving")}
                </>
              ) : (
                <>{t("profile.saveChanges")}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={avatarEditorOpen} onOpenChange={setAvatarEditorOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t("profile.avatar.studio")}</DialogTitle>
            <DialogDescription>
              {t("profile.avatar.description")}
            </DialogDescription>
          </DialogHeader>
          <AvatarSelector
            open={avatarEditorOpen}
            onOpenChange={setAvatarEditorOpen}
            currentAvatar={userData.avatar_url}
            onSelectAvatar={handleAvatarUpdate}
            currentLanguage={currentLanguage}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
