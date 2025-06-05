import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Bookmark, Share2, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Post {
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
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onBookmark, onTagClick }) => {
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
    <Card className="bg-[#1a1a2e] border-[#2a2a3a] hover:border-amber-500/30 transition-colors">
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
            className="text-gray-400 hover:text-amber-300"
            onClick={() => onLike(post.id)}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {post.likes}
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
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={post.isBookmarked ? "text-amber-300" : "text-gray-400 hover:text-amber-300"}
            onClick={() => onBookmark(post.id)}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-amber-300"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;