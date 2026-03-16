import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useI18n } from "@/components/i18n/i18nProvider";
import { Community } from "@/entities/Community";
import { Comment } from "@/entities/Comment";
import { User } from "@/entities/User";
import { Book } from "@/entities/Book";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import FollowButton from "@/components/social/FollowButton";
import { moderateInput } from "@/utils/content-moderation";
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark,
  Tag,
  User as UserIcon,
  Calendar,
  Send,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import CommentItem from "../components/community/CommentItem";

export default function CommunityPost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, isRTL } = useI18n();
  const { user: hookUser } = useCurrentUser();
  const [post, setPost] = useState(null);
  const [book, setBook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Get post ID from URL
  const postId = searchParams.get("id");
  
  useEffect(() => {
    if (!postId) {
      navigate(createPageUrl("Community"));
      return;
    }
    
    loadData();
  }, [postId]);
  
  const loadData = async () => {
    try {
      setIsLoading(true);

      // Set current user from hook
      if (hookUser) {
        setCurrentUser(hookUser);
      }

      // Load post data
      const postData = await Community.get(postId);
      setPost(postData);
      
      // Load book data
      if (postData.book_id) {
        const bookData = await Book.get(postData.book_id);
        setBook(bookData);
      }
      
      // Load author data
      if (postData.user_id) {
        const userData = await User.get(postData.user_id);
        setAuthor(userData);
      }
      
      // Load comments
      await loadComments();
      
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("communityPost.loadError"),
      });
      navigate(createPageUrl("Community"));
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadComments = async () => {
    try {
      // Get all comments for this post
      const commentData = await Comment.filter(
        { community_id: postId },
        "-created_date"
      );
      
      // Enhance comments with user data
      const enhancedComments = await Promise.all(
        commentData.map(async (comment) => {
          try {
            const user = await User.get(comment.user_id);
            return {
              ...comment,
              user
            };
          } catch (error) {
            return {
              ...comment,
              user: { full_name: t("common.unknownUser") }
            };
          }
        })
      );
      
      // Group comments by parent/child
      const rootComments = enhancedComments.filter(c => !c.parent_id);
      
      const commentTree = rootComments.map(rootComment => {
        const replies = enhancedComments.filter(c => c.parent_id === rootComment.id);
        return {
          ...rootComment,
          replies
        };
      });
      
      setComments(commentTree);
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("communityPost.loadCommentsError"),
      });
    }
  };
  
  const handleLike = async () => {
    try {
      if (!post) return;

      // Per-user like dedup via localStorage
      const likeKey = `post_liked_${postId}_${user?.email || 'anon'}`;
      if (localStorage.getItem(likeKey)) {
        toast({ description: t("communityPost.alreadyLiked") || "Already liked!" });
        return;
      }

      // Increment like count
      const newLikeCount = (post.likes || 0) + 1;
      await Community.update(postId, { likes: newLikeCount });
      localStorage.setItem(likeKey, '1');

      // Update post in state
      setPost({
        ...post,
        likes: newLikeCount
      });

      toast({
        description: t("communityPost.likeSuccess"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("communityPost.likeError"),
      });
    }
  };
  
  const handleSubmitComment = async () => {
    try {
      if (!commentText.trim() || !currentUser) return;

      // Moderate the comment before submitting
      const modResult = moderateInput(commentText, 'comment');
      if (modResult.blocked) {
        toast({
          variant: "destructive",
          title: t("communityPost.inappropriateTitle"),
          description: t("communityPost.inappropriateDesc")
        });
        return;
      }

      setIsSubmitting(true);

      // Create comment
      const commentData = {
        community_id: postId,
        user_id: currentUser.id,
        content: modResult.sanitized,
        parent_id: null // Root comment
      };

      await Comment.create(commentData);
      
      // Refresh comments
      await loadComments();
      
      // Clear form
      setCommentText('');
      
      toast({
        description: t("communityPost.commentSuccess"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("communityPost.commentError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitReply = async (parentId, content) => {
    try {
      if (!content.trim() || !currentUser) return;

      // Moderate the reply before submitting
      const modResult = moderateInput(content, 'comment');
      if (modResult.blocked) {
        toast({
          variant: "destructive",
          title: t("communityPost.inappropriateTitle"),
          description: t("communityPost.inappropriateDesc")
        });
        return false;
      }

      // Create reply
      const replyData = {
        community_id: postId,
        user_id: currentUser.id,
        content: modResult.sanitized,
        parent_id: parentId
      };

      await Comment.create(replyData);
      
      // Refresh comments
      await loadComments();
      
      toast({
        description: t("communityPost.replySuccess"),
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        description: t("communityPost.replyError"),
      });
      return false;
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{t("communityPost.notFound")}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{t("communityPost.notFoundDesc")}</p>
        <Button onClick={() => navigate(createPageUrl("Community"))}>
          {t("communityPost.returnToCommunity")}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(createPageUrl("Community"))}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("communityPost.backToCommunity")}
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-3">
              <Avatar>
                {author?.avatar_url ? (
                  <AvatarImage src={author.avatar_url} alt={author.full_name} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                  {author?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{author?.full_name || t("common.unknownUser")}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {post.created_date && format(new Date(post.created_date), 'MMM d, yyyy')}
                </p>
              </div>
              {author?.email && hookUser?.email && author.email !== hookUser.email && (
                <FollowButton targetEmail={author.email} size="sm" />
              )}
            </div>
            
            <CardTitle className="text-2xl">{post.title}</CardTitle>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {post.description}
            </p>
            
            {book && (
              <Card className="overflow-hidden border-none shadow-md">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-gray-100 dark:bg-gray-800">
                    {book.cover_image ? (
                      <img 
                        src={book.cover_image} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h3 className="text-xl font-bold mb-2">{book.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t("communityPost.personalizedStoryFor")} {book.child_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{book.genre?.replace(/_/g, ' ')}</Badge>
                      <Badge variant="outline">{book.age_range} {t("communityPost.years")}</Badge>
                      <Badge variant="outline" className="capitalize">{book.language}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between pt-4 border-t">
            <div className="flex items-center gap-6">
              <Button variant="ghost" className="flex items-center gap-2" onClick={handleLike}>
                <Heart className={`h-5 w-5 ${post.likes > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                <span>{post.likes || 0}</span>
              </Button>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MessageSquare className="h-5 w-5" />
                <span>{comments.length}</span>
              </div>
            </div>
            
            <div>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={async () => {
                  const shareUrl = `${window.location.origin}${createPageUrl("CommunityPost")}?id=${postId}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: post?.title,
                        text: post?.description,
                        url: shareUrl,
                      });
                    } catch {
                      // User cancelled share dialog — no action needed
                    }
                  } else {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      toast({ description: t("communityPost.linkCopied") });
                    });
                  }
                }}
              >
                <Share2 className="h-5 w-5" />
                {t("communityPost.share")}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Comments Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t("communityPost.comments")} ({comments.length})
        </h3>
        
        {/* Comment form */}
        <div className="mb-8">
          <Textarea
            placeholder={t("communityPost.addComment")}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[100px] mb-2"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? t("communityPost.posting") : t("communityPost.postComment")}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Comments list */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                currentUser={currentUser}
                onSubmitReply={handleSubmitReply}
              />
            ))
          ) : (
            <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <MessageSquare className="h-10 w-10 mx-auto text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t("communityPost.noComments")}</p>
              <p className="text-gray-500 dark:text-gray-500">{t("communityPost.beFirstComment")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}