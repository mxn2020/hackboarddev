import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Bookmark, Share2, Clock, Triangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: 'question' | 'showcase' | 'idea' | 'team' | 'resource';
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  isBookmarked?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onTagClick: (tag: string) => void;
  isAuthenticated?: boolean;
  onAuthRequired?: (action: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onBookmark, 
  onTagClick, 
  isAuthenticated = true,
  onAuthRequired 
}) => {
  const handleInteraction = (action: () => void, actionName: string) => {
    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired(actionName);
      return;
    }
    action();
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors flex">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="bg-amber-500 text-black">
                  {post.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-gray-200">{post.author.name}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(post.createdAt)}
                </div>
              </div>
            </div>
            <div>
              <Badge className={`
                ${post.category === 'question' ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' : ''}
                ${post.category === 'showcase' ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' : ''}
                ${post.category === 'idea' ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : ''}
                ${post.category === 'team' ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : ''}
                ${post.category === 'resource' ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : ''}
              `}>
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold text-gray-100 mb-2 hover:text-amber-300 transition-colors">
            <Link to={`/hackboard/post/${post.id}`}>
              {post.title}
            </Link>
          </h3>
          <p className="text-gray-300 mb-4 line-clamp-2">
            {post.content}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="border-amber-500/30 text-amber-300/70 hover:border-amber-500/50 hover:text-amber-300 cursor-pointer"
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t border-[#2a2a3a] pt-3 flex justify-between">
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-400 hover:text-amber-300 ${!isAuthenticated ? 'opacity-50' : ''}`}
              onClick={() => handleInteraction(() => onBookmark(post.id), 'bookmark posts')}
              disabled={!isAuthenticated}
            >
              <Bookmark className={post.isBookmarked ? 'text-amber-300' : 'text-gray-400'} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-amber-300"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/hackboard/post/${post.id}`);
                toast.success('Post link copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-amber-300"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.comments}
            </Button>
          </div>
        </CardFooter>
      </div>
      {/* Upvote section */}
      <div className="flex flex-col items-center justify-center px-4 min-w-[64px] border-l border-[#2a2a3a] bg-[#181825]">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full text-2xl ${post.likes > 0 ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'} ${!isAuthenticated ? 'opacity-50' : ''}`}
          onClick={() => handleInteraction(() => onLike(post.id), 'like posts')}
          disabled={!isAuthenticated}
          aria-label="Upvote"
        >
          <Triangle className="h-7 w-7 rotate-0" fill={post.likes > 0 ? 'currentColor' : 'none'} />
        </Button>
        <span className="text-lg font-bold text-amber-400 mt-1">{post.likes}</span>
      </div>
    </Card>
  );
};

export default PostCard;