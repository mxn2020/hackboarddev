// src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Settings, 
  User, 
  X,
  BookOpen,
  FlaskConical,
  TestTube,
  Flag,
  Zap,
  Users,
  MessageSquare,
  Rocket,
  Lightbulb
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { useFeatureFlag } from '../../hooks/useFeatureFlags';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();
  const qstashEnabled = useFeatureFlag('upstash_qstash');

  const navigation = [
    { name: 'Community', href: '/', icon: MessageSquare },
    { name: 'Team Matching', href: '/hackboard', icon: Users, badge: 'New' },
    { name: 'Project Showcase', href: '/showcase', icon: Rocket },
    { name: 'Resources', href: '/resources', icon: Lightbulb },
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Examples', href: '/examples', icon: FlaskConical },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Test Suite', href: '/test', icon: TestTube },
  ];

  // Add admin-only routes with feature flag integration
  const adminNavigation = [
    { 
      name: 'Feature Flags', 
      href: '/admin/feature-flags', 
      icon: Flag, 
      adminOnly: true, 
      badge: 'Admin' 
    },
    ...(qstashEnabled ? [{
      name: 'Task Queue',
      href: '/admin/qstash',
      icon: Zap,
      adminOnly: true,
      badge: 'QStash'
    }] : [])
  ];

  const isAdmin = user?.role === 'admin';

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  const allNavigation = [
    ...filteredNavigation,
    ...(isAdmin ? adminNavigation : [])
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-30 w-64 bg-[#0a0a14] border-r border-[#2a2a3a] transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a] md:hidden">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-semibold text-gray-100">HackBoard</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-400 hover:text-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {allNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-black'
                    : 'text-gray-400 hover:text-amber-300 hover:bg-[#1a1a2e]'
                }`}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
              >
                <div className="flex items-center">
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
                {item.badge && (
                  <Badge variant="secondary" className={`text-xs ${isActive ? 'bg-black/20 text-black' : 'bg-[#2a2a3a] text-amber-300'}`}>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Section Separator */}
        {isAdmin && (
          <div className="px-4 py-2 border-t border-[#2a2a3a] mt-4">
            <div className="flex items-center gap-2 px-3 py-2">
              <Flag className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Administration
              </span>
            </div>
            {qstashEnabled && (
              <div className="px-3 py-1">
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-300">
                  <Zap className="h-3 w-3 mr-1" />
                  QStash Active
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;