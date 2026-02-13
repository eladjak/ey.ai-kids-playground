import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Community } from "@/entities/Community";
import { Book } from "@/entities/Book";
import { User } from "@/entities/User";
import { Comment } from "@/entities/Comment";
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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [currentFilter, setCurrentFilter] = useState("recent");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState("english");

  // For pagination
  const [page, setPage] = useState(1);
  const postsPerPage = 10;
  
  // Load language preference
  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage");
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
    
    const handleStorageChange = (e) => {
      if (e.key === "appLanguage") {
        setCurrentLanguage(e.newValue || "english");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Translations
  const translations = {
    english: {
      "community.title": "Community",
      "community.subtitle": "Discover and share stories created by our community",
      "community.shareYourBook": "Share Your Book",
      "community.featuredStories": "Featured Stories",
      "community.search": "Search stories, authors or topics...",
      "community.mostRecent": "Most Recent",
      "community.mostPopular": "Most Popular",
      "community.allStories": "All Stories",
      "community.mySharedStories": "My Shared Stories",
      "community.clearFilters": "Clear filters",
      "community.noStories": "No stories found",
      "community.adjustFilters": "Try adjusting your search or filters",
      "community.beFirst": "Be the first to share a story with the community",
      "community.shareYourStory": "Share Your Story",
      "community.previous": "Previous",
      "community.next": "Next",
      "community.noSharedYet": "No shared stories yet",
      "community.notSharedYet": "You haven't shared any books with the community yet",
      "community.shareFirstStory": "Share Your First Story"
    },
    hebrew: {
      "community.title": "קהילה",
      "community.subtitle": "גלה ושתף סיפורים שנוצרו על ידי הקהילה שלנו",
      "community.shareYourBook": "שתף את הספר שלך",
      "community.featuredStories": "סיפורים מובחרים",
      "community.search": "חפש סיפורים, יוצרים או נושאים...",
      "community.mostRecent": "הכי חדשים",
      "community.mostPopular": "הכי פופולריים",
      "community.allStories": "כל הסיפורים",
      "community.mySharedStories": "הסיפורים ששיתפתי",
      "community.clearFilters": "נקה מסננים",
      "community.noStories": "לא נמצאו סיפורים",
      "community.adjustFilters": "נסה להתאים את החיפוש או המסננים שלך",
      "community.beFirst": "היה הראשון לשתף סיפור עם הקהילה",
      "community.shareYourStory": "שתף את הסיפור שלך",
      "community.previous": "הקודם",
      "community.next": "הבא",
      "community.noSharedYet": "אין עדיין סיפורים משותפים",
      "community.notSharedYet": "עדיין לא שיתפת ספרים עם הקהילה",
      "community.shareFirstStory": "שתף את הסיפור הראשון שלך"
    },
    yiddish: {
      "community.title": "קהילה",
      "community.shareYourBook": "טיילן דיין בוך",
      "community.allStories": "אַלע געשיכטעס",
      "community.mySharedStories": "מיינע געטיילטע געשיכטעס"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  // Determine text direction
  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadFilteredPosts();
  }, [searchQuery, currentTab, currentFilter, selectedTags, page]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load current user
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        // silently handled
      }
      
      // Load featured posts
      const featured = await Community.filter({ is_featured: true }, "-featured_date", 3);
      
      // Enhance posts with book and user data
      const enhancedFeatured = await Promise.all(
        featured.map(async (post) => {
          const book = await Book.get(post.book_id);
          const user = await User.get(post.user_id);
          const commentCount = (await Comment.filter({ community_id: post.id })).length;
          
          return {
            ...post,
            book,
            user,
            commentCount
          };
        })
      );
      
      setFeaturedPosts(enhancedFeatured);
      
      // Load initial posts
      await loadFilteredPosts();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to load community data. Please try again.",
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
      
      // Enhance posts with book and user data
      const enhancedPosts = await Promise.all(
        filteredPosts.map(async (post) => {
          const book = await Book.get(post.book_id);
          const user = await User.get(post.user_id);
          const commentCount = (await Comment.filter({ community_id: post.id })).length;
          
          return {
            ...post,
            book,
            user,
            commentCount
          };
        })
      );
      
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
        description: "Failed to load posts. Please try again.",
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
      // Find post
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) return;
      
      const post = posts[postIndex];
      
      // Update like count
      const newLikeCount = post.likes + 1;
      await Community.update(postId, { likes: newLikeCount });
      
      // Update UI
      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...post,
        likes: newLikeCount
      };
      
      setPosts(updatedPosts);
      
      toast({
        description: "You liked this post!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to like post. Please try again.",
      });
    }
  };

  const handleShareBook = async (bookData) => {
    try {
      // Create community post
      const postData = {
        book_id: bookData.bookId,
        user_id: currentUser.id,
        title: bookData.title,
        description: bookData.description,
        tags: bookData.tags,
        visibility: "public",
        likes: 0
      };
      
      await Community.create(postData);
      
      // Refresh posts
      await loadFilteredPosts();
      
      setShowShareModal(false);
      
      toast({
        description: "Your book has been shared with the community!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to share book. Please try again.",
      });
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
    if (currentLanguage === "hebrew" && hebrewTags[tag]) {
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
          <BookOpen className={isRTL ? "ml-2" : "mr-2" + " h-4 w-4"} />
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
    </div>
  );
}