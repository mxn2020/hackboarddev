import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Users, MessageSquare, Rocket } from 'lucide-react';
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
          ? 'py-3 bg-[#0a0a14]/80 backdrop-blur-lg shadow-sm' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap 
            size={24} 
            className="text-amber-500" 
          />
          <span className="font-semibold text-lg text-gray-100">
            HackBoard
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {['Community', 'Teams', 'Resources'].map((item) => (
            <a 
              key={item}
              href="#" 
              className="text-sm font-medium text-gray-300 hover:text-amber-300 transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" className="border-amber-500/30 text-amber-300 hover:border-amber-500/50">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;