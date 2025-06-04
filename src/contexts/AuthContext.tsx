// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user info from API (uses httpOnly cookies)
        const response = await api.get('/auth/me');
        if (response.data.user) {
          setUser(response.data.user);
          setToken(response.data.token || 'cookie-based');
        }
      } catch (error) {
        console.warn('Auth check failed:', error);
        // User is not authenticated, clear any stale data
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Helper function to schedule welcome email via QStash
  const scheduleWelcomeEmail = async (email: string, name: string) => {
    try {
      await api.post('/qstash/welcome-email', {
        email,
        name
      });
      console.log('Welcome email scheduled successfully via QStash');
    } catch (error) {
      console.warn('Failed to schedule welcome email:', error);
      // Don't throw error - welcome email is non-critical
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.user && response.data.success) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken || 'cookie-based');
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data?.retryAfter || 60;
        throw new Error(`Too many login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`);
      }
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, username: name });

      if (response.data.user && response.data.success) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken || 'cookie-based');

        // Schedule welcome email via QStash (non-blocking)
        scheduleWelcomeEmail(email, name);
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data?.retryAfter || 60;
        throw new Error(`Too many registration attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`);
      }
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear httpOnly cookies and blacklist token server-side
      await api.delete('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed, proceeding with client-side cleanup:', error);
    } finally {
      // Always clear client-side data regardless of API call result
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        // Make API call to update user in the database
        const response = await api.put('/auth/profile', userData);

        if (response.data.user) {
          const updatedUser = response.data.user;
          setUser(updatedUser);
          return updatedUser;
        }
      } catch (error: any) {
        console.error('Error updating user profile:', error);
        throw new Error(error.response?.data?.error || error.message || 'Failed to update profile');
      }
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });

      if (response.data.requireReauth) {
        // Password changed successfully, but user needs to re-authenticate
        await logout();
        return { success: true, requireReauth: true, message: response.data.message };
      }

      return { success: true, requireReauth: false, message: response.data.message };
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data?.retryAfter || 60;
        throw new Error(`Too many password change attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`);
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to change password');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    updateUser,
    changePassword,
    logout,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };