import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types';
import { Button } from '../ui/button';
import { Calendar, User, Tag } from 'lucide-react';
import dayjs from 'dayjs';

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {post.imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{dayjs(post.publishedDate).format('MMM DD, YYYY')}</span>
          </div>
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
          <Link to={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h2>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.summary}
        </p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2 flex-wrap">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <Link to={`/blog/${post.slug}`}>
          <Button variant="outline" size="sm">
            Read More
          </Button>
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;
