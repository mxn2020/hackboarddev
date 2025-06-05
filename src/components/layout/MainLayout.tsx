import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

const MainLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  // Make sure to use the latest user preference value
  const menuLayout = user?.preferences?.menuLayout || 'sidebar';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#0a0a14] to-[#1a1a2e]">
      <div className="relative z-10 flex flex-1">
        {isAuthenticated && menuLayout === 'sidebar' && (
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        )}
        <div className="flex flex-col flex-1 overflow-hidden">
          {isAuthenticated && (
            <Navbar 
              toggleSidebar={toggleSidebar} 
              showMenu={menuLayout === 'header'}
              isFixed={menuLayout === 'header'}
            />
          )}
          <main className={`flex-grow p-0 overflow-y-auto ${menuLayout === 'header' ? 'mt-16' : ''}`}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;