const { Redis } = require('@upstash/redis');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { parse } = require('cookie');

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const { httpMethod, path } = event;
    const pathParts = path.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];

    switch (httpMethod) {
      case 'POST':
        if (action === 'register') {
          return await handleRegister(event);
        } else if (action === 'login') {
          return await handleLogin(event);
        }
        break;
      case 'GET':
        if (action === 'me') {
          return await handleGetMe(event);
        }
        break;
      case 'PUT':
        if (action === 'profile') {
          return await handleUpdateProfile(event);
        }
        break;
      case 'DELETE':
        if (action === 'logout') {
          return await handleLogout(event);
        }
        break;
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function handleRegister(event) {
  try {
    // Safely parse the request body
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else if (event.body && typeof event.body === 'object') {
      body = event.body;
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    const { username, email, password } = body;

    if (!username || !email || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Username, email, and password are required' }),
      };
    }

    // Check if user already exists
    const existingUser = await redis.get(`user:email:${email}`);
    if (existingUser) {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'User already exists with this email' }),
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user object
    const user = {
      id: userId,
      username,
      name: username, // Add name field for consistency
      email,
      password: hashedPassword,
      role: 'user', // Default role for new users
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store user data
    await redis.set(`user:${userId}`, JSON.stringify(user));
    await redis.set(`user:email:${email}`, userId);

    // Generate JWT token
    const token = jwt.sign({ 
      userId, 
      email,
      role: 'user'
    }, JWT_SECRET, { expiresIn: '7d' });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        user: userWithoutPassword,
        token,
      }),
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to register user' }),
    };
  }
}

async function handleLogin(event) {
  try {
    // Safely parse the request body
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else if (event.body && typeof event.body === 'object') {
      body = event.body;
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

    // Get user ID by email
    const userId = await redis.get(`user:email:${email}`);
    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Get user data
    const userData = await redis.get(`user:${userId}`);
    if (!userData) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Safely parse user data
    let user;
    try {
      user = typeof userData === 'string' ? JSON.parse(userData) : userData;
    } catch (parseError) {
      console.error('Failed to parse user data:', parseError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid user data' }),
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      };
    }

    // Generate JWT token
    const token = jwt.sign({ 
      userId: user.id, 
      email: user.email,
      role: user.role || 'user'
    }, JWT_SECRET, { expiresIn: '7d' });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        user: userWithoutPassword,
        token,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to login' }),
    };
  }
}

async function handleGetMe(event) {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No token provided' }),
      };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user data
    const userData = await redis.get(`user:${decoded.userId}`);
    if (!userData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Safely parse user data
    let user;
    try {
      user = typeof userData === 'string' ? JSON.parse(userData) : userData;
    } catch (parseError) {
      console.error('Failed to parse user data:', parseError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid user data' }),
      };
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ user: userWithoutPassword }),
    };
  } catch (error) {
    console.error('Get me error:', error);
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }
}

async function handleLogout(event) {
  try {
    // For JWT tokens, logout is typically handled client-side by removing the token
    // We could implement a token blacklist if needed, but for simplicity, we'll just confirm
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Logged out successfully' }),
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to logout' }),
    };
  }
}

async function handleUpdateProfile(event) {
  try {
    // Verify token
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No token provided' }),
      };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user data
    const userData = await redis.get(`user:${decoded.userId}`);
    if (!userData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Safely parse user data
    let user;
    try {
      user = typeof userData === 'string' ? JSON.parse(userData) : userData;
    } catch (parseError) {
      console.error('Failed to parse user data:', parseError);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid user data' }),
      };
    }

    // Parse request body
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else if (event.body && typeof event.body === 'object') {
      body = event.body;
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    // Update user fields
    const updatedUser = {
      ...user,
      name: body.name || user.name || user.username,
      email: body.email || user.email,
      preferences: body.preferences || user.preferences,
      updatedAt: new Date().toISOString()
    };

    // If email is changed, we need to update the email index
    if (body.email && body.email !== user.email) {
      // Remove old email index
      await redis.del(`user:email:${user.email}`);
      // Add new email index
      await redis.set(`user:email:${body.email}`, user.id);
    }

    // Save updated user
    await redis.set(`user:${user.id}`, JSON.stringify(updatedUser));

    // Return user data without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        user: userWithoutPassword
      }),
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to update profile' }),
    };
  }
}
