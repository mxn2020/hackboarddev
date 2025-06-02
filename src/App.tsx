import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BlogAdminProvider } from './contexts/BlogAdminContext';
import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import NoteDetailPage from './pages/NoteDetailPage';
import NoteEditorPage from './pages/NoteEditorPage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogAdminPage from './pages/BlogAdminPage';
import BlogEditorPage from './pages/BlogEditorPage';
import ExamplesPage from './pages/ExamplesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function AppContent() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />

          {/* Public Blog Routes */}
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/examples" element={<ExamplesPage />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notes" 
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notes/new" 
            element={
              <ProtectedRoute>
                <NoteEditorPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notes/:id" 
            element={
              <ProtectedRoute>
                <NoteDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notes/:id/edit" 
            element={
              <ProtectedRoute>
                <NoteEditorPage />
              </ProtectedRoute>
            } 
          />

          {/* Blog Admin Routes */}
          <Route 
            path="/admin/blog" 
            element={
              <ProtectedRoute>
                <BlogAdminProvider>
                  <BlogAdminPage />
                </BlogAdminProvider>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/blog/new" 
            element={
              <ProtectedRoute>
                <BlogAdminProvider>
                  <BlogEditorPage />
                </BlogAdminProvider>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/blog/:slug/edit" 
            element={
              <ProtectedRoute>
                <BlogAdminProvider>
                  <BlogEditorPage />
                </BlogAdminProvider>
              </ProtectedRoute>
            } 
          />

          {/* Profile and Settings Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
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