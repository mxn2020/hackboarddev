Okay, creating a comprehensive app template by merging the features of your "hello-ai-world" app with the functionality of "PromptNotes" (Netlify Functions and Upstash Redis), and then adding a blog and other examples, is a significant task.

I'll provide a refactored structure and implementation details for key new features and modifications. The core idea is to use the more robust application structure of "PromptNotes" as the base for the frontend (React with Vite, Tailwind CSS, routing, auth context) and backend (Netlify Functions), and then integrate the aesthetic elements of "hello-ai-world" and add the new features.

Here's a breakdown of the proposed app template:

**Project Name:** `AI-Enhanced Notes & Blog Template` (or similar)

**Core Technologies:**

* **Frontend:** React, Vite, TypeScript, Tailwind CSS, `react-router-dom`, `next-themes` (for theme management), `lucide-react` (icons). (Based on `PromptNotes-Src` but incorporating `hello-ai-world` visuals).
* **Backend:** Netlify Functions (Node.js).
* **Database/Cache:** Upstash Redis.
* **Deployment:** Netlify.
* **Additional Libraries (from PromptNotes):** `axios` for API calls, `jsonwebtoken`, `bcryptjs`, `cookie` for auth in functions, `nanoid`.

**I. Project Structure (Simplified Overview):**

```
/
├── functions/                  # Netlify Functions (Backend)
│   ├── auth/
│   │   └── index.cjs           # Authentication logic (login, register, me, etc.)
│   ├── notes/
│   │   ├── index.cjs           # Notes CRUD logic
│   │   └── cloudinary.cjs      # (Optional) Image upload helper
│   ├── note-types/
│   │   └── index.cjs           # Note Types CRUD
│   ├── blog/
│   │   └── index.cjs           # NEW: Blog posts CRUD
│   ├── examples/
│   │   ├── guestbook.cjs       # NEW: Guestbook example (Redis List)
│   │   └── counter.cjs         # NEW: Counter example (Redis INCR)
│   ├── health.cjs              # Health check
│   └── test.cjs                # Simple test function
├── public/                     # Static assets
│   └── ...
├── src/                        # React Application (Frontend)
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles & Tailwind setup
│   ├── vite-env.d.ts
│   ├── assets/                 # Images, fonts etc.
│   ├── components/
│   │   ├── layout/             # Layout components (Navbar, Sidebar, Footer, MainLayout)
│   │   │   ├── MainLayout.tsx    # Integrates ParticleBackground, Navbar, Sidebar, Footer
│   │   │   ├── Navbar.tsx        # Adapted from PromptNotes, includes theme toggle
│   │   │   ├── Sidebar.tsx       # From PromptNotes
│   │   │   └── Footer.tsx        # Adapted from hello-ai-world
│   │   ├── notes/              # Note-specific components (NoteCard, NoteForm, etc. from PromptNotes)
│   │   ├── blog/               # NEW: Blog components (BlogCard, BlogPostDisplay)
│   │   ├── examples/           # NEW: Example components (Guestbook, RedisCounter)
│   │   ├── ui/                 # (Shadcn/ui or similar - Button, Input, Card, etc.)
│   │   └── shared/
│   │       ├── ParticleBackground.tsx # Adapted from hello-ai-world
│   │       ├── TypeWriter.tsx         # From hello-ai-world
│   │       └── LoadingSpinner.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx       # From PromptNotes
│   ├── data/
│   │   └── systemNoteTypes.ts    # From PromptNotes
│   ├── hooks/
│   │   ├── useAuth.ts            # From PromptNotes
│   │   └── useThemeSwitcher.ts   # NEW or integrated into Navbar if using next-themes
│   ├── pages/
│   │   ├── DashboardPage.tsx     # Main dashboard, could feature Hero elements
│   │   ├── NotesPage.tsx         # (If distinct from Dashboard)
│   │   ├── NoteDetailPage.tsx
│   │   ├── NoteEditorPage.tsx
│   │   ├── BlogListPage.tsx      # NEW: Lists all blog posts
│   │   ├── BlogPostPage.tsx      # NEW: Displays a single blog post
│   │   ├── ExamplesPage.tsx      # NEW: Showcases Guestbook & Counter
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── NoteTypesPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── types/
│   │   └── index.ts              # TypeScript definitions, extended for Blog
│   └── utils/
│       └── api.ts                # Axios instance for API calls
├── .env.example                # Environment variable template
├── netlify.toml                # Netlify deployment and functions configuration
├── package.json
├── tailwind.config.js
└── tsconfig.json
└── README.md
```

**II. Key File Implementations & Refactoring:**

**1. `src/components/layout/MainLayout.tsx` (Integrates `ParticleBackground`)**

This component will wrap your routed pages and include the particle background.

```tsx
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar'; // Assuming you have this from PromptNotes
import Footer from './Footer';   // Adapted from hello-ai-world
import ParticleBackground from '../shared/ParticleBackground'; // Adapted
import { useAuth } from '../../hooks/useAuth'; // To conditionally show sidebar/navbar

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Example: only show sidebar if authenticated
  const [sidebarOpen, setSidebarOpen] = React.useState(true); // Manage sidebar state

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ParticleBackground />
      <div className="relative z-10 flex flex-1">
        {isAuthenticated && <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
        <div className="flex flex-col flex-1 overflow-hidden">
          {isAuthenticated && <Navbar toggleSidebar={toggleSidebar} />}
          <main className="flex-grow p-4 md:p-6 overflow-y-auto">
            <div className="container mx-auto">
               {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
```

**2. `src/components/shared/ParticleBackground.tsx` (Adaptation for `next-themes`)**

Modify `ParticleBackground.tsx` from `hello-ai-world` to use `next-themes`.

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes'; // Use next-themes

// ... (rest of the Particle interface and component logic remains similar)

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const { resolvedTheme } = useTheme(); // Get the resolved theme (light or dark)

  // Initialize canvas dimensions (useEffect remains similar)
  useEffect(() => {
    // ...
    const handleResize = () => {
      if (canvasRef.current) {
        setDimensions({
          width: window.innerWidth,
          // Ensure height covers the entire viewport or main content area
          height: document.documentElement.scrollHeight // Or a more specific container
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Track mouse position (useEffect remains similar)
  useEffect(() => {
    // ...
  }, []);

  // Create particles and start animation
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const particleCount = Math.min(Math.floor(dimensions.width * 0.05), 100);
    const particles: Particle[] = [];

    const lightColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4']; // Your light theme colors
    const darkColors = ['#93C5FD', '#C4B5FD', '#FBCFE8', '#67E8F9']; // Your dark theme colors
    const colors = resolvedTheme === 'dark' ? darkColors : lightColors; // Use resolvedTheme

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.1
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      // Clear only the visible part if canvas is larger than viewport
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary check (relative to canvas dimensions)
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
          if (particle.x < 0) particle.x = 0;
          if (particle.x > canvas.width) particle.x = canvas.width;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
           if (particle.y < 0) particle.y = 0;
           if (particle.y > canvas.height) particle.y = canvas.height;
        }

        // Mouse interaction (useEffect remains similar)
        // ...

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        // Ensure alpha is appended correctly for hex colors
        const alphaHex = Math.floor(particle.alpha * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = particle.color + alphaHex;
        ctx.fill();
        
        // Draw connections (logic remains similar)
        // ...
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, mousePosition, resolvedTheme]); // Depend on resolvedTheme

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0" // Ensure it's behind content
      style={{ width: '100%', height: '100%' }} // Make it cover the viewport
    />
  );
};

export default ParticleBackground;
```

**3. `src/components/layout/Navbar.tsx` (Theme Toggle with `next-themes`)**

Adapt the `Navbar` from `PromptNotes-Src` to include a theme toggle button using `next-themes`.

```tsx
import React, { useState } from 'react';
import { Search, PlusCircle, Bell, Settings, User, LogOut, Menu, Sun, Moon, BookOpen, Home as HomeIcon, Info } from 'lucide-react'; // Added BookOpen, HomeIcon, Info
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button'; // Assuming Shadcn/ui

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 bg-background/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm z-30 border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden" // Only show on mobile if sidebar is present
                aria-label="Toggle sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 ml-2 md:ml-0">
              {/* <Sparkles className="h-6 w-6 text-primary" /> */} {/* Replace with your logo/icon */}
              <img src="/logo.svg" alt="App Logo" className="h-7 w-7" /> {/* Example logo */}
              <span className="font-semibold text-lg text-foreground">
                AppTemplate
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavLink to="/" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Home</NavLink>
            <NavLink to="/blog" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Blog</NavLink>
            {isAuthenticated && <NavLink to="/dashboard" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Notes</NavLink>}
            <NavLink to="/examples" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Examples</NavLink>
          </nav>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {isAuthenticated ? (
              <>
                <Link to="/notes/new">
                  <Button variant="ghost" size="icon" aria-label="New Note">
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </Link>
                {/* User menu from PromptNotes can be used here */}
                <div className="relative">
                  <Button variant="ghost" size="icon" onClick={toggleUserMenu} aria-label="User Menu">
                     <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground uppercase text-xs">
                       {user?.name?.charAt(0) || 'U'}
                     </div>
                  </Button>
                  {userMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-popover ring-1 ring-border focus:outline-none">
                      <div className="px-4 py-2 text-sm text-popover-foreground border-b border-border">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent flex items-center" onClick={() => setUserMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2" /> Profile
                      </Link>
                      <Link to="/settings" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent flex items-center" onClick={() => setUserMenuOpen(false)}>
                        <Settings className="h-4 w-4 mr-2" /> Settings
                      </Link>
                      <button onClick={() => { setUserMenuOpen(false); logout(); }} className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent flex items-center">
                        <LogOut className="h-4 w-4 mr-2" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
```

**4. `src/components/layout/Footer.tsx`**

Adapted from `hello-ai-world`.

```tsx
import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full py-8 bg-transparent mt-auto"> {/* mt-auto to push to bottom if content is short */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Your App Name. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="https://github.com/your-repo" // Update link
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-foreground transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            {/* Add other social links as needed */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

**5. Blog Feature:**

* **`src/types/index.ts` (add BlogPost type):**

    ```typescript
    // ... other types
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
    ```
* **`functions/blog/index.cjs` (Netlify Function for Blog):**

    ```javascript
    const { Redis } = require('@upstash/redis');

    let redis;
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Redis configuration missing');
      }
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } catch (error) {
      console.error('Redis initialization failed for blog:', error);
    }

    // Helper to create a slug
    const slugify = (text) => text.toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w-]+/g, '')     // Remove all non-word chars
      .replace(/--+/g, '-')        // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text


    // Seed some initial blog posts if they don't exist (for template demonstration)
    const seedBlogPosts = async () => {
      const postExists = await redis.exists('blog:post:hello-ai-world');
      if (!postExists) {
        const posts = [
          {
            id: 'hello-ai-world',
            slug: 'hello-ai-world',
            title: 'Hello AI World: A New Beginning',
            author: 'AI Template Bot',
            publishedDate: new Date('2025-06-01T10:00:00Z').toISOString(),
            summary: 'Welcome to your new AI-enhanced application template, ready to be customized!',
            content: '# Welcome to Your New App!\n\nThis is a sample blog post. You can store your posts in **Markdown** format in Upstash Redis.\n\n## Features\n\n* Netlify Functions\n* Upstash Redis\n* React Frontend\n\nStart building something amazing!',
            tags: ['welcome', 'ai', 'template'],
            imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80' // Example image
          },
          {
            id: 'getting-started-with-redis',
            slug: 'getting-started-with-redis',
            title: 'Using Upstash Redis with Netlify Functions',
            author: 'AI Template Bot',
            publishedDate: new Date('2025-06-02T12:00:00Z').toISOString(),
            summary: 'A quick guide on how this template uses Upstash Redis for data persistence.',
            content: '## Upstash Redis Integration\n\nThis template demonstrates storing blog posts, notes, and user data in Upstash Redis. \n\nEach blog post is stored as a HASH with its content and metadata. A sorted set `blog:posts:by_date` can be used to fetch posts chronologically.',
            tags: ['redis', 'netlify', 'tutorial'],
          }
        ];

        const pipeline = redis.pipeline();
        for (const post of posts) {
          pipeline.hmset(`blog:post:${post.slug}`, post);
          pipeline.zadd('blog:posts_by_date', { score: new Date(post.publishedDate).getTime(), member: post.slug });
        }
        await pipeline.exec();
        console.log('Seeded blog posts.');
      }
    };


    exports.handler = async (event, context) => {
      const headers = {
        'Access-Control-Allow-Origin': process.env.URL || 'http://localhost:8888', // Adjust for your frontend URL
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
      };

      if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
      }

      if (!redis) {
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Redis not available' }) };
      }
      
      // Seed posts on first call (or periodically)
      await seedBlogPosts();


      const pathParts = event.path.replace('/.netlify/functions/blog', '').split('/').filter(Boolean);
      
      try {
        if (event.httpMethod === 'GET') {
          if (pathParts.length === 0) { // GET /blog (list all posts)
            const postSlugs = await redis.zrevrange('blog:posts_by_date', 0, -1); // Get all, newest first
            if (!postSlugs || postSlugs.length === 0) {
              return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: [] }) };
            }
            const posts = await Promise.all(
              postSlugs.map(slug => redis.hgetall(`blog:post:${slug}`))
            );
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: posts.filter(p => p) }) };
          } else if (pathParts.length === 1) { // GET /blog/:slug
            const slug = pathParts[0];
            const post = await redis.hgetall(`blog:post:${slug}`);
            if (!post) {
              return { statusCode: 404, headers, body: JSON.stringify({ success: false, error: 'Post not found' }) };
            }
            return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: post }) };
          }
        }
        // Add POST/PUT/DELETE for blog management if needed for a more advanced template
        // For a simple clone-and-go, users might add posts directly to Redis or via a seeding script.

        return { statusCode: 404, headers, body: JSON.stringify({ success: false, error: 'Route not found' }) };
      } catch (error) {
        console.error('Blog function error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: 'Internal server error' }) };
      }
    };
    ```
* **`src/pages/BlogListPage.tsx`:**

    ```tsx
    import React, { useEffect, useState } from 'react';
    import { Link } from 'react-router-dom';
    import { api } from '../utils/api';
    import { BlogPost } from '../types';
    import LoadingSpinner from '../components/shared/LoadingSpinner';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'; // Assuming Shadcn/ui
    import { Button } from '@/components/ui/button';
    import { Tag } from 'lucide-react';
    import dayjs from 'dayjs';

    const BlogListPage: React.FC = () => {
      const [posts, setPosts] = useState<BlogPost[]>([]);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        const fetchPosts = async () => {
          try {
            setIsLoading(true);
            setError(null);
            const response = await api.get('/blog');
            if (response.data.success) {
              setPosts(response.data.data);
            } else {
              setError(response.data.error || 'Failed to load blog posts.');
            }
          } catch (err) {
            setError('An error occurred while fetching blog posts.');
            console.error(err);
          } finally {
            setIsLoading(false);
          }
        };
        fetchPosts();
      }, []);

      if (isLoading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
      if (error) return <div className="text-center text-destructive py-10">{error}</div>;

      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Our Blog</h1>
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground">No blog posts available yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="h-48 w-full object-cover"/>
                  )}
                  <CardHeader>
                    <Link to={`/blog/${post.slug}`}>
                      <CardTitle className="text-xl font-semibold text-primary hover:underline">{post.title}</CardTitle>
                    </Link>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      By {post.author || 'Anonymous'} on {dayjs(post.publishedDate).format('MMMM D, YYYY')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-foreground line-clamp-3">{post.summary}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-4">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full flex items-center">
                            <Tag size={12} className="mr-1"/>{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link to={`/blog/${post.slug}`} className="w-full">
                       <Button variant="outline" className="w-full">Read More</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    };

    export default BlogListPage;
    ```
* **`src/pages/BlogPostPage.tsx`:** (You'll need a Markdown renderer like `react-markdown`)

    ```tsx
    import React, { useEffect, useState } Ffrom 'react';
    import { useParams, Link } from 'react-router-dom';
    import { api } from '../utils/api';
    import { BlogPost } from '../types';
    import LoadingSpinner from '../components/shared/LoadingSpinner';
    import ReactMarkdown from 'react-markdown';
    import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
    import { ChevronLeft, User, CalendarDays, Tag } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import dayjs from 'dayjs';

    const BlogPostPage: React.FC = () => {
      const { slug } = useParams<{ slug: string }>();
      const [post, setPost] = useState<BlogPost | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        if (!slug) return;
        const fetchPost = async () => {
          try {
            setIsLoading(true);
            setError(null);
            const response = await api.get(`/blog/${slug}`);
            if (response.data.success) {
              setPost(response.data.data);
            } else {
              setError(response.data.error || 'Failed to load blog post.');
            }
          } catch (err) {
            setError('An error occurred while fetching the blog post.');
            console.error(err);
          } finally {
            setIsLoading(false);
          }
        };
        fetchPost();
      }, [slug]);

      if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
      if (error) return <div className="text-center text-destructive py-10">{error}</div>;
      if (!post) return <div className="text-center text-muted-foreground py-10">Blog post not found.</div>;

      return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/blog" className="mb-8 inline-flex items-center text-primary hover:underline">
            <Button variant="outline" size="sm">
              <ChevronLeft size={18} className="mr-1" /> Back to Blog
            </Button>
          </Link>

          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-card p-6 sm:p-8 rounded-lg shadow-lg border border-border">
            {post.imageUrl && (
              <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-[400px] object-cover rounded-md mb-6"/>
            )}
            <h1 className="text-foreground">{post.title}</h1>
            <div className="flex flex-wrap items-center space-x-4 text-muted-foreground text-sm mb-6">
              {post.author && (
                <div className="flex items-center">
                  <User size={14} className="mr-1" /> {post.author}
                </div>
              )}
              <div className="flex items-center">
                <CalendarDays size={14} className="mr-1" /> {dayjs(post.publishedDate).format('MMMM D, YYYY')}
              </div>
            </div>

            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full flex items-center">
                      <Tag size={12} className="mr-1"/>{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      );
    };

    export default BlogPostPage;
    ```

**6. "Hello World" Style Examples (Guestbook & Counter):**

* **`functions/examples/guestbook.cjs`:**

    ```javascript
    const { Redis } = require('@upstash/redis');
    // ... (Redis initialization as in blog.cjs) ...
    const redisKey = 'example:guestbook_entries';

    exports.handler = async (event, context) => {
      // ... (CORS headers, Redis check) ...
      const headers = { /* ... CORS ... */ };
      if (!redis) { /* ... handle error ... */ }

      try {
        if (event.httpMethod === 'GET') {
          const entries = await redis.lrange(redisKey, 0, 49); // Get latest 50
          return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: entries.map(entry => JSON.parse(entry)) }) };
        } else if (event.httpMethod === 'POST') {
          const body = JSON.parse(event.body);
          if (!body.name || !body.message) {
            return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Name and message are required.' }) };
          }
          const entry = { name: body.name, message: body.message, timestamp: new Date().toISOString() };
          await redis.lpush(redisKey, JSON.stringify(entry));
          await redis.ltrim(redisKey, 0, 99); // Keep only the latest 100 entries
          return { statusCode: 201, headers, body: JSON.stringify({ success: true, data: entry }) };
        }
        return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method Not Allowed' }) };
      } catch (error) { /* ... error handling ... */ }
    };
    ```
* **`functions/examples/counter.cjs`:**

    ```javascript
    const { Redis } = require('@upstash/redis');
    // ... (Redis initialization) ...
    const redisKey = 'example:counter';

    exports.handler = async (event, context) => {
      // ... (CORS headers, Redis check) ...
      const headers = { /* ... CORS ... */ };
       if (!redis) { /* ... handle error ... */ }
      try {
        if (event.httpMethod === 'GET') {
          const count = await redis.get(redisKey) || 0;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: { count: parseInt(count) } }) };
        } else if (event.httpMethod === 'POST') {
          const newCount = await redis.incr(redisKey);
          return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: { count: newCount } }) };
        }
        return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method Not Allowed' }) };
      } catch (error) { /* ... error handling ... */ }
    };
    ```
* **`src/pages/ExamplesPage.tsx` and components `Guestbook.tsx`, `RedisCounter.tsx`:**
    These would be React components that use `useEffect` to fetch initial data and forms/buttons to POST data to these new Netlify functions via the `api.ts` utility.

**7. `netlify.toml` (Example):**

```toml
[build]
  command = "npm run build" # Or yarn build, etc.
  functions = "functions"
  publish = "dist"          # Or out, .next, depending on your build output

[dev]
  command = "npm run dev" # Or yarn dev
  port = 8888
  publish = "dist"
  targetPort = 5173       # Vite dev server port
  functionsPort = 34567
  framework = "#static"   # Important for Vite: use #static or #auto if Netlify auto-detects Vite

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]] # SPA fallback for client-side routing
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild" # Recommended for faster builds
  # Define environment variables here or in Netlify UI
  # UPSTASH_REDIS_REST_URL = "YOUR_UPSTASH_URL"
  # UPSTASH_REDIS_REST_TOKEN = "YOUR_UPSTASH_TOKEN"
  # JWT_SECRET = "YOUR_VERY_SECRET_JWT_KEY"
  # CLOUDINARY_CLOUD_NAME = "YOUR_CLOUDINARY_CLOUD_NAME" # If using image uploads
  # CLOUDINARY_API_KEY = "YOUR_CLOUDINARY_API_KEY"
  # CLOUDINARY_API_SECRET = "YOUR_CLOUDINARY_API_SECRET"
```

**8. `README.md` (Outline):**

* **Project Title & Description**
* **Features:** (Notes App, Blog, Theme Toggle, Particle Background, Netlify Functions examples with Redis - Guestbook, Counter, Auth, etc.)
* **Tech Stack**
* **Prerequisites:** Node.js, npm/yarn, Netlify CLI (optional for local dev).
* **Setup & Installation:**
    1.  Clone repository.
    2.  Install dependencies (`npm install` or `yarn install`).
    3.  Set up Upstash Redis and get URL/Token.
    4.  (Optional) Set up Cloudinary if using image uploads for notes.
    5.  Create `.env` file from `.env.example` and fill in:
        * `VITE_API_BASE_URL=http://localhost:8888/.netlify/functions` (for local dev)
        * `UPSTASH_REDIS_REST_URL`
        * `UPSTASH_REDIS_REST_TOKEN`
        * `JWT_SECRET`
        * (Cloudinary variables)
* **Running Locally:**
    * `netlify dev` (recommended, runs frontend and functions together).
    * Or, run Vite dev server (`npm run dev`) and Netlify functions separately if preferred.
* **Building for Production:**
    * `npm run build`
* **Deployment:**
    * Connect repo to Netlify.
    * Configure build settings (usually auto-detected).
    * Add environment variables in Netlify UI.
* **Backend (Netlify Functions):**
    * Overview of functions: `auth`, `notes`, `blog`, `examples`, etc.
    * How Redis is used.
* **Customization:**
    * Theming (Tailwind config, CSS variables).
    * Adding new note types.
    * Extending blog features.
* **License**

**III. Merging Existing Code:**

* **`hello-ai-world`:**
    * `App.tsx` logic for theme toggle is replaced by `next-themes` and its toggle mechanism (likely in `Navbar.tsx`). The overall structure of `hello-ai-world/App.tsx` is replaced by `PromptNotes-Src/App.tsx`'s routing structure.
    * `ParticleBackground.tsx` is adapted and integrated into `MainLayout.tsx`.
    * `Header.tsx` elements/style can inspire the new `Navbar.tsx`.
    * `Footer.tsx` is adapted and used in `MainLayout.tsx`.
    * `Hero.tsx` and `TypeWriter.tsx` can be used on a landing page/dashboard or a dedicated "Home" route.
    * `index.css` styles from `hello-ai-world` can be merged into the main `src/index.css` if desired, or Tailwind utility classes can be used to achieve similar effects.
* **`PromptNotes-Netlify` & `PromptNotes-Src`:**
    * These form the backbone of the template. You'll copy most of these files into the new project structure.
    * The `AuthContext`, API utilities, routing, notes components, and Netlify functions for auth and notes are largely reused.

This plan provides a comprehensive structure. The key is to use the robust backend and frontend architecture from "PromptNotes" and embellish it with the visual flair of "hello-ai-world," then extend it with the requested blog and example functionalities. Remember to thoroughly test each part, especially the Netlify Functions and their interaction with Upstash Redis.