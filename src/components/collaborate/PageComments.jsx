import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Send, 
  CheckCircle,
  MessageCircle, 
  Reply
} from 'lucide-react';

export default function PageComments({ 
  comments, 
  onAddComment, 
  onReplyToComment, 
  onResolveComment,
  currentUser
}) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    const success = await onAddComment(newComment);
    
    if (success) {
      setNewComment("");
    }
    
    setIsSubmitting(false);
  };
  
  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    const success = await onReplyToComment(commentId, replyText);
    
    if (success) {
      setReplyText("");
      setReplyingTo(null);
    }
    
    setIsSubmitting(false);
  };
  
  const renderComment = (comment, isReply = false) => {
    return (
      <div key={comment.id} className={`${isReply ? "ml-10 mt-3" : "mb-6"}`}>
        <div className={`flex gap-3 ${comment.resolved ? "opacity-60" : ""}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user?.full_name ? 
              `https://ui-avatars.com/api/?name=${comment.user.full_name}&background=random` : 
              undefined
            } />
            <AvatarFallback>
              {comment.user?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {comment.user?.full_name || "Unknown User"}
                  </span>
                  {comment.user?.id === currentUser?.id && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {comment.created_date && format(new Date(comment.created_date), "MMM d, h:mm a")}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
            
            <div className="mt-2 flex gap-3">
              {!isReply && !comment.resolved && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => {
                    if (replyingTo === comment.id) {
                      setReplyingTo(null);
                    } else {
                      setReplyingTo(comment.id);
                      setReplyText("");
                    }
                  }}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              
              {!comment.resolved && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  onClick={() => onResolveComment(comment.id)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolve
                </Button>
              )}
              
              {comment.resolved && (
                <Badge variant="outline" className="h-5 text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            
            {replyingTo === comment.id && (
              <div className="mt-3">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="text-sm min-h-[80px]"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyText.trim() || isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          Comments & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Add Comment Form */}
        <div className="mb-8">
          <Textarea
            placeholder="Add a comment or feedback..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[120px] mb-3"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map(comment => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Comments Yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Be the first to add a comment or feedback on this page
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}