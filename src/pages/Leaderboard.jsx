
import React, { useState, useEffect } from "react";
import { useI18n } from "@/components/i18n/i18nProvider";
import { Book } from "@/entities/Book";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Community } from "@/entities/Community";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { getLevelFromXP } from "@/hooks/useGamification";
import {
  Trophy,
  Medal,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Clock,
  Star,
  BookOpen,
  Users,
  Shield,
  Calendar,
  Loader2
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function Leaderboard() {
  const { t, language, isRTL } = useI18n();
  const { user: hookUser } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("weekly");
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStoryTellers, setTotalStoryTellers] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (currentUser) {
      buildLeaderboard();
    }
  }, [timePeriod, category]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      if (hookUser) {
        setCurrentUser(hookUser);
      }

      await buildLeaderboard(hookUser);
    } catch {
      // silently handled
    } finally {
      setIsLoading(false);
    }
  };

  const buildLeaderboard = async (userOverride) => {
    try {
      const user = userOverride || currentUser;
      if (!user) return;

      // Load all books to aggregate per-user stats
      const allBooks = await Book.list("-created_date", 200);

      // Build date filter based on time period
      const now = new Date();
      let dateThreshold = null;
      if (timePeriod === "weekly") {
        dateThreshold = new Date(now.getTime() - 7 * 86400000);
      } else if (timePeriod === "monthly") {
        dateThreshold = new Date(now.getTime() - 30 * 86400000);
      }
      // allTime = no filter

      // Filter books by date
      const filteredBooks = dateThreshold
        ? allBooks.filter(b => new Date(b.created_date) >= dateThreshold)
        : allBooks;

      // Aggregate by created_by (email)
      const userMap = {};
      for (const book of filteredBooks) {
        const email = book.created_by;
        if (!email) continue;

        if (!userMap[email]) {
          userMap[email] = {
            email,
            name: book.created_by_name || email.split("@")[0],
            avatar: "",
            books: 0,
            xp: 0,
            streak: 0,
            level: 1,
            isCurrentUser: email === user.email
          };
        }
        userMap[email].books += 1;
        userMap[email].xp += 100; // XP_EVENTS.book_created = 100
      }

      // Enrich current user with real data
      if (userMap[user.email]) {
        userMap[user.email].name = user.display_name || user.full_name || user.email.split("@")[0];
        userMap[user.email].avatar = user.avatar_url || "";
        userMap[user.email].xp = user.xp || userMap[user.email].xp;
        userMap[user.email].level = user.level || getLevelFromXP(userMap[user.email].xp);
        userMap[user.email].streak = user.streak_days || 0;
      } else {
        // Current user has no books in this period — still show them
        userMap[user.email] = {
          email: user.email,
          name: user.display_name || user.full_name || user.email.split("@")[0],
          avatar: user.avatar_url || "",
          books: 0,
          xp: user.xp || 0,
          streak: user.streak_days || 0,
          level: user.level || 1,
          isCurrentUser: true
        };
      }

      // Convert to array
      let entries = Object.values(userMap);

      // Compute levels for all entries
      entries = entries.map(e => ({
        ...e,
        level: e.level || getLevelFromXP(e.xp)
      }));

      // Sort by selected category
      if (category === "books") {
        entries.sort((a, b) => b.books - a.books);
      } else if (category === "streak") {
        entries.sort((a, b) => b.streak - a.streak);
      } else {
        entries.sort((a, b) => b.xp - a.xp);
      }

      setLeaderboardData(entries);
      setTotalStoryTellers(entries.length);
    } catch {
      // silently handled
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
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
  };

  const RankTrend = ({ rank }) => {
    // For real data we show the rank number, no fake trends
    return null;
  };

  const getRankDecoration = (rank) => {
    switch (rank) {
      case 1:
        return {
          icon: <Trophy className="h-5 w-5 text-amber-500" />,
          className: "bg-gradient-to-br from-amber-200 to-yellow-300 text-amber-900 dark:from-amber-700/40 dark:to-yellow-600/30 dark:text-amber-200 shadow-sm ring-2 ring-amber-300/50 dark:ring-amber-600/30",
          rowClassName: "bg-gradient-to-r from-amber-50/80 to-yellow-50/50 dark:from-amber-900/15 dark:to-yellow-900/10 border-l-4 border-amber-400"
        };
      case 2:
        return {
          icon: <Medal className="h-5 w-5 text-gray-400" />,
          className: "bg-gradient-to-br from-gray-200 to-slate-300 text-gray-800 dark:from-gray-600/40 dark:to-slate-500/30 dark:text-gray-200 shadow-sm ring-2 ring-gray-300/50 dark:ring-gray-600/30",
          rowClassName: "bg-gradient-to-r from-gray-50/80 to-slate-50/50 dark:from-gray-800/30 dark:to-slate-800/20 border-l-4 border-gray-300"
        };
      case 3:
        return {
          icon: <Award className="h-5 w-5 text-orange-700" />,
          className: "bg-gradient-to-br from-orange-200 to-amber-300 text-orange-900 dark:from-orange-700/30 dark:to-amber-600/20 dark:text-orange-200 shadow-sm ring-2 ring-orange-300/50 dark:ring-orange-600/30",
          rowClassName: "bg-gradient-to-r from-orange-50/60 to-amber-50/40 dark:from-orange-900/10 dark:to-amber-900/5 border-l-4 border-orange-300"
        };
      default:
        return {
          icon: null,
          className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          rowClassName: ""
        };
    }
  };

  const filteredLeaderboard = leaderboardData.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUserEntry = leaderboardData.find(u => u.isCurrentUser);
  const currentUserRank = currentUserEntry ? leaderboardData.indexOf(currentUserEntry) + 1 : null;

  const totalPages = Math.max(1, Math.ceil(filteredLeaderboard.length / 10));
  const paginatedData = filteredLeaderboard.slice((currentPage - 1) * 10, currentPage * 10);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto pb-12 p-4 md:p-6">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Skeleton className="md:col-span-2 h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>

        {/* Table skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Tabs skeleton */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>

          {/* Row skeletons — match actual leaderboard row layout */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
                {/* Rank */}
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                {/* Avatar + name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 w-32" />
                </div>
                {/* Level */}
                <Skeleton className="h-4 w-12 hidden sm:block" />
                {/* XP */}
                <Skeleton className="h-4 w-16 hidden sm:block" />
                {/* Books */}
                <Skeleton className="h-4 w-10 hidden md:block" />
                {/* Streak */}
                <Skeleton className="h-4 w-14 hidden md:block" />
                {/* Button */}
                <Skeleton className="h-8 w-20 rounded-md flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12" dir={isRTL ? "rtl" : "ltr"}>
      {/* Gradient Banner Header */}
      <div className="relative overflow-hidden rounded-2xl mx-4 md:mx-6 mt-4 mb-6 shadow-lg">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-8 md:p-10">
          <div
            className="absolute inset-0 opacity-[0.08] bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: "url('/images/leaderboard.jpg')" }}
          />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,white_0%,transparent_60%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">{t("leaderboard.title")}</h1>
                <p className="text-white/80">{t("leaderboard.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-white/60`} />
                <Input
                  placeholder={t("leaderboard.search")}
                  value={searchQuery}
                  onChange={handleSearch}
                  className={`w-full md:w-64 ${isRTL ? 'pr-9' : 'pl-9'} bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/50 focus:bg-white/30`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 pt-0">

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
                </div>
              ) : (
                <div className="text-center py-2">
                  <p>{language === "hebrew" ? "התחבר כדי לראות את הדירוג שלך" : "Login to see your rank"}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-900/30">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-lg">{t("leaderboard.top.storytellers")}</h3>
              <p className="text-2xl font-bold mt-1">{totalStoryTellers}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-900/30">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-lg">{t("leaderboard.rising.stars")}</h3>
              <p className="text-2xl font-bold mt-1">{leaderboardData.filter(u => u.books > 0).length}</p>
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

          {paginatedData.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t("leaderboard.empty")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("leaderboard.rank")}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("leaderboard.user")}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("leaderboard.level")}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("leaderboard.xp")}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("leaderboard.books")}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("leaderboard.streak")}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">

                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((entry, index) => {
                    const actualRank = (currentPage - 1) * 10 + index + 1;
                    const rankDecoration = getRankDecoration(actualRank);

                    return (
                      <tr
                        key={entry.email}
                        className={`transition-all duration-150 ${entry.isCurrentUser ? 'bg-purple-50 dark:bg-purple-900/10 ring-1 ring-inset ring-purple-200 dark:ring-purple-800/30' : rankDecoration.rowClassName || 'hover:bg-gray-50/80 dark:hover:bg-gray-800/60'} hover:shadow-sm`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${rankDecoration.className}`}
                            style={{ float: isRTL ? 'right' : 'left' }}>
                            {rankDecoration.icon || actualRank}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              {entry.avatar ? (
                                <AvatarImage src={entry.avatar} alt={entry.name} />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                                  {entry.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{entry.name}</span>
                              {entry.isCurrentUser && (
                                <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                  {t("leaderboard.you")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">{entry.level || 1}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap font-medium">
                          {(entry.xp || 0).toLocaleString()} XP
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span>{entry.books}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <CalendarRange className="h-4 w-4 text-green-500" />
                            <span>{entry.streak} {timePeriod !== "allTime" ? (language === "hebrew" ? "ימים" : "days") : ""}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-end whitespace-nowrap">
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
          )}

          {totalPages > 1 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
