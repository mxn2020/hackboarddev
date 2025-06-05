// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BlogAdminProvider } from './contexts/BlogAdminContext';
import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogAdminPage from './pages/BlogAdminPage';
import BlogEditorPage from './pages/BlogEditorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import HackboardPage from './pages/HackboardPage';

// Admin Pages
import FeatureFlagsPage from './pages/admin/FeatureFlagsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/\" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

function AppContent() {
  const auth = useAuth();

  // Initialize console tests when the app starts
  React.useEffect(() => {
    // Only in development mode
    if (process.env.NODE_ENV === 'development') {
      import('./utils/consoleTestInit').then(({ initConsoleTests }) => {
        initConsoleTests(auth.updateUser, auth.user);
      });
    }
  }, [auth.user, auth.updateUser]);

  return (
    <Router>
      <Routes>
        {/* Home Page has its own layout */}
        <Route path="/" element={<HomePage />} />

        {/* Routes with MainLayout */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/hackboard" element={<HackboardPage />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Public Blog Routes */}
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />

          {/* Blog Admin Routes */}
          <Route
            path="admin/blog"
            element={
              <ProtectedRoute>
                <BlogAdminProvider>
                  <BlogAdminPage />
                </BlogAdminProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/blog/new"
            element={
              <ProtectedRoute>
                <BlogAdminProvider>
                  <BlogEditorPage />
                </BlogAdminProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/blog/:slug/edit"
            element={
              <ProtectedRoute>
                <BlogAdminProvider>
                  <BlogEditorPage />
                </BlogAdminProvider>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin/feature-flags"
            element={
              <AdminRoute>
                <FeatureFlagsPage />
              </AdminRoute>
            }
          />

          {/* Profile and Settings Routes */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;