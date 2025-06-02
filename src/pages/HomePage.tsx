import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TypeWriter from '../components/shared/TypeWriter';
import ParticleBackground from '../components/shared/ParticleBackground';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from 'next-themes';
import { BookOpen, Info, Home as HomeIcon, FileText, Users, Sun, Moon, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '../utils/api';
import { BlogPost } from '../types';
import dayjs from 'dayjs';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  const handleThemeToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  const greetings = [
    "Welcome to App Template",
    "A React & TypeScript Starter",
    "Build Modern Web Apps",
    "Powered by Vite & Tailwind"
  ];

  // Fetch blog posts for the homepage preview
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await api.get('/blog');
        if (response.data.success) {
          // Get only the latest 3 posts for homepage preview
          setBlogPosts(response.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        // Keep loading state to false even on error so page still renders
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchBlogPosts();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ParticleBackground />
      
      {/* Header Navigation */}
      <header className="relative z-10 py-4 border-b border-gray-200 dark:border-gray-800 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="App Logo" className="h-8 w-8" />
              <span className="font-semibold text-xl text-foreground">AppTemplate</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/blog" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="h-4 w-4 mr-1" />
                Blog
              </Link>
              <Link to="/examples" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4 mr-1" />
                Examples
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <HomeIcon className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                  <Link to="/notes" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <FileText className="h-4 w-4 mr-1" />
                    Notes
                  </Link>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={handleThemeToggle}
                    aria-label="Toggle theme"
                    className="mr-2"
                    title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    Sign In
                  </Link>
                </>
              )}
            </nav>
            
            {/* Mobile menu Button */}
            <Button 
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent" 
              aria-label="Open mobile menu"
              onClick={() => {
                // Add mobile menu functionality
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                  mobileMenu.classList.toggle('hidden');
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
          
          {/* Mobile menu dropdown */}
          <div id="mobile-menu" className="hidden md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border z-50 py-4 px-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Menu</h3>
              <Button 
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => {
                  const mobileMenu = document.getElementById('mobile-menu');
                  if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <nav className="flex flex-col space-y-4">
              <Link to="/blog" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="h-4 w-4 mr-1" />
                Blog
              </Link>
              <Link to="/examples" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4 mr-1" />
                Examples
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <HomeIcon className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                  <Link to="/notes" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <FileText className="h-4 w-4 mr-1" />
                    Notes
                  </Link>
                </>
              ) : (
                <>
                <Button
                  onClick={handleThemeToggle}
                  className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                >
                  {resolvedTheme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4 mr-1" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 mr-1" />
                      Dark Mode
                    </>
                  )}
                </Button>
                <Link to="/login" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Sign In
                </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center transform transition-all duration-700">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-8">
              <TypeWriter texts={greetings} delay={150} pauseBetweenTexts={2000} />
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              A modern React application starter with authentication, blog functionality, and more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/login" className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                  Sign In
                </Link>
              )}
              <Link to="/blog" className="px-6 py-3 rounded-full bg-card hover:bg-accent text-foreground font-medium border border-border transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Read Our Blog
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="relative z-10 py-12 md:py-20 bg-accent/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-16">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">User Authentication</h3>
              <p className="text-muted-foreground">Secure login and registration with JWT authentication and protected routes.</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Notes Management</h3>
              <p className="text-muted-foreground">Create, edit, and organize your notes with categories and tags.</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Blog Platform</h3>
              <p className="text-muted-foreground">Publish and manage blog posts with a clean, responsive design.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Tech Stack Section */}
      <section className="relative z-10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Powered By</h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Built with modern technologies for performance, reliability, and developer experience.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-8 justify-items-center">
            {/* React */}
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 mb-3 flex items-center justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="max-h-full max-w-full" />
              </div>
              <span className="text-sm font-medium">React</span>
            </div>
            
            {/* Tailwind */}
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 mb-3 flex items-center justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Tailwind CSS" className="max-h-full max-w-full" />
              </div>
              <span className="text-sm font-medium">Tailwind CSS</span>
            </div>
            
            {/* Shadcn UI */}
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 mb-3 flex items-center justify-center bg-black rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="max-h-full max-w-full">
                  <path fill="#fff" d="M165.7 84.3a8.1 8.1 0 0 0-11.4 0l-62 62a8.1 8.1 0 0 0 11.4 11.4l62-62c3.1-3.1 3.1-8.2 0-11.4ZM128 40a88 88 0 1 0 88 88 88.1 88.1 0 0 0-88-88Zm0 160a72 72 0 1 1 72-72 72.1 72.1 0 0 1-72 72Z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">shadcn/ui</span>
            </div>
            
            {/* Zustand */}
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 mb-3 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="max-h-full max-w-full">
                  <path fill="currentColor" d="M16.43 0c-1.285.023-2.482.447-3.325 1.146a5.28 5.28 0 0 0-.652.596C11.596 1.007 10.4.584 9.117.562 4.953.503 2.522 5.146 5.289 10.42a15.96 15.96 0 0 0 1.057 1.72l.574.794a15.591 15.591 0 0 0 .774 1.06 14.976 14.976 0 0 0 1.77 1.886c1.178 1.074 2.258 1.67 3.12 1.67.208 0 .405-.027.586-.082.52-.143.942-.5 1.245-.876.304.375.725.733 1.245.876.182.055.378.082.585.082.863 0 1.943-.596 3.121-1.67a15.001 15.001 0 0 0 2.172-2.381c.203-.282.404-.577.597-.884l.408-.564c.145-.199.271-.375.397-.57A7.541 7.541 0 0 0 24 7.667c0-3.616-2.57-7.674-7.57-7.667zm-4.43 13.433a1.976 1.976 0 0 0-1.42.612A1.985 1.985 0 0 0 10 15.6c0 1.104.896 2 2 2s2-.896 2-2c0-.737-.406-1.375-1-1.722-.183-.101-.379-.167-.587-.19a2.235 2.235 0 0 0-.413 0zm4 0a1.976 1.976 0 0 0-1.42.612c-.364.365-.58.864-.58 1.555 0 1.104.896 2 2 2s2-.896 2-2c0-.737-.406-1.375-1-1.722-.183-.101-.379-.167-.587-.19a2.235 2.235 0 0 0-.413 0z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">Zustand</span>
            </div>
            
            {/* Zod */}
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 mb-3 flex items-center justify-center">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="max-h-full max-w-full">
                  <path fill="#18B6F6" d="m14.1 24-3.6-3.62 7.4-7.39 3.62 3.61zm8.5-14.25-3.61-3.61 1.26-1.26 3.61 3.6zM14.1 3.75l3.62-3.6L14.1 0l-3.61 3.62z"/>
                  <path fill="#0784C3" d="m14.1 24-3.6-3.62h7.28l-3.61 3.62h-.07zm3.8-17.5-3.62 3.62h7.22zm-3.73-2.75L21 3.68h-7.22zm-3.68 17.5H3.3l7.2-7.4-3.63-3.6 3.63-3.62L21.38 16.5h-7.27z"/>
                  <path fill="#0C63A6" d="M10.49 10.12h7.27L3.92 24l10.6-13.88z"/>
                  <path fill="#0C63A6" d="M10.5 3.75 3.92 0l6.57 7.38V3.75z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">Zod</span>
            </div>
            
            {/* Netlify */}
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 mb-3 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className="max-h-full max-w-full">
                  <path fill="#20C6B7" d="M28.589 14.135l-.014-.006c-.008-.003-.016-.006-.023-.013a.11.11 0 0 1-.028-.093l.773-4.726 3.625 3.626-3.77 1.604a.083.083 0 0 1-.033.006h-.015c-.005-.003-.01-.007-.02-.017a1.716 1.716 0 0 0-.495-.381zm5.258-.288 3.876 3.876c.805.806 1.208 1.208 1.355 1.674.022.069.04.138.054.209l-9.263-3.923a.728.728 0 0 0-.015-.006c-.037-.015-.08-.032-.08-.07 0-.038.044-.056.081-.071l.012-.005 3.98-1.684zm5.127 7.003c-.2.376-.59.766-1.25 1.427l-4.37 4.369L27 25.469V25c0-.075-.015-.148-.044-.219a1.901 1.901 0 0 0-.5-.768l-.005-.005-.005-.006a2.055 2.055 0 0 0-.731-.44l-.013-.006-.006-.003-.017-.006-.115-.048-.011-.005-.008-.003-.063-.031H25.5c0-.063-.013-.121-.038-.175l-.008-.018a1.537 1.537 0 0 0-.538-.65l-.007-.005-.005-.006a2.063 2.063 0 0 0-.918-.328c-.025-.001-.05-.004-.075-.004s-.05.003-.075.004a2.063 2.063 0 0 0-.918.329l-.007.004-.005.006c-.267.21-.456.421-.538.65l-.008.018c-.025.054-.038.112-.038.175h-.014l-.063.031-.008.003-.011.006-.115.047-.017.006-.006.003-.013.006c-.284.121-.535.267-.731.44l-.005.006-.005.005a1.899 1.899 0 0 0-.5.769c-.029.07-.044.144-.044.219v.469l-6.401 2.769-4.362-4.37c-.66-.66-1.05-1.051-1.25-1.427a2.026 2.026 0 0 1-.143-.578l15.825 6.704c.232.098.232.369 0 .467l-7.686 3.260 8.997-1.36c.7566-.992.5012-.633.5206-.995.17-.327-.047-.6-.21-.787l-.015-.017 7.566-3.208c.504-.214.87-.577.87-.985s-.366-.771-.87-.985L20.397 10.88l8.807 3.729c.466.197.78.634.79 1.143a1.369 1.369 0 0 1-.289.885c.015.012.03.022.044.035l.055.056c.214.214.445.4.573.633.095.175.142.362.142.557 0 .145-.027.287-.082.423l-.004.01-.017.428z"/>
                  <path fill="#20C6B7" d="M7.734 28.242c-.18-.386-.29-.775-.307-1.145l-.003-.053-.003-.053c0-1.555 1.187-3.328 2.547-3.63.128-.029.257-.043.386-.043a1.54 1.54 0 0 1 .14.006c.05.005.1.011.15.019l.077.015c.049.011.097.025.145.041l.107.036c.05.019.097.04.143.063l.096.05c.049.027.095.056.139.087.014.01.028.019.041.029.006.004.011.008.017.012l5.792 5.793-6.56 2.805c-.527.226-.827.4-1.114.547a7.366 7.366 0 0 1-.43.209c-.302.139-.594.245-.885.345l-.9.027c-.208.063-.417.127-.629.201l-.15.005c-.202.066-.397.155-.576.265-.0702.044-.1354.096-.1932.148-.0604.054-.1163.108-.162.17-.0836.112-.144.238-.18.375a1.411 1.411 0 0 0-.0234.308 1.212 1.212 0 0 1-.0225-.257c-.0026-.073-.004-.146-.004-.221 0-.21.005-.424.018-.656v-.024l.006-.146c.001-.024.002-.047.004-.071v-.012c.01-.195.027-.396.05-.605a13.233 13.233 0 0 1 .224-1.441v-.003c.057-.023.111-.054.161-.086a2.13 2.13 0 0 0 .43-.392c.153-.177.292-.375.416-.594a5.61 5.61 0 0 0 .134-.25c.096-.191.183-.391.264-.599l.003-.009v-.003a6.801 6.801 0 0 0 .225-.657l.106-.323c.064-.215.117-.431.156-.645l.037-.24a4.55 4.55 0 0 0 .023-.626v-.024c-.002-.044-.004-.088-.008-.133l-.013-.138-.022-.133c-.007-.041-.016-.082-.026-.123a1.952 1.952 0 0 0-.249-.654l-.017-.03a2.157 2.157 0 0 0-.139-.21 2.134 2.134 0 0 0-.494-.488l-.009-.006-.009-.006c-.251-.175-.563-.284-.918-.304l-.07-.003-.07-.001c-.492 0-.95.253-1.332.537l-.01.008-.01.007c-.859.637-1.473 1.53-1.794 2.12-.063.115-.115.23-.155.341l-.019.055-.003.009c-.034.108-.057.219-.069.332a1.923 1.923 0 0 0-.008.073c-.001.015-.002.03-.002.046h-.007c-.001.024-.002.047-.002.071v.008a1.03 1.03 0 0 0 .008.129v.009c.008.086.024.17.048.252l.001.003.001.003c.029.098.068.193.117.285.084.158.192.312.325.454l.075.077.098.094.1.089c.032.027.065.054.099.08l.099.074c.033.023.067.046.102.068.068.045.138.087.21.126.072.039.145.076.22.11l.036.017c.001 0 .002.001.003.002l.227.104.058.026 6.474 2.8.85.037.113.05a.763.763 0 0 1-.146-.083 1.283 1.283 0 0 1-.175-.15c-.528-.525-1.26-1.254-1.744-1.738l-9.257-9.256a.766.766 0 0 1-.175-.244l-.003-.006-.003-.006a.822.822 0 0 1-.063-.32v-.046-.047a.668.668 0 0 1 .676-.654h.048a.673.673 0 0 1 .135.015h.005l.005.001c.189.04.33.168.442.28l11.794 11.796-6.073 1.512-.292.073-.084.02a2.52 2.52 0 0 0-.147.04l-.134.04c-.043.014-.085.028-.127.043l-.123.045a2.385 2.385 0 0 0-.208.086c-.03.013-.061.028-.091.043a1.235 1.235 0 0 0-.101.053c-.361.209-.661.503-.879.838v.001h-.001a2.185 2.185 0 0 0-.233.576l-.007.028-.008.028c-.036.145-.061.29-.076.428L.526 30.574l6.758-1.687c.082-.02.107-.126.034-.162-.358-.177-.706-.763-.787-1.322a1.985 1.985 0 0 1 .017-.62l.023-.091c.143-.526.482-.807 1.16-1.009.119-.036.238-.07.359-.101l.142-.036a14.38 14.38 0 0 0 .288-.079c.195-.054.392-.111.581-.175l.142-.046.14-.047c.093-.032.186-.064.278-.097l.136-.049c.045-.017.09-.033.134-.051a4.413 4.413 0 0 0 .753-.353l.035-.022.017-.01-3.003-1.098z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">Netlify</span>
            </div>
            
            {/* Upstash */}
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 mb-3 flex items-center justify-center">
                <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="max-h-full max-w-full">
                  <path fill="#00E9A3" d="M224 128a96 96 0 1 0-96 96 96 96 0 0 0 96-96Z"/>
                  <path fill="#fff" d="m57.814 128-.015 44.473 38.754-22.282.016-44.329-38.755 22.138Z"/>
                  <path fill="#fff" d="m146.665 106.199-38.624 22.28-.015 44.33 38.624-22.282.015-44.328Z"/>
                  <path fill="#fff" d="m57.678 83.718-.015 44.33 38.755-22.282.015-44.33-38.755 22.282Z"/>
                  <path fill="#fff" d="m146.978 61.869-38.624 22.282-.016 44.33 38.625-22.282.015-44.33Z"/>
                  <path fill="#fff" d="m159.4 150.69-.015 44.28 38.755-22.281.015-44.28L159.4 150.69Z"/>
                  <path fill="#fff" d="m159.364 150.382 38.624-22.281.016-44.33-38.625 22.28-.015 44.33Z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">Upstash</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Blog Preview Section */}
      <section className="relative z-10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 sm:mb-0">Latest Blog Posts</h2>
            <Link to="/blog" className="text-primary hover:text-primary/80 font-medium flex items-center">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loadingPosts ? (
              // Loading skeleton for blog posts
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-8 bg-muted rounded w-24 mt-4"></div>
                  </div>
                </div>
              ))
            ) : blogPosts.length > 0 ? (
              // Real blog posts
              blogPosts.map((post) => (
                <div key={post.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {post.imageUrl ? (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500"></div>
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
                    
                    <h3 className="text-xl font-semibold mb-3 hover:text-primary transition-colors">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.summary || 'No summary available.'}
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
                    
                    <Link to={`/blog/${post.slug}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                      Read More
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // No posts fallback
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No blog posts available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Sign Up Section */}
      <section className="relative z-10 py-12 md:py-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">Ready to Get Started?</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-10">Join our community today and start building amazing applications.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                Create an Account
              </Link>
              <Link to="/examples" className="px-6 py-3 rounded-full bg-card hover:bg-accent text-foreground font-medium border border-border transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                View Examples
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 py-10 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="App Logo" className="h-8 w-8" />
                <span className="font-semibold text-lg">AppTemplate</span>
              </Link>
              <p className="text-muted-foreground">A modern React application starter with everything you need.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/examples" className="text-muted-foreground hover:text-foreground transition-colors">Examples</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
              <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} AppTemplate. All rights reserved.</p>
              
              <Button
                onClick={handleThemeToggle}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors md:ml-4"
                aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {resolvedTheme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
