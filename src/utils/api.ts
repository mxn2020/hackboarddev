import axios from 'axios';

// Check if Bearer token authentication is enabled via feature flag
const isBearerAuthEnabled = () => {
  // Check localStorage for feature flag state
  const featureFlags = localStorage.getItem('featureFlags');
  if (featureFlags) {
    try {
      const flags = JSON.parse(featureFlags);
      return flags.bearer_token_auth?.enabled === true;
    } catch (e) {
      return false;
    }
  }
  return false;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/.netlify/functions',
  timeout: 10000,
  withCredentials: true, // Enable cookies for HttpOnly auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const useBearerAuth = isBearerAuthEnabled();

    if (useBearerAuth) {
      // Bearer token mode - get token from localStorage
      const token = localStorage.getItem('authToken');
      if (token && token.trim() !== '' && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // In cookie mode, we rely on withCredentials: true for HttpOnly cookies
    // No additional headers needed

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and enhanced security
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      const useBearerAuth = isBearerAuthEnabled();
      if (useBearerAuth) {
        localStorage.removeItem('authToken');
      }
      localStorage.removeItem('user');
      // Don't automatically redirect to avoid infinite loops
      // Let the component handle the redirect
      console.warn('Authentication expired or invalid');
    } else if (error.response?.status === 429) {
      // Handle rate limiting
      const retryAfter = error.response.data?.retryAfter || 60;
      console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    }
    return Promise.reject(error);
  }
);

export { api };