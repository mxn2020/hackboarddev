import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import TypeWriter from './shared/TypeWriter';

const Hero: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const greetings = [
    "Hello AI World",
    "Bonjour Monde d'IA",
    "Hola Mundo de IA",
    "こんにちは AI 世界",
    "你好 AI 世界"
  ];

  return (
    <main ref={heroRef} className="flex-grow flex items-center justify-center px-4 py-12 md:py-20">
      <div 
        className={`max-w-4xl w-full mx-auto text-center transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="relative backdrop-blur-sm bg-white/5 dark:bg-gray-900/30 rounded-2xl p-8 md:p-12 border border-white/10 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20" />
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-6">
              <TypeWriter texts={greetings} delay={150} pauseBetweenTexts={2000} />
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Welcome to a world where artificial intelligence meets beautiful design, creating immersive and intuitive experiences for the future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                Explore Now
              </button>
              <button className="px-6 py-3 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Learn More
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-12 text-gray-600 dark:text-gray-400">
              {['React', 'TypeScript', 'Tailwind', 'Vite'].map((tech) => (
                <div key={tech} className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;