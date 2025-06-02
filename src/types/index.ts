// TypeScript type definitions for the enhanced app template

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  noteTypeId: string;
  userId: string;
  category?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface NoteType {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  isSystem: boolean;
  userId?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  author?: string;
  publishedDate: string; // ISO Date string
  summary: string;
  content: string; // Markdown content
  tags?: string[];
  imageUrl?: string;
}

export interface GuestbookEntry {
  name: string;
  message: string;
  timestamp: string;
}

export interface CounterData {
  count: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
