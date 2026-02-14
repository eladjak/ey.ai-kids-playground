import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageSquare, 
  BookOpen, 
  Tag,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CommunityPost({ post, onLike, isOwner = false }) {
  if (!post || !post.book) return null;
  
  const truncate = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Book Cover */}
          <div className="md:w-1/4 lg:w-1/5 bg-gray-100 dark:bg-gray-800 aspect-square md:aspect-auto">
            <Link to={`${createPageUrl("CommunityPost")}?id=${post.id}`}>
              {post.book?.cover_image ? (
                <img 
                  src={post.book.cover_image} 
                  alt={post.book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[140px] flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-gray-300" />
                </div>
              )}
            </Link>
          </div>
          
          {/* Content */}
          <div className="p-5 flex-1">
            <div className="flex justify-between">
              {/* Author info */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${post.user?.full_name || 'User'}&background=random`} />
                  <AvatarFallback>{post.user?.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{post.user?.full_name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.created_date && format(new Date(post.created_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              {/* Actions menu */}
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* Post title and content */}
            <Link to={`${createPageUrl("CommunityPost")}?id=${post.id}`}>
              <h3 className="text-lg font-semibold mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                {post.title}
              </h3>
            </Link>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              {truncate(post.description)}
            </p>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Book info */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                <BookOpen className="mr-1 h-3 w-3" />
                {post.book.title}
              </Badge>
              {post.book.genre && (
                <Badge variant="outline" className="text-xs capitalize">
                  {post.book.genre.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            
            {/* Interactions */}
            <div className="flex items-center gap-4 mt-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                onClick={() => onLike(post.id)}
              >
                <Heart className={`h-4 w-4 ${post.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{post.likes || 0}</span>
              </Button>
              
              <Link to={`${createPageUrl("CommunityPost")}?id=${post.id}`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.commentCount || 0}</span>
                </Button>
              </Link>
              
              <div className="ml-auto">
                <Link to={`${createPageUrl("CommunityPost")}?id=${post.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}