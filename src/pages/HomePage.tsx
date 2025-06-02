import React from 'react';
import { Link } from 'react-router-dom';
import TypeWriter from '../components/shared/TypeWriter';
import ParticleBackground from '../components/shared/ParticleBackground';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Info, Home as HomeIcon, FileText, Users } from 'lucide-react';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  const greetings = [
    "Welcome to App Template",
    "A React & TypeScript Starter",
    "Build Modern Web Apps",
    "Powered by Vite & Tailwind"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
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
                <Link to="/login" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Sign In
                </Link>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <button 
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
            </button>
          </div>
          
          {/* Mobile menu dropdown */}
          <div id="mobile-menu" className="hidden md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border z-50 py-4 px-4">
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
                <Link to="/login" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center transform transition-all duration-1000 opacity-0 translate-y-8 animate-[fadeIn_1s_ease-out_forwards]">
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
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 opacity-0 animate-[fadeIn_0.5s_ease-out_0.1s_forwards]">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">User Authentication</h3>
              <p className="text-muted-foreground">Secure login and registration with JWT authentication and protected routes.</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 opacity-0 animate-[fadeIn_0.5s_ease-out_0.3s_forwards]">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Notes Management</h3>
              <p className="text-muted-foreground">Create, edit, and organize your notes with categories and tags.</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 opacity-0 animate-[fadeIn_0.5s_ease-out_0.5s_forwards]">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Blog Platform</h3>
              <p className="text-muted-foreground">Publish and manage blog posts with a clean, responsive design.</p>
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
            {/* Sample blog posts - these would typically come from your API */}
            <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Getting Started with React and TypeScript</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">Learn how to set up a new project with React and TypeScript using Vite.</p>
                <Link to="/blog/getting-started" className="text-primary hover:text-primary/80 font-medium text-sm">Read More</Link>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-green-400 to-teal-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Building a Modern UI with Tailwind CSS</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">Discover how to create beautiful interfaces using Tailwind's utility-first approach.</p>
                <Link to="/blog/tailwind-ui" className="text-primary hover:text-primary/80 font-medium text-sm">Read More</Link>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-red-400 to-orange-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Authentication Best Practices</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">Learn how to implement secure authentication in your React applications.</p>
                <Link to="/blog/auth-best-practices" className="text-primary hover:text-primary/80 font-medium text-sm">Read More</Link>
              </div>
            </div>
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
            <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} AppTemplate. All rights reserved.</p>
            
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
