import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      // Validate token format before using it
      if (storedToken && storedToken.trim() !== '' && storedToken !== 'null' && storedToken !== 'undefined' && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setToken(storedToken);
          // Verify token with backend
          const response = await api.get('/auth/me');
          if (response.data.user) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.warn('Auth token validation failed:', error);
          // Token is invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.user && response.data.token) {
        const { user: userData, token: authToken } = response.data;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setToken(authToken);
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, username: name });

      if (response.data.user && response.data.token) {
        const { user: userData, token: authToken } = response.data;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setToken(authToken);
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        // Make API call to update user in the database
        const response = await api.put('/auth/profile', userData);

        if (response.data.user) {
          const updatedUser = response.data.user;
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        }
      } catch (error: any) {
        console.error('Error updating user profile:', error);
        throw new Error(error.response?.data?.error || error.message || 'Failed to update profile');
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    updateUser,
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
