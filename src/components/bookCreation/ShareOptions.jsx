import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Share2, 
  MessageSquare, 
  Heart, 
  Download, 
  Copy, 
  Twitter, 
  Facebook, 
  Instagram, 
  Mail,
  BookOpen,
  Send
} from "lucide-react";
import { Community } from "@/entities/Community";
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";

export default function ShareOptions({ book, bookId }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shareType, setShareType] = useState("community");
  const [communityPost, setCommunityPost] = useState({
    title: book?.title || "",
    description: "",
    tags: ["story", "children"]
  });
  
  const handleCommunityShare = async () => {
    if (!communityPost.title || !communityPost.description) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide a title and description for your post."
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await Community.create({
        book_id: bookId,
        title: communityPost.title,
        description: communityPost.description,
        tags: communityPost.tags,
        visibility: "public"
      });
      
      toast({
        title: "Book shared successfully!",
        description: "Your book is now available in the community section.",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
      
      // Reset form
      setCommunityPost({
        title: book?.title || "",
        description: "",
        tags: ["story", "children"]
      });
    } catch (error) {
      // silently handled
      toast({
        variant: "destructive",
        title: "Error sharing book",
        description: "There was a problem sharing your book. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyLink = () => {
    const url = `${window.location.origin}${createPageUrl("BookView")}?id=${bookId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "Book link has been copied to clipboard."
      });
    });
  };
  
  const shareToSocialMedia = (platform) => {
    const url = `${window.location.origin}${createPageUrl("BookView")}?id=${bookId}`;
    const text = `Check out this amazing children's book: ${book?.title}`;
    
    let shareUrl;
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-purple-500" />
            Share with Community
          </CardTitle>
          <CardDescription>
            Share your book with other EY.AI Kids users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postTitle">Post Title</Label>
              <Input
                id="postTitle"
                value={communityPost.title}
                onChange={(e) => setCommunityPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a title for your community post"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postDescription">Description</Label>
              <Textarea
                id="postDescription"
                value={communityPost.description}
                onChange={(e) => setCommunityPost(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Share the story behind your book..."
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {communityPost.tags.map((tag, index) => (
                  <div key={index} className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1 text-sm flex items-center">
                    {tag}
                    <button
                      onClick={() => setCommunityPost(prev => ({
                        ...prev,
                        tags: prev.tags.filter((_, i) => i !== index)
                      }))}
                      className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <Input
                  className="w-32 h-8"
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      e.preventDefault();
                      if (!communityPost.tags.includes(e.target.value)) {
                        setCommunityPost(prev => ({
                          ...prev,
                          tags: [...prev.tags, e.target.value]
                        }));
                      }
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleCommunityShare}
            disabled={isLoading || !communityPost.title || !communityPost.description}
            className="w-full"
          >
            {isLoading ? (
              <>
                <span className="mr-2">Sharing...</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share with Community
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-blue-500" />
            Share Book Link
          </CardTitle>
          <CardDescription>
            Get a link to share your book with friends and family
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="relative">
              <Input
                value={`${window.location.origin}${createPageUrl("BookView")}?id=${bookId}`}
                readOnly
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full text-gray-500 hover:text-gray-700"
                onClick={copyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <Label className="mb-2 block">Share on social media</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => shareToSocialMedia('facebook')}
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full text-blue-400 hover:text-blue-500 hover:bg-blue-50"
                  onClick={() => shareToSocialMedia('twitter')}
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => shareToSocialMedia('email')}
                >
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={copyLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Share Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2 text-green-500" />
            Send Direct Invitation
          </CardTitle>
          <CardDescription>
            Invite others to read your book via email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="Enter email address"
                type="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to your invitation..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            Add More Recipients
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}