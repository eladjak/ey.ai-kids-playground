import React, { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from 'lucide-react';

function CommentItem({ comment, currentUser, onSubmitReply, level = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    const success = await onSubmitReply(comment.id, replyText);
    
    if (success) {
      setReplyText('');
      setShowReplyForm(false);
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <div className={`${level > 0 ? 'ml-8 pl-4 border-l border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://ui-avatars.com/api/?name=${comment.user?.full_name || 'User'}&background=random`} />
          <AvatarFallback>{comment.user?.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{comment.user?.full_name || 'Unknown User'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {comment.created_date && format(new Date(comment.created_date), 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>
          
          <div className="mt-2 ml-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>
          
          {showReplyForm && (
            <div className="mt-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px] mb-2 text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                  <Send className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply}
                  currentUser={currentUser}
                  onSubmitReply={onSubmitReply} 
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(CommentItem);