
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Book } from "@/entities/Book";
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
  Plus
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

import BadgeDisplay from "../components/gamification/BadgeDisplay";
import AvatarSelector from "../components/profile/AvatarSelector";
import UserStats from "../components/profile/UserStats";
import AchievementList from "../components/profile/AchievementList";
import RecentActivity from "../components/profile/RecentActivity";
import MyBooksSection from "../components/profile/MyBooksSection";

export default function Profile() {
  const showToast = (message, type = "info") => {
    const toastClass = type === "error" ? "bg-red-100 border-red-200 text-red-800" : 
                      type === "success" ? "bg-green-100 border-green-200 text-green-800" : 
                      "bg-blue-100 border-blue-200 text-blue-800";

    const toastElement = document.createElement("div");
    toastElement.className = `fixed bottom-4 right-4 p-4 rounded-md border ${toastClass} shadow-md transition-all duration-500 z-50`;
    toastElement.textContent = message;
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(toastElement);
      }, 500);
    }, 3000);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isRTL, setIsRTL] = useState(false);
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

  const translations = {
    english: {
      "profile.title": "Profile",
      "profile.editProfile": "Edit Profile",
      "profile.saveChanges": "Save Changes",
      "profile.cancel": "Cancel",
      "profile.saving": "Saving...",
      "profile.saved": "Profile updated successfully",
      "profile.error": "Error updating profile",
      "profile.loading": "Loading profile...",
      "profile.tabs.overview": "Overview",
      "profile.tabs.books": "My Books",
      "profile.tabs.achievements": "Achievements",
      "profile.tabs.activity": "Activity",
      "profile.level": "Level",
      "profile.booksCreated": "Books Created",
      "profile.joined": "Joined",
      "profile.recentBooks": "Recent Books",
      "profile.noBooks": "No books created yet",
      "profile.startCreating": "Start creating your first book",
      "profile.viewAll": "View All",
      "profile.recentAchievements": "Recent Achievements",
      "profile.recentActivity": "Recent Activity",
      "profile.form.displayName": "Display Name",
      "profile.form.bio": "Bio",
      "profile.form.email": "Email",
      "profile.form.memberSince": "Member Since",
      "profile.form.storytellerLevel": "Storyteller Level",
      "profile.avatar.updated": "Avatar updated successfully",
      "profile.avatar.error": "Failed to update avatar",
      "profile.avatar.studio": "Avatar Studio",
      "profile.avatar.description": "Customize your avatar",
      "profile.createBook": "Create Book"
    },
    hebrew: {
      "profile.title": "פרופיל",
      "profile.editProfile": "עריכת פרופיל",
      "profile.saveChanges": "שמירת שינויים",
      "profile.cancel": "ביטול",
      "profile.saving": "שומר...",
      "profile.saved": "הפרופיל עודכן בהצלחה",
      "profile.error": "שגיאה בעדכון הפרופיל",
      "profile.loading": "טוען פרופיל...",
      "profile.tabs.overview": "סקירה כללית",
      "profile.tabs.books": "הספרים שלי",
      "profile.tabs.achievements": "הישגים",
      "profile.tabs.activity": "פעילות",
      "profile.level": "רמה",
      "profile.booksCreated": "ספרים שנוצרו",
      "profile.joined": "הצטרף",
      "profile.recentBooks": "ספרים אחרונים",
      "profile.noBooks": "עדיין לא נוצרו ספרים",
      "profile.startCreating": "התחל ליצור את הספר הראשון שלך",
      "profile.viewAll": "צפה בהכל",
      "profile.recentAchievements": "הישגים אחרונים",
      "profile.recentActivity": "פעילות אחרונה",
      "profile.form.displayName": "שם תצוגה",
      "profile.form.bio": "ביוגרפיה",
      "profile.form.email": "דוא\"ל",
      "profile.form.memberSince": "חבר מאז",
      "profile.form.storytellerLevel": "רמת מספר סיפורים",
      "profile.avatar.updated": "התמונה עודכנה בהצלחה",
      "profile.avatar.error": "שגיאה בעדכון התמונה",
      "profile.avatar.studio": "סטודיו לתמונות",
      "profile.avatar.description": "התאם אישית את התמונה שלך",
      "profile.createBook": "יצירת ספר"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || 
           translations.english[key] || 
           key;
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        const user = await User.me();
        if (!user) {
          showToast("Failed to load user data", "error");
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
        
        const interfaceLanguage = user.language || 
                                localStorage.getItem("appLanguage") || 
                                "english";
        setCurrentLanguage(interfaceLanguage);
        setIsRTL(interfaceLanguage === "hebrew" || interfaceLanguage === "yiddish");
        
        loadAchievementsData();
        loadRecentActivityData();
        
      } catch (error) {
        console.error("Error loading user data:", error);
        showToast("Failed to load profile", "error");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const loadAchievementsData = () => {
    const sampleAchievements = [
      {
        id: "first_book",
        title: "First Book Creator",
        description: "Create your first book",
        icon: BookOpen,
        category: "books",
        completed: true,
        progress: 100,
        max_progress: 1,
        unlocked_date: "2023-12-15",
        xp_reward: 50,
        translations: {
          en: {
            title: "First Book Creator",
            description: "Create your first book"
          },
          he: {
            title: "יוצר הספר הראשון",
            description: "צור את הספר הראשון שלך"
          }
        }
      },
      {
        id: "storyteller",
        title: "Storyteller",
        description: "Create 5 different books",
        icon: Sparkles,
        category: "books",
        completed: false,
        progress: 3,
        max_progress: 5,
        xp_reward: 100,
        translations: {
          en: {
            title: "Storyteller",
            description: "Create 5 different books"
          },
          he: {
            title: "מספר stories",
            description: "צור 5 ספרים שונים"
          }
        }
      },
      {
        id: "daily_streak",
        title: "Consistent Creator",
        description: "Access the app for 7 consecutive days",
        icon: Calendar,
        category: "activity",
        completed: true,
        progress: 7,
        max_progress: 7,
        unlocked_date: "2023-12-25",
        xp_reward: 75,
        translations: {
          en: {
            title: "Consistent Creator",
            description: "Access the app for 7 consecutive days"
          },
          he: {
            title: "יוצר עקבי",
            description: "גש לאפליקציה 7 ימים ברציפות"
          }
        }
      },
      {
        id: "genre_master",
        title: "Genre Explorer",
        description: "Create books in 3 different genres",
        icon: BookOpen,
        category: "creativity",
        completed: false,
        progress: 2,
        max_progress: 3,
        xp_reward: 80,
        translations: {
          en: {
            title: "Genre Explorer",
            description: "Create books in 3 different genres" 
          },
          he: {
            title: "חוקר ז'אנרים",
            description: "צור ספרים ב-3 ז'אנרים שונים"
          }
        }
      },
      {
        id: "community_contributor",
        title: "Community Star",
        description: "Share 3 books with the community",
        icon: Star,
        category: "community",
        completed: false,
        progress: 1,
        max_progress: 3,
        xp_reward: 100,
        translations: {
          en: {
            title: "Community Star",
            description: "Share 3 books with the community"
          },
          he: {
            title: "כוכב הקהילה",
            description: "שתף 3 ספרים עם הקהילה"
          }
        }
      }
    ];
    
    setAchievements(sampleAchievements);
  };

  const loadRecentActivityData = () => {
    const sampleActivity = [
      {
        id: "act1",
        type: "book_created",
        title: "Created a new book",
        description: "The Adventures of Luna",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        icon: BookOpen,
        iconColor: "text-blue-500"
      },
      {
        id: "act2",
        type: "achievement_unlocked",
        title: "Unlocked achievement",
        description: "Consistent Creator",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        icon: Award,
        iconColor: "text-amber-500"
      },
      {
        id: "act3",
        type: "level_up",
        title: "Leveled up to",
        description: "Level 2 Storyteller",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        icon: Trophy,
        iconColor: "text-purple-500"
      }
    ];
    
    setRecentActivity(sampleActivity);
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
      console.error("Error saving profile:", error);
      showToast(t("profile.error"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpdate = async (newAvatarUrl) => {
    try {
      setIsSaving(true);
      
      console.log("Updating avatar with URL:", newAvatarUrl);
      
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
      console.error("Error updating avatar:", error);
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
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div
            className="relative group cursor-pointer"
            onClick={() => setAvatarEditorOpen(true)}
          >
            <div className="h-24 w-24 relative overflow-hidden">
              <Avatar className="h-24 w-24 border-4 border-purple-100 dark:border-purple-900/50 
                                group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-all">
                {userData.avatar_url ? (
                  <AvatarImage src={userData.avatar_url} alt={userData.display_name} />
                ) : (
                  <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200 text-2xl">
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
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{userData.display_name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{userData.email}</p>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full flex items-center">
                <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400 me-1" />
                <span className="text-sm font-medium">
                  {t("profile.level")} {userData.level}
                </span>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full flex items-center">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 me-1" />
                <span className="text-sm font-medium">
                  {userData.total_books} {t("profile.booksCreated")}
                </span>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full flex items-center">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 me-1" />
                <span className="text-sm font-medium">
                  {t("profile.joined")} {formatDate(userData.created_date)}
                </span>
              </div>
            </div>
          </div>
          
          <Button onClick={() => setEditMode(true)} variant="outline" className="mt-4 md:mt-0">
            <Edit className="h-4 w-4 me-2" />
            {t("profile.editProfile")}
          </Button>
        </div>
        
        <div className="mt-6">
          <UserStats userData={userData} currentLanguage={currentLanguage} />
        </div>
      </div>

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

            <Card>
              <CardHeader>
                <CardTitle>{t("profile.recentAchievements")}</CardTitle>
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
                                    {currentLanguage === "hebrew" ? "הושלם" : "Completed"}
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
                        {currentLanguage === "hebrew" 
                          ? "השלם משימות כדי לקבל הישגים" 
                          : "Complete actions to earn achievements"}
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
          </div>
        </TabsContent>

        <TabsContent value="books">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t("profile.tabs.books")}</h2>
              <Link to={createPageUrl("CreativeStoryStudio")}>
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
