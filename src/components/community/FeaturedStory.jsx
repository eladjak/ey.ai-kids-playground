import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageSquare, 
  Award, 
  Star,
  BookOpen
} from 'lucide-react';

export default function FeaturedStory({ post, onLike }) {
  if (!post || !post.book) return null;
  
  return (
    <Card className="overflow-hidden h-full transition-all hover:shadow-md bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800">
            {post.book.cover_image ? (
              <img 
                src={post.book.cover_image} 
                alt={post.book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>
          
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 text-white">
              <Star className="h-3 w-3 mr-1 fill-white" />
              Featured
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <Link to={`${createPageUrl("CommunityPost")}?id=${post.id}`}>
            <h3 className="font-bold text-lg mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {post.title}
            </h3>
          </Link>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {post.description}
          </p>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Shared by {post.user?.full_name || 'Unknown User'} • {format(new Date(post.created_date || Date.now()), 'MMM d')}
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                onClick={() => onLike(post.id)}
              >
                <Heart className={`h-4 w-4 ${post.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{post.likes || 0}</span>
              </Button>
              
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <MessageSquare className="h-4 w-4" />
                <span>{post.commentCount || 0}</span>
              </div>
            </div>
            
            <Link to={`${createPageUrl("CommunityPost")}?id=${post.id}`}>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                Read More
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}