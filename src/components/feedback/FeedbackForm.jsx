import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Star, Lightbulb, HelpCircle } from 'lucide-react';

export default function FeedbackForm({ onSubmit, onCancel }) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState("general");
  const [isSuggestion, setIsSuggestion] = useState(false);
  const [privacy, setPrivacy] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    const feedbackData = {
      content,
      rating,
      feedback_type: feedbackType,
      is_suggestion: isSuggestion,
      privacy
    };
    
    const success = await onSubmit(feedbackData);
    
    if (!success) {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="content">Your Feedback</Label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 p-0">
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Guidelines for Giving Feedback</h4>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 list-disc pl-4">
                  <li>Be specific and constructive</li>
                  <li>Highlight both strengths and areas for improvement</li>
                  <li>Phrase feedback as observations rather than judgments</li>
                  <li>Consider the target age group of the story</li>
                </ul>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you think about this page? Provide specific, constructive feedback..."
          className="min-h-[120px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              type="button"
              variant="ghost"
              className="p-0 w-10 h-10"
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"
                }`}
              />
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Feedback Type</Label>
        <Select value={feedbackType} onValueChange={setFeedbackType}>
          <SelectTrigger>
            <SelectValue placeholder="Select feedback type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Feedback</SelectItem>
            <SelectItem value="story">Story & Narrative</SelectItem>
            <SelectItem value="illustrations">Illustrations & Visual Style</SelectItem>
            <SelectItem value="language">Language & Writing</SelectItem>
            <SelectItem value="age_appropriate">Age Appropriateness</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-start space-x-2">
        <Checkbox 
          id="is-suggestion" 
          checked={isSuggestion}
          onCheckedChange={setIsSuggestion}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="is-suggestion"
            className="flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <Lightbulb className="h-4 w-4 text-amber-500" />
            This feedback includes a specific suggestion for improvement
          </Label>
          <p className="text-sm text-muted-foreground text-gray-500 dark:text-gray-400">
            Suggestions are tracked separately and can be marked as implemented
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Who can see this feedback?</Label>
        <RadioGroup value={privacy} onValueChange={setPrivacy} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="public" id="public" />
            <Label htmlFor="public">Public (Visible to everyone)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="collaborators" id="collaborators" />
            <Label htmlFor="collaborators">Collaborators only</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="private" id="private" />
            <Label htmlFor="private">Private (Only visible to the book owner)</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </div>
  );
}