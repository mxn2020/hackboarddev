import React from 'react';
import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'light', 
  showText = true, 
  className = '',
  linkTo = '/'
}) => {
  const sizeClasses = {
    sm: {
      container: 'p-1.5',
      icon: 'h-5 w-5',
      text: 'text-lg'
    },
    md: {
      container: 'p-2',
      icon: 'h-6 w-6',
      text: 'text-xl'
    },
    lg: {
      container: 'p-2',
      icon: 'h-8 w-8',
      text: 'text-2xl'
    }
  };

  const variantClasses = {
    light: {
      background: 'bg-amber-500/20',
      icon: 'text-amber-400',
      text: 'text-white'
    },
    dark: {
      background: 'bg-amber-500/10',
      icon: 'text-amber-500',
      text: 'text-gray-900'
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  const LogoContent = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${currentSize.container} ${currentVariant.background} rounded-lg`}>
        <Code className={`${currentSize.icon} ${currentVariant.icon}`} />
      </div>
      {showText && (
        <span className={`${currentSize.text} font-bold ${currentVariant.text}`}>
          HackBoard
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;
