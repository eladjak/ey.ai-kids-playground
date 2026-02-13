import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Community } from "@/entities/Community";
import { Comment } from "@/entities/Comment";
import { User } from "@/entities/User";
import { Book } from "@/entities/Book";
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
  const { toast } = useToast();
  const [post, setPost] = useState(null);
  const [book, setBook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Get post ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");
  
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
      
      // Load current user
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        // silently handled
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
        description: "Failed to load post data. Please try again.",
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
              user: { full_name: "Unknown User" }
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
        description: "Failed to load comments. Please try again.",
      });
    }
  };
  
  const handleLike = async () => {
    try {
      if (!post) return;
      
      // Increment like count
      const newLikeCount = (post.likes || 0) + 1;
      await Community.update(postId, { likes: newLikeCount });
      
      // Update post in state
      setPost({
        ...post,
        likes: newLikeCount
      });
      
      toast({
        description: "Thanks for liking this post!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to like post. Please try again.",
      });
    }
  };
  
  const handleSubmitComment = async () => {
    try {
      if (!commentText.trim() || !currentUser) return;
      
      setIsSubmitting(true);
      
      // Create comment
      const commentData = {
        community_id: postId,
        user_id: currentUser.id,
        content: commentText,
        parent_id: null // Root comment
      };
      
      await Comment.create(commentData);
      
      // Refresh comments
      await loadComments();
      
      // Clear form
      setCommentText('');
      
      toast({
        description: "Comment added successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to add comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitReply = async (parentId, content) => {
    try {
      if (!content.trim() || !currentUser) return;
      
      // Create reply
      const replyData = {
        community_id: postId,
        user_id: currentUser.id,
        content: content,
        parent_id: parentId
      };
      
      await Comment.create(replyData);
      
      // Refresh comments
      await loadComments();
      
      toast({
        description: "Reply added successfully!",
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to add reply. Please try again.",
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
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">This post may have been removed or doesn't exist</p>
        <Button onClick={() => navigate(createPageUrl("Community"))}>
          Return to Community
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(createPageUrl("Community"))}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-3">
              <Avatar>
                <AvatarImage src={`https://ui-avatars.com/api/?name=${author?.full_name || 'User'}&background=random`} />
                <AvatarFallback>{author?.full_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{author?.full_name || 'Unknown User'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {post.created_date && format(new Date(post.created_date), 'MMM d, yyyy')}
                </p>
              </div>
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
                      A personalized story for {book.child_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{book.genre?.replace(/_/g, ' ')}</Badge>
                      <Badge variant="outline">{book.age_range} years</Badge>
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
              <Button variant="ghost" className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Comments Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </h3>
        
        {/* Comment form */}
        <div className="mb-8">
          <Textarea
            placeholder="Add a comment..."
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
              {isSubmitting ? 'Posting...' : 'Post Comment'}
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
              <p className="mt-4 text-gray-600 dark:text-gray-400">No comments yet</p>
              <p className="text-gray-500 dark:text-gray-500">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}