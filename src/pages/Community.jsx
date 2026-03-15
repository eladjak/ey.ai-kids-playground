import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useI18n } from "@/components/i18n/i18nProvider";
import { Community } from "@/entities/Community";
import { Book } from "@/entities/Book";
import { User } from "@/entities/User";
import { Comment } from "@/entities/Comment";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useGamification from "@/hooks/useGamification";
import { verifyParentalPin, isPinSet } from "@/utils/content-moderation";
import {
  Search,
  Filter,
  Award,
  Heart,
  MessageSquare,
  Users,
  Tag,
  BookOpen,
  Star,
  ChevronDown,
  X,
  Sparkles,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import CommunityPost from "../components/community/CommunityPost";
import FeaturedStory from "../components/community/FeaturedStory";
import ShareBookModal from "../components/community/ShareBookModal";

export default function CommunityPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const gamification = useGamification();
  const { user: hookUser } = useCurrentUser();
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [currentFilter, setCurrentFilter] = useState("recent");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // Per-user liked-posts set; populated once the current user is loaded
  const [likedPostsKey, setLikedPostsKey] = useState("likedPosts_anonymous");
  const [likedPosts, setLikedPosts] = useState([]);
  const { t, isRTL } = useI18n();

  // For pagination
  const [page, setPage] = useState(1);
  const postsPerPage = 10;

  // Parental PIN approval state
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pendingShareData, setPendingShareData] = useState(null);

  // Batch enhance posts to avoid N+1 queries
  const batchEnhancePosts = async (posts) => {
    if (posts.length === 0) return [];

    // Collect unique IDs
    const bookIds = [...new Set(posts.map(p => p.book_id).filter(Boolean))];
    const userIds = [...new Set(posts.map(p => p.user_id).filter(Boolean))];

    // Fetch all books/users/comments in parallel batches
    const [books, users, allComments] = await Promise.all([
      Promise.all(bookIds.map(id => Book.get(id).catch(() => null))),
      Promise.all(userIds.map(id => User.get(id).catch(() => null))),
      Promise.all(posts.map(p => Comment.filter({ community_id: p.id }).catch(() => [])))
    ]);

    // Build lookup maps
    const bookMap = {};
    books.forEach(b => { if (b) bookMap[b.id] = b; });
    const userMap = {};
    users.forEach(u => { if (u) userMap[u.id] = u; });

    return posts.map((post, i) => ({
      ...post,
      book: bookMap[post.book_id] || null,
      user: userMap[post.user_id] || null,
      commentCount: allComments[i]?.length || 0
    }));
  };
  
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadFilteredPosts();
  }, [searchQuery, currentTab, currentFilter, selectedTags, page]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Set up current user and per-user like tracking from hook.
      // Key by user ID (stable) rather than email to avoid collisions on
      // email changes and to work even when email is not set.
      if (hookUser) {
        setCurrentUser(hookUser);
        const userId = hookUser?.id || hookUser?.email;
        if (userId) {
          const key = `liked_posts_${userId}`;
          setLikedPostsKey(key);
          try {
            setLikedPosts(JSON.parse(localStorage.getItem(key) || "[]"));
          } catch {
            setLikedPosts([]);
          }
        }
      }
      
      // Load featured posts
      const featured = await Community.filter({ is_featured: true }, "-featured_date", 3);

      // Batch enhance posts (avoid N+1)
      const enhancedFeatured = await batchEnhancePosts(featured);

      setFeaturedPosts(enhancedFeatured);
      
      // Load initial posts
      await loadFilteredPosts();
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("community.toast.loadError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilteredPosts = async () => {
    try {
      setIsLoading(true);
      
      // Create filter object
      let filter = { visibility: "public" };
      
      // Filter by tab
      if (currentTab === "my-posts" && currentUser) {
        filter.user_id = currentUser.id;
      }
      
      // Get posts
      let sortOrder = "-created_date"; // Default to newest first
      if (currentFilter === "popular") {
        sortOrder = "-likes";
      }
      
      const filteredPosts = await Community.filter(filter, sortOrder, postsPerPage, (page - 1) * postsPerPage);

      // Batch enhance posts (avoid N+1)
      const enhancedPosts = await batchEnhancePosts(filteredPosts);
      
      // Filter by search query if present
      let searchResults = enhancedPosts;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        searchResults = enhancedPosts.filter(post => 
          post.title.toLowerCase().includes(query) || 
          post.description.toLowerCase().includes(query) ||
          post.book?.title.toLowerCase().includes(query) ||
          post.user?.full_name.toLowerCase().includes(query)
        );
      }
      
      // Filter by tags if selected
      if (selectedTags.length > 0) {
        searchResults = searchResults.filter(post => 
          post.tags && post.tags.some(tag => selectedTags.includes(tag))
        );
      }
      
      setPosts(searchResults);
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("community.toast.postsError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    
    // Reset page when changing filters
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setCurrentFilter("recent");
    setPage(1);
  };

  const handleLikePost = async (postId) => {
    try {
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) return;

      const alreadyLiked = likedPosts.includes(postId);

      // Re-fetch the current like count from the server before writing to
      // avoid stale-state manipulation (e.g. a user opening two tabs and
      // clicking like in both).  We only ever add or subtract exactly 1.
      const freshPost = await Community.get(postId);
      const currentLikes = (freshPost?.likes ?? posts[postIndex].likes) || 0;

      const newLikeCount = alreadyLiked
        ? Math.max(0, currentLikes - 1)
        : currentLikes + 1;

      await Community.update(postId, { likes: newLikeCount });

      // Update per-user liked posts tracking (keyed by userId)
      const newLikedPosts = alreadyLiked
        ? likedPosts.filter(id => id !== postId)
        : [...likedPosts, postId];
      setLikedPosts(newLikedPosts);
      localStorage.setItem(likedPostsKey, JSON.stringify(newLikedPosts));

      // Update both posts list and featured posts list in local state
      const applyUpdate = (list) =>
        list.map(p => p.id === postId ? { ...p, likes: newLikeCount } : p);
      setPosts(applyUpdate);
      setFeaturedPosts(applyUpdate);

      toast({
        description: alreadyLiked ? t("community.toast.likeRemoved") : t("community.toast.likeAdded"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("community.toast.likeError"),
      });
    }
  };

  const doShareBook = async (bookData) => {
    try {
      // Create community post
      const postData = {
        book_id: bookData.bookId,
        user_id: currentUser.id,
        title: bookData.title,
        description: bookData.description,
        tags: bookData.tags,
        visibility: "public",
        likes: 0,
      };

      await Community.create(postData);

      // Award XP for community share
      gamification.awardXP("community_share");
      gamification.incrementStat("totalShares");

      // Refresh posts
      await loadFilteredPosts();

      setShowShareModal(false);

      toast({
        description: t("community.toast.shareSuccess"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("community.toast.shareError"),
      });
    }
  };

  const handleShareBook = async (bookData) => {
    // Check if parental approval is required before publishing
    let controls = {};
    try {
      controls = JSON.parse(localStorage.getItem("parentalControls") || "{}");
    } catch {
      controls = {};
    }

    const requireApproval = controls.requireApprovalBeforePublish ?? true;

    if (requireApproval && isPinSet()) {
      // Store the share data and show PIN dialog
      setPendingShareData(bookData);
      setPinInput("");
      setPinError("");
      setShowPinDialog(true);
    } else {
      await doShareBook(bookData);
    }
  };

  const handlePinSubmit = async () => {
    const ok = await verifyParentalPin(pinInput);
    if (ok) {
      setShowPinDialog(false);
      setPinError("");
      if (pendingShareData) {
        await doShareBook(pendingShareData);
        setPendingShareData(null);
      }
    } else {
      setPinError(isRTL ? "PIN שגוי. נסה שוב." : "Incorrect PIN. Please try again.");
    }
  };

  const popularTags = [
    "adventure", "fantasy", "education", "animals", "family", 
    "friendship", "science", "magic", "nature", "values"
  ];
  
  // Hebrew translations for tags when in Hebrew
  const hebrewTags = {
    "adventure": "הרפתקאות",
    "fantasy": "פנטזיה",
    "education": "חינוך",
    "animals": "חיות",
    "family": "משפחה",
    "friendship": "חברות",
    "science": "מדע",
    "magic": "קסם",
    "nature": "טבע",
    "values": "ערכים"
  };
  
  // Function to get tag display based on language
  const getTagDisplay = (tag) => {
    if (isRTL && hebrewTags[tag]) {
      return hebrewTags[tag];
    }
    return tag;
  };

  return (
    <div className="max-w-6xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("community.title")}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {t("community.subtitle")}
          </p>
        </div>
        <Button 
          onClick={() => setShowShareModal(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <BookOpen className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4`} />
          {t("community.shareYourBook")}
        </Button>
      </div>

      {/* Featured Stories Section */}
      {featuredPosts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4 gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("community.featuredStories")}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex-1">
                  <Skeleton className="w-full aspect-[3/2] rounded-lg" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              featuredPosts.map(post => (
                <FeaturedStory
                  key={post.id}
                  post={post}
                  onLike={() => handleLikePost(post.id)}
                  isLiked={likedPosts.includes(post.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4`} />
            <Input
              placeholder={t("community.search")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className={isRTL ? 'pr-9' : 'pl-9'}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className={`absolute ${isRTL ? 'left-1' : 'right-1'} top-1/2 -translate-y-1/2 h-7 w-7`}
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                {currentFilter === "recent" ? t("community.mostRecent") : t("community.mostPopular")}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              <DropdownMenuItem onClick={() => setCurrentFilter("recent")}>
                {t("community.mostRecent")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCurrentFilter("popular")}>
                {t("community.mostPopular")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <Badge 
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer ${
                selectedTags.includes(tag) 
                  ? "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleTagSelect(tag)}
            >
              <Tag className="h-3 w-3 mr-1" />
              {getTagDisplay(tag)}
            </Badge>
          ))}
          
          {(selectedTags.length > 0 || searchQuery || currentFilter !== "recent") && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-gray-500 dark:text-gray-400"
            >
              {t("community.clearFilters")}
            </Button>
          )}
        </div>
        
        {/* Tabs and Content */}
        <Tabs defaultValue="all" value={currentTab} onValueChange={(value) => {
          setCurrentTab(value);
          setPage(1); // Reset page on tab change
        }}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("community.allStories")}
            </TabsTrigger>
            <TabsTrigger value="my-posts" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              {t("community.mySharedStories")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex gap-4">
                      <Skeleton className="h-24 w-24 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <CommunityPost
                    key={post.id}
                    post={post}
                    onLike={() => handleLikePost(post.id)}
                    isLiked={likedPosts.includes(post.id)}
                    onReport={(postId) => {
                      const reported = JSON.parse(localStorage.getItem("reportedPosts") || "[]");
                      if (!reported.includes(postId)) {
                        localStorage.setItem("reportedPosts", JSON.stringify([...reported, postId]));
                      }
                      toast({ description: isRTL ? "הדיווח נשלח. תודה!" : "Report submitted. Thank you!" });
                    }}
                  />
                ))}

                {/* Pagination */}
                <div className="flex justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {t("community.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={posts.length < postsPerPage}
                  >
                    {t("community.next")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Users className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{t("community.noStories")}</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {searchQuery || selectedTags.length > 0 
                    ? t("community.adjustFilters")
                    : t("community.beFirst")}
                </p>
                <Button 
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowShareModal(true)}
                >
                  {t("community.shareYourStory")}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-posts" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex gap-4">
                      <Skeleton className="h-24 w-24 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <CommunityPost
                    key={post.id}
                    post={post}
                    onLike={() => handleLikePost(post.id)}
                    isLiked={likedPosts.includes(post.id)}
                    isOwner={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{t("community.noSharedYet")}</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {t("community.notSharedYet")}
                </p>
                <Button 
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => setShowShareModal(true)}
                >
                  {t("community.shareFirstStory")}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Share Book Modal */}
      <ShareBookModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShareBook}
      />

      {/* Parental PIN Approval Dialog */}
      <Dialog open={showPinDialog} onOpenChange={(open) => {
        if (!open) {
          setShowPinDialog(false);
          setPendingShareData(null);
          setPinInput("");
          setPinError("");
        }
      }}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              {isRTL ? "אישור הורה נדרש" : "Parental Approval Required"}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? "כדי לפרסם ספר בקהילה, יש להזין את קוד ה-PIN של ההורה."
                : "To publish a book to the community, please enter the parental PIN."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder={isRTL ? "הזן PIN (4-6 ספרות)" : "Enter PIN (4-6 digits)"}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError("");
              }}
              onKeyDown={(e) => { if (e.key === "Enter") handlePinSubmit(); }}
              autoFocus
              className={isRTL ? "text-right" : "text-left"}
            />
            {pinError && (
              <p className="text-sm text-red-500">{pinError}</p>
            )}
          </div>

          <DialogFooter className={isRTL ? "flex-row-reverse" : ""}>
            <Button variant="outline" onClick={() => {
              setShowPinDialog(false);
              setPendingShareData(null);
              setPinInput("");
              setPinError("");
            }}>
              {isRTL ? "ביטול" : "Cancel"}
            </Button>
            <Button onClick={handlePinSubmit} className="bg-purple-600 hover:bg-purple-700">
              {isRTL ? "אשר" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}