import axios from 'axios';
import { devAuth } from './devAuth';

interface AuthRequestData {
  email?: string;
  password?: string;
  username?: string;
  name?: string;
  preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

// Check if we're in development mode (StackBlitz or local dev without backend)
const isDevelopmentMode = import.meta.env.DEV || window.location.hostname.includes('stackblitz');

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/.netlify/functions',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Request configuration type
interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  [key: string]: unknown;
}

// Enhanced API with development mode support
const enhancedApi = {
  ...api,

  async get(url: string, config?: RequestConfig) {
    if (isDevelopmentMode && url.startsWith('/auth/')) {
      return this.handleDevAuthRequest('GET', url, undefined, config);
    }
    return api.get(url, config);
  },

  async post(url: string, data?: AuthRequestData, config?: RequestConfig) {
    if (isDevelopmentMode && url.startsWith('/auth/')) {
      return this.handleDevAuthRequest('POST', url, data, config);
    }
    return api.post(url, data, config);
  },

  async put(url: string, data?: AuthRequestData, config?: RequestConfig) {
    if (isDevelopmentMode && url.startsWith('/auth/')) {
      return this.handleDevAuthRequest('PUT', url, data, config);
    }
    return api.put(url, data, config);
  },

  async delete(url: string, config?: RequestConfig) {
    if (isDevelopmentMode && url.startsWith('/auth/')) {
      return this.handleDevAuthRequest('DELETE', url, undefined, config);
    }
    return api.delete(url, config);
  },

  async handleDevAuthRequest(method: string, url: string, data?: AuthRequestData, _config?: RequestConfig) {
    const token = localStorage.getItem('authToken');

    try {
      let result;

      if (url === '/auth/register' && method === 'POST') {
        if (!data?.email || !data?.password || !data?.username) {
          throw new Error('Missing required fields');
        }
        result = await devAuth.register(data.email, data.password, data.username);
      } else if (url === '/auth/login' && method === 'POST') {
        if (!data?.email || !data?.password) {
          throw new Error('Missing email or password');
        }
        result = await devAuth.login(data.email, data.password);
      } else if (url === '/auth/me' && method === 'GET') {
        if (!token) throw new Error('No token provided');
        result = await devAuth.getMe(token);
      } else if (url === '/auth/profile' && method === 'PUT') {
        if (!token) throw new Error('No token provided');
        if (!data) throw new Error('No data provided');
        result = await devAuth.updateProfile(token, data);
      } else if (url === '/auth/logout' && method === 'DELETE') {
        await devAuth.logout();
        result = { message: 'Logged out successfully' };
      } else {
        throw new Error('Endpoint not found');
      }

      return { data: result };
    } catch (error: unknown) {
      // Simulate axios error format
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const axiosError = {
        response: {
          status: errorMessage.includes('Invalid credentials') || errorMessage.includes('Invalid token') ? 401 :
            errorMessage.includes('User already exists') ? 409 :
              errorMessage.includes('not found') ? 404 : 500,
          data: { error: errorMessage }
        },
        message: errorMessage
      };
      throw axiosError;
    }
  }
};

export { enhancedApi as api };
