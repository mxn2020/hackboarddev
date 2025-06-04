// Enhanced security utilities for authentication
const { Redis } = require('@upstash/redis');
const validator = require('validator');

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Security configuration
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  TOKEN_EXPIRY: 60 * 60, // 1 hour
  BCRYPT_ROUNDS: 12,
  PASSWORD_MIN_LENGTH: 8,
};

// Enhanced security headers
const getSecurityHeaders = (origin = '*') => ({
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || origin,
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
});

// Rate limiting for login attempts
const checkRateLimit = async (identifier, maxAttempts = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) => {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, Math.floor(SECURITY_CONFIG.RATE_LIMIT_WINDOW / 1000));
  }

  return {
    allowed: current <= maxAttempts,
    remaining: Math.max(0, maxAttempts - current),
    resetTime: Date.now() + SECURITY_CONFIG.RATE_LIMIT_WINDOW
  };
};

// Password strength validation
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    return { valid: false, message: `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long` };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    };
  }

  return { valid: true, message: 'Password is strong' };
};

// Input sanitization and validation
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.escape(validator.trim(input));
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }

  if (!validator.isEmail(email) || email.length > 254) {
    return { valid: false, message: 'Please provide a valid email address' };
  }

  return { valid: true, message: 'Email is valid' };
};

const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Username is required' };
  }

  const sanitized = sanitizeInput(username);
  if (sanitized.length < 3 || sanitized.length > 30) {
    return { valid: false, message: 'Username must be between 3 and 30 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true, message: 'Username is valid' };
};

// Token blacklisting for secure logout
const blacklistToken = async (token) => {
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.setex(`blacklist:${token}`, ttl, 'true');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

const isTokenBlacklisted = async (token) => {
  try {
    const result = await redis.get(`blacklist:${token}`);
    return result !== null;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false;
  }
};

// Enhanced JWT token generation
const generateSecureToken = (user) => {
  const jwt = require('jsonwebtoken');
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role || 'user',
      iat: now,
      exp: now + SECURITY_CONFIG.TOKEN_EXPIRY,
      iss: 'hackathon-template',
      aud: 'hackathon-users'
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256' }
  );
};

// Set secure HTTP-only cookies
const setSecureCookie = (token, isProduction = process.env.NODE_ENV === 'production') => {
  const cookieOptions = [
    `auth_token=${token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${SECURITY_CONFIG.TOKEN_EXPIRY}`,
    'SameSite=Strict'
  ];

  if (isProduction) {
    cookieOptions.push('Secure');
  }

  return cookieOptions.join('; ');
};

// Clear secure cookies
const clearSecureCookie = () => {
  return 'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict';
};

// Brute force protection tracking
const recordFailedLogin = async (email, ip) => {
  const emailKey = `failed_login:email:${email}`;
  const ipKey = `failed_login:ip:${ip}`;

  await redis.incr(emailKey);
  await redis.expire(emailKey, SECURITY_CONFIG.RATE_LIMIT_WINDOW / 1000);

  await redis.incr(ipKey);
  await redis.expire(ipKey, SECURITY_CONFIG.RATE_LIMIT_WINDOW / 1000);
};

const clearFailedLoginAttempts = async (email, ip) => {
  await redis.del(`failed_login:email:${email}`);
  if (ip) {
    await redis.del(`failed_login:ip:${ip}`);
  }
};

const clearRateLimit = async (key) => {
  await redis.del(key);
};

module.exports = {
  SECURITY_CONFIG,
  getSecurityHeaders,
  checkRateLimit,
  clearRateLimit,
  validatePassword,
  validateEmail,
  validateUsername,
  sanitizeInput,
  blacklistToken,
  isTokenBlacklisted,
  generateSecureToken,
  setSecureCookie,
  clearSecureCookie,
  recordFailedLogin,
  clearFailedLoginAttempts,
};
