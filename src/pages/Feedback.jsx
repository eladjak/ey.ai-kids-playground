import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useI18n } from "@/components/i18n/i18nProvider";
import { Book } from "@/entities/Book";
import { Page } from "@/entities/Page";
import { Feedback } from "@/entities/Feedback";
import { Collaboration } from "@/entities/Collaboration";
import { User } from "@/entities/User";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  StarHalf,
  MessageSquare,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  LightbulbOff,
  Lightbulb,
  CheckCircle,
  XCircle,
  Filter,
  SlidersHorizontal,
  Users,
  ArrowUpRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

import FeedbackList from "../components/feedback/FeedbackList";
import FeedbackForm from "../components/feedback/FeedbackForm";
import FeedbackStats from "../components/feedback/FeedbackStats";
import FeedbackContext from "../components/feedback/FeedbackContext";

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, isRTL } = useI18n();
  const { user: hookUser } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [allFeedback, setAllFeedback] = useState([]);
  const [pageFeedback, setPageFeedback] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [filter, setFilter] = useState("all"); // all, suggestions, general, story, illustrations
  const [currentTab, setCurrentTab] = useState("feedback");
  
  // Get book ID from URL
  const bookId = searchParams.get("id");
  
  useEffect(() => {
    if (!bookId) {
      navigate(createPageUrl("Library"));
      return;
    }
    
    loadBookData();
  }, [bookId]);
  
  useEffect(() => {
    if (pages.length > 0 && currentPageIndex >= 0 && currentPageIndex < pages.length) {
      setCurrentPage(pages[currentPageIndex]);
      loadPageFeedback(pages[currentPageIndex].id);
    }
  }, [pages, currentPageIndex, filter]);
  
  const loadBookData = async () => {
    try {
      setIsLoading(true);

      // Use current user from hook
      const user = hookUser;
      if (user) {
        setCurrentUser(user);
      }

      // Load book data
      const bookData = await Book.get(bookId);
      setBook(bookData);

      // Check if user is owner
      if (user) {
        setIsOwner(bookData.created_by === user.email);
      }

      // Check if user is collaborator
      const collaborations = user ? await Collaboration.filter({
        book_id: bookId,
        collaborator_email: user.email,
        status: "accepted"
      }) : [];
      
      setIsCollaborator(collaborations.length > 0);
      
      // Load pages
      const pagesData = await Page.filter({ book_id: bookId }, "page_number");
      setPages(pagesData);
      
      if (pagesData.length > 0) {
        setCurrentPageIndex(0);
        setCurrentPage(pagesData[0]);
      }
      
      // Load all feedback
      await loadAllFeedback();
      
      setIsLoading(false);
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("feedback.toast.loadBookError")
      });
      navigate(createPageUrl("Library"));
    }
  };

  const loadAllFeedback = async () => {
    try {
      // Get all feedback for this book
      const feedbackData = await Feedback.filter({ book_id: bookId });
      
      // Enhance with user data
      const enhancedFeedback = await Promise.all(
        feedbackData.map(async (feedback) => {
          try {
            const user = await User.get(feedback.user_id);
            return {
              ...feedback,
              user
            };
          } catch (error) {
            return {
              ...feedback,
              user: { full_name: t("common.unknownUser") }
            };
          }
        })
      );
      
      setAllFeedback(enhancedFeedback);
      
      // If we have a current page, load its feedback
      if (currentPage) {
        loadPageFeedback(currentPage.id);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("feedback.toast.loadFeedbackError")
      });
    }
  };
  
  const loadPageFeedback = (pageId) => {
    // Filter feedback for current page
    let filtered = allFeedback.filter(f => f.page_id === pageId);
    
    // Apply filter
    if (filter !== "all") {
      if (filter === "suggestions") {
        filtered = filtered.filter(f => f.is_suggestion);
      } else {
        filtered = filtered.filter(f => f.feedback_type === filter);
      }
    }
    
    setPageFeedback(filtered);
  };
  
  const handleAddFeedback = async (feedbackData) => {
    try {
      // Create feedback
      const newFeedback = {
        ...feedbackData,
        book_id: bookId,
        page_id: currentPage.id,
        user_id: currentUser.id
      };
      
      const createdFeedback = await Feedback.create(newFeedback);
      
      // Add user data
      createdFeedback.user = currentUser;
      
      // Update state
      setAllFeedback([createdFeedback, ...allFeedback]);
      
      // Update page feedback if it matches the filter
      if (filter === "all" || 
          (filter === "suggestions" && createdFeedback.is_suggestion) ||
          filter === createdFeedback.feedback_type) {
        setPageFeedback([createdFeedback, ...pageFeedback]);
      }
      
      // Hide form
      setShowFeedbackForm(false);
      
      toast({
        description: t("feedback.toast.submitSuccess")
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("feedback.toast.submitError")
      });
      return false;
    }
  };
  
  const handleUpdateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      // Update feedback status
      await Feedback.update(feedbackId, { status: newStatus });
      
      // Update state
      const updatedAllFeedback = allFeedback.map(f => 
        f.id === feedbackId ? { ...f, status: newStatus } : f
      );
      setAllFeedback(updatedAllFeedback);
      
      const updatedPageFeedback = pageFeedback.map(f => 
        f.id === feedbackId ? { ...f, status: newStatus } : f
      );
      setPageFeedback(updatedPageFeedback);
      
      const statusMessages = {
        "implemented": t("feedback.toast.statusImplemented"),
        "accepted": t("feedback.toast.statusAccepted"),
        "declined": t("feedback.toast.statusDeclined"),
        "pending": t("feedback.toast.statusPending")
      };

      toast({
        description: statusMessages[newStatus] || t("feedback.toast.statusUpdated")
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("feedback.toast.statusUpdateError")
      });
    }
  };
  
  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };
  
  // Calculate average rating
  const avgRating = allFeedback.length > 0 
    ? allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.length 
    : 0;
  
  // Count suggestions
  const suggestionCount = allFeedback.filter(f => f.is_suggestion).length;
  
  // Count implemented suggestions
  const implementedCount = allFeedback.filter(f => f.status === "implemented").length;
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-4">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto py-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl mb-6 shadow-md">
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 py-6">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white_0%,transparent_60%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => navigate(createPageUrl("Library"))}
              >
                {isRTL ? (
                  <ArrowRight className="h-5 w-5" />
                ) : (
                  <ArrowLeft className="h-5 w-5" />
                )}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  {t("feedback.title").replace("{{bookTitle}}", book?.title || "")}
                  <Badge variant="outline" className="ml-2 text-xs border-white/30 text-white/90 bg-white/10">
                    {allFeedback.length} {t("feedback.total")}
                  </Badge>
                </h1>
                <div className="flex items-center text-white/70 mt-1">
                  <div className="flex items-center mr-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(avgRating) ? 'text-amber-300 fill-amber-300' : 'text-white/30'}`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-white/80">{avgRating.toFixed(1)}</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-white/30 text-white/80 bg-white/10">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {suggestionCount} {t("feedback.stats.suggestions")}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-white/30 text-white/80 bg-white/10 ml-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {implementedCount} {t("feedback.stats.implemented")}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to={`${createPageUrl("BookView")}?id=${bookId}`}>
                <Button variant="outline" className="flex items-center gap-2 border-white/30 text-white bg-white/10 hover:bg-white/20">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("feedback.bookInfo.viewBook")}</span>
                </Button>
              </Link>
              <Button
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className={showFeedbackForm ? "bg-white/20 hover:bg-white/30 text-white" : "bg-white text-purple-700 hover:bg-purple-50"}
              >
                {showFeedbackForm ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t("feedback.cancel")}</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t("feedback.giveFeedback")}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Book preview */}
          <Card className="overflow-hidden border shadow-md">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-gray-100 dark:bg-gray-800 aspect-square md:aspect-auto">
                {book?.cover_image ? (
                  <img 
                    src={book.cover_image} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{book?.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>{t("common.for")} {book?.child_name}</Badge>
                    <Badge variant="outline">{book?.age_range}</Badge>
                    <Badge variant="outline" className="capitalize">{book?.genre?.replace(/_/g, ' ')}</Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span className="mr-2">{t("feedback.currentPage")}:</span>
                    <Badge variant="outline">
                      {currentPageIndex + 1} of {pages.length}
                    </Badge>
                  </div>
                </div>
                  
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t("common.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPageIndex === pages.length - 1}
                  >
                    {t("common.next")}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Page content preview */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2 flex items-center">
                <span>{t("feedback.bookInfo.pageContent").replace("{{current}}", currentPageIndex + 1)}</span>
                <Badge className="ml-2" variant="outline">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {pageFeedback.length} {t("feedback.bookInfo.feedback")}
                </Badge>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                {currentPage?.text_content || t("feedback.noContent")}
              </p>
            </div>
          </Card>
          
          {/* Feedback form */}
          {showFeedbackForm && (
            <Card className="border-purple-200 dark:border-purple-800/30 shadow-md bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  {t("feedback.giveFeedback")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackForm 
                  onSubmit={handleAddFeedback}
                  onCancel={() => setShowFeedbackForm(false)}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Feedback for this page */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {t("feedback.feedbackForPage").replace("{{page}}", currentPageIndex + 1)}
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {filter === "all" && t("feedback.filter.all")}
                    {filter === "suggestions" && t("common.suggestions")}
                    {filter === "story" && t("feedback.form.types.story")}
                    {filter === "illustrations" && t("feedback.form.types.illustrations")}
                    {filter === "language" && t("feedback.form.types.language")}
                    {filter === "age_appropriate" && t("feedback.form.types.age_appropriate")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter("all")}>
                    {t("feedback.filter.all")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("suggestions")}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {t("feedback.filter.suggestionsOnly")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("story")}>
                    {t("feedback.form.types.story")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("illustrations")}>
                    {t("feedback.form.types.illustrations")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("language")}>
                    {t("feedback.form.types.language")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("age_appropriate")}>
                    {t("feedback.form.types.age_appropriate")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <FeedbackList 
              feedback={pageFeedback}
              isOwner={isOwner}
              isCollaborator={isCollaborator}
              onUpdateStatus={handleUpdateFeedbackStatus}
              currentUser={currentUser}
            />
          </div>
        </div>
        
        {/* Stats and book feedback context */}
        <div className="space-y-6">
          <FeedbackStats 
            feedback={allFeedback}
            book={book}
          />
          
          <FeedbackContext 
            book={book}
            pages={pages}
            currentPageIndex={currentPageIndex}
            setCurrentPageIndex={setCurrentPageIndex}
          />
        </div>
      </div>
    </div>
  );
}