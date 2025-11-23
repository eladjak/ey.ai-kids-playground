import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, 
  MessageSquare, 
  RotateCw,
  AlertCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

export default function CollaborativeEditor({ 
  content,
  onChange,
  onSave,
  isSaving,
  currentPage,
  onAddComment
}) {
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const editorRef = useRef(null);
  const { toast } = useToast();
  
  // Check for unsaved changes
  useEffect(() => {
    if (currentPage) {
      setHasUnsavedChanges(content !== currentPage.text_content);
    }
  }, [content, currentPage]);
  
  // Setup autosave every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges && !isSaving) {
        onSave();
      }
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [hasUnsavedChanges, isSaving, onSave]);
  
  // Setup beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a comment."
      });
      return;
    }
    
    onAddComment(commentText);
    setCommentText("");
    setIsCommentMode(false);
  };
  
  // Who's editing notifications would be implemented here in a real-time system
  
  return (
    <div className="space-y-4">
      {hasUnsavedChanges && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-md flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            You have unsaved changes. Remember to save your work!
          </p>
          <Button 
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="ml-auto bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSaving ? (
              <>
                <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Now
              </>
            )}
          </Button>
        </div>
      )}
      
      <Card className="overflow-hidden border bg-white dark:bg-gray-800 relative">
        <div className="absolute right-3 top-3 flex gap-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCommentMode(!isCommentMode)}
                  className={isCommentMode ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : ""}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCommentMode ? "Cancel Comment" : "Add Comment"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Textarea
          ref={editorRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[60vh] p-6 text-lg leading-relaxed border-none focus-visible:ring-0 resize-none font-serif"
          placeholder="Start writing your story here..."
        />
      </Card>
      
      {isCommentMode && (
        <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-700 dark:text-purple-300" />
            Add a Comment
          </h3>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What would you like to say about this page?"
            className="mb-3"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCommentMode(false);
                setCommentText("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Add Comment
            </Button>
          </div>
        </Card>
      )}
      
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        <p>Tip: All changes are automatically saved every minute. Collaborators will see your changes when you save.</p>
      </div>
    </div>
  );
}