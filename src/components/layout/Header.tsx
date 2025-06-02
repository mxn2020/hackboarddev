import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from 'next-themes';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles 
            size={24} 
            className="text-blue-600 dark:text-blue-400" 
          />
          <span className="font-semibold text-lg text-gray-800 dark:text-white">
            AI World
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {['Features', 'About', 'Contact'].map((item) => (
            <a 
              key={item}
              href="#" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>

        <Button className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg active:shadow-sm">
          Get Started
        </Button>
      </div>
    </header>
  );
};

export default Header;