const { Redis } = require('@upstash/redis');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { parse } = require('cookie');

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const AUTH_MODE = process.env.AUTH_MODE || 'cookie'; // 'cookie' or 'bearer'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Authentication middleware
async function authenticateUser(event) {
  // Extract token based on auth mode
  let token;
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (AUTH_MODE === 'bearer') {
    // Bearer token mode - only check Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  } else {
    // Cookie mode - check both header and cookies for backward compatibility
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Check for token in cookies
      const cookies = event.headers.cookie;
      if (cookies) {
        const parsedCookies = parse(cookies);
        token = parsedCookies.auth_token;
      }
    }
  }

  if (!token) {
    throw new Error('No token provided');
  }

  if (token.trim() === '' || token === 'null' || token === 'undefined') {
    throw new Error('Invalid token format');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.sub || decoded.userId; // Use 'sub' field which contains the user ID
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    throw new Error('Invalid token');
  }
}

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

    // All endpoints require authentication
    let userId;
    try {
      userId = await authenticateUser(event);
    } catch (authError) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: authError.message || 'Authentication required' }),
      };
    }

    // Get user data to include in responses
    const userData = await redis.get(`user:${userId}`);
    const user = userData ? (typeof userData === 'string' ? JSON.parse(userData) : userData) : null;

    if (!user) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'User not found' }),
      };
    }

    switch (httpMethod) {
      case 'GET':
        if (action === 'requests') {
          return await getTeamRequests(event);
        } else if (action === 'my-requests') {
          return await getMyTeamRequests(userId);
        } else if (action === 'connections') {
          return await getConnections(userId);
        }
        break;
      case 'POST':
        if (action === 'requests') {
          return await createTeamRequest(event, userId, user);
        } else if (action === 'connect') {
          return await createConnection(event, userId, user);
        }
        break;
      case 'PUT':
        if (pathParts.includes('connections')) {
          const connectionId = pathParts[pathParts.indexOf('connections') + 1];
          if (connectionId) {
            return await updateConnection(event, connectionId, userId);
          }
        }
        break;
      case 'DELETE':
        if (pathParts.includes('requests')) {
          const requestId = pathParts[pathParts.indexOf('requests') + 1];
          if (requestId) {
            return await deleteTeamRequest(requestId, userId);
          }
        }
        break;
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Team function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Internal server error' }),
    };
  }
};

// Get all team requests
async function getTeamRequests(event) {
  try {
    // Get all team request IDs
    const requestIds = await redis.lrange('team:requests', 0, -1);
    
    if (!requestIds || requestIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: [] }),
      };
    }

    // Get all team requests data
    const requestsData = await Promise.all(
      requestIds.map(async (id) => {
        const request = await redis.get(`team:request:${id}`);
        if (!request) return null;
        
        try {
          return typeof request === 'string' ? JSON.parse(request) : request;
        } catch (e) {
          console.error(`Failed to parse team request ${id}:`, e);
          return null;
        }
      })
    );

    // Filter out null values
    const teamRequests = requestsData.filter(request => request !== null);

    // Sort by creation date (newest first)
    teamRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: teamRequests }),
    };
  } catch (error) {
    console.error('Error getting team requests:', error);
    throw error;
  }
}

// Get my team requests
async function getMyTeamRequests(userId) {
  try {
    // Get user's team request IDs
    const requestIds = await redis.smembers(`user:${userId}:team_requests`);
    
    if (!requestIds || requestIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: [] }),
      };
    }

    // Get all team requests data
    const requestsData = await Promise.all(
      requestIds.map(async (id) => {
        const request = await redis.get(`team:request:${id}`);
        if (!request) return null;
        
        try {
          return typeof request === 'string' ? JSON.parse(request) : request;
        } catch (e) {
          console.error(`Failed to parse team request ${id}:`, e);
          return null;
        }
      })
    );

    // Filter out null values
    const teamRequests = requestsData.filter(request => request !== null);

    // Sort by creation date (newest first)
    teamRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: teamRequests }),
    };
  } catch (error) {
    console.error('Error getting my team requests:', error);
    throw error;
  }
}

// Create a team request
async function createTeamRequest(event, userId, user) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { skills, description } = requestBody;

    if (!skills || !skills.length || !description) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Skills and description are required' }),
      };
    }

    const requestId = `request_${Date.now()}_${nanoid(8)}`;
    const now = new Date().toISOString();

    const teamRequest = {
      id: requestId,
      author: {
        id: userId,
        name: user.name || user.username,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=random`
      },
      skills,
      description,
      createdAt: now,
      updatedAt: now,
    };

    // Store team request data
    await redis.set(`team:request:${requestId}`, JSON.stringify(teamRequest));
    
    // Add to team requests list
    await redis.lpush('team:requests', requestId);
    
    // Add to user's team requests
    await redis.sadd(`user:${userId}:team_requests`, requestId);

    // Add to skills indices for searching
    for (const skill of skills) {
      await redis.sadd(`team:skill:${skill.toLowerCase()}`, requestId);
    }

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: teamRequest }),
    };
  } catch (error) {
    console.error('Error creating team request:', error);
    throw error;
  }
}

// Delete a team request
async function deleteTeamRequest(requestId, userId) {
  try {
    // Get team request data
    const requestData = await redis.get(`team:request:${requestId}`);
    if (!requestData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Team request not found' }),
      };
    }

    const request = typeof requestData === 'string' ? JSON.parse(requestData) : requestData;

    // Check if user is the author
    if (request.author.id !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'You can only delete your own team requests' }),
      };
    }

    // Delete team request data
    await redis.del(`team:request:${requestId}`);
    
    // Remove from team requests list
    await redis.lrem('team:requests', 0, requestId);
    
    // Remove from user's team requests
    await redis.srem(`user:${userId}:team_requests`, requestId);

    // Remove from skills indices
    for (const skill of request.skills) {
      await redis.srem(`team:skill:${skill.toLowerCase()}`, requestId);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: 'Team request deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting team request:', error);
    throw error;
  }
}

// Get user connections
async function getConnections(userId) {
  try {
    // Get connection IDs where user is sender or recipient
    const senderConnections = await redis.smembers(`user:${userId}:sent_connections`);
    const recipientConnections = await redis.smembers(`user:${userId}:received_connections`);
    
    const connectionIds = [...new Set([...senderConnections, ...recipientConnections])];
    
    if (!connectionIds || connectionIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: [] }),
      };
    }

    // Get all connections data
    const connectionsData = await Promise.all(
      connectionIds.map(async (id) => {
        const connection = await redis.get(`team:connection:${id}`);
        if (!connection) return null;
        
        try {
          return typeof connection === 'string' ? JSON.parse(connection) : connection;
        } catch (e) {
          console.error(`Failed to parse connection ${id}:`, e);
          return null;
        }
      })
    );

    // Filter out null values
    const connections = connectionsData.filter(connection => connection !== null);

    // Sort by creation date (newest first)
    connections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: connections }),
    };
  } catch (error) {
    console.error('Error getting connections:', error);
    throw error;
  }
}

// Create a connection request
async function createConnection(event, userId, user) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { requestId, message } = requestBody;

    if (!requestId || !message) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Request ID and message are required' }),
      };
    }

    // Get team request data
    const requestData = await redis.get(`team:request:${requestId}`);
    if (!requestData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Team request not found' }),
      };
    }

    const request = typeof requestData === 'string' ? JSON.parse(requestData) : requestData;

    // Check if user is trying to connect to their own request
    if (request.author.id === userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'You cannot connect to your own team request' }),
      };
    }

    // Check if connection already exists
    const existingConnections = await redis.smembers(`user:${userId}:sent_connections`);
    for (const connId of existingConnections) {
      const connData = await redis.get(`team:connection:${connId}`);
      if (connData) {
        const conn = typeof connData === 'string' ? JSON.parse(connData) : connData;
        if (conn.requestId === requestId && conn.recipientId === request.author.id) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, error: 'You have already sent a connection request to this team' }),
          };
        }
      }
    }

    const connectionId = `connection_${Date.now()}_${nanoid(8)}`;
    const now = new Date().toISOString();

    const connection = {
      id: connectionId,
      requestId,
      senderId: userId,
      senderName: user.name || user.username,
      senderAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=random`,
      recipientId: request.author.id,
      recipientName: request.author.name,
      recipientAvatar: request.author.avatar,
      message,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Store connection data
    await redis.set(`team:connection:${connectionId}`, JSON.stringify(connection));
    
    // Add to sender's connections
    await redis.sadd(`user:${userId}:sent_connections`, connectionId);
    
    // Add to recipient's connections
    await redis.sadd(`user:${request.author.id}:received_connections`, connectionId);

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: connection }),
    };
  } catch (error) {
    console.error('Error creating connection:', error);
    throw error;
  }
}

// Update a connection (accept/reject)
async function updateConnection(event, connectionId, userId) {
  try {
    // Get connection data
    const connectionData = await redis.get(`team:connection:${connectionId}`);
    if (!connectionData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Connection not found' }),
      };
    }

    const connection = typeof connectionData === 'string' ? JSON.parse(connectionData) : connectionData;

    // Check if user is the recipient
    if (connection.recipientId !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'You can only respond to connection requests sent to you' }),
      };
    }

    // Check if connection is already accepted or rejected
    if (connection.status !== 'pending') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: `Connection is already ${connection.status}` }),
      };
    }

    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { status } = requestBody;

    if (status !== 'accepted' && status !== 'rejected') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Status must be "accepted" or "rejected"' }),
      };
    }

    // Update connection
    const updatedConnection = {
      ...connection,
      status,
      updatedAt: new Date().toISOString()
    };

    // Store updated connection
    await redis.set(`team:connection:${connectionId}`, JSON.stringify(updatedConnection));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: updatedConnection }),
    };
  } catch (error) {
    console.error('Error updating connection:', error);
    throw error;
  }
}