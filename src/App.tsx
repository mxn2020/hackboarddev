import React, { useState } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import ParticleBackground from './components/ParticleBackground';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`${themeMode} transition-colors duration-300`}>
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <ParticleBackground />
        <div className="relative z-10 flex-grow flex flex-col">
          <Header />
          <Hero />
          <Footer />
        </div>
        
        <button 
          onClick={toggleTheme}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300 z-50 text-gray-800 dark:text-white"
          aria-label="Toggle theme"
        >
          {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </div>
  );
}

export default App;