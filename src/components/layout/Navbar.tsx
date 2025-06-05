import React, { useState } from 'react';
import { PlusCircle, Settings, User, LogOut, Menu, Sun, Moon, BookOpen, Home as HomeIcon, Info, FileText, TestTube, Users, Zap, MessageSquare } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';

interface NavbarProps {
  toggleSidebar: () => void;
  showMenu?: boolean;
  isFixed?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, showMenu = false, isFixed = false }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={`${isFixed ? 'fixed' : 'sticky'} top-0 w-full bg-[#0a0a14]/90 dark:bg-[#0a0a14]/90 backdrop-blur-lg shadow-sm z-30 border-b border-[#2a2a3a]`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {isAuthenticated && !showMenu && (
              <Button
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-amber-300 hover:bg-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 md:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <Link to="/" className="flex items-center gap-2 ml-2 md:ml-0">
              <Zap className="h-6 w-6 text-amber-500" />
              <span className="font-semibold text-lg text-gray-100">
                HackBoard
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          {showMenu && (
            <>
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="ml-2 text-gray-300 hover:text-amber-300"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-4">
                {isAuthenticated && (
                  <>
                    <NavLink to="/\" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-amber-300' : 'text-gray-300 hover:text-amber-300'}`}>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Community
                      </div>
                    </NavLink>
                    <NavLink to="/hackboard" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-amber-300' : 'text-gray-300 hover:text-amber-300'}`}>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Team Matching
                      </div>
                    </NavLink>
                    <NavLink to="/blog" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-amber-300' : 'text-gray-300 hover:text-amber-300'}`}>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Blog
                      </div>
                    </NavLink>
                  </>
                )}
                <NavLink to="/" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-amber-300' : 'text-gray-300 hover:text-amber-300'}`}>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Community
                  </div>
                </NavLink>
                <NavLink to="/hackboard" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-amber-300' : 'text-gray-300 hover:text-amber-300'}`}>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Team Matching
                  </div>
                </NavLink>
                <NavLink to="/blog" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-amber-300' : 'text-gray-300 hover:text-amber-300'}`}>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Blog
                  </div>
                </NavLink>
              </nav>
            </>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
              className="text-gray-300 hover:text-amber-300"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {isAuthenticated ? (
              <>
                <div className="relative">
                  <Button variant="ghost" size="icon" onClick={toggleUserMenu} aria-label="User Menu" className="text-gray-300 hover:text-amber-300">
                    <div className="h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center text-black uppercase text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  </Button>
                  {userMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-[#1a1a2e] ring-1 ring-[#2a2a3a] focus:outline-none">
                      <div className="px-4 py-2 text-sm text-gray-200 border-b border-[#2a2a3a]">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        {user?.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 mt-1">
                            Admin
                          </span>
                        )}
                        </div>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#2a2a3a] flex items-center" onClick={() => setUserMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2 text-gray-400" /> Profile
                        </Link>
                        <Link to="/settings" className="block px-4 py-2 text-sm text-gray-200 hover:bg-[#2a2a3a] flex items-center" onClick={() => setUserMenuOpen(false)}>
                        <Settings className="h-4 w-4 mr-2 text-gray-400" /> Settings
                        </Link>
                        <button
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#2a2a3a] flex items-center cursor-pointer"
                        >
                        <LogOut className="h-4 w-4 mr-2 text-gray-400" /> Sign out
                        </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;