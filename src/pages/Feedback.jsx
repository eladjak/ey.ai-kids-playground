import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const { toast } = useToast();
  const { isRTL } = useI18n();
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
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  
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
        description: "Failed to load book. Please try again."
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
              user: { full_name: "Unknown User" }
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
        description: "Failed to load feedback. Please try again."
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
        description: "Feedback submitted successfully."
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to submit feedback. Please try again."
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
        "implemented": "Feedback marked as implemented.",
        "accepted": "Feedback accepted.",
        "declined": "Feedback declined.",
        "pending": "Feedback status set to pending."
      };
      
      toast({
        description: statusMessages[newStatus] || "Feedback status updated."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update feedback status. Please try again."
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Library"))}
          >
            {isRTL ? (
              <ArrowRight className="h-5 w-5" />
            ) : (
              <ArrowLeft className="h-5 w-5" />
            )}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Feedback for "{book?.title}"
              <Badge variant="outline" className="ml-2 text-xs">
                {allFeedback.length} total
              </Badge>
            </h1>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <div className="flex items-center mr-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(avgRating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-1 text-sm">{avgRating.toFixed(1)}</span>
              </div>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/10 dark:text-purple-300">
                <Lightbulb className="h-3 w-3 mr-1" />
                {suggestionCount} suggestions
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 ml-2 dark:bg-green-900/10 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                {implementedCount} implemented
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link to={`${createPageUrl("BookView")}?id=${bookId}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">View Book</span>
            </Button>
          </Link>
          <Button
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            className={showFeedbackForm ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-purple-600 hover:bg-purple-700"}
          >
            {showFeedbackForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cancel</span>
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Give Feedback</span>
              </>
            )}
          </Button>
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
                    <Badge>For {book?.child_name}</Badge>
                    <Badge variant="outline">{book?.age_range}</Badge>
                    <Badge variant="outline" className="capitalize">{book?.genre?.replace(/_/g, ' ')}</Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span className="mr-2">Current page:</span>
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
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPageIndex === pages.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Page content preview */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2 flex items-center">
                <span>Page {currentPageIndex + 1} Content</span>
                <Badge className="ml-2" variant="outline">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {pageFeedback.length} feedback
                </Badge>
              </h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                {currentPage?.text_content || "No content for this page"}
              </p>
            </div>
          </Card>
          
          {/* Feedback form */}
          {showFeedbackForm && (
            <Card>
              <CardHeader>
                <CardTitle>Give Feedback</CardTitle>
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
                Feedback for Page {currentPageIndex + 1}
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {filter === "all" && "All Feedback"}
                    {filter === "suggestions" && "Suggestions"}
                    {filter === "story" && "Story Feedback"}
                    {filter === "illustrations" && "Illustration Feedback"}
                    {filter === "language" && "Language Feedback"}
                    {filter === "age_appropriate" && "Age Appropriateness"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter("all")}>
                    All Feedback
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("suggestions")}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Suggestions Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("story")}>
                    Story Feedback
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("illustrations")}>
                    Illustration Feedback
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("language")}>
                    Language Feedback
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("age_appropriate")}>
                    Age Appropriateness
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