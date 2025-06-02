import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  updatedDate?: string;
}

interface BlogAdminContextType {
  createPost: (postData: Omit<BlogPost, 'id' | 'slug' | 'author' | 'publishedDate' | 'updatedDate'>) => Promise<BlogPost>;
  updatePost: (slug: string, postData: Partial<Omit<BlogPost, 'id' | 'slug' | 'author' | 'publishedDate'>>) => Promise<BlogPost>;
  deletePost: (slug: string) => Promise<void>;
  fetchPosts: () => Promise<BlogPost[]>;
  fetchPost: (slug: string) => Promise<BlogPost>;
}

const BlogAdminContext = createContext<BlogAdminContextType | undefined>(undefined);

export const useBlogAdmin = () => {
  const context = useContext(BlogAdminContext);
  if (context === undefined) {
    throw new Error('useBlogAdmin must be used within a BlogAdminProvider');
  }
  return context;
};

interface BlogAdminProviderProps {
  children: ReactNode;
}

export const BlogAdminProvider: React.FC<BlogAdminProviderProps> = ({ children }) => {
  const { token } = useAuth();

  const createPost = async (postData: Omit<BlogPost, 'id' | 'slug' | 'author' | 'publishedDate' | 'updatedDate'>): Promise<BlogPost> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create post');
    }

    return result.data;
  };

  const updatePost = async (slug: string, postData: Partial<Omit<BlogPost, 'id' | 'slug' | 'author' | 'publishedDate'>>): Promise<BlogPost> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blog/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update post');
    }

    return result.data;
  };

  const deletePost = async (slug: string): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blog/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete post');
    }
  };

  const fetchPosts = async (): Promise<BlogPost[]> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blog`);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch posts');
    }
    return result.data || [];
  };

  const fetchPost = async (slug: string): Promise<BlogPost> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blog/${slug}`);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch post');
    }
    return result.data;
  };

  const value: BlogAdminContextType = {
    createPost,
    updatePost,
    deletePost,
    fetchPosts,
    fetchPost,
  };

  return (
    <BlogAdminContext.Provider value={value}>
      {children}
    </BlogAdminContext.Provider>
  );
};

export default BlogAdminProvider;
