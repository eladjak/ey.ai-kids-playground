
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Book } from "@/entities/Book";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { 
  Trophy, 
  Medal, 
  Award, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Clock,
  Star,
  BookOpen,
  Users,
  Shield,
  Calendar
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function Leaderboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isRTL, setIsRTL] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("weekly");
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load user settings
        const user = await User.me();
        setCurrentUser(user);
        
        const storedLanguage = localStorage.getItem("appLanguage") || "english";
        setCurrentLanguage(storedLanguage);
        setIsRTL(storedLanguage === "hebrew" || storedLanguage === "yiddish");
        
        // Load mock leaderboard data
        generateMockLeaderboardData();
        
      } catch (error) {
        // silently handled
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Update leaderboard when filters change
  useEffect(() => {
    generateMockLeaderboardData();
  }, [timePeriod, category]);

  const generateMockLeaderboardData = () => {
    // Generate different data based on selected period and category
    const mockUsers = [
      { id: 1, name: "Sophie K.", avatar: "https://i.pravatar.cc/150?img=29", level: 8, books: 24, xp: 1860, streak: 15, rank_change: 0 },
      { id: 2, name: "Ethan M.", avatar: "https://i.pravatar.cc/150?img=12", level: 7, books: 19, xp: 1580, streak: 12, rank_change: 2 },
      { id: 3, name: "Olivia J.", avatar: "https://i.pravatar.cc/150?img=23", level: 6, books: 15, xp: 1250, streak: 8, rank_change: -1 },
      { id: 4, name: "Daniel S.", avatar: "https://i.pravatar.cc/150?img=52", level: 5, books: 12, xp: 980, streak: 5, rank_change: 1 },
      { id: 5, name: "Current User", avatar: "", level: 4, books: 8, xp: 720, streak: 7, rank_change: 3, isCurrentUser: true },
      { id: 6, name: "Maya L.", avatar: "https://i.pravatar.cc/150?img=32", level: 4, books: 7, xp: 650, streak: 4, rank_change: -2 },
      { id: 7, name: "Noah B.", avatar: "https://i.pravatar.cc/150?img=53", level: 3, books: 6, xp: 540, streak: 3, rank_change: 0 },
      { id: 8, name: "Emma R.", avatar: "https://i.pravatar.cc/150?img=44", level: 3, books: 5, xp: 480, streak: 6, rank_change: 5 },
      { id: 9, name: "Liam P.", avatar: "https://i.pravatar.cc/150?img=55", level: 3, books: 5, xp: 450, streak: 2, rank_change: -3 },
      { id: 10, name: "Ava T.", avatar: "https://i.pravatar.cc/150?img=47", level: 2, books: 4, xp: 390, streak: 1, rank_change: 1 }
    ];
    
    // Create variations for different time periods and categories
    let selectedData = [...mockUsers];
    
    if (timePeriod === "monthly") {
      // Different order for monthly
      selectedData = selectedData.map(user => ({
        ...user,
        xp: Math.round(user.xp * 3.2), // More XP for longer period
        books: Math.round(user.books * 1.5),
        rank_change: Math.floor(Math.random() * 7) - 3
      }));
      
      // Shuffle the order a bit
      selectedData.sort((a, b) => b.xp - a.xp);
    } else if (timePeriod === "allTime") {
      selectedData = selectedData.map(user => ({
        ...user,
        xp: Math.round(user.xp * 8.5), // Much more XP for all time
        books: Math.round(user.books * 3.2),
        rank_change: 0 // No rank change for all time
      }));
      
      // Add more veteran users at the top for all time
      selectedData.unshift(
        { id: 100, name: "James W.", avatar: "https://i.pravatar.cc/150?img=59", level: 12, books: 42, xp: 8950, streak: 24, rank_change: 0 },
        { id: 101, name: "Charlotte D.", avatar: "https://i.pravatar.cc/150?img=48", level: 11, books: 38, xp: 7600, streak: 18, rank_change: 0 }
      );
      
      // Move current user down for all time
      const currentUserIndex = selectedData.findIndex(u => u.isCurrentUser);
      if (currentUserIndex !== -1) {
        const currentUser = selectedData[currentUserIndex];
        selectedData.splice(currentUserIndex, 1);
        selectedData.splice(7, 0, { ...currentUser, xp: 2100, level: 6, books: 12 });
      }
    }
    
    // Filter by category
    if (category === "books") {
      selectedData.sort((a, b) => b.books - a.books);
    } else if (category === "streak") {
      selectedData.sort((a, b) => b.streak - a.streak);
    } else {
      // Default sort by XP
      selectedData.sort((a, b) => b.xp - a.xp);
    }
    
    setLeaderboardData(selectedData);
    setTotalPages(Math.ceil(selectedData.length / 10));
  };

  const translations = {
    english: {
      "leaderboard.title": "Storytellers Leaderboard",
      "leaderboard.subtitle": "See who's creating the most magical stories",
      "leaderboard.tabs.weekly": "This Week",
      "leaderboard.tabs.monthly": "This Month",
      "leaderboard.tabs.allTime": "All Time",
      "leaderboard.filter.title": "Filter by",
      "leaderboard.filter.all": "Overall XP",
      "leaderboard.filter.books": "Books Created",
      "leaderboard.filter.streak": "Longest Streak",
      "leaderboard.rank": "Rank",
      "leaderboard.user": "Storyteller",
      "leaderboard.level": "Level",
      "leaderboard.xp": "XP Points",
      "leaderboard.books": "Books",
      "leaderboard.streak": "Streak",
      "leaderboard.search": "Search storytellers...",
      "leaderboard.your.rank": "Your Rank",
      "leaderboard.your.position": "Your position",
      "leaderboard.top.storytellers": "Top Storytellers",
      "leaderboard.total.users": "Total Storytellers",
      "leaderboard.rising.stars": "Rising Stars",
      "leaderboard.most.improved": "Most Improved",
      "leaderboard.view.profile": "View Profile"
    },
    hebrew: {
      "leaderboard.title": "טבלת המובילים",
      "leaderboard.subtitle": "ראה מי יוצר את הסיפורים הקסומים ביותר",
      "leaderboard.tabs.weekly": "השבוע",
      "leaderboard.tabs.monthly": "החודש",
      "leaderboard.tabs.allTime": "כל הזמנים",
      "leaderboard.filter.title": "סנן לפי",
      "leaderboard.filter.all": "ניקוד כולל",
      "leaderboard.filter.books": "ספרים שנוצרו",
      "leaderboard.filter.streak": "רצף הארוך ביותר",
      "leaderboard.rank": "דירוג",
      "leaderboard.user": "מספר סיפורים",
      "leaderboard.level": "רמה",
      "leaderboard.xp": "נקודות ניסיון",
      "leaderboard.books": "ספרים",
      "leaderboard.streak": "רצף",
      "leaderboard.search": "חפש מספרי סיפורים...",
      "leaderboard.your.rank": "הדירוג שלך",
      "leaderboard.your.position": "המיקום שלך",
      "leaderboard.top.storytellers": "מספרי הסיפורים המובילים",
      "leaderboard.total.users": "סה״כ מספרי סיפורים",
      "leaderboard.rising.stars": "כוכבים עולים",
      "leaderboard.most.improved": "השיפור הגדול ביותר",
      "leaderboard.view.profile": "צפה בפרופיל"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // In a real app, this would trigger a search API call or filter the data
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTimePeriod(tab);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // In a real app, this would load the relevant page of data
  };

  // Rank trend indicator component
  const RankTrend = ({ change }) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-500 text-xs">
          <ArrowUp className="h-3 w-3 mr-1" />
          <span>{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500 text-xs">
          <ArrowDown className="h-3 w-3 mr-1" />
          <span>{Math.abs(change)}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-400 text-xs">
          <Minus className="h-3 w-3 mr-1" />
          <span>0</span>
        </div>
      );
    }
  };

  // Get rank decoration based on position
  const getRankDecoration = (rank) => {
    switch (rank) {
      case 1:
        return {
          icon: <Trophy className="h-5 w-5 text-amber-500" />,
          className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
        };
      case 2:
        return {
          icon: <Medal className="h-5 w-5 text-gray-500" />,
          className: "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300"
        };
      case 3:
        return {
          icon: <Award className="h-5 w-5 text-amber-800" />,
          className: "bg-amber-100/50 text-amber-800 dark:bg-amber-900/10 dark:text-amber-400"
        };
      default:
        return {
          icon: null,
          className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        };
    }
  };

  const filteredLeaderboard = leaderboardData.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current user data
  const currentUserEntry = leaderboardData.find(user => user.isCurrentUser);
  const currentUserRank = currentUserEntry ? leaderboardData.indexOf(currentUserEntry) + 1 : null;

  const paginatedData = filteredLeaderboard.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="max-w-6xl mx-auto pb-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("leaderboard.title")}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t("leaderboard.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
              <Input
                placeholder={t("leaderboard.search")}
                value={searchQuery}
                onChange={handleSearch}
                className={`w-full md:w-64 ${isRTL ? 'pr-9' : 'pl-9'}`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="md:col-span-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-900/30">
            <CardContent className="p-6">
              {currentUserEntry ? (
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-full ${getRankDecoration(currentUserRank).className}`}>
                    {getRankDecoration(currentUserRank).icon || (
                      <span className="text-xl font-bold">#{currentUserRank}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{t("leaderboard.your.rank")}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className="gap-1 font-normal bg-white/70 dark:bg-gray-800/50">
                        <Trophy className="h-3 w-3 text-amber-500" />
                        <span>#{currentUserRank}</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1 font-normal bg-white/70 dark:bg-gray-800/50">
                        <Star className="h-3 w-3 text-purple-500" />
                        <span>{currentUserEntry.xp} XP</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1 font-normal bg-white/70 dark:bg-gray-800/50">
                        <BookOpen className="h-3 w-3 text-blue-500" />
                        <span>{currentUserEntry.books}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <RankTrend change={currentUserEntry.rank_change} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p>Login to see your rank</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-900/30">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-lg">{t("leaderboard.top.storytellers")}</h3>
              <p className="text-2xl font-bold mt-1">{leaderboardData.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-900/30">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-lg">{t("leaderboard.rising.stars")}</h3>
              <p className="text-2xl font-bold mt-1">24</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <Tabs
              defaultValue={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="weekly">
                    <CalendarRange className="h-4 w-4 mr-2" />
                    {t("leaderboard.tabs.weekly")}
                  </TabsTrigger>
                  <TabsTrigger value="monthly">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("leaderboard.tabs.monthly")}
                  </TabsTrigger>
                  <TabsTrigger value="allTime">
                    <Clock className="h-4 w-4 mr-2" />
                    {t("leaderboard.tabs.allTime")}
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t("leaderboard.filter.title")}:</span>
                  <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("leaderboard.filter.all")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("leaderboard.filter.all")}</SelectItem>
                      <SelectItem value="books">{t("leaderboard.filter.books")}</SelectItem>
                      <SelectItem value="streak">{t("leaderboard.filter.streak")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="weekly" className="mt-0" />
              <TabsContent value="monthly" className="mt-0" />
              <TabsContent value="allTime" className="mt-0" />
            </Tabs>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("leaderboard.rank")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("leaderboard.user")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("leaderboard.level")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("leaderboard.xp")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("leaderboard.books")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("leaderboard.streak")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedData.map((user, index) => {
                  const actualRank = (currentPage - 1) * 10 + index + 1;
                  const rankDecoration = getRankDecoration(actualRank);
                  
                  return (
                    <tr 
                      key={user.id} 
                      className={user.isCurrentUser ? 'bg-purple-50 dark:bg-purple-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${rankDecoration.className}`}>
                            {rankDecoration.icon || actualRank}
                          </div>
                          <RankTrend change={user.rank_change} />
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            {user.avatar ? (
                              <AvatarImage src={user.avatar} alt={user.name} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className="font-medium">{user.name}</span>
                              {user.isCurrentUser && (
                                <Badge className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                  {t("leaderboard.you")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{user.level}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium">
                        {user.xp.toLocaleString()} XP
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span>{user.books}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <CalendarRange className="h-4 w-4 text-green-500" />
                          <span>{user.streak} {timePeriod !== "allTime" ? (currentLanguage === "hebrew" ? "ימים" : "days") : ""}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <Link to={createPageUrl("Profile")}>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-purple-600 dark:text-purple-400">
                            {t("leaderboard.view.profile")}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  
                  // Logic to show the right range of page numbers
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
